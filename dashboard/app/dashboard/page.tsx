"use client"

import ProtectedRoute from "@/components/auth/protected-route"
import DashboardLayout from "@/components/layout/mainLayoutDash"
import { OverviewView } from "@/components/dashboard/views"

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <OverviewView />
      </DashboardLayout>
    </ProtectedRoute>
  )
} 