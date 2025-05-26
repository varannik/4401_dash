"use client"

import { useSession } from "next-auth/react"
import ProtectedRoute from "@/components/auth/protected-route"
import AuthButton from "@/components/auth/auth-button"

export default function Dashboard() {
  const { data: session } = useSession()

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <AuthButton />
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Welcome to your Dashboard!
                </h2>
                <p className="text-gray-600 mb-6">
                  You are successfully authenticated with Azure SSO.
                </p>
                
                {session?.user && (
                  <div className="bg-white p-6 rounded-lg shadow max-w-md mx-auto">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      User Information
                    </h3>
                    <div className="space-y-2 text-left">
                      {session.user.name && (
                        <p><strong>Name:</strong> {session.user.name}</p>
                      )}
                      {session.user.email && (
                        <p><strong>Email:</strong> {session.user.email}</p>
                      )}
                      {session.user.image && (
                        <div className="flex items-center space-x-2">
                          <strong>Avatar:</strong>
                          <img
                            src={session.user.image}
                            alt="Profile"
                            className="w-10 h-10 rounded-full"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
} 