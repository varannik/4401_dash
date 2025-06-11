"use client"

import { useSession } from "next-auth/react"
import ProtectedRoute from "@/components/auth/protected-route"
import { DashboardLayout } from "@/components/layout"
import { TokenDisplay } from "@/components/dashboard/TokenDisplay"
import { Shield, Database } from 'lucide-react'

export default function Dashboard() {
  const { data: session } = useSession()

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Welcome back, {session?.user?.name}!
                </h1>
                <p className="text-gray-600 mt-1">
                  Secure Fabric SQL Token Management Dashboard
                </p>
              </div>
              <div className="flex items-center space-x-2 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
                <Shield className="w-5 h-5 text-green-600" />
                <span className="text-green-800 text-sm font-medium">Server Actions Secured</span>
              </div>
            </div>
          </div>

          {/* Token Display Component */}
          <TokenDisplay />

          {/* Architecture Information */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-2 flex items-center">
                <Database className="w-5 h-5 mr-2" />
                Secure Architecture
              </h3>
              <p className="text-blue-700 text-sm mb-3">
                This implementation uses Next.js Server Actions to securely handle Fabric SQL authentication:
              </p>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>• No client-side secret exposure</li>
                <li>• Redis token caching (1 hour TTL)</li>
                <li>• Automatic token refresh</li>
                <li>• Rate-limiting protection</li>
              </ul>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-900 mb-2">
                Usage Guidelines
              </h3>
              <p className="text-green-700 text-sm mb-3">
                Use this token in your server actions to query Fabric SQL Analytics Endpoint:
              </p>
              <ul className="text-green-700 text-sm space-y-1">
                <li>• Call <code className="bg-green-100 px-1 rounded">getFabricSQLToken()</code> in server actions</li>
                <li>• Token is automatically cached and refreshed</li>
                <li>• Never expose token to client-side code</li>
                <li>• Use for secure database connections only</li>
              </ul>
            </div>
          </div>

          {/* Development Note */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-yellow-900 mb-2">
                Development Environment
              </h4>
              <p className="text-yellow-800 text-xs">
                This token display is for testing purposes only. In production, tokens should never be displayed in the UI.
                Use the server actions <code>getFabricSQLToken()</code> to securely access tokens for database operations.
              </p>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
} 