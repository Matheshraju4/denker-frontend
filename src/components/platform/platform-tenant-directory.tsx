

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Mail, Plus, Send, UserRound, UsersRound } from "lucide-react";
import { useForm, type UseFormReturn } from "react-hook-form";
import { z } from "zod";

import { useAuth } from "@/components/platform/platform-auth-provider";
import { TenantCreateForm } from "@/components/platform/tenant-create-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";

const PAGE_SIZE = 20;
const invitationSchema = z.object({ email: z.string().trim().email("Enter a valid administrator email address."), phone: z.string().trim().max(32) });

type Tenant = { id: string; slug: string; name: string; status: string; readiness?: string | null };
type TenantPage = { content: Tenant[]; totalElements: number; page: number; size: number };
type TenantUser = { userId: string; email: string | null; displayName: string | null; userStatus: string; role: string; membershipStatus: string };
type PendingInvitation = { invitationId: string; email: string; phone: string | null; status: string; expiresAt: string; createdAt: string };
type TenantUserPage = { content: TenantUser[]; pendingMasterAdminInvitations?: PendingInvitation[] };
type InvitationValues = z.infer<typeof invitationSchema>;
type BackendProblem = { detail?: string; message?: string };

function errorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message === "Your session has expired. Please sign in again.") return error.message;
  if (axios.isAxiosError<BackendProblem>(error)) return error.response?.data?.detail ?? error.response?.data?.message ?? fallback;
  return fallback;
}

function statusClass(status: string) {
  return status === "ACTIVE" ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "border-primary/20 bg-primary/10 text-primary-strong";
}

export function PlatformTenantDirectory() {
  const { authorizedRequest } = useAuth();
  const [directory, setDirectory] = useState<TenantPage>({ content: [], totalElements: 0, page: 0, size: PAGE_SIZE });
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [expandedTenant, setExpandedTenant] = useState<Tenant | null>(null);
  const [masterAdmins, setMasterAdmins] = useState<TenantUser[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<PendingInvitation[]>([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState("");
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const invitationForm = useForm<InvitationValues>({ resolver: zodResolver(invitationSchema), defaultValues: { email: "", phone: "" } });

  const loadTenants = useCallback(async (page = 0) => {
    setIsLoading(true);
    try {
      const response = await authorizedRequest<TenantPage>({ method: "GET", url: "/api/v1/platform/tenants", params: { page, size: PAGE_SIZE } });
      setDirectory(response.data);
    } catch (error) {
      toast.add({ title: "Unable to load tenants", description: errorMessage(error, "Please try again."), type: "error", priority: "high" });
    } finally {
      setIsLoading(false);
    }
  }, [authorizedRequest]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadTenants(), 0);
    return () => window.clearTimeout(timer);
  }, [loadTenants]);

  async function openTenant(tenant: Tenant, openInvitation = false) {
    if (expandedTenant?.id === tenant.id && !openInvitation) {
      setExpandedTenant(null);
      setIsInviteOpen(false);
      return;
    }

    setExpandedTenant(tenant);
    setIsInviteOpen(openInvitation);
    invitationForm.reset();
    setMasterAdmins([]);
    setPendingInvitations([]);
    setDetailsError("");
    setIsLoadingDetails(true);
    try {
      const response = await authorizedRequest<TenantUserPage>({ method: "GET", url: `/api/v1/platform/tenants/${tenant.id}/users`, params: { page: 0, size: 100 } });
      setMasterAdmins(response.data.content.filter((user) => user.role === "MASTER_ADMIN"));
      setPendingInvitations(response.data.pendingMasterAdminInvitations ?? []);
    } catch (error) {
      const message = errorMessage(error, "Unable to load Master Admin details.");
      setDetailsError(message);
      toast.add({ title: "Unable to load tenant details", description: message, type: "error", priority: "high" });
    } finally {
      setIsLoadingDetails(false);
    }
  }

  async function inviteMasterAdmin(values: InvitationValues) {
    if (!expandedTenant) return;
    try {
      const response = await authorizedRequest<{ invitationId: string }>({ method: "POST", url: `/api/v1/platform/tenants/${expandedTenant.id}/admin-invitations`, data: { email: values.email, phone: values.phone || undefined } });
      toast.add({ title: "Invitation sent", description: `${values.email} can now activate the Master Admin account for ${expandedTenant.name}.`, type: "success" });
      invitationForm.reset();
      setIsInviteOpen(false);
      setPendingInvitations((invitations) => [...invitations, { invitationId: response.data.invitationId, email: values.email, phone: values.phone || null, status: "PENDING", expiresAt: "", createdAt: new Date().toISOString() }]);
    } catch (error) {
      toast.add({ title: "Invitation failed", description: errorMessage(error, "Unable to send the invitation. Please try again."), type: "error", priority: "high" });
    }
  }

  const first = directory.totalElements === 0 ? 0 : directory.page * directory.size + 1;
  const last = Math.min((directory.page + 1) * directory.size, directory.totalElements);

  return (
    <div className="w-full max-w-6xl space-y-5">
      <div className="rounded-2xl border border-border bg-card p-5 shadow-2xl shadow-background/50 ring-1 ring-inset ring-foreground/5 sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between"><div><Badge variant="secondary" className="mb-4 border border-primary/20 px-2.5 text-primary-strong"><Building2 data-icon="inline-start" aria-hidden="true" />Platform directory</Badge><h1 className="font-heading text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Your academy tenants</h1><p className="mt-2 text-sm leading-6 text-muted-foreground">Select a tenant to view its Master Admin details or send an invitation.</p></div><Button size="lg" className="h-10" onClick={() => { setIsCreating((current) => !current); setExpandedTenant(null); }}><Plus data-icon="inline-start" aria-hidden="true" />{isCreating ? "Close form" : "Create tenant"}</Button></div>
        {isCreating && <div className="mt-7 border-t border-border pt-7"><h2 className="font-heading text-xl font-semibold">Create a tenant</h2><p className="mt-1 text-sm text-muted-foreground">You can send the Master Admin invitation from the new tenant&apos;s row once it appears below.</p><div className="mt-5 max-w-2xl"><TenantCreateForm onCreated={() => { setIsCreating(false); void loadTenants(0); }} /></div></div>}
      </div>
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xl shadow-background/30 ring-1 ring-inset ring-foreground/5">
        <div className="flex items-center justify-between border-b border-border px-5 py-4 sm:px-7"><div className="flex items-center gap-2"><UsersRound aria-hidden="true" className="size-4 text-primary-strong" /><h2 className="font-heading text-lg font-semibold">Tenants</h2></div><span className="text-sm text-muted-foreground">{directory.totalElements} total</span></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-muted/50 text-xs uppercase tracking-[0.08em] text-muted-foreground"><tr><th className="px-5 py-3 font-medium sm:px-7">Academy</th><th className="px-5 py-3 font-medium">Tenant slug</th><th className="px-5 py-3 font-medium">Status</th><th className="px-5 py-3 font-medium">Readiness</th><th className="px-5 py-3 text-right font-medium sm:px-7">Action</th></tr></thead><tbody className="divide-y divide-border">{isLoading ? <tr><td colSpan={5} className="px-5 py-12 text-center text-muted-foreground">Loading tenantsÃ¢â‚¬Â¦</td></tr> : directory.content.length === 0 ? <tr><td colSpan={5} className="px-5 py-12 text-center text-muted-foreground">No tenants yet. Create your first academy tenant.</td></tr> : directory.content.map((tenant) => <TenantRow key={tenant.id} tenant={tenant} expanded={expandedTenant?.id === tenant.id} masterAdmins={masterAdmins} pendingInvitations={pendingInvitations} isLoadingDetails={isLoadingDetails} detailsError={detailsError} isInviteOpen={isInviteOpen} invitationForm={invitationForm} onRowClick={() => void openTenant(tenant)} onInvite={() => void openTenant(tenant, true)} onCloseInvite={() => setIsInviteOpen(false)} onSubmitInvitation={inviteMasterAdmin} />)}</tbody></table></div>
        <div className="flex flex-col gap-3 border-t border-border px-5 py-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-7"><span>Showing {first}Ã¢â‚¬â€œ{last} of {directory.totalElements}</span><div className="flex gap-2"><Button size="sm" variant="outline" disabled={isLoading || directory.page === 0} onClick={() => void loadTenants(directory.page - 1)}><ChevronLeft aria-hidden="true" />Previous</Button><Button size="sm" variant="outline" disabled={isLoading || last >= directory.totalElements} onClick={() => void loadTenants(directory.page + 1)}>Next<ChevronRight aria-hidden="true" /></Button></div></div>
      </div>
    </div>
  );
}

function TenantRow({ tenant, expanded, masterAdmins, pendingInvitations, isLoadingDetails, detailsError, isInviteOpen, invitationForm, onRowClick, onInvite, onCloseInvite, onSubmitInvitation }: { tenant: Tenant; expanded: boolean; masterAdmins: TenantUser[]; pendingInvitations: PendingInvitation[]; isLoadingDetails: boolean; detailsError: string; isInviteOpen: boolean; invitationForm: UseFormReturn<InvitationValues>; onRowClick: () => void; onInvite: () => void; onCloseInvite: () => void; onSubmitInvitation: (values: InvitationValues) => Promise<void> }) {
  return <><tr className="cursor-pointer transition-colors hover:bg-muted/40" onClick={onRowClick}><td className="px-5 py-4 sm:px-7"><div className="flex items-center gap-2"><p className="font-medium text-foreground">{tenant.name}</p>{expanded ? <ChevronUp aria-hidden="true" className="size-4 text-muted-foreground" /> : <ChevronDown aria-hidden="true" className="size-4 text-muted-foreground" />}</div><p className="mt-1 text-xs text-muted-foreground">{tenant.id}</p></td><td className="px-5 py-4 font-mono text-xs text-muted-foreground">{tenant.slug}</td><td className="px-5 py-4"><Badge variant="outline" className={statusClass(tenant.status)}>{tenant.status}</Badge></td><td className="px-5 py-4"><Badge variant="secondary">{tenant.readiness ?? "PENDING"}</Badge></td><td className="px-5 py-4 text-right sm:px-7"><Button size="sm" variant="outline" onClick={(event) => { event.stopPropagation(); onInvite(); }}><Mail data-icon="inline-start" aria-hidden="true" />Invite Master Admin</Button></td></tr>{expanded && <tr><td colSpan={5} className="bg-muted/30 px-5 py-5 sm:px-7"><div className="space-y-5"><div><h3 className="font-heading text-lg font-semibold">Master Admins</h3><p className="mt-1 text-sm text-muted-foreground">Account and invitation details for {tenant.name}.</p></div>{isLoadingDetails ? <div className="grid gap-3 sm:grid-cols-2"><div className="h-28 animate-pulse rounded-xl bg-muted" /><div className="h-28 animate-pulse rounded-xl bg-muted" /></div> : detailsError ? <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{detailsError}</p> : masterAdmins.length === 0 && pendingInvitations.length === 0 ? <div className="rounded-xl border border-dashed border-border bg-background/50 p-5 text-sm text-muted-foreground"><UserRound aria-hidden="true" className="mb-3 size-5 text-primary-strong" />No Master Admin has been added yet. Use the invitation button to set one up.</div> : <div className="grid gap-3 sm:grid-cols-2">{masterAdmins.map((admin) => <div key={`${admin.userId}-${admin.role}`} className="rounded-xl border border-border bg-background/70 p-4"><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-full bg-primary/10 text-primary-strong"><UserRound aria-hidden="true" className="size-4" /></span><div><p className="font-medium text-foreground">{admin.displayName || "Master Admin"}</p><p className="text-xs text-muted-foreground">{admin.email || "No email provided"}</p></div></div><div className="mt-4 flex flex-wrap gap-2"><Badge variant="outline" className={statusClass(admin.userStatus)}>{admin.userStatus}</Badge><Badge variant="secondary">Membership: {admin.membershipStatus}</Badge></div></div>)}{pendingInvitations.map((invitation) => <div key={invitation.invitationId} className="rounded-xl border border-dashed border-amber-500/35 bg-amber-500/5 p-4"><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300"><Mail aria-hidden="true" className="size-4" /></span><div><p className="font-medium text-foreground">{invitation.email}</p><p className="text-xs text-muted-foreground">{invitation.phone || "Email invitation"}</p></div></div><div className="mt-4 flex flex-wrap gap-2"><Badge variant="outline" className="border-amber-500/35 bg-amber-500/10 text-amber-800 dark:text-amber-200">Invitation {invitation.status}</Badge><Badge variant="secondary">Awaiting activation</Badge></div></div>)}</div>}{isInviteOpen && <form className="rounded-xl border border-primary/25 bg-primary/5 p-4 sm:p-5" onClick={(event) => event.stopPropagation()} onSubmit={invitationForm.handleSubmit(onSubmitInvitation)} noValidate><div className="mb-4 flex items-start justify-between gap-4"><div><h3 className="font-heading text-lg font-semibold">Invite a Master Admin</h3><p className="mt-1 text-sm text-muted-foreground">They will receive an activation link for {tenant.name}.</p></div><Button type="button" size="sm" variant="ghost" onClick={onCloseInvite}>Cancel</Button></div><div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor={`master-admin-email-${tenant.id}`}>Email address *</Label><div className="relative"><Mail aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input id={`master-admin-email-${tenant.id}`} type="email" autoComplete="email" placeholder="masteradmin@academy.com" className="h-11 bg-background/60 pl-9" aria-invalid={Boolean(invitationForm.formState.errors.email)} {...invitationForm.register("email")} /></div>{invitationForm.formState.errors.email && <p role="alert" className="text-xs text-destructive">{invitationForm.formState.errors.email.message}</p>}</div><div className="space-y-2"><Label htmlFor={`master-admin-phone-${tenant.id}`}>Phone number</Label><Input id={`master-admin-phone-${tenant.id}`} type="tel" autoComplete="tel" placeholder="+65 8123 4567" className="h-11 bg-background/60" aria-invalid={Boolean(invitationForm.formState.errors.phone)} {...invitationForm.register("phone")} />{invitationForm.formState.errors.phone && <p role="alert" className="text-xs text-destructive">{invitationForm.formState.errors.phone.message}</p>}</div></div><Button type="submit" className="mt-4 h-10" disabled={invitationForm.formState.isSubmitting}><Send data-icon="inline-start" aria-hidden="true" />{invitationForm.formState.isSubmitting ? "SendingÃ¢â‚¬Â¦" : "Send invitation"}</Button></form>}</div></td></tr>}</>;
}



