

import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Building2, KeyRound, Mail, ShieldCheck } from "lucide-react";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080").replace(/\/$/, "");

const loginSchema = z.object({
  tenantSlug: z.string().trim().min(1, "Enter your academy's tenant slug."),
  identifier: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

type LoginValues = z.infer<typeof loginSchema>;
type LoginResponse = { accessToken: string };
type MeResponse = { email?: string; memberships?: Array<{ role?: string }> };
type BackendProblem = { detail?: string; message?: string };

function errorMessage(error: unknown) {
  if (axios.isAxiosError<BackendProblem>(error)) {
    return error.response?.data?.detail ?? error.response?.data?.message ?? "Sign-in failed. Check your details and try again.";
  }
  return error instanceof Error ? error.message : "Sign-in failed. Check your details and try again.";
}

export function MasterAdminLoginForm() {
  const navigate = useNavigate();
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { tenantSlug: "", identifier: "", password: "" },
  });

  async function onSubmit(values: LoginValues) {
    try {
      const login = await axios.post<LoginResponse>(
        `${API_BASE_URL}/api/v1/auth/login`,
        values,
        { withCredentials: true },
      );
      const profile = await axios.get<MeResponse>(`${API_BASE_URL}/api/v1/me`, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${login.data.accessToken}` },
      });

      if (!profile.data.memberships?.some((membership) => membership.role === "MASTER_ADMIN")) {
        throw new Error("This account does not have Master Admin access.");
      }

      toast.add({ title: "Signed in", description: "Your Master Admin session is ready.", type: "success" });
      navigate("/admin/approvals", { replace: true });
    } catch (error) {
      toast.add({ title: "Unable to sign in", description: errorMessage(error), type: "error", priority: "high" });
    }
  }

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <div className="space-y-2">
        <Label htmlFor="tenant-slug">Academy tenant slug</Label>
        <div className="relative"><Building2 aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input id="tenant-slug" autoComplete="organization" placeholder="academy" className="h-11 bg-background/60 pl-9" aria-invalid={Boolean(form.formState.errors.tenantSlug)} {...form.register("tenantSlug")} /></div>
        {form.formState.errors.tenantSlug && <p role="alert" className="text-xs text-destructive">{form.formState.errors.tenantSlug.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="master-admin-email">Email address</Label>
        <div className="relative"><Mail aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input id="master-admin-email" type="email" autoComplete="email" placeholder="admin@academy.com" className="h-11 bg-background/60 pl-9" aria-invalid={Boolean(form.formState.errors.identifier)} {...form.register("identifier")} /></div>
        {form.formState.errors.identifier && <p role="alert" className="text-xs text-destructive">{form.formState.errors.identifier.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="master-admin-login-password">Password</Label>
        <div className="relative"><KeyRound aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input id="master-admin-login-password" type="password" placeholder="Enter your password" autoComplete="current-password" className="h-11 bg-background/60 pl-9" aria-invalid={Boolean(form.formState.errors.password)} {...form.register("password")} /></div>
        {form.formState.errors.password && <p role="alert" className="text-xs text-destructive">{form.formState.errors.password.message}</p>}
      </div>

      <Button type="submit" size="lg" className="mt-2 h-11 w-full text-sm" disabled={form.formState.isSubmitting}>
        <ShieldCheck data-icon="inline-start" aria-hidden="true" />
        {form.formState.isSubmitting ? "Signing in…" : "Sign in as Master Admin"}
        {!form.formState.isSubmitting && <ArrowRight data-icon="inline-end" aria-hidden="true" />}
      </Button>
    </form>
  );
}
