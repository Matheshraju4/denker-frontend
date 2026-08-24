import { buttonVariants } from "@/components/ui/button"
import { ArrowUpRight, LogIn, UserPlus } from "lucide-react"
import { Link } from "react-router-dom"

import Programs from "./programs"
import UpcomingClasses from "./upcoming-class"
import AboutUs from "./aboutus"
import { DarkModeToggle } from "@/components/common/dark_mode"

const navItems = [
  { label: "Home", href: "#" },
  { label: "About", href: "#about" },

  { label: "Programs", href: "#programs" },
  { label: "classes/Schedule", href: "#classes" },
  { label: "Gallery", href: "#gallery" },
  { label: "Contact", href: "#contact" },
]

function PrecisionMark() {
  return (
    <span className="mx-[0.08em] inline-grid size-[0.86em] translate-y-[0.06em] place-items-center rounded-[0.12em] border border-primary/20 bg-background shadow-[0_8px_30px_rgba(163,130,28,0.22)]">
      <svg aria-hidden="true" className="size-[0.62em]" viewBox="0 0 64 64">
        <circle
          cx="32"
          cy="32"
          r="25"
          fill="#d8c270"
          fillOpacity=".16"
          stroke="#d8c270"
          strokeWidth="3"
        />
        <circle
          cx="32"
          cy="32"
          r="15"
          fill="none"
          stroke="#a3821c"
          strokeWidth="4"
        />
        <circle cx="32" cy="32" r="6" fill="#574712" />
        <path
          d="M32 2v11M32 51v11M2 32h11M51 32h11"
          stroke="#b99a37"
          strokeWidth="3"
        />
      </svg>
    </span>
  )
}

function HeroArtwork({ mobile = false }: { mobile?: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={
        mobile
          ? "pointer-events-none absolute inset-0 overflow-hidden lg:hidden"
          : "pointer-events-none absolute inset-y-0 right-0 hidden w-[66%] overflow-hidden lg:block"
      }
    >
      <img
        src="/images/landing-hero-shooting.png"
        alt=""
        className={
          mobile
            ? "absolute inset-0 size-full object-cover object-[62%_center] dark:hidden"
            : "absolute inset-0 size-full object-cover object-center dark:hidden"
        }
      />
      <img
        src="/images/landing-hero-shooting-dark.png"
        alt=""
        className={
          mobile
            ? "absolute inset-0 hidden size-full object-cover object-[62%_center] dark:block"
            : "absolute inset-0 hidden size-full object-cover object-center dark:block"
        }
      />
      <div
        className={
          mobile
            ? "absolute inset-0 bg-background/20"
            : "absolute inset-0 bg-gradient-to-r from-background via-background/65 to-transparent lg:via-background/15"
        }
      />
    </div>
  )
}

const LandingPage = () => {
  return (
    <main className="min-h-svh overflow-hidden bg-background text-foreground">
      <div className="relative isolate overflow-hidden">
        <header className="relative z-20 mx-auto flex h-20 w-full max-w-[1600px] items-center justify-between px-5 sm:h-24 sm:px-8 lg:px-12 xl:px-20">
          <Link
            to="/"
            aria-label="Denker Sports World Shooting home"
            className="rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          >
            <img
              src="/images/logo.png"
              alt="Denker Sports World Shooting"
              className="h-auto w-[150px] sm:w-[180px]"
            />
          </Link>

          <nav
            aria-label="Main navigation"
            className="hidden items-center gap-1 rounded-full border border-border/80 bg-background/80 text-sm font-semibold text-foreground/65 shadow-[0_10px_35px_rgba(23,19,7,0.07)] backdrop-blur-xl lg:flex"
          >
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="group/nav-link relative rounded-full px-4 py-2 transition-colors duration-300 hover:bg-primary/10 hover:text-primary-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring xl:px-5"
              >
                {item.label}
                {/* <span
                aria-hidden="true"
                className="absolute inset-x-5 bottom-1 h-px origin-center scale-x-0 bg-primary transition-transform duration-300 group-hover/nav-link:scale-x-100"
              /> */}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-1 rounded-full border border-border/70 bg-background/75 p-1 shadow-[0_12px_35px_rgba(23,19,7,0.1)] backdrop-blur-xl">
            <Link
              to="/auth/users"
              aria-label="Log in"
              className={buttonVariants({
                variant: "ghost",
                size: "lg",
                className:
                  "hidden px-4 text-foreground/70 hover:text-foreground sm:inline-flex",
              })}
            >
              <LogIn aria-hidden="true" className="size-4" />
              Log in
            </Link>
            <Link
              to="/auth/manual-registration"
              aria-label="Register"
              className={buttonVariants({
                variant: "default",
                size: "lg",
                className:
                  "size-10 px-0 shadow-[0_8px_22px_rgba(163,130,28,0.25)] sm:w-auto sm:px-4",
              })}
            >
              <UserPlus aria-hidden="true" className="size-4" />
              <span className="hidden sm:inline">Register</span>
            </Link>
            <DarkModeToggle />
          </div>
        </header>

        <HeroArtwork />

        <section className="relative z-10 mx-auto flex w-full max-w-[1600px] items-start px-5 pt-2 pb-12 sm:px-8 lg:min-h-[calc(100svh-6rem)] lg:items-center lg:px-12 lg:pt-0 lg:pb-20 xl:px-20">
          <HeroArtwork mobile />

          <div className="relative z-10 w-full lg:w-[64%] lg:max-w-[940px]">
            {/* <div className="group/credential inline-flex items-center gap-3 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-background/95 to-background/80 p-1.5 pr-4 shadow-[0_12px_40px_rgba(163,130,28,0.12)] backdrop-blur-xl">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#171307] text-[#d8c270] shadow-[0_6px_18px_rgba(23,19,7,0.2)]">
              <Target
                aria-hidden="true"
                className="size-5 transition-transform duration-500 motion-safe:group-hover/credential:rotate-45"
              />
            </span>
            <span className="text-left">
              <span className="block text-[10px] font-bold tracking-[0.18em] text-primary-strong uppercase dark:text-primary">
                Denker Shooting
              </span>
              <span className="mt-0.5 block text-xs font-semibold text-foreground/75 sm:text-sm">
                Professional Academy{" "}
                <span className="mx-1.5 text-primary">·</span> Since 2012
              </span>
            </span>
          </div> */}

            <h1 className="mt-4 font-heading text-[clamp(3.15rem,5.2vw,5.2rem)] leading-[0.9] font-[750] tracking-[-0.06em] text-foreground lg:mt-8">
              <span className="block">Master Your Aim.</span>
              <span className="block sm:whitespace-nowrap">
                Build <PrecisionMark />
                Precision.
              </span>
              <span className="block sm:whitespace-nowrap">
                Perform with <em className="font-medium">Confidence.</em>
              </span>
            </h1>

            <p className="mt-5 max-w-[540px] text-base leading-relaxed text-muted-foreground sm:mt-7 sm:text-lg">
              Structured shooting-sport coaching for juniors and adults—building
              safe habits, disciplined technique, and competition-ready
              confidence.
            </p>

            <div className="mt-6 flex flex-wrap gap-3 sm:mt-8">
              <a
                href="#programs"
                className={buttonVariants({ variant: "outline", size: "lg" })}
              >
                Explore Programs{" "}
                <ArrowUpRight aria-hidden="true" className="size-4" />
              </a>
              <Link
                to="/auth/manual-registration"
                className={buttonVariants({ variant: "default", size: "lg" })}
              >
                Book a Trial Session
              </Link>
            </div>

            <div className="mt-10 text-sm text-muted-foreground sm:mt-14">
              <p>From first session to competition</p>
              <p className="mt-2 font-medium text-foreground/75">
                Structured coaching <span className="mx-2 text-primary">•</span>{" "}
                Safe progression <span className="mx-2 text-primary">•</span>{" "}
                Competitive pathways
              </p>
            </div>
          </div>
        </section>
      </div>

      <AboutUs />
      <Programs />
      <UpcomingClasses />
    </main>
  )
}

export default LandingPage
