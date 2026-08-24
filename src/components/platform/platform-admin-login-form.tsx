

import { useState } from "react";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, KeyRound, Mail, ShieldCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useAuth } from "@/components/platform/platform-auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";

const loginSchema = z.object({
  tenantSlug: z.string().trim().min(1, "Enter the platform tenant slug."),
  identifier: z.string().trim().min(1, "Enter your email address or username."),
  password: z.string().min(1, "Enter your password."),
});

type LoginValues = z.infer<typeof loginSchema>;
type BackendProblem = { detail?: string; message?: string };

export function PlatformAdminLoginForm() {
  const { login } = useAuth();
  const [message, setMessage] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { tenantSlug: "platform", identifier: "", password: "" },
  });

  async function onSubmit(values: LoginValues) {
    setMessage("");

    try {
      await login(values);
      const successMessage = "Signed in successfully.";
      setMessage(successMessage);
      toast.add({ title: "Welcome back", description: successMessage, type: "success" });
    } catch (error) {
      let errorMessage = "Unable to sign in. Check that the backend is running and try again.";

      if (error instanceof Error && error.message === "This account is not a Platform Admin.") {
        errorMessage = "This account does not have Platform Admin access.";
      } else if (axios.isAxiosError<BackendProblem>(error)) {
        const detail = error.response?.data?.detail ?? error.response?.data?.message;
        if (detail) {
          errorMessage = detail;
        } else if (error.response?.status === 401) {
          errorMessage = "The email, platform tenant slug, or password is incorrect.";
        } else if (error.response?.status === 429) {
          errorMessage = "Too many sign-in attempts. Please wait and try again.";
        }
      }

      setMessage(errorMessage);
      toast.add({ title: "Sign-in failed", description: errorMessage, type: "error", priority: "high" });
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="space-y-2">
        <Label htmlFor="platform-slug">Platform tenant slug</Label>
        <Input id="platform-slug" placeholder="platform" className="h-11 bg-background/60" {...register("tenantSlug")} aria-invalid={Boolean(errors.tenantSlug)} />
        {errors.tenantSlug && <p role="alert" className="text-xs text-destructive">{errors.tenantSlug.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="platform-identifier">Email or username</Label>
        <div className="relative">
          <Mail aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input id="platform-identifier" autoComplete="username" placeholder="owner@example.com" className="h-11 bg-background/60 pl-9" {...register("identifier")} aria-invalid={Boolean(errors.identifier)} />
        </div>
        {errors.identifier && <p role="alert" className="text-xs text-destructive">{errors.identifier.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="platform-password">Password</Label>
        <div className="relative">
          <KeyRound aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input id="platform-password" type="password" autoComplete="current-password" placeholder="Enter your password" className="h-11 bg-background/60 pl-9" {...register("password")} aria-invalid={Boolean(errors.password)} />
        </div>
        {errors.password && <p role="alert" className="text-xs text-destructive">{errors.password.message}</p>}
      </div>

      {message && <p role="status" className="rounded-lg border border-primary/25 bg-primary/10 p-3 text-sm text-foreground">{message}</p>}

      <Button type="submit" size="lg" className="h-11 w-full" disabled={isSubmitting}>
        <ShieldCheck data-icon="inline-start" aria-hidden="true" />
        {isSubmitting ? "Signing in…" : "Sign in as Platform Admin"}
        {!isSubmitting && <ArrowRight data-icon="inline-end" aria-hidden="true" />}
      </Button>
    </form>
  );
}
