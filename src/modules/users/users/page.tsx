import { useState } from "react"
import axios from "axios"

import { Link } from "react-router-dom"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  ArrowRight,
  Building2,
  KeyRound,
  Mail,
  ShieldCheck,
} from "lucide-react"
import { useForm, useWatch } from "react-hook-form"
import { z } from "zod"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/components/ui/toast"

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080"
).replace(/\/$/, "")
const roles = [
  { value: "STUDENT", label: "Student" },
  { value: "PARENT", label: "Parent or guardian" },
  { value: "COACH", label: "Coach" },
] as const

const loginSchema = z.object({
  tenantSlug: z.string().trim().min(1, "Enter your academy tenant slug."),
  identifier: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
  role: z.enum(["STUDENT", "PARENT", "COACH"]),
})

type LoginValues = z.infer<typeof loginSchema>
type LoginResponse = { accessToken: string }
type MeResponse = { email?: string; memberships?: Array<{ role?: string }> }
type BackendProblem = { detail?: string; message?: string }

function errorMessage(error: unknown) {
  if (axios.isAxiosError<BackendProblem>(error))
    return (
      error.response?.data.detail ??
      error.response?.data.message ??
      "Sign-in failed. Check your details and try again."
    )
  return error instanceof Error
    ? error.message
    : "Sign-in failed. Check your details and try again."
}

export default function UsersLoginPage() {
  const [signedInEmail, setSignedInEmail] = useState<string>()
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      tenantSlug: "",
      identifier: "",
      password: "",
      role: "STUDENT",
    },
  })
  const role = useWatch({ control: form.control, name: "role" })

  async function onSubmit(values: LoginValues) {
    try {
      const login = await axios.post<LoginResponse>(
        `${API_BASE_URL}/api/v1/auth/login`,
        {
          tenantSlug: values.tenantSlug,
          identifier: values.identifier,
          password: values.password,
        },
        { withCredentials: true }
      )
      const profile = await axios.get<MeResponse>(`${API_BASE_URL}/api/v1/me`, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${login.data.accessToken}` },
      })
      if (
        !profile.data.memberships?.some(
          (membership) => membership.role === values.role
        )
      )
        throw new Error(
          `This account does not have ${roles.find((item) => item.value === values.role)?.label} access.`
        )
      setSignedInEmail(profile.data.email ?? values.identifier)
      toast.add({
        title: "Signed in",
        description: "Your secure session is ready.",
        type: "success",
      })
    } catch (error) {
      toast.add({
        title: "Unable to sign in",
        description: errorMessage(error),
        type: "error",
        priority: "high",
      })
    }
  }

  return (
    <main className="relative min-h-svh overflow-x-hidden bg-background text-foreground">
      <img
        src="/images/image.png"
        alt=""
        className="absolute inset-0 hidden size-full object-cover object-[68%_center] sm:object-center dark:block"
      />
      <img
        src="/images/image-light-mode.png"
        alt=""
        className="absolute inset-0 size-full object-cover object-[68%_center] sm:object-center dark:hidden"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-background/55 sm:bg-gradient-to-r sm:from-background sm:via-background/90 sm:to-background/10"
      />
      <div className="relative z-10 mx-auto flex min-h-svh w-full max-w-[1600px] flex-col px-4 py-5 sm:px-8 sm:py-7 lg:px-12 xl:px-16">
        <header className="flex w-full max-w-xl items-center">
          <Link to="/" aria-label="Return to the Sports Academy home page">
            <img
              src="/images/logo.png"
              alt="Denker Sports World Shooting"
              className="h-auto w-[220px] sm:w-[270px]"
            />
          </Link>
        </header>
        <section className="flex flex-1 items-center py-8 sm:py-10">
          <div className="w-full max-w-xl rounded-2xl border border-primary/10 bg-card/90 p-5 shadow-2xl ring-1 shadow-primary/10 ring-foreground/5 backdrop-blur-md ring-inset sm:p-7 lg:p-8">
            <Badge
              variant="secondary"
              className="mb-4 border border-primary/20 px-2.5 text-primary-strong"
            >
              <ShieldCheck data-icon="inline-start" aria-hidden="true" />
              Member access
            </Badge>
            <h1 className="font-heading text-3xl leading-[1.08] font-semibold tracking-[-0.04em] sm:text-4xl">
              Welcome back.
            </h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Sign in as a student, parent, or coach.
            </p>
            {signedInEmail ? (
              <div className="mt-7 rounded-lg border border-primary/25 bg-primary/10 p-4 text-sm leading-6">
                Signed in as {signedInEmail}. Your secure session is active.
              </div>
            ) : (
              <form
                className="mt-7 space-y-5"
                onSubmit={form.handleSubmit(onSubmit)}
                noValidate
              >
                <div className="space-y-2">
                  <Label>Account type</Label>
                  <Select
                    value={role}
                    onValueChange={(value) =>
                      value &&
                      form.setValue("role", value as LoginValues["role"], {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                  >
                    <SelectTrigger
                      className="h-11 w-full bg-background/60"
                      aria-label="Account type"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tenant-slug">Academy tenant slug</Label>
                  <div className="relative">
                    <Building2
                      aria-hidden="true"
                      className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                    />
                    <Input
                      id="tenant-slug"
                      autoComplete="organization"
                      placeholder="academy"
                      className="h-11 bg-background/60 pl-9"
                      aria-invalid={Boolean(form.formState.errors.tenantSlug)}
                      {...form.register("tenantSlug")}
                    />
                  </div>
                  {form.formState.errors.tenantSlug && (
                    <p role="alert" className="text-xs text-destructive">
                      {form.formState.errors.tenantSlug.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="member-email">Email address</Label>
                  <div className="relative">
                    <Mail
                      aria-hidden="true"
                      className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                    />
                    <Input
                      id="member-email"
                      type="email"
                      autoComplete="email"
                      placeholder="name@example.com"
                      className="h-11 bg-background/60 pl-9"
                      aria-invalid={Boolean(form.formState.errors.identifier)}
                      {...form.register("identifier")}
                    />
                  </div>
                  {form.formState.errors.identifier && (
                    <p role="alert" className="text-xs text-destructive">
                      {form.formState.errors.identifier.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="member-password">Password</Label>
                  <div className="relative">
                    <KeyRound
                      aria-hidden="true"
                      className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                    />
                    <Input
                      id="member-password"
                      type="password"
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      className="h-11 bg-background/60 pl-9"
                      aria-invalid={Boolean(form.formState.errors.password)}
                      {...form.register("password")}
                    />
                  </div>
                  {form.formState.errors.password && (
                    <p role="alert" className="text-xs text-destructive">
                      {form.formState.errors.password.message}
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="h-11 w-full"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? "Signing in…" : "Sign in"}
                  {!form.formState.isSubmitting && (
                    <ArrowRight data-icon="inline-end" aria-hidden="true" />
                  )}
                </Button>
              </form>
            )}
          </div>
        </section>
        <footer className="flex w-full max-w-xl items-center justify-between gap-4 text-xs text-foreground/60">
          <span>Protected with industry-standard security.</span>
          <span className="hidden sm:inline">© 2026 Sports Academy</span>
        </footer>
      </div>
    </main>
  )
}
