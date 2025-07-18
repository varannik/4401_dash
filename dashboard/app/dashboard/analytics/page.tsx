"use client"

import ProtectedRoute from "@/components/auth/protected-route"
import DashboardLayout from "@/components/layout/mainLayoutDash"
import { AnalyticsView } from "@/components/dashboard/views"

export default function AnalyticsPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <AnalyticsView />
      </DashboardLayout>
    </ProtectedRoute>
  )
} 