

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, KeyRound, ShieldCheck, UserRound } from "lucide-react";

import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";
import { useNavigate,useSearchParams } from "react-router-dom";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080").replace(/\/$/, "");

const signupSchema = z
  .object({
    otpCode: z.string().trim().regex(/^\d{6}$/, "Enter the six-digit verification code."),
    displayName: z.string().trim().min(1, "Enter your display name.").max(200),
    password: z
      .string()
      .min(12, "Use at least 12 characters.")
      .regex(/[A-Z]/, "Include an uppercase letter.")
      .regex(/[a-z]/, "Include a lowercase letter.")
      .regex(/\d/, "Include a number.")
      .regex(/[^A-Za-z0-9]/, "Include a special character."),
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type SignupValues = z.infer<typeof signupSchema>;
type BackendProblem = { detail?: string; message?: string };

function errorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError<BackendProblem>(error)) {
    return error.response?.data?.detail ?? error.response?.data?.message ?? fallback;
  }
  return fallback;
}

export function MasterAdminSignupForm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const [otpRequested, setOtpRequested] = useState(false);
  const form = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { otpCode: "", displayName: "", password: "", confirmPassword: "" },
  });

  const requestOtp = useCallback(async () => {
    if (!token) return;

    try {
      await axios.post(`${API_BASE_URL}/api/v1/invitations/${encodeURIComponent(token)}/mfa/request`, undefined, {
        withCredentials: true,
      });
      setOtpRequested(true);
      toast.add({ title: "Verification code sent", description: "Check your email for the six-digit code.", type: "success" });
    } catch (error) {
      toast.add({ title: "Unable to send code", description: errorMessage(error, "This invitation may be invalid or expired."), type: "error", priority: "high" });
    }
  }, [token]);

  useEffect(() => {
    const timer = window.setTimeout(() => void requestOtp(), 0);
    return () => window.clearTimeout(timer);
  }, [requestOtp]);

  async function onSubmit(values: SignupValues) {
    if (!token) return;

    try {
      await axios.post(
        `${API_BASE_URL}/api/v1/invitations/${encodeURIComponent(token)}/accept`,
        { displayName: values.displayName, password: values.password, otpCode: values.otpCode },
        { withCredentials: true },
      );
      toast.add({ title: "Account activated", description: "Your Master Admin account is ready to sign in.", type: "success" });
      navigate("/auth/login", { replace: true });
    } catch (error) {
      toast.add({ title: "Activation failed", description: errorMessage(error, "Check the verification code and try again."), type: "error", priority: "high" });
    }
  }

  if (!token) {
    return <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-foreground">This invitation link is missing its token. Ask your Platform Admin to send a new invitation.</p>;
  }

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3"><Label htmlFor="otp-code">Email verification code</Label><Button type="button" variant="link" size="sm" onClick={() => void requestOtp()}>Resend code</Button></div>
        <Input id="otp-code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="123456" className="h-11 bg-background/60 px-3" aria-invalid={Boolean(form.formState.errors.otpCode)} {...form.register("otpCode")} />
        {form.formState.errors.otpCode ? <p role="alert" className="text-xs text-destructive">{form.formState.errors.otpCode.message}</p> : <p className="text-xs text-muted-foreground">{otpRequested ? "Enter the six-digit code sent to your email." : "Requesting your verification code…"}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="master-admin-name">Your display name</Label>
        <div className="relative"><UserRound aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input id="master-admin-name" autoComplete="name" placeholder="Matheshraju" className="h-11 bg-background/60 pl-9" aria-invalid={Boolean(form.formState.errors.displayName)} {...form.register("displayName")} /></div>
        {form.formState.errors.displayName && <p role="alert" className="text-xs text-destructive">{form.formState.errors.displayName.message}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2"><Label htmlFor="master-admin-password">Create password</Label><div className="relative"><KeyRound aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input id="master-admin-password" type="password" autoComplete="new-password" placeholder="StrongPassword@123" className="h-11 bg-background/60 pl-9" aria-invalid={Boolean(form.formState.errors.password)} {...form.register("password")} /></div>{form.formState.errors.password && <p role="alert" className="text-xs text-destructive">{form.formState.errors.password.message}</p>}</div>
        <div className="space-y-2"><Label htmlFor="master-admin-confirm-password">Confirm password</Label><Input id="master-admin-confirm-password" type="password" autoComplete="new-password" className="h-11 bg-background/60 px-3" aria-invalid={Boolean(form.formState.errors.confirmPassword)} {...form.register("confirmPassword")} />{form.formState.errors.confirmPassword && <p role="alert" className="text-xs text-destructive">{form.formState.errors.confirmPassword.message}</p>}</div>
      </div>

      <Button type="submit" size="lg" className="mt-2 h-11 w-full text-sm" disabled={form.formState.isSubmitting || !otpRequested}>
        <ShieldCheck data-icon="inline-start" aria-hidden="true" />
        {form.formState.isSubmitting ? "Activating account…" : "Activate Master Admin account"}
        {!form.formState.isSubmitting && <ArrowRight data-icon="inline-end" aria-hidden="true" />}
      </Button>
    </form>
  );
}
