"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw, UsersRound } from "lucide-react";

import { useAuth } from "@/components/platform/platform-auth-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/toast";

type Coach = {
  id: string;
  firstName: string;
  lastName: string;
  employmentType: string;
  jobTitle: string | null;
  status: string;
  branchId: string;
};

type CoachPage = {
  content: Coach[];
  totalElements: number;
};

function coachErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Please try again.";
}

export default function CoachesPage() {
  const { authorizedRequest, state } = useAuth();
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [totalCoaches, setTotalCoaches] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadCoaches = useCallback(async () => {
    setLoading(true);

    try {
      const response = await authorizedRequest<CoachPage>({
        method: "GET",
        url: "/api/v1/coaches",
        params: { page: 0, size: 100 },
      });
      setCoaches(response.data.content);
      setTotalCoaches(response.data.totalElements);
    } catch (error) {
      toast.add({
        title: "Unable to load coaches",
        description: coachErrorMessage(error),
        type: "error",
        priority: "high",
      });
    } finally {
      setLoading(false);
    }
  }, [authorizedRequest]);

  useEffect(() => {
    if (state !== "authenticated") return;

    const timer = window.setTimeout(() => void loadCoaches(), 0);
    return () => window.clearTimeout(timer);
  }, [loadCoaches, state]);

  return (
    <main className="min-h-svh bg-background text-foreground">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-8 lg:px-12">
        <header className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <Badge variant="secondary" className="mb-3 border border-primary/20 px-2.5 text-primary-strong">
              <UsersRound data-icon="inline-start" aria-hidden="true" />
              Academy team
            </Badge>
            <h1 className="font-heading text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
              Coaches
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              View the coaches in your academy.
            </p>
          </div>
          <Button type="button" variant="outline" onClick={() => void loadCoaches()} disabled={loading}>
            <RefreshCw aria-hidden="true" className={loading ? "animate-spin" : ""} />
            Refresh
          </Button>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Coach directory</CardTitle>
            <CardDescription>
              {totalCoaches} coach{totalCoaches === 1 ? "" : "es"} in this tenant.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading || state === "loading" ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Loading coaches…</p>
            ) : coaches.length === 0 ? (
              <div className="py-8 text-center">
                <p className="font-medium">No coaches yet.</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Approved coach registrations will appear here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px] text-left text-sm">
                  <thead className="border-b text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-3 py-3 font-medium">Coach</th>
                      <th className="px-3 py-3 font-medium">Job title</th>
                      <th className="px-3 py-3 font-medium">Employment</th>
                      <th className="px-3 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coaches.map((coach) => (
                      <tr key={coach.id} className="border-b last:border-0">
                        <td className="px-3 py-4 font-medium text-foreground">
                          {coach.firstName} {coach.lastName}
                        </td>
                        <td className="px-3 py-4 text-muted-foreground">
                          {coach.jobTitle || "Not specified"}
                        </td>
                        <td className="px-3 py-4 capitalize">
                          {coach.employmentType.replaceAll("_", " ").toLowerCase()}
                        </td>
                        <td className="px-3 py-4">
                          <Badge variant={coach.status === "ACTIVE" ? "default" : "secondary"}>
                            {coach.status.toLowerCase()}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
