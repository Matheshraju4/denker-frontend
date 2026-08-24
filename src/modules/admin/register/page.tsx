import { Suspense } from "react"
import { Link, Navigate } from "react-router-dom"
import { UserRoundPlus } from "lucide-react"

import { DarkModeToggle } from "@/components/common/dark_mode"
import { MasterAdminSignupForm } from "@/components/auth/master-admin-signup-form"
import { Badge } from "@/components/ui/badge"
import Loading from "@/components/common/loading"
import { useAuth } from "@/components/platform/platform-auth-provider"

export default function AdminRegistrationPage() {
  const { state } = useAuth()

  if (state == "loading") {
    return <Loading />
  }

  if (state == "authenticated") {
    return <Navigate to="/admin" />
  }

  return (
    <main className="relative min-h-svh overflow-hidden bg-background text-foreground">
      <img
        src="/images/admin-light-mode.png"
        alt=""
        className="absolute inset-0 size-full -translate-x-[20%] scale-[1.4] object-cover object-center blur-[2.1px] dark:hidden"
      />
      <img
        src="/images/admin-dark-mode.png"
        alt=""
        className="absolute inset-0 hidden size-full -translate-x-[20%] scale-[1.4] object-cover object-center blur-[2px] dark:block"
      />
      <div className="relative z-10 mx-auto flex min-h-svh w-full max-w-[1600px] flex-col px-4 py-5 sm:px-8 sm:py-7 lg:px-12 xl:px-16">
        <div className="absolute top-5 right-4 sm:top-7 sm:right-8 lg:right-12 xl:right-16">
          <DarkModeToggle />
        </div>
        <header className="flex w-full max-w-xl items-center justify-between gap-5">
          <Link to="/" aria-label="Return to the Sports Academy home page">
            <img
              src="/images/logo.png"
              alt="Denker Sports World Shooting"
              className="h-auto w-[220px] sm:w-[270px]"
            />
          </Link>
        </header>
        <section className="flex flex-1 items-center justify-center py-8 sm:py-10">
          <div className="relative w-full max-w-xl rounded-2xl bg-card/90 p-5 shadow-2xl ring-1 shadow-background/70 ring-foreground/5 backdrop-blur-md ring-inset after:pointer-events-none after:absolute after:inset-x-12 after:top-0 after:h-px after:bg-gradient-to-r after:from-transparent after:via-primary/80 after:to-transparent sm:p-7 lg:p-8">
            <div className="mb-6">
              <Badge
                variant="secondary"
                className="mb-5 h-6 border border-primary/20 px-2.5 text-primary-strong"
              >
                <UserRoundPlus data-icon="inline-start" aria-hidden="true" />
                Master Admin invitation
              </Badge>
              <h1 className="font-heading text-3xl leading-[1.08] font-semibold tracking-[-0.04em] sm:text-4xl">
                Activate your account.
              </h1>
              <p className="mt-3 max-w-lg text-sm leading-6 text-muted-foreground sm:text-base">
                Verify your email code and choose the credentials for managing
                your academy.
              </p>
            </div>
            <Suspense
              fallback={
                <p className="text-sm text-muted-foreground">
                  Loading invitation…
                </p>
              }
            >
              <MasterAdminSignupForm />
            </Suspense>
          </div>
        </section>
        <footer className="flex w-full items-center justify-between gap-4 text-xs text-foreground/60">
          <span>Protected with industry-standard security.</span>
          <span className="hidden sm:inline">© 2026 Sports Academy</span>
        </footer>
      </div>
    </main>
  )
}
