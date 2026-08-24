import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import axios, { type AxiosRequestConfig, type AxiosResponse } from "axios"

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080"
).replace(/\/$/, "")

type LoginResponse = {
  accessToken: string
  tokenType: "Bearer"
  expiresInSeconds: number
}

type Membership = {
  tenantId: string
  role: string
}

export type PlatformAdminProfile = {
  userId: string
  email: string
  displayName: string
  memberships: Membership[]
}

type LoginCredentials = {
  tenantSlug: string
  identifier: string
  password: string
}

type PlatformAuthState = "loading" | "authenticated" | "unauthenticated"

type PlatformAuthContextValue = {
  state: PlatformAuthState
  profile: PlatformAdminProfile | null
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => Promise<void>
  authorizedRequest: <T>(
    config: AxiosRequestConfig
  ) => Promise<AxiosResponse<T>>
}

const PlatformAuthContext = createContext<PlatformAuthContextValue | null>(null)

const sessionClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
})

export function PlatformAuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PlatformAuthState>("loading")
  const [profile, setProfile] = useState<PlatformAdminProfile | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)

  const loadProfile = useCallback(async (token: string) => {
    const response = await sessionClient.get<PlatformAdminProfile>(
      "/api/v1/me",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )
    setAccessToken(token)
    setProfile(response.data)
    setState("authenticated")
  }, [])

  const refreshSession = useCallback(async () => {
    const response = await sessionClient.post<LoginResponse>(
      "/api/v1/auth/refresh"
    )
    await loadProfile(response.data.accessToken)
    return response.data.accessToken
  }, [loadProfile])

  useEffect(() => {
    const restoreTimer = window.setTimeout(() => {
      void refreshSession().catch(() => {
        setAccessToken(null)
        setProfile(null)
        setState("unauthenticated")
      })
    }, 0)

    return () => window.clearTimeout(restoreTimer)
  }, [refreshSession])

  const logout = useCallback(async () => {
    setAccessToken(null)
    setProfile(null)
    setState("unauthenticated")

    try {
      await sessionClient.post("/api/v1/auth/logout")
    } catch {
      // The local state is already cleared. Logout is intentionally idempotent server-side.
    }
  }, [])

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      const response = await sessionClient.post<LoginResponse>(
        "/api/v1/auth/login",
        credentials
      )

      try {
        await loadProfile(response.data.accessToken)
      } catch (error) {
        await logout()
        throw error
      }
    },
    [loadProfile, logout]
  )

  const authorizedRequest = useCallback(
    async <T,>(config: AxiosRequestConfig) => {
      if (!accessToken) {
        throw new Error("Your session has expired. Please sign in again.")
      }

      const request = (token: string) =>
        sessionClient.request<T>({
          ...config,
          headers: { ...config.headers, Authorization: `Bearer ${token}` },
        })

      try {
        return await request(accessToken)
      } catch (error) {
        if (!axios.isAxiosError(error) || error.response?.status !== 401) {
          throw error
        }

        try {
          return await request(await refreshSession())
        } catch (refreshError) {
          await logout()
          throw refreshError
        }
      }
    },
    [accessToken, logout, refreshSession]
  )

  const value = useMemo(
    () => ({ state, profile, login, logout, authorizedRequest }),
    [state, profile, login, logout, authorizedRequest]
  )

  return (
    <PlatformAuthContext.Provider value={value}>
      {children}
    </PlatformAuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(PlatformAuthContext)

  if (!context) {
    throw new Error(
      "useAuth must be used inside PlatformAuthProvider."
    )
  }

  return context
}
