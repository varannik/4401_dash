'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { ExpandableHeader } from '@/components/dashboard/ExpandableHeader'

export default function ExpandableHeaderWrapper() {
  const [isHeaderExpanded, setIsHeaderExpanded] = useState(false)
  const pathname = usePathname()

  // Only allow header expansion on dashboard routes
  const isDashboardRoute = pathname.startsWith('/dashboard')

  // Reset header expansion when navigating away from dashboard routes
  useEffect(() => {
    if (!isDashboardRoute && isHeaderExpanded) {
      setIsHeaderExpanded(false)
    }
  }, [isDashboardRoute, isHeaderExpanded])

  const toggleHeader = () => {
    // Prevent expansion on non-dashboard routes (like root "/")
    if (isDashboardRoute) {
      setIsHeaderExpanded(!isHeaderExpanded)
    }
  }

  // Force header to be collapsed on non-dashboard routes
  const shouldBeExpanded = isDashboardRoute && isHeaderExpanded

  // Hide header entirely on landing and auth routes
  if (pathname === '/' || pathname.startsWith('/auth')) {
    return null
  }

  return (
    <ExpandableHeader 
      isExpanded={shouldBeExpanded} 
      onToggle={toggleHeader}
    />
  )
}
