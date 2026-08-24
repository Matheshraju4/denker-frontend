import { BadgeCheck, ChevronDown, Clock3, Plus, UsersRound } from "lucide-react"
import { Link } from "react-router-dom"

const programs = [
  {
    slug: "junior-laser",
    name: "Junior Laser",
    age: "Ages 7–9",
    duration: "90 min",
    description:
      "Perfect for building foundational skills — 90-minute sessions introduce the basics of shooting in a safe, fun and supportive environment.",
    image: "/images/denker/program-junior-laser.jpg",
    alt: "A coach with a young Junior Laser athlete at the range",
    suitableFor:
      "First-time young athletes building confidence before handling live equipment.",
    sessionLength: "90-minute sessions",
    focus: [
      "Range safety fundamentals",
      "Stance and posture",
      "Focus and trigger control",
    ],
  },
  {
    slug: "junior-shooting-stars",
    name: "Junior Shooting Stars",
    age: "Ages 10–11",
    duration: "120 min",
    description:
      "The transition to live shooting. Two-hour sessions reinforce the fundamentals, build confidence and enhance technique as young athletes progress.",
    image: "/images/denker/program-junior-stars.jpg",
    alt: "A junior athlete practising precision air rifle shooting",
    suitableFor:
      "Junior Laser graduates, or new athletes ready for longer, more structured live sessions.",
    sessionLength: "2-hour sessions",
    focus: [
      "Extended focus and discipline",
      "Technique refinement",
      "Introduction to scoring",
    ],
  },
  {
    slug: "junior-sports-shooting",
    name: "Junior Sports Shooting",
    age: "Ages 12–17",
    duration: "Weekly",
    description:
      "For athletes competing nationally and aspiring to represent their school teams — refining technique and gaining valuable competitive experience.",
    image: "/images/denker/program-junior-sports.jpg",
    alt: "A junior athlete training with a competition air rifle and electronic scoring monitor",
    suitableFor:
      "Committed young athletes pursuing school and national-level competition.",
    sessionLength: "Weekly structured sessions",
    focus: [
      "Olympic 10m standing technique",
      "Competition readiness",
      "Performance consistency",
    ],
  },
  {
    slug: "adult-shooting",
    name: "Adult Shooting",
    age: "Ages 18+",
    duration: "Flexible",
    description:
      "Open to competitive and recreational shooters alike — coached or self-guided training that caters to all skill levels and aspirations.",
    image: "/images/denker/program-adult.jpg",
    alt: "Adults receiving precision shooting coaching at the range",
    suitableFor:
      "Adults seeking a focused hobby, a competitive pathway, or a team-bonding activity.",
    sessionLength: "Flexible single-session and multipass options",
    focus: [
      "Range safety and weapon handling",
      "Basic-to-advanced technique",
      "Coached or self-guided practice",
    ],
  },
]

function Programs() {
  return (
    <section
      id="programs"
      className="w-full scroll-mt-8 bg-muted/40 text-foreground"
    >
      <div className="mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-12 xl:px-20">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold tracking-[0.22em] text-primary-strong uppercase dark:text-primary">
            Programs
          </p>
          <h2 className="mt-4 text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">
            Train with purpose.
          </h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            Four focused pathways for new athletes, developing juniors and adult
            shooters.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {programs.map((program) => (
            <article
              key={program.name}
              className="group flex min-h-[620px] flex-col rounded-[54px] bg-card p-3 text-card-foreground shadow-[0_26px_70px_rgba(0,0,0,0.12)] ring-1 ring-border/80 transition-transform duration-500 motion-safe:hover:-translate-y-2"
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-[44px] bg-muted">
                <img
                  src={program.image}
                  alt={program.alt}
                  className="size-full object-cover transition-transform duration-700 motion-safe:group-hover:scale-105"
                />
                <span className="absolute top-5 left-5 rounded-full bg-background/80 px-4 py-2 text-xs font-medium text-foreground shadow-sm backdrop-blur-md">
                  {program.age}
                </span>
              </div>

              <div className="flex flex-1 flex-col px-5 pt-7 pb-5 sm:px-6">
                <div className="flex items-center gap-2.5">
                  <h3 className="text-2xl font-semibold tracking-[-0.035em]">
                    {program.name}
                  </h3>
                  <BadgeCheck
                    aria-label="Verified programme"
                    className="size-5 fill-primary text-primary-foreground"
                  />
                </div>
                <p className="mt-4 text-[15px] leading-6 text-muted-foreground">
                  {program.description}
                </p>

                <details className="group/details mt-5">
                  <summary className="flex w-fit cursor-pointer list-none items-center gap-1.5 text-sm font-semibold text-foreground transition-colors hover:text-primary-strong focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring [&::-webkit-details-marker]:hidden">
                    <span className="group-open/details:hidden">
                      View details
                    </span>
                    <span className="hidden group-open/details:inline">
                      Hide details
                    </span>
                    <ChevronDown
                      aria-hidden="true"
                      className="size-4 transition-transform group-open/details:rotate-180"
                    />
                  </summary>
                  <div className="mt-3 space-y-3 rounded-[24px] bg-muted p-4 text-sm leading-5 text-muted-foreground">
                    <p>
                      <span className="font-semibold text-foreground">
                        Suitable for:
                      </span>{" "}
                      {program.suitableFor}
                    </p>
                    <p>
                      <span className="font-semibold text-foreground">
                        Session length:
                      </span>{" "}
                      {program.sessionLength}
                    </p>
                    <div>
                      <p className="font-semibold text-foreground">
                        Training focus:
                      </p>
                      <ul className="mt-1 list-inside list-disc">
                        {program.focus.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </details>

                <div className="mt-auto flex items-center gap-3 pt-8">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <UsersRound aria-hidden="true" className="size-4" />
                    <span>{program.age.replace("Ages ", "")}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock3 aria-hidden="true" className="size-4" />
                    <span>{program.duration}</span>
                  </div>
                  <Link
                    to={`/auth/manual-registration?program=${program.slug}`}
                    className="ml-auto inline-flex h-14 items-center gap-2 rounded-full bg-secondary px-4 text-sm font-medium text-secondary-foreground shadow-md transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
                  >
                    Register
                    <span className="grid size-6 place-items-center rounded-full bg-primary text-primary-foreground">
                      <Plus aria-hidden="true" className="size-3.5" />
                    </span>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Programs
