import { PlatformAdminAccessPage } from "@/modules/platform-admin"
import { Outlet, type RouteObject } from "react-router-dom"
import MasterAdminLoginPage from "@/modules/admin/login/page"
import AdminRegistrationPage from "@/modules/admin/register/page"
import ManualRegistrationPage from "@/modules/users/manual-registration/page"
import LandingPage from "@/modules/landing-page/landingpage"
import UsersLoginPage from "@/modules/users/users/page"
import AdminDashboardPage from "@/modules/admin/page"
import PendingApprovalsPage from "@/modules/admin/approvals/page"
import CoachesPage from "@/modules/admin/coaches/page"
import StudentsPage from "@/modules/admin/students/page"
import AppSidebar from "@/components/common/app-sidebar"

export const routeConfig: RouteObject[] = [
  { path: "/", element: <LandingPage /> },

  {
    path: "auth",
    children: [
      //admin
      { path: "login", element: <MasterAdminLoginPage /> },
      { path: "register", element: <AdminRegistrationPage /> },

      //users
      { path: "manual-registration", element: <ManualRegistrationPage /> },
      { path: "users", element: <UsersLoginPage /> },
    ],
  },

  { path: "platform-admin-access", element: <PlatformAdminAccessPage /> },
  {
    path: "admin",
    element: (
      <AppSidebar>
        <Outlet />
      </AppSidebar>
    ),
    children: [
      { index: true, element: <AdminDashboardPage /> },
      { path: "approvals", element: <PendingApprovalsPage /> },

      { path: "coaches", element: <CoachesPage /> },
      { path: "students", element: <StudentsPage /> },
    ],
  },
]
