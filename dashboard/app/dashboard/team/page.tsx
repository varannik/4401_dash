"use client"

import ProtectedRoute from "@/components/auth/protected-route"
import DashboardLayout from "@/components/layout/mainLayoutDash"
import { TeamView } from "@/components/dashboard/views"

export default function TeamPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <TeamView />
      </DashboardLayout>
    </ProtectedRoute>
  )
} 