"use client"

import { useSession } from "next-auth/react"
import ProtectedRoute from "@/components/auth/protected-route"
import { DashboardLayout } from "@/components/layout"

export default function Dashboard() {
  const { data: session } = useSession()

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Welcome to your Dashboard!
              </h2>
              
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
} 