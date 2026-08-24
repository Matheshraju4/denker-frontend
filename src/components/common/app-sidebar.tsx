import type { ReactNode } from "react"

import { Link, useLocation, useNavigate } from "react-router-dom"
import {
  ClipboardCheck,
  Dumbbell,
  GraduationCap,
  HomeIcon,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react"

import { DarkModeToggle } from "@/components/common/dark_mode"
import { useAuth } from "@/components/platform/platform-auth-provider"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

type NavigationItem = {
  label: string
  href: string
  icon: LucideIcon
}

type NavigationGroup = {
  heading: string
  items: NavigationItem[]
}

export default function AppSidebar({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { profile, logout } = useAuth()
  const isMasterAdmin = profile?.memberships.some(
    (membership) => membership.role === "MASTER_ADMIN"
  )

  const masterAdminNavigation: NavigationGroup[] = [
    {
      heading: "Dashboard",
      items: [{ label: "Home", href: "/admin", icon: HomeIcon }],
    },
    {
      heading: "People",
      items: [
        { label: "Students", href: "/admin/students", icon: GraduationCap },
        { label: "Coaches", href: "/admin/coaches", icon: Dumbbell },
        {
          label: "Pending registrations",
          href: "/admin/approvals",
          icon: ClipboardCheck,
        },
      ],
    },
  ]
  const navigationGroups = isMasterAdmin ? masterAdminNavigation : []

  async function signOut() {
    await logout()
    navigate("/", { replace: true })
  }

  return (
    <SidebarProvider>
      <Sidebar variant="inset" collapsible="icon">
        <SidebarHeader className="p-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                size="lg"
                tooltip="Denker Sports"
                className="rounded-xl px-2 group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0 hover:bg-sidebar-accent"
                render={<Link to="/admin/approvals" />}
              >
                <img
                  src="/images/logo.png"
                  alt="Denker Sports World Shooting"
                  className="h-auto w-full max-w-[11.5rem] object-contain group-data-[collapsible=icon]:hidden"
                />
                <img
                  src="/images/logo_without_name.png"
                  alt="Denker Sports"
                  className="hidden size-8 object-contain group-data-[collapsible=icon]:block"
                />
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        {/* <SidebarSeparator className="mx-2 bg-sidebar-border/80" /> */}

        <SidebarContent className="px-1 py-2 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:py-1">
          {navigationGroups.map((group) => (
            <SidebarGroup
              key={group.heading}
              className="px-2 py-2 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:py-1"
            >
              <SidebarGroupLabel className="px-2 text-[0.68rem] font-semibold tracking-[0.14em] text-sidebar-foreground/45 uppercase">
                {group.heading}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="gap-1">
                  {group.items.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        isActive={pathname === item.href}
                        tooltip={item.label}
                        className="h-10 rounded-lg text-sidebar-foreground/75 group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:size-9! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:p-0! hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-active:bg-sidebar-primary data-active:text-sidebar-primary-foreground data-active:shadow-sm group-data-[collapsible=icon]:[&_svg]:size-[1.125rem] group-data-[collapsible=icon]:[&>span:last-child]:hidden"
                        render={<Link to={item.href} />}
                      >
                        <item.icon aria-hidden="true" />
                        <span className="group-data-[collapsible=icon]:hidden">
                          {item.label}
                        </span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>

        <SidebarFooter className="m-2 mt-auto rounded-xl border border-sidebar-border bg-sidebar-accent/40 p-1.5 group-data-[collapsible=icon]:m-1 group-data-[collapsible=icon]:border-0 group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:p-0">
          <SidebarMenu className="gap-1">
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip={profile?.email ?? "Signed-in account"}
                className="h-10 rounded-lg px-2.5 group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:size-9! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:p-0! hover:bg-sidebar-accent group-data-[collapsible=icon]:[&>span:last-child]:hidden"
              >
                <span className="grid size-6 place-items-center rounded-md bg-sidebar-primary/15 text-sidebar-primary">
                  <ShieldCheck aria-hidden="true" />
                </span>
                <span className="font-medium group-data-[collapsible=icon]:hidden">
                  {profile?.displayName ?? "Loading account…"}
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Sign out"
                onClick={() => void signOut()}
                className="h-9 rounded-lg px-2.5 text-sidebar-foreground/70 group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:size-9! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:p-0! hover:bg-destructive/10 hover:text-destructive group-data-[collapsible=icon]:[&_svg]:size-[1.125rem] group-data-[collapsible=icon]:[&>span:last-child]:hidden"
              >
                <LogOut aria-hidden="true" />
                <span className="group-data-[collapsible=icon]:hidden">
                  Sign out
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="min-w-0 bg-background">
        <header className="flex h-16 items-center gap-3 border-b border-border/70 bg-background/85 px-4 backdrop-blur-md sm:px-6">
          <SidebarTrigger className="text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" />
          <Separator orientation="vertical" className="h-5 bg-border/70" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">Academy dashboard</p>
            <p className="truncate text-xs text-muted-foreground">
              Manage your academy workspace
            </p>
          </div>
          <Badge
            variant="secondary"
            className="hidden border border-primary/20 text-primary-strong sm:inline-flex"
          >
            <LayoutDashboard data-icon="inline-start" aria-hidden="true" />
            {isMasterAdmin ? "Master Admin" : "Member"}
          </Badge>
          <DarkModeToggle />
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
