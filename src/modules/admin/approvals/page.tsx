"use client"

import { useCallback, useEffect, useState } from "react"
import axios from "axios"
import { Link } from "react-router-dom"
import { Check, ClipboardCheck, RefreshCw, X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { toast } from "@/components/ui/toast"

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080"
).replace(/\/$/, "")
const client = axios.create({ baseURL: API_BASE_URL, withCredentials: true })

type PendingRegistration = {
  userId: string
  email: string | null
  displayName: string | null
  requestedRole: "STUDENT" | "PARENT" | "COACH" | string
  studentId: string | null
}

type RefreshResponse = { accessToken: string }
type BackendProblem = { detail?: string; message?: string }

function errorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError<BackendProblem>(error))
    return (
      error.response?.data.detail ?? error.response?.data.message ?? fallback
    )
  return error instanceof Error ? error.message : fallback
}

function roleLabel(role: PendingRegistration["requestedRole"]) {
  return role === "PARENT"
    ? "Parent or guardian"
    : role.charAt(0) + role.slice(1).toLowerCase()
}

export default function PendingApprovalsPage() {
  const [registrations, setRegistrations] = useState<PendingRegistration[]>([])
  const [loading, setLoading] = useState(true)
  const [actingOn, setActingOn] = useState<string>()

  const withAccessToken = useCallback(
    async <T,>(request: (accessToken: string) => Promise<T>) => {
      const refresh = await client.post<RefreshResponse>("/api/v1/auth/refresh")
      return request(refresh.data.accessToken)
    },
    []
  )

  const loadRegistrations = useCallback(async () => {
    setLoading(true)
    try {
      const response = await withAccessToken((accessToken) =>
        client.get<PendingRegistration[]>("/api/v1/registrations/pending", {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
      )
      setRegistrations(
        response.data.filter((registration) =>
          ["STUDENT", "PARENT", "COACH"].includes(registration.requestedRole)
        )
      )
    } catch (error) {
      toast.add({
        title: "Unable to load approvals",
        description: errorMessage(
          error,
          "Sign in as a Master Admin and try again."
        ),
        type: "error",
        priority: "high",
      })
    } finally {
      setLoading(false)
    }
  }, [withAccessToken])

  useEffect(() => {
    const timer = window.setTimeout(() => void loadRegistrations(), 0)
    return () => window.clearTimeout(timer)
  }, [loadRegistrations])

  async function reviewRegistration(
    userId: string,
    decision: "approve" | "reject"
  ) {
    setActingOn(userId)
    try {
      await withAccessToken((accessToken) =>
        client.post(`/api/v1/registrations/${userId}/${decision}`, undefined, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
      )
      setRegistrations((current) =>
        current.filter((registration) => registration.userId !== userId)
      )
      toast.add({
        title:
          decision === "approve"
            ? "Registration approved"
            : "Registration rejected",
        description:
          decision === "approve"
            ? "The user can now sign in."
            : "The user will remain without access.",
        type: "success",
      })
    } catch (error) {
      toast.add({
        title: "Unable to update registration",
        description: errorMessage(error, "Please try again."),
        type: "error",
        priority: "high",
      })
    } finally {
      setActingOn(undefined)
    }
  }

  return (
    <main className="min-h-svh bg-background text-foreground">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-8 lg:px-12">
        <header className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <Badge
              variant="secondary"
              className="mb-3 border border-primary/20 px-2.5 text-primary-strong"
            >
              <ClipboardCheck data-icon="inline-start" aria-hidden="true" />
              Master Admin
            </Badge>
            <h1 className="font-heading text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
              Pending approvals
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Review new student, parent, and coach registrations for your
              academy.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => void loadRegistrations()}
            disabled={loading || Boolean(actingOn)}
          >
            <RefreshCw
              aria-hidden="true"
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </Button>
        </header>
        <Card>
          <CardHeader>
            <CardTitle>Registration requests</CardTitle>
            <CardDescription>
              {registrations.length} request
              {registrations.length === 1 ? "" : "s"} awaiting a decision.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Loading pending registrations…
              </p>
            ) : registrations.length === 0 ? (
              <div className="py-8 text-center">
                <p className="font-medium">You&apos;re all caught up.</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  New registrations will appear here for review.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px] text-left text-sm">
                  <thead className="border-b text-xs tracking-wide text-muted-foreground uppercase">
                    <tr>
                      <th className="px-3 py-3 font-medium">Applicant</th>
                      <th className="px-3 py-3 font-medium">Role</th>
                      <th className="px-3 py-3 font-medium">Status</th>
                      <th className="px-3 py-3 text-right font-medium">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrations.map((registration) => (
                      <tr
                        key={registration.userId}
                        className="border-b last:border-0"
                      >
                        <td className="px-3 py-4">
                          <p className="font-medium text-foreground">
                            {registration.displayName ?? "Unnamed applicant"}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {registration.email ?? "No email provided"}
                          </p>
                        </td>
                        <td className="px-3 py-4">
                          <Badge variant="outline">
                            {roleLabel(registration.requestedRole)}
                          </Badge>
                        </td>
                        <td className="px-3 py-4">
                          <Badge variant="secondary">Pending</Badge>
                        </td>
                        <td className="px-3 py-4">
                          <div className="flex justify-end gap-2">
                            <Button
                              type="button"
                              size="sm"
                              onClick={() =>
                                void reviewRegistration(
                                  registration.userId,
                                  "approve"
                                )
                              }
                              disabled={Boolean(actingOn)}
                            >
                              <Check aria-hidden="true" />
                              Approve
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="destructive"
                              onClick={() =>
                                void reviewRegistration(
                                  registration.userId,
                                  "reject"
                                )
                              }
                              disabled={Boolean(actingOn)}
                            >
                              <X aria-hidden="true" />
                              Reject
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Need a different account?{" "}
          <Link
            to="/auth/login"
            className="text-primary-strong hover:underline"
          >
            Return to sign in
          </Link>
        </p>
      </div>
    </main>
  )
}
