"use client"

import ProtectedRoute from "@/components/auth/protected-route"
import DashboardLayout from "@/components/layout/mainLayoutDash"
import { MonitoringDashboard } from "../../../components/dashboard/MonitoringDashboard"

export default function MonitoringPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <MonitoringDashboard />
      </DashboardLayout>
    </ProtectedRoute>
  )
} 