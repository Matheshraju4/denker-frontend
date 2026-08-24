
import { ShieldCheck, Sparkles } from "lucide-react";

import { RegistrationOptions } from "@/components/registration/registration-options";
import { Badge } from "@/components/ui/badge";

export default function SignUp() {
  return (
    <main className="relative min-h-svh overflow-hidden bg-background text-foreground">
      <img
        src="/images/image.png"
        alt="Shooter aiming toward the registration area at an indoor range"
        className="absolute inset-0 hidden size-full object-cover object-[68%_center] sm:object-center dark:block"
      />
      <img
        src="/images/image-light-mode.png"
        alt="Shooter aiming toward the registration area at an indoor range"
        className="absolute inset-0 size-full object-cover object-[68%_center] sm:object-center dark:hidden"
      />
      

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-background/55 sm:bg-transparent sm:bg-gradient-to-r sm:from-background sm:from-0% sm:via-background/90 sm:via-38% sm:to-background/10 sm:to-72%"
      />
     

      <aside
        aria-label="Academy message"
        className="absolute right-10 top-15 z-10 hidden max-w-4xl xl:block 2xl:right-1/3 2xl:top-28"
      >
        <div className="mb-4 flex items-center gap-3">
          {/* <span aria-hidden="true" className="h-px w-10 bg-primary" /> */}
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-strong">
            Train with intention
          </span>
          {/* <span aria-hidden="true" className="h-px w-10 bg-primary" /> */}
        </div>
        <h2 className="font-heading text-4xl font-semibold leading-[1.06] tracking-[-0.04em] text-foreground drop-shadow-lg 2xl:text-5xl">
          Find your focus.
          <br />
          Own your next shot.
        </h2>
        <p className="mt-4 max-w-xs text-sm leading-6 text-foreground/75 drop-shadow-md">
          Precision is built one deliberate session at a time.
        </p>
      </aside>

      <div className="relative z-10 mx-auto flex min-h-svh w-full max-w-[1600px] flex-col px-4 py-5 sm:px-8 sm:py-7 lg:px-12 xl:px-16">
        <header className="flex w-full max-w-xl items-center justify-between gap-5">
          <img
            src="/images/logo.png"
            alt="Denker Sports World Shooting"
            className="h-auto w-[220px] sm:w-[270px]"
          />

          <div className="hidden items-center gap-2 text-xs font-medium text-foreground/70 sm:flex">
            <ShieldCheck aria-hidden="true" className="size-4 text-primary-strong" />
            Secure registration
          </div>
        </header>

        <section className="flex flex-1 items-center py-10 sm:py-12">
          <div className="w-full max-w-xl rounded-2xl border border-border/70 bg-background/85 p-5 shadow-2xl shadow-background/70 backdrop-blur-md sm:p-7 lg:p-8">
            <div className="mb-7">
              <Badge variant="secondary" className="mb-5 h-6 border-border/70 px-2.5">
                <Sparkles data-icon="inline-start" aria-hidden="true" />
                Let&apos;s get you started
              </Badge>
              <h1 className="font-heading max-w-lg text-4xl font-semibold leading-[1.08] tracking-[-0.045em] sm:text-5xl">
                Join your academy.
              </h1>
              <p className="mt-4 max-w-lg text-base leading-7 text-muted-foreground">
                Choose the registration method that works best for you. You can complete your
                profile in the next step.
              </p>
            </div>

            <RegistrationOptions />
          </div>
        </section>

        <footer className="flex w-full max-w-xl items-center justify-between gap-4 text-xs text-foreground/60">
          <span>Protected with industry-standard security.</span>
          <span className="hidden sm:inline">© 2026 Sports Academy</span>
        </footer>
      </div>
    </main>
  );
}
