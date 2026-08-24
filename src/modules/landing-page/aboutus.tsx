import { buttonVariants } from "@/components/ui/button"
import { ArrowUpRight, ShieldCheck, Target, Trophy } from "lucide-react"
import { Link } from "react-router-dom"

function AboutUs() {
  return (
    <section id="about" className="scroll-mt-8 bg-background py-20 sm:py-24">
      <div className="mx-auto grid max-w-[1400px] items-center gap-14 px-5 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20 lg:px-12">
        <div className="relative pb-8 sm:pr-12">
          <div className="group relative aspect-[4/5] overflow-hidden rounded-[44px] bg-muted shadow-[0_28px_80px_rgba(0,0,0,0.14)] sm:aspect-[5/4] lg:aspect-[4/5]">
            <img
              src="/images/denker/about-range.jpg"
              alt="Athletes training at the Denker Shooting Academy range"
              loading="lazy"
              className="size-full object-cover transition-transform duration-700 motion-safe:group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <div className="absolute right-7 bottom-7 left-7 text-white">
              <p className="text-xs font-semibold tracking-[0.18em] text-white/65 uppercase">
                Denker Shooting Academy
              </p>
              <p className="mt-2 max-w-sm text-xl leading-snug font-semibold sm:text-2xl">
                A focused environment where discipline becomes confidence.
              </p>
            </div>
          </div>

          <div className="absolute right-0 bottom-0 rounded-[28px] border border-primary/20 bg-card p-5 text-card-foreground shadow-xl">
            <p className="text-3xl font-semibold tracking-[-0.04em] text-primary-strong dark:text-primary">
              2012
            </p>
            <p className="mt-1 text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase">
              Established
            </p>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold tracking-[0.22em] text-primary-strong uppercase dark:text-primary">
            About Denker
          </p>
          <h2 className="mt-4 max-w-3xl text-4xl leading-[1.02] font-semibold tracking-[-0.05em] sm:text-5xl lg:text-6xl">
            Built for calm.
            <span className="block text-muted-foreground">
              Coached for precision.
            </span>
          </h2>
          <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            Denker helps juniors and adults develop safe habits, technical
            control and the confidence to progress from their first session to
            competition.
          </p>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
            Every pathway is structured around the athlete, with patient
            coaching, purposeful practice and a range environment designed for
            focused improvement.
          </p>

          <div className="mt-9 grid gap-3 sm:grid-cols-3">
            {[
              {
                icon: ShieldCheck,
                title: "Safety first",
                text: "Clear habits from day one.",
              },
              {
                icon: Target,
                title: "Precise coaching",
                text: "Technique with purpose.",
              },
              {
                icon: Trophy,
                title: "Real pathways",
                text: "Progress toward competition.",
              },
            ].map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="rounded-[24px] bg-muted/70 p-5 ring-1 ring-border/70"
              >
                <Icon
                  aria-hidden="true"
                  className="size-5 text-primary-strong dark:text-primary"
                />
                <h3 className="mt-4 font-semibold">{title}</h3>
                <p className="mt-1 text-sm leading-5 text-muted-foreground">
                  {text}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-9 flex flex-wrap gap-3">
            <a
              href="#programs"
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              Explore programs
              <ArrowUpRight aria-hidden="true" className="size-4" />
            </a>
            <Link
              to="/auth/manual-registration"
              className={buttonVariants({ variant: "default", size: "lg" })}
            >
              Book a trial
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AboutUs
