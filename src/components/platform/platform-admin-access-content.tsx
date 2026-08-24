


import {Link} from "react-router-dom";
import { ShieldCheck } from "lucide-react";

import { DarkModeToggle } from "@/components/common/dark_mode";
import { useAuth } from "@/components/platform/platform-auth-provider";
import { PlatformAdminLoginForm } from "@/components/platform/platform-admin-login-form";
import { PlatformAdminSessionActions } from "@/components/platform/platform-admin-session-actions";
import { PlatformTenantDirectory } from "@/components/platform/platform-tenant-directory";
import { Badge } from "@/components/ui/badge";

function PageHeader({ authenticated }: { authenticated: boolean }) {
  return (
    <>
      <div className="absolute right-4 top-5 flex items-center gap-2 sm:right-8 sm:top-7 lg:right-12 xl:right-16">
        <DarkModeToggle />
        {authenticated && <PlatformAdminSessionActions />}
      </div>
      <header className="flex items-center gap-4">
        <Link to="/" aria-label="Return to the Sports Academy home page">
          <img src="/images/logo.png" alt="Denker Sports World Shooting" className="h-auto w-[200px] sm:w-[240px]" />
        </Link>
        <span className="hidden h-5 w-px bg-border sm:block" />
        <span className="hidden text-sm text-muted-foreground sm:inline">Platform administration</span>
      </header>
    </>
  );
}

function AccessPanel() {
  const { state } = useAuth();

  if (state === "loading") {
    return (
      <div className="grid min-h-[360px] place-items-center text-center text-sm text-muted-foreground">
        Checking your secure session…
      </div>
    );
  }

  if (state === "unauthenticated") {
    return (
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl shadow-background/60 ring-1 ring-inset ring-foreground/5 sm:p-8">
        <Badge variant="secondary" className="mb-6 border border-primary/20 px-2.5 text-primary-strong">
          <ShieldCheck data-icon="inline-start" aria-hidden="true" />
          Restricted access
        </Badge>
        <h1 className="font-heading text-3xl font-semibold tracking-[-0.04em]">Platform Admin sign in</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Use the owner account created during the one-time platform bootstrap.
        </p>
        <div className="mt-7"><PlatformAdminLoginForm /></div>
      </div>
    );
  }

  return <PlatformTenantDirectory />;
}

export function PlatformAdminAccessContent() {
  const { state } = useAuth();

  return (
    <main className="min-h-svh bg-background text-foreground">
      <div className="relative mx-auto flex min-h-svh w-full max-w-[1600px] flex-col px-4 py-5 sm:px-8 sm:py-7 lg:px-12 xl:px-16">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[480px] bg-[radial-gradient(circle_at_top_right,var(--primary)_0%,transparent_42%)] opacity-10" />
        <PageHeader authenticated={state === "authenticated"} />
        <section className="flex flex-1 items-center justify-center py-10 sm:py-14"><AccessPanel /></section>
        <footer className="text-center text-xs text-muted-foreground">Restricted to platform administrators.</footer>
      </div>
    </main>
  );
}
