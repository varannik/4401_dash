"use client"

import ProtectedRoute from "@/components/auth/protected-route"
import DashboardLayout from "@/components/layout/mainLayoutDash"
import { SettingsView } from "@/components/dashboard/views"

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <SettingsView />
      </DashboardLayout>
    </ProtectedRoute>
  )
} 