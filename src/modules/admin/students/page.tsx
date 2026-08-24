"use client";

import { useCallback, useEffect, useState } from "react";
import { GraduationCap, RefreshCw } from "lucide-react";

import { useAuth } from "@/components/platform/platform-auth-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/toast";

type Student = {
  id: string;
  firstName: string;
  lastName: string;
  schoolName: string | null;
  schoolLevel: string | null;
  status: string;
  joiningDate: string | null;
  membershipNumber: string | null;
};

type StudentPage = {
  content: Student[];
  totalElements: number;
};

function studentErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Please try again.";
}

export default function StudentsPage() {
  const { authorizedRequest, state } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadStudents = useCallback(async () => {
    setLoading(true);

    try {
      const response = await authorizedRequest<StudentPage>({
        method: "GET",
        url: "/api/v1/students",
        params: { page: 0, size: 100 },
      });
      setStudents(response.data.content);
      setTotalStudents(response.data.totalElements);
    } catch (error) {
      toast.add({
        title: "Unable to load students",
        description: studentErrorMessage(error),
        type: "error",
        priority: "high",
      });
    } finally {
      setLoading(false);
    }
  }, [authorizedRequest]);

  useEffect(() => {
    if (state !== "authenticated") return;

    const timer = window.setTimeout(() => void loadStudents(), 0);
    return () => window.clearTimeout(timer);
  }, [loadStudents, state]);

  return (
    <main className="min-h-svh bg-background text-foreground">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-8 lg:px-12">
        <header className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <Badge variant="secondary" className="mb-3 border border-primary/20 px-2.5 text-primary-strong">
              <GraduationCap data-icon="inline-start" aria-hidden="true" />
              Academy members
            </Badge>
            <h1 className="font-heading text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
              Students
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              View the students enrolled in your academy.
            </p>
          </div>
          <Button type="button" variant="outline" onClick={() => void loadStudents()} disabled={loading}>
            <RefreshCw aria-hidden="true" className={loading ? "animate-spin" : ""} />
            Refresh
          </Button>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Student directory</CardTitle>
            <CardDescription>
              {totalStudents} student{totalStudents === 1 ? "" : "s"} in this tenant.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading || state === "loading" ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Loading students…</p>
            ) : students.length === 0 ? (
              <div className="py-8 text-center">
                <p className="font-medium">No students yet.</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Approved student registrations will appear here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px] text-left text-sm">
                  <thead className="border-b text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-3 py-3 font-medium">Student</th>
                      <th className="px-3 py-3 font-medium">School</th>
                      <th className="px-3 py-3 font-medium">Membership</th>
                      <th className="px-3 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => (
                      <tr key={student.id} className="border-b last:border-0">
                        <td className="px-3 py-4 font-medium text-foreground">
                          {student.firstName} {student.lastName}
                        </td>
                        <td className="px-3 py-4 text-muted-foreground">
                          {student.schoolName || "Not specified"}
                          {student.schoolLevel ? ` · ${student.schoolLevel}` : ""}
                        </td>
                        <td className="px-3 py-4 text-muted-foreground">
                          {student.membershipNumber || "Not assigned"}
                        </td>
                        <td className="px-3 py-4">
                          <Badge variant={student.status === "ACTIVE" ? "default" : "secondary"}>
                            {student.status.toLowerCase()}
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
