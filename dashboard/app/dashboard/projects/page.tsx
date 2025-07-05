"use client"

import ProtectedRoute from "@/components/auth/protected-route"
import DashboardLayout from "@/components/layout/mainLayoutDash"
import { ProjectsView } from "@/components/dashboard/views"

export default function ProjectsPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <ProjectsView />
      </DashboardLayout>
    </ProtectedRoute>
  )
} 