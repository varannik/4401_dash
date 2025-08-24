"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { 
  Menu,
  X,
  LayoutDashboard,
  BarChart2,
  FolderOpen,
  Settings,
  Users,
  Home,
  ChevronDown,
  User,
  CheckCircle,
  AlertCircle,
  Clock,
  RefreshCw
} from 'lucide-react'
import AuthButton from '@/components/auth/auth-button'
import UserProfileButton from '@/components/auth/UserProfileButton'
import AnomalyIcon from './AnomalyIcon'
import { useAnomalyStore } from '@/stores/anomaly-store'
// Custom simple tabs implementation

const StatusIndicator = ({ type, label, count = 0 }: { type: 'success' | 'warning' | 'error' | 'info', label: string, count?: number }) => {
  const colors = {
    success: 'bg-green-500',
    warning: 'bg-orange-500', 
    error: 'bg-red-500',
    info: 'bg-blue-500'
  }
  
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 backdrop-blur-sm">
      <div className={`w-2 h-2 rounded-full ${colors[type]}`} />
      <span className="text-sm font-medium text-white">{label}</span>
      {count > 0 && (
        <span className="text-xs bg-white/20 px-2 py-1 rounded-full text-white">{count}</span>
      )}
    </div>
  )
}

interface ExpandableHeaderProps {
  isExpanded: boolean
  onToggle: () => void
}

export const ExpandableHeader: React.FC<ExpandableHeaderProps> = ({ 
  isExpanded, 
  onToggle
}) => {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const headerRef = React.useRef<HTMLDivElement>(null)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [isUpdating, setIsUpdating] = useState(false)
  
  // Anomaly store
  const { unreadCount, isDrawerOpen, toggleDrawer } = useAnomalyStore()

  // Handle click outside to close expanded header
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isExpanded && headerRef.current && !headerRef.current.contains(event.target as Node)) {
        onToggle()
      }
    }

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isExpanded, onToggle])

  // Simulate data updates every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIsUpdating(true)
      
      // Simulate network delay
      setTimeout(() => {
        setLastUpdate(new Date())
        setIsUpdating(false)
      }, 200)
    }, 10000) // Update every 10 seconds

    return () => clearInterval(interval)
  }, [])

  const navigationItems = [
    { icon: LayoutDashboard, label: 'Real Time', href: '/dashboard/realtime' },
    { icon: BarChart2, label: 'Analytics', href: '/dashboard/analytics' },
    { icon: FolderOpen, label: 'Projects', href: '/dashboard/projects' },
    { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
    { icon: Users, label: 'Team', href: '/dashboard/team' },
  ]

  // Define different tab sets for different navigation items
  const tabSets = {
    '/dashboard/realtime': [
      { name: 'Plant Overview', href: '/dashboard/realtime?tab=plant-overview' },
      { name: 'CO2 Injection', href: '/dashboard/realtime?tab=co2-injection' },
      { name: 'Water Injection', href: '/dashboard/realtime?tab=water-injection' },
      { name: 'Liquid Tracer', href: '/dashboard/realtime?tab=liquid-tracer' },
    ],
    '/dashboard/analytics': [
      { name: 'Reports', href: '/dashboard/analytics?tab=reports' },
      { name: 'Insights', href: '/dashboard/analytics?tab=insights' },
      { name: 'Trends', href: '/dashboard/analytics?tab=trends' },
      { name: 'Forecasts', href: '/dashboard/analytics?tab=forecasts' },
    ],
    '/dashboard/projects': [
      { name: 'Active', href: '/dashboard/projects?tab=active' },
      { name: 'Planning', href: '/dashboard/projects?tab=planning' },
      { name: 'Completed', href: '/dashboard/projects?tab=completed' },
      { name: 'On Hold', href: '/dashboard/projects?tab=onhold' },
    ],
    '/dashboard/settings': [
      { name: 'General', href: '/dashboard/settings?tab=general' },
      { name: 'Security', href: '/dashboard/settings?tab=security' },
      { name: 'Integrations', href: '/dashboard/settings?tab=integrations' },
      { name: 'Advanced', href: '/dashboard/settings?tab=advanced' },
    ],
    '/dashboard/team': [
      { name: 'Engineering', href: '/dashboard/team?tab=engineering' },
      { name: 'Operations', href: '/dashboard/team?tab=operations' },
      { name: 'Analytics', href: '/dashboard/team?tab=analytics' },
      { name: 'Management', href: '/dashboard/team?tab=management' },
    ],
  }

  // Get current navigation section from pathname
  const getCurrentNavigationSection = () => {
    if (pathname.startsWith('/dashboard/realtime')) return '/dashboard/realtime'
    if (pathname.startsWith('/dashboard/analytics')) return '/dashboard/analytics'
    if (pathname.startsWith('/dashboard/projects')) return '/dashboard/projects'
    if (pathname.startsWith('/dashboard/settings')) return '/dashboard/settings'
    if (pathname.startsWith('/dashboard/team')) return '/dashboard/team'
    return '/dashboard/realtime' // default
  }

  // Get current tabs based on navigation section
  const currentNavigationSection = getCurrentNavigationSection()
  const currentTabs = tabSets[currentNavigationSection as keyof typeof tabSets] || tabSets['/dashboard/realtime']

  const handleNavigationClick = () => {
    onToggle() // Close the menu after navigation
  }

  return (
    <div 
      ref={headerRef}
      className={`bg-black/20 backdrop-blur-sm rounded-b-lg transition-all duration-300 overflow-hidden ${
        isExpanded ? 'shadow-2xl' : 'shadow-lg'
      }`}
    >
      {/* Main Header Bar */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onToggle}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label={isExpanded ? "Close navigation menu" : "Open navigation menu"}
          >
            {isExpanded ? (
              <X className="w-6 h-6 text-white" />
            ) : (
              <Menu className="w-6 h-6 text-white" />
            )}
          </button>
          <div className="text-2xl font-bold text-white">44.01</div>
          <div className="flex items-center gap-2 text-white/70 text-sm">
            <Clock className="w-4 h-4" />
            <span>Last Update: {lastUpdate.toLocaleTimeString()}</span>
            {isUpdating && <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Tabs in Header - Hidden on expanded and mobile */}
          {!isExpanded && (
            <div className="hidden lg:flex items-center">
              <div 
                className="lg:bg-transparent bg-white/10 backdrop-blur-sm lg:border-0 border border-white/20 rounded-lg p-1 flex items-center gap-1"
                role="tablist"
                aria-label="Team selection"
              >
                {currentTabs.map((tab) => {
                  const tabParam = new URL(tab.href, 'http://localhost').searchParams.get('tab')
                  const currentTab = searchParams.get('tab')
                  const isActiveTab = currentTab === tabParam
                  return (
                    <Link
                      key={tab.name}
                      href={tab.href}
                      role="tab"
                      aria-selected={isActiveTab}
                      aria-controls={`tabpanel-${tab.name.toLowerCase()}`}
                      className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200 ${
                        isActiveTab
                          ? 'text-white bg-white/20'
                          : 'text-white/70 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <span className="text-sm font-medium">{tab.name}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}
          
          {/* Anomaly Icon - Always visible on all screen sizes */}
          <AnomalyIcon 
            unreadCount={unreadCount} 
            onClick={toggleDrawer}
            isOpen={isDrawerOpen}
          />
        </div>
      </div>

      {/* Expandable Navigation Content */}
      <div className={`transition-all duration-300 ${
        isExpanded ? 'max-h-[90vh] opacity-100' : 'max-h-0 opacity-0'
      } overflow-y-auto w-full`}>
        <div className="border-t border-white/20 bg-white/10 backdrop-blur-lg w-full">
          <div className="p-4 sm:p-6 w-full">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 w-full">
              {/* Reports */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Reports</h3>
                <div className="space-y-2">
                  {navigationItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <Link
                        key={item.label}
                        href={item.href}
                        onClick={handleNavigationClick}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 ${
                          isActive
                            ? 'bg-blue-500/30 text-blue-200 border border-blue-400/50'
                            : 'text-white/80 hover:bg-white/10'
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    )
                  })}
                </div>
              </div>

              {/* Sections */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Sections</h3>
                <div className="space-y-3">
                  {currentTabs.map((tab) => {
                    const tabParam = new URL(tab.href, 'http://localhost').searchParams.get('tab')
                    const currentTab = searchParams.get('tab')
                    const isActiveTab = currentTab === tabParam
                    return (
                      <Link
                        key={tab.name}
                        href={tab.href}
                        onClick={handleNavigationClick}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 ${
                          isActiveTab
                            ? 'border-white/40 bg-white/20 text-white'
                            : 'border-white/20 bg-transparent text-white/80 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <div className="flex-1 text-left">
                          <div className="font-medium">{tab.name}</div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>

              {/* User Profile */}
              <div className="space-y-4 sm:col-span-2">
                <h3 className="text-lg font-semibold text-white">Account</h3>
                <div className="p-4 rounded-lg border border-white/20 bg-white/10 hover:bg-white/20 transition-colors cursor-pointer">
                  <UserProfileButton />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 