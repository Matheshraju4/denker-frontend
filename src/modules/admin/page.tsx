"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BadgeDollarSign,
  CalendarDays,
  ClipboardCheck,
  Clock3,
  CreditCard,
  RefreshCw,
  ShieldAlert,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import { useAuth } from "@/components/platform/platform-auth-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { toast } from "@/components/ui/toast";

type PageResponse<T> = {
  content: T[];
  totalElements: number;
};

type Student = {
  membershipStatus: string | null;
};

type Payment = {
  amountMinor: number;
  currency: string;
  paymentDate: string;
  status: string;
};

type Attendance = {
  status: string;
};

type Session = {
  id: string;
  startAt: string;
  status: string;
  title: string;
};

type DashboardData = {
  totalMembers: number;
  activeMembers: number;
  revenue: string;
  attendanceRate: string;
  upcomingSessions: number;
  sessionChart: { day: string; sessions: number }[];
};

const emptyDashboard: DashboardData = {
  totalMembers: 0,
  activeMembers: 0,
  revenue: "—",
  attendanceRate: "—",
  upcomingSessions: 0,
  sessionChart: [],
};

const chartConfig = {
  sessions: { label: "Sessions", color: "var(--primary)" },
} satisfies ChartConfig;

function monthStart() {
  const date = new Date();
  date.setDate(1);
  date.setHours(0, 0, 0, 0);
  return date;
}

function toDateKey(date: Date) {
  return date.toLocaleDateString("en-CA");
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Please try again.";
}

function revenueLabel(payments: Payment[], start: Date) {
  const totals = new Map<string, number>();
  const startKey = toDateKey(start);

  for (const payment of payments) {
    if (payment.status !== "COMPLETED" || payment.paymentDate < startKey) continue;
    totals.set(payment.currency, (totals.get(payment.currency) ?? 0) + payment.amountMinor);
  }

  return [...totals].map(([currency, amount]) => new Intl.NumberFormat("en-SG", {
    style: "currency",
    currency,
  }).format(amount / 100)).join(" · ") || "—";
}

function sessionChart(sessions: Session[], start: Date) {
  const days = Array.from({ length: 7 }, (_, offset) => {
    const date = new Date(start);
    date.setDate(date.getDate() + offset);
    return { key: toDateKey(date), day: date.toLocaleDateString("en", { weekday: "short" }), sessions: 0 };
  });

  for (const session of sessions) {
    const day = days.find((item) => item.key === toDateKey(new Date(session.startAt)));
    if (day) day.sessions += 1;
  }

  return days.map(({ day, sessions }) => ({ day, sessions }));
}

export default function AdminDashboardPage() {
  const { authorizedRequest, state } = useAuth();
  const [dashboard, setDashboard] = useState<DashboardData>(emptyDashboard);
  const [loading, setLoading] = useState(true);

  const getAllPages = useCallback(async <T,>(url: string, params: Record<string, string | number>) => {
    const content: T[] = [];

    for (let page = 0; ; page += 1) {
      const response = await authorizedRequest<PageResponse<T>>({
        method: "GET",
        url,
        params: { ...params, page, size: 100 },
      });
      content.push(...response.data.content);

      if (content.length >= response.data.totalElements || response.data.content.length === 0) return content;
    }
  }, [authorizedRequest]);

  const loadDashboard = useCallback(async () => {
    setLoading(true);

    try {
      const now = new Date();
      const attendanceFrom = monthStart();
      const upcomingUntil = new Date(now);
      upcomingUntil.setDate(upcomingUntil.getDate() + 7);

      const [students, payments, attendance, sessions] = await Promise.all([
        getAllPages<Student>("/api/v1/students", {}),
        getAllPages<Payment>("/api/v1/payments", {}),
        getAllPages<Attendance>("/api/v1/attendance", {
          markedFrom: attendanceFrom.toISOString(),
          markedTo: now.toISOString(),
        }),
        getAllPages<Session>("/api/v1/calendar/admin", {
          startAtFrom: now.toISOString(),
          startAtTo: upcomingUntil.toISOString(),
          status: "SCHEDULED",
        }),
      ]);
      const markedAttendance = attendance.filter((record) => ["PRESENT", "LATE", "ABSENT", "EXCUSED"].includes(record.status));
      const attended = markedAttendance.filter((record) => ["PRESENT", "LATE"].includes(record.status));

      setDashboard({
        totalMembers: students.length,
        activeMembers: students.filter((student) => student.membershipStatus === "ACTIVE").length,
        revenue: revenueLabel(payments, attendanceFrom),
        attendanceRate: markedAttendance.length ? `${Math.round((attended.length / markedAttendance.length) * 100)}%` : "—",
        upcomingSessions: sessions.length,
        sessionChart: sessionChart(sessions, now),
      });
    } catch (error) {
      toast.add({
        title: "Unable to load dashboard",
        description: errorMessage(error),
        type: "error",
        priority: "high",
      });
    } finally {
      setLoading(false);
    }
  }, [getAllPages]);

  useEffect(() => {
    if (state !== "authenticated") return;

    const timer = window.setTimeout(() => void loadDashboard(), 0);
    return () => window.clearTimeout(timer);
  }, [loadDashboard, state]);

  const metrics = useMemo(() => [
    { label: "Total members", value: dashboard.totalMembers.toLocaleString(), detail: "Student records", icon: UsersRound },
    { label: "Active members", value: dashboard.activeMembers.toLocaleString(), detail: "Active memberships", icon: UsersRound },
    { label: "Revenue", value: dashboard.revenue, detail: "Completed payments this month", icon: BadgeDollarSign },
    { label: "Attendance rate", value: dashboard.attendanceRate, detail: "Present and late this month", icon: ClipboardCheck },
    { label: "Outstanding payments", value: "—", detail: "Requires invoice summary API", icon: CreditCard },
    { label: "Upcoming sessions", value: dashboard.upcomingSessions.toLocaleString(), detail: "Next 7 days", icon: CalendarDays },
    { label: "Pending bookings", value: "—", detail: "Booking workflow not available", icon: Clock3 },
    { label: "Expiring certifications", value: "—", detail: "Requires tenant-wide certification API", icon: ShieldAlert },
  ] satisfies { label: string; value: string; detail: string; icon: LucideIcon }[], [dashboard]);

  return (
    <main className="min-h-svh bg-background text-foreground">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-8 lg:px-12">
        <header className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <Badge variant="secondary" className="mb-3 border border-primary/20 px-2.5 text-primary-strong">
              <UsersRound data-icon="inline-start" aria-hidden="true" />
              Master Admin
            </Badge>
            <h1 className="font-heading text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Academy overview</h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Your academy at a glance, using the current month and next seven days.</p>
          </div>
          <Button type="button" variant="outline" onClick={() => void loadDashboard()} disabled={loading}>
            <RefreshCw aria-hidden="true" className={loading ? "animate-spin" : ""} />
            Refresh
          </Button>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <Card key={metric.label} size="sm">
              <CardHeader>
                <CardDescription className="flex items-center justify-between gap-2">
                  {metric.label}
                  <metric.icon className="size-4 text-primary" aria-hidden="true" />
                </CardDescription>
                <CardTitle className="text-2xl tabular-nums">{loading ? "…" : metric.value}</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">{metric.detail}</CardContent>
            </Card>
          ))}
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming sessions</CardTitle>
              <CardDescription>Scheduled sessions over the next seven days.</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[260px] w-full aspect-auto">
                <BarChart accessibilityLayer data={dashboard.sessionChart}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="day" tickLine={false} tickMargin={10} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                  <Bar dataKey="sessions" fill="var(--color-sessions)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Next backend slice</CardTitle>
              <CardDescription>These cards need server-side summaries before they can show accurate tenant totals.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>Outstanding invoice balances</p>
              <p>Pending booking requests</p>
              <p>Certifications expiring in 30 days</p>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
