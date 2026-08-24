import { buttonVariants } from "@/components/ui/button"
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  MapPin,
  UsersRound,
} from "lucide-react"
import { Link } from "react-router-dom"

const classDays = [
  {
    date: "Sep 05",
    day: "Saturday",
    classes: [
      {
        time: "09:00",
        period: "AM",
        category: "Junior",
        location: "Laser Range",
        title: "Junior Laser Discovery",
        description:
          "A safe, confidence-building introduction to stance, focus and laser shooting fundamentals.",
        duration: "90 min",
        coaches: "2 coaches",
        availability: "Available",
        spots: "8 spots left",
        slug: "junior-laser",
      },
      {
        time: "13:30",
        period: "PM",
        category: "Workshop",
        location: "Main Range",
        title: "Precision Fundamentals",
        description:
          "Build a repeatable routine through guided work on posture, sight alignment and trigger control.",
        duration: "2 hours",
        coaches: "2 coaches",
        availability: "Waitlist only",
        spots: "Class is full",
        slug: "precision-fundamentals",
      },
    ],
  },
  {
    date: "Sep 12",
    day: "Saturday",
    classes: [
      {
        time: "10:00",
        period: "AM",
        category: "Competition",
        location: "10m Range",
        title: "Competition Readiness Clinic",
        description:
          "A focused clinic covering match routines, scoring strategy and calm performance under pressure.",
        duration: "3 hours",
        coaches: "3 coaches",
        availability: "Available",
        spots: "Filling fast",
        slug: "competition-readiness",
      },
    ],
  },
]

function UpcomingClasses() {
  return (
    <section id="classes" className="scroll-mt-8 bg-background py-20 sm:py-24">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold tracking-[0.22em] text-primary-strong uppercase dark:text-primary">
            Upcoming classes
          </p>
          <h2 className="mt-4 text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">
            Your next session starts here.
          </h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            Reserve a place in an upcoming coached session at Denker Shooting
            Academy.
          </p>
        </div>

        <div className="mt-12 space-y-10">
          {classDays.map((classDay) => (
            <div
              key={classDay.date}
              className="grid gap-5 border-b border-border/70 pb-10 last:border-0 last:pb-0 md:grid-cols-[120px_minmax(0,1fr)]"
            >
              <div className="md:pt-5">
                <p className="text-2xl font-semibold tracking-[-0.03em] text-foreground">
                  {classDay.date}
                </p>
                <p className="mt-1 text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                  {classDay.day}
                </p>
              </div>

              <div className="space-y-4">
                {classDay.classes.map((classItem) => {
                  const available = classItem.availability === "Available"

                  return (
                    <article
                      key={classItem.title}
                      className="relative grid gap-6 overflow-hidden rounded-[28px] bg-card p-6 text-card-foreground shadow-[0_18px_50px_rgba(0,0,0,0.08)] ring-1 ring-border/80 sm:p-7 lg:grid-cols-[90px_minmax(0,1fr)_180px] lg:items-center"
                    >
                      <span
                        aria-hidden="true"
                        className="absolute inset-y-0 left-0 w-1 bg-primary"
                      />

                      <div>
                        <p className="text-2xl font-semibold tracking-[-0.03em]">
                          {classItem.time}
                        </p>
                        <p className="mt-1 text-xs font-medium text-muted-foreground">
                          {classItem.period}
                        </p>
                        <p className="mt-5 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock3 aria-hidden="true" className="size-3.5" />
                          {classItem.duration}
                        </p>
                      </div>

                      <div>
                        <div className="flex flex-wrap gap-2">
                          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold tracking-[0.12em] text-primary-strong uppercase dark:text-primary">
                            {classItem.category}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[10px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                            <MapPin aria-hidden="true" className="size-3" />
                            {classItem.location}
                          </span>
                        </div>
                        <h3 className="mt-3 text-xl font-semibold tracking-[-0.025em] sm:text-2xl">
                          {classItem.title}
                        </h3>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                          {classItem.description}
                        </p>
                        <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <UsersRound aria-hidden="true" className="size-3.5" />
                          {classItem.coaches}
                        </p>
                      </div>

                      <div className="flex flex-col items-start lg:items-end">
                        <p
                          className={
                            available
                              ? "flex items-center gap-1.5 text-sm font-semibold text-primary-strong dark:text-primary"
                              : "flex items-center gap-1.5 text-sm font-semibold text-destructive"
                          }
                        >
                          <CheckCircle2 aria-hidden="true" className="size-4" />
                          {classItem.availability}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {classItem.spots}
                        </p>
                        <Link
                          to={
                            "/auth/manual-registration?class=" + classItem.slug
                          }
                          className={buttonVariants({
                            variant: available ? "default" : "outline",
                            size: "lg",
                            className: "mt-4 w-full lg:w-auto",
                          })}
                        >
                          {available ? "Register now" : "Join waitlist"}
                          <ArrowRight aria-hidden="true" className="size-4" />
                        </Link>
                      </div>
                    </article>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default UpcomingClasses
