'use client'

import { useState } from 'react'
import UserProfileButton from '@/components/auth/UserProfileButton'
import { ExpandableHeader } from '@/components/dashboard/ExpandableHeader'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isHeaderExpanded, setIsHeaderExpanded] = useState(false)

  const toggleHeader = () => {
    setIsHeaderExpanded(!isHeaderExpanded)
  }

  return (
    <div className="min-h-screen relative">
      {/* Dashboard background image */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: -1,
          backgroundImage: 'url(/dashboard-bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
        aria-hidden="true"
      />
      {/* Expandable Header - consistent across all dashboard pages */}
      <div className="sticky top-0 z-40 px-0 sm:px-0 lg:px-0 pt-0">
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
