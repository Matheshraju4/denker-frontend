

import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { ArrowRight, Building2, Globe2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useAuth } from "@/components/platform/platform-auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";

const tenantFormSchema = z.object({
  name: z.string().trim().min(1, "Enter the academy name.").max(200),
  slug: z.string().trim().min(1, "Enter a tenant slug.").max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and single hyphens only."),
  displayName: z.string().trim().max(200),
  primaryDomain: z.string().trim().max(255).refine((value) => value === "" || /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i.test(value), "Enter a domain without https://."),
  plan: z.enum(["CORE", "PROFESSIONAL", "ENTERPRISE", "CUSTOM"]),
  status: z.enum(["TRIAL", "ACTIVE", "EXPIRED", "CANCELLED"]),
});

type TenantFormValues = z.infer<typeof tenantFormSchema>;
type BackendProblem = { detail?: string; message?: string };

function messageFromError(error: unknown) {
  if (error instanceof Error && error.message === "Your session has expired. Please sign in again.") return error.message;
  if (axios.isAxiosError<BackendProblem>(error)) return error.response?.data?.detail ?? error.response?.data?.message ?? "Unable to create the tenant. Check the details and try again.";
  return "Unable to create the tenant. Check the details and try again.";
}

export function TenantCreateForm({ onCreated }: { onCreated: () => void }) {
  const { authorizedRequest } = useAuth();
  const form = useForm<TenantFormValues>({
    resolver: zodResolver(tenantFormSchema),
    defaultValues: { name: "", slug: "", displayName: "", primaryDomain: "", plan: "CORE", status: "TRIAL" },
  });

  async function createTenant(values: TenantFormValues) {
    try {
      await authorizedRequest({ method: "POST", url: "/api/v1/platform/tenants", data: values });
      toast.add({ title: "Tenant created", description: `“${values.name}” is ready for a Master Admin invitation.`, type: "success" });
      form.reset();
      onCreated();
    } catch (error) {
      toast.add({ title: "Tenant creation failed", description: messageFromError(error), type: "error", priority: "high" });
    }
  }

  return (
    <form className="space-y-5" onSubmit={form.handleSubmit(createTenant)} noValidate>
      <div className="space-y-2"><Label htmlFor="tenant-name">Academy name *</Label><div className="relative"><Building2 aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input id="tenant-name" autoComplete="organization" placeholder="Denker Sports World Shooting" className="h-11 bg-background/60 pl-9" aria-invalid={Boolean(form.formState.errors.name)} {...form.register("name")} /></div>{form.formState.errors.name && <p role="alert" className="text-xs text-destructive">{form.formState.errors.name.message}</p>}</div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2"><Label htmlFor="tenant-slug">Tenant slug *</Label><Input id="tenant-slug" placeholder="denker-shooting" className="h-11 bg-background/60 px-3" aria-invalid={Boolean(form.formState.errors.slug)} {...form.register("slug")} />{form.formState.errors.slug ? <p role="alert" className="text-xs text-destructive">{form.formState.errors.slug.message}</p> : <p className="text-xs text-muted-foreground">Lowercase letters, numbers, and hyphens only.</p>}</div>
        <div className="space-y-2"><Label htmlFor="display-name">Display name</Label><Input id="display-name" placeholder="Denker Shooting" className="h-11 bg-background/60 px-3" aria-invalid={Boolean(form.formState.errors.displayName)} {...form.register("displayName")} />{form.formState.errors.displayName && <p role="alert" className="text-xs text-destructive">{form.formState.errors.displayName.message}</p>}</div>
      </div>
      <div className="space-y-2"><Label htmlFor="primary-domain">Primary domain</Label><div className="relative"><Globe2 aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input id="primary-domain" inputMode="url" placeholder="academy.example.com" className="h-11 bg-background/60 pl-9" aria-invalid={Boolean(form.formState.errors.primaryDomain)} {...form.register("primaryDomain")} /></div>{form.formState.errors.primaryDomain ? <p role="alert" className="text-xs text-destructive">{form.formState.errors.primaryDomain.message}</p> : <p className="text-xs text-muted-foreground">Optional. Do not include https://.</p>}</div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2"><Label htmlFor="subscription-plan">Subscription plan</Label><select id="subscription-plan" className="h-11 w-full rounded-lg border border-input bg-background/60 px-3 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/50" {...form.register("plan")}><option value="CORE">Core</option><option value="PROFESSIONAL">Professional</option><option value="ENTERPRISE">Enterprise</option><option value="CUSTOM">Custom</option></select></div>
        <div className="space-y-2"><Label htmlFor="subscription-status">Subscription status</Label><select id="subscription-status" className="h-11 w-full rounded-lg border border-input bg-background/60 px-3 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/50" {...form.register("status")}><option value="TRIAL">Trial</option><option value="ACTIVE">Active</option><option value="EXPIRED">Expired</option><option value="CANCELLED">Cancelled</option></select></div>
      </div>
      <Button type="submit" size="lg" className="h-11 w-full text-sm" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? "Creating tenant…" : "Create tenant"}{!form.formState.isSubmitting && <ArrowRight data-icon="inline-end" aria-hidden="true" />}</Button>
    </form>
  );
}
