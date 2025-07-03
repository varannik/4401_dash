"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import { useState } from "react"
import { useAuthStore } from "@/stores"
import { useNotifications } from "@/hooks/use-notifications"
import { useLoading } from "@/hooks/use-loading"

export default function AuthButton() {
  const { data: session, status } = useSession()
  const { user, isAuthenticated } = useAuthStore()
  const { showSuccess, showError } = useNotifications()
  const { isLoading, withLoading } = useLoading('auth-button')

  const handleSignIn = async () => {
    try {
      await withLoading(async () => {
        await signIn("azure-ad")
        showSuccess("Signing in...", "Redirecting to Azure AD")
      })
    } catch (error) {
      console.error("Sign in error:", error)
      showError("Sign in failed", "Please try again")
    }
  }

  const handleSignOut = async () => {
    try {
      await withLoading(async () => {
        await signOut({ callbackUrl: "/" })
        showSuccess("Signed out successfully")
      })
    } catch (error) {
      console.error("Sign out error:", error)
      showError("Sign out failed", "Please try again")
    }
  }

  if (status === "loading") {
    return (
      <div className="flex items-center space-x-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span className="text-sm text-gray-600">Loading...</span>
      </div>
    )
  }

  if (session) {
    return (
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          {session.user?.image && (
            <img
              src={session.user.image}
              alt="Profile"
              className="w-8 h-8 rounded-full"
            />
          )}
          <span className="text-sm font-medium text-gray-700">
            {session.user?.name || session.user?.email}
          </span>
        </div>
        <button
          onClick={handleSignOut}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Signing out..." : "Sign out"}
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={handleSignIn}
      disabled={isLoading}
      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? "Signing in..." : "Sign in"}
    </button>
  )
} 