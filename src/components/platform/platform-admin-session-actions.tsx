

import { LogOut } from "lucide-react";
import {  useNavigate } from "react-router-dom";

import { useAuth } from "@/components/platform/platform-auth-provider";
import { Button } from "@/components/ui/button";

export function PlatformAdminSessionActions() {
  const navigate= useNavigate();
  const { profile, logout } = useAuth();

  async function handleLogout() {
    await logout();
    navigate("/platform-admin-access",{replace:true});
  }

  return (
    <div className="flex items-center gap-2">
      <span className="hidden text-right text-xs text-muted-foreground sm:block">
        Signed in as<br />{profile?.displayName || profile?.email}
      </span>
      <Button type="button" variant="outline" size="sm" onClick={handleLogout}>
        <LogOut data-icon="inline-start" aria-hidden="true" />
        Sign out
      </Button>
    </div>
  );
}
