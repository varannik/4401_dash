'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/animate-ui/radix/dropdown-menu'
import MonitoringBackground from './monitoringBackground'
import { ExpandableHeader } from '@/components/dashboard/ExpandableHeader'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: session } = useSession()
  const [isHeaderExpanded, setIsHeaderExpanded] = useState(false)

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
  }

  const toggleHeader = () => {
    setIsHeaderExpanded(!isHeaderExpanded)
  }

  const UserProfileButton = ({ className = "" }: { className?: string }) => (
    <DropdownMenu>
      <DropdownMenuTrigger className={`flex items-center gap-x-4 text-sm font-semibold text-white hover:bg-gray-800 focus:outline-none ${className}`}>
        {session?.user?.image ? (
          <img
            alt=""
            src={session.user.image}
            className="size-8 rounded-full bg-gray-800"
          />
        ) : (
          <div className="size-8 rounded-full bg-gray-600 flex items-center justify-center">
            <span className="text-sm font-medium text-white">
              {session?.user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
        )}
        <span className="sr-only">Your profile</span>
        <span aria-hidden="true" className="hidden lg:inline">
          {session?.user?.name || 'User'}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {session?.user?.name || 'User'}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {session?.user?.email || 'user@example.com'}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  return (
    <div className="min-h-screen">
      <MonitoringBackground />
      
      {/* Expandable Header - consistent across all dashboard pages */}
      <div className="relative z-40 px-4 sm:px-6 lg:px-8 pt-6">
        <ExpandableHeader 
          isExpanded={isHeaderExpanded} 
          onToggle={toggleHeader}
        />
      </div>

      {/* Mobile fallback user profile - only visible on small screens when header is collapsed */}
      <div className="sticky top-0 z-30 flex items-center justify-end px-4 py-2 sm:px-6 lg:hidden" style={{ backgroundColor: 'rgba(7, 8, 8, 0.9)' }}>
        {!isHeaderExpanded && <UserProfileButton />}
      </div>

      {/* Main content - full width */}
      <main className="py-10 relative min-h-screen">
        <div className="px-4 sm:px-6 lg:px-8 relative z-10">{children}</div>
      </main>
    </div>
  )
}
