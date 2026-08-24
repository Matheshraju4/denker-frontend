


import { useState, type ReactNode } from "react";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";

import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, CalendarDays, KeyRound, Mail, ShieldCheck, UserRound } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/toast";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080").replace(/\/$/, "");

const roles = [{ label: "Student", value: "STUDENT" }, { label: "Parent or guardian", value: "PARENT" }, { label: "Coach", value: "COACH" }] as const;

const registrationSchema = z.object({
  tenantSlug: z.string().trim().min(1, "Enter your academy tenant slug."),
  accountType: z.enum(["STUDENT", "PARENT", "COACH"]),
  fullName: z.string().trim().min(2, "Enter your full name.").max(200),
  email: z.string().trim().email("Enter a valid email address."),
  mobile: z.string().trim().regex(/^$|^\d{8}$/, "Enter an 8-digit Singapore mobile number."),
  otpCode: z.string().trim().regex(/^\d{6}$/, "Enter the six-digit code."),
  password: z.string().min(12, "Use at least 12 characters.").regex(/[A-Z]/, "Include an uppercase letter.").regex(/[a-z]/, "Include a lowercase letter.").regex(/\d/, "Include a number.").regex(/[^A-Za-z0-9]/, "Include a special character."),
  confirmPassword: z.string(),
  termsAccepted: z.boolean().refine(Boolean, "You must accept the Terms of Use."),
  privacyAccepted: z.boolean().refine(Boolean, "You must accept the Privacy Policy."),
  firstName: z.string().trim(),
  lastName: z.string().trim(),
  dateOfBirth: z.string(),
  gender: z.string(),
  nationality: z.string().trim(),
  identificationType: z.string(),
  rawIdentificationNumber: z.string().trim(),
}).superRefine((values, context) => {
  if (values.password !== values.confirmPassword) context.addIssue({ code: "custom", path: ["confirmPassword"], message: "Passwords do not match." });
  if (values.accountType !== "STUDENT") return;
  (["firstName", "lastName", "dateOfBirth", "gender", "nationality", "identificationType", "rawIdentificationNumber"] as const).forEach((field) => {
    if (!values[field]) context.addIssue({ code: "custom", path: [field], message: "This student detail is required." });
  });
});

type RegistrationValues = z.infer<typeof registrationSchema>;
type RequestOtpResponse = { challengeId: string };
type VerifyOtpResponse = { outcome: string; registrationToken?: string; message?: string };
type BackendProblem = { detail?: string; message?: string };
type Step = "details" | "verify" | "complete" | "submitted";

function errorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError<BackendProblem>(error)) return error.response?.data?.detail ?? error.response?.data?.message ?? fallback;
  return error instanceof Error ? error.message : fallback;
}

function Progress({ step }: { step: Step }) {
  const active = step === "details" ? 1 : step === "verify" ? 2 : 3;
  return <div className="mb-6 grid grid-cols-3 gap-2" aria-label={`Registration progress: step ${active} of 3`}>{[1, 2, 3].map((item) => <span key={item} className={`h-1 rounded-full ${item <= active ? "bg-primary" : "bg-border"}`} />)}</div>;
}

export default function ManualRegistration() {
  const [step, setStep] = useState<Step>("details");
  const [challengeId, setChallengeId] = useState("");
  const [registrationToken, setRegistrationToken] = useState("");
  const form = useForm<RegistrationValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: { tenantSlug: "", accountType: "STUDENT", fullName: "", email: "", mobile: "", otpCode: "", password: "", confirmPassword: "", termsAccepted: false, privacyAccepted: false, firstName: "", lastName: "", dateOfBirth: "", gender: "", nationality: "Singapore", identificationType: "NRIC", rawIdentificationNumber: "" },
  });
  const role = useWatch({ control: form.control, name: "accountType" });

  async function requestOtp() {
    const valid = await form.trigger(["tenantSlug", "accountType", "fullName", "email", "mobile"]);
    if (!valid) return;
    const values = form.getValues();
    try {
      const response = await axios.post<RequestOtpResponse>(`${API_BASE_URL}/api/v1/auth/otp/request`, { tenantSlug: values.tenantSlug, channel: "EMAIL", destination: values.email }, { withCredentials: true });
      setChallengeId(response.data.challengeId);
      setStep("verify");
      toast.add({ title: "Verification code sent", description: "Check your email for the six-digit code.", type: "success" });
    } catch (error) {
      toast.add({ title: "Unable to send code", description: errorMessage(error, "Check the tenant slug and email address."), type: "error", priority: "high" });
    }
  }

  async function verifyOtp() {
    const valid = await form.trigger("otpCode");
    if (!valid || !challengeId) return;
    const values = form.getValues();
    try {
      const response = await axios.post<VerifyOtpResponse>(`${API_BASE_URL}/api/v1/auth/otp/verify`, { challengeId, destination: values.email, code: values.otpCode, displayName: values.fullName }, { withCredentials: true });
      if (!response.data.registrationToken || !["REGISTRATION_REQUIRED", "ONBOARDING_INCOMPLETE"].includes(response.data.outcome)) throw new Error(response.data.message ?? "This email is already registered. Please sign in instead.");
      setRegistrationToken(response.data.registrationToken);
      setStep("complete");
      toast.add({ title: "Email verified", description: "Create your password and complete the registration.", type: "success" });
    } catch (error) {
      toast.add({ title: "Verification failed", description: errorMessage(error, "Check the code and try again."), type: "error", priority: "high" });
    }
  }

  async function submitRegistration() {
    const valid = await form.trigger();
    if (!valid || !registrationToken) return;
    const values = form.getValues();
    const mobile = values.mobile ? `+65${values.mobile}` : undefined;
    try {
      await axios.post(`${API_BASE_URL}/api/v1/registration/submit`, {
        accountType: values.accountType,
        mobile,
        password: values.password,
        termsAccepted: values.termsAccepted,
        privacyAccepted: values.privacyAccepted,
        studentProfile: values.accountType === "STUDENT" ? { firstName: values.firstName, lastName: values.lastName, dateOfBirth: values.dateOfBirth, gender: values.gender, nationality: values.nationality, identificationType: values.identificationType, rawIdentificationNumber: values.rawIdentificationNumber } : undefined,
      }, { withCredentials: true, headers: { Authorization: `Bearer ${registrationToken}` } });
      setStep("submitted");
      toast.add({ title: "Registration submitted", description: "The academy will review your account before you can sign in.", type: "success" });
    } catch (error) {
      toast.add({ title: "Registration failed", description: errorMessage(error, "Please review your details and try again."), type: "error", priority: "high" });
    }
  }

  return <main className="relative min-h-svh overflow-x-hidden bg-background text-foreground"><img src="/images/image.png" alt="" className="absolute inset-0 hidden size-full object-cover object-[68%_center] dark:block sm:object-center" /><img src="/images/image-light-mode.png" alt="" className="absolute inset-0 size-full object-cover object-[68%_center] dark:hidden sm:object-center" /><div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-background/55 sm:bg-gradient-to-r sm:from-background sm:via-background/90 sm:to-background/10" /><div className="relative z-10 mx-auto flex min-h-svh w-full max-w-[1600px] flex-col px-4 py-5 sm:px-8 sm:py-7 lg:px-12 xl:px-16"><header className="flex w-full max-w-xl items-center"><Link to="/" aria-label="Return to registration options"><img src="/images/logo.png" alt="Denker Sports World Shooting" className="h-auto w-[220px] sm:w-[270px]" /></Link></header><section className="flex flex-1 items-center py-8 sm:py-10"><div className="relative w-full max-w-xl rounded-2xl border border-primary/10 bg-gradient-to-br from-background via-background to-primary/15 p-5 shadow-2xl shadow-primary/10 ring-1 ring-inset ring-foreground/5 backdrop-blur-md sm:p-7 lg:p-8"><Progress step={step} />{step === "submitted" ? <Submitted /> : <><Badge variant="secondary" className="mb-4 border border-primary/20 px-2.5 text-primary-strong"><ShieldCheck data-icon="inline-start" aria-hidden="true" />Manual registration</Badge><h1 className="font-heading text-3xl font-semibold leading-[1.08] tracking-[-0.04em] sm:text-4xl">{step === "verify" ? "Verify your email." : step === "complete" ? "Finish your registration." : "Create your account."}</h1><p className="mt-3 text-sm leading-6 text-muted-foreground">{step === "complete" && role === "STUDENT" ? "Add the student details required for academy approval." : "Register as a student, parent, or coach using your email address."}</p><div className="mt-7">{step === "details" && <DetailsForm form={form} onContinue={() => void requestOtp()} />}{step === "verify" && <VerificationForm form={form} onBack={() => setStep("details")} onVerify={() => void verifyOtp()} onResend={() => void requestOtp()} />}{step === "complete" && <CompleteForm form={form} role={role} onBack={() => setStep("verify")} onSubmit={() => void submitRegistration()} />}</div></>}</div></section><footer className="flex w-full max-w-xl items-center justify-between gap-4 text-xs text-foreground/60"><span>Protected with industry-standard security.</span><span className="hidden sm:inline">Â© 2026 Sports Academy</span></footer></div></main>;
}

function DetailsForm({ form, onContinue }: { form: ReturnType<typeof useForm<RegistrationValues>>; onContinue: () => void }) {
  const { register, formState: { errors } } = form;
  return <div className="space-y-5"><Field label="Academy tenant slug" error={errors.tenantSlug?.message}><Input placeholder="mathesh" className="h-11 bg-card/70" {...register("tenantSlug")} /></Field><Field label="I am registering as" error={errors.accountType?.message}><Select value={form.getValues("accountType")} onValueChange={(value) => value && form.setValue("accountType", value as RegistrationValues["accountType"], { shouldDirty: true, shouldValidate: true })}><SelectTrigger className="h-11 w-full bg-card/70" aria-label="I am registering as"><SelectValue /></SelectTrigger><SelectContent>{roles.map((role) => <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>)}</SelectContent></Select></Field><Field label="Full name" error={errors.fullName?.message}><Input autoComplete="name" placeholder="Jane Tan" className="h-11 bg-card/70" {...register("fullName")} /></Field><Field label="Email address" error={errors.email?.message}><Input type="email" autoComplete="email" placeholder="jane.tan@example.com" className="h-11 bg-card/70" {...register("email")} /></Field><Field label="Singapore mobile number (optional)" error={errors.mobile?.message}><div className="flex h-11 overflow-hidden rounded-lg border border-input bg-card/70"><span className="flex items-center border-r border-input px-3 text-sm text-muted-foreground">+65</span><Input inputMode="numeric" autoComplete="tel-national" placeholder="8123 4567" className="h-full rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0" {...register("mobile")} /></div></Field><Button type="button" size="lg" className="h-11 w-full" onClick={onContinue}>Send verification code<ArrowRight data-icon="inline-end" aria-hidden="true" /></Button></div>;
}
function VerificationForm({ form, onBack, onVerify, onResend }: { form: ReturnType<typeof useForm<RegistrationValues>>; onBack: () => void; onVerify: () => void; onResend: () => void }) { const { register, formState: { errors } } = form; return <div className="space-y-5"><Field label="Six-digit verification code" error={errors.otpCode?.message}><div className="relative"><Mail aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="123456" className="h-11 bg-card/70 pl-9" {...register("otpCode")} /></div></Field><p className="text-sm text-muted-foreground">We sent a code to {form.getValues("email")}.</p><Button type="button" size="lg" className="h-11 w-full" onClick={onVerify}>Verify email<ArrowRight data-icon="inline-end" aria-hidden="true" /></Button><div className="flex justify-between text-sm"><Button type="button" variant="link" onClick={onBack}><ArrowLeft aria-hidden="true" />Back</Button><Button type="button" variant="link" onClick={onResend}>Resend code</Button></div></div>; }
function CompleteForm({ form, role, onBack, onSubmit }: { form: ReturnType<typeof useForm<RegistrationValues>>; role: RegistrationValues["accountType"]; onBack: () => void; onSubmit: () => void }) {
  const { register, formState: { errors, isSubmitting } } = form;
  const gender = useWatch({ control: form.control, name: "gender" });
  const identificationType = useWatch({ control: form.control, name: "identificationType" });

  return <div className="space-y-5">{role === "STUDENT" && <div className="space-y-4 rounded-xl border border-border bg-card/50 p-4"><div className="flex gap-2"><UserRound aria-hidden="true" className="mt-0.5 size-4 text-primary-strong" /><div><h2 className="font-medium">Student profile</h2><p className="text-xs text-muted-foreground">These details are reviewed by the academy.</p></div></div><div className="grid gap-4 sm:grid-cols-2"><Field label="First name" error={errors.firstName?.message}><Input placeholder="Jane" className="h-10 bg-background/60" {...register("firstName")} /></Field><Field label="Last name" error={errors.lastName?.message}><Input placeholder="Tan" className="h-10 bg-background/60" {...register("lastName")} /></Field><DateOfBirthPicker form={form} error={errors.dateOfBirth?.message} /><Field label="Gender" error={errors.gender?.message}><Select value={gender || null} onValueChange={(value) => form.setValue("gender", value ?? "", { shouldDirty: true, shouldValidate: true })}><SelectTrigger className="h-10 w-full bg-background/60" aria-label="Gender"><SelectValue placeholder="Select gender" /></SelectTrigger><SelectContent><SelectItem value="MALE">Male</SelectItem><SelectItem value="FEMALE">Female</SelectItem><SelectItem value="OTHER">Other</SelectItem><SelectItem value="UNDISCLOSED">Prefer not to say</SelectItem></SelectContent></Select></Field><Field label="Nationality" error={errors.nationality?.message}><Input placeholder="Singapore" className="h-10 bg-background/60" {...register("nationality")} /></Field><Field label="ID type" error={errors.identificationType?.message}><Select value={identificationType || null} onValueChange={(value) => form.setValue("identificationType", value ?? "", { shouldDirty: true, shouldValidate: true })}><SelectTrigger className="h-10 w-full bg-background/60" aria-label="Identification type"><SelectValue placeholder="Select ID type" /></SelectTrigger><SelectContent><SelectItem value="NRIC">NRIC</SelectItem><SelectItem value="FIN">FIN</SelectItem><SelectItem value="PASSPORT">Passport</SelectItem><SelectItem value="OTHER">Other</SelectItem></SelectContent></Select></Field></div><Field label="Identification number" error={errors.rawIdentificationNumber?.message}><Input placeholder="S1234567A" className="h-10 bg-background/60" {...register("rawIdentificationNumber")} /></Field></div>}<Field label="Create password" error={errors.password?.message}><div className="relative"><KeyRound aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input type="password" autoComplete="new-password" placeholder="StrongPassword@123" className="h-11 bg-card/70 pl-9" {...register("password")} /></div></Field><Field label="Confirm password" error={errors.confirmPassword?.message}><Input type="password" autoComplete="new-password" className="h-11 bg-card/70" {...register("confirmPassword")} /></Field><label className="flex gap-3 text-sm text-muted-foreground"><input type="checkbox" className="mt-1 size-4 accent-primary" {...register("termsAccepted")} />I accept the Terms of Use.</label>{errors.termsAccepted && <p role="alert" className="text-xs text-destructive">{errors.termsAccepted.message}</p>}<label className="flex gap-3 text-sm text-muted-foreground"><input type="checkbox" className="mt-1 size-4 accent-primary" {...register("privacyAccepted")} />I accept the Privacy Policy.</label>{errors.privacyAccepted && <p role="alert" className="text-xs text-destructive">{errors.privacyAccepted.message}</p>}<Button type="button" size="lg" className="h-11 w-full" disabled={isSubmitting} onClick={onSubmit}>{isSubmitting ? "Submitting…" : "Submit for academy approval"}<ArrowRight data-icon="inline-end" aria-hidden="true" /></Button><Button type="button" variant="link" onClick={onBack}><ArrowLeft aria-hidden="true" />Back</Button></div>;
}

function DateOfBirthPicker({ form, error }: { form: ReturnType<typeof useForm<RegistrationValues>>; error?: string }) {
  const [open, setOpen] = useState(false);
  const value = useWatch({ control: form.control, name: "dateOfBirth" });
  const selectedDate = value ? new Date(value + "T00:00:00") : undefined;
  const label = selectedDate?.toLocaleDateString("en-SG", { day: "2-digit", month: "short", year: "numeric" }) ?? "Pick a date";

  return <Field label="Date of birth" error={error}><Popover open={open} onOpenChange={setOpen}><PopoverTrigger render={<Button type="button" variant="outline" className="h-10 w-full justify-between bg-background/60 font-normal" />}><span>{label}</span><CalendarDays aria-hidden="true" className="size-4 text-muted-foreground" /></PopoverTrigger><PopoverContent align="start" className="p-0"><Calendar mode="single" selected={selectedDate} disabled={{ after: new Date() }} onSelect={(date) => { if (!date) return; form.setValue("dateOfBirth", [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-"), { shouldDirty: true, shouldValidate: true }); setOpen(false); }} /></PopoverContent></Popover></Field>;
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) { return <div className="space-y-2"><Label>{label}</Label>{children}{error && <p role="alert" className="text-xs text-destructive">{error}</p>}</div>; }
function Submitted() { return <div><Badge variant="secondary" className="mb-4 border border-primary/20 px-2.5 text-primary-strong"><ShieldCheck data-icon="inline-start" aria-hidden="true" />Registration submitted</Badge><h1 className="font-heading text-3xl font-semibold tracking-[-0.04em]">We&apos;ll review your account.</h1><p className="mt-3 text-sm leading-6 text-muted-foreground">Your registration is pending academy approval. You can sign in once it has been approved.</p><Link to="/" className="mt-6 inline-flex items-center gap-1.5 text-sm text-primary-strong hover:underline"><ArrowLeft aria-hidden="true" className="size-4" />Return to home</Link></div>; }

