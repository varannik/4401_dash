"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
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
  AlertCircle
} from 'lucide-react'

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
  const [activeTeam, setActiveTeam] = useState<string | null>(null)
  const pathname = usePathname()

  const navigationItems = [
    { icon: Home, label: 'Overview', href: '/dashboard' },
    { icon: LayoutDashboard, label: 'Monitoring', href: '/dashboard/monitoring' },
    { icon: BarChart2, label: 'Analytics', href: '/dashboard/analytics' },
    { icon: FolderOpen, label: 'Projects', href: '/dashboard/projects' },
    { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
    { icon: Users, label: 'Team', href: '/dashboard/team' },
  ]

  const teams = [
    { name: 'Engineering', members: 12, color: 'bg-blue-500' },
    { name: 'Operations', members: 8, color: 'bg-green-500' },
    { name: 'Analytics', members: 6, color: 'bg-purple-500' },
    { name: 'Management', members: 4, color: 'bg-orange-500' },
  ]

  const handleNavigationClick = () => {
    onToggle() // Close the menu after navigation
  }

  return (
    <div className={`bg-black/20 backdrop-blur-sm rounded-lg transition-all duration-300 overflow-hidden ${
      isExpanded ? 'shadow-2xl' : 'shadow-lg'
    }`}>
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
        </div>
        <div className="flex items-center gap-4">
          <StatusIndicator type="warning" label="Whats going on" />
          <StatusIndicator type="error" label="What has gone wrong" />
          <StatusIndicator type="info" label="Impact" />
          <StatusIndicator type="success" label="Action to Fix" />
        </div>
      </div>

      {/* Expandable Navigation Content */}
      <div className={`transition-all duration-300 ${
        isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="border-t border-white/20 bg-white/10 backdrop-blur-lg">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">44</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Industrial Monitoring</h2>
                <p className="text-sm text-white/80">Carbon Capture & Storage Dashboard</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Navigation */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Navigation</h3>
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

              {/* Teams */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Teams</h3>
                <div className="space-y-3">
                  {teams.map((team) => (
                    <div
                      key={team.name}
                      className="flex items-center gap-3 p-3 rounded-lg border border-white/20 hover:bg-white/10 cursor-pointer transition-colors"
                      onClick={() => setActiveTeam(activeTeam === team.name ? null : team.name)}
                    >
                      <div className={`w-3 h-3 rounded-full ${team.color}`} />
                      <div className="flex-1">
                        <div className="font-medium text-white">{team.name}</div>
                        <div className="text-sm text-white/70">{team.members} members</div>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-white/60 transition-transform ${
                        activeTeam === team.name ? 'rotate-180' : ''
                      }`} />
                    </div>
                  ))}
                </div>
              </div>

              {/* User Profile */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Account</h3>
                <div className="p-4 rounded-lg border border-white/20 bg-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-white">System Admin</div>
                      <div className="text-sm text-white/70">admin@44.01.com</div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-white/20">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/70">Status</span>
                      <span className="text-green-400 font-medium">Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-6 pt-6 border-t border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link 
                  href="/dashboard/analytics"
                  onClick={handleNavigationClick}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500/30 text-blue-200 rounded-lg hover:bg-blue-500/40 transition-colors"
                >
                  <BarChart2 className="w-4 h-4" />
                  <span>Analytics</span>
                </Link>
                <Link 
                  href="/dashboard/settings"
                  onClick={handleNavigationClick}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500/30 text-green-200 rounded-lg hover:bg-green-500/40 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </Link>
                <Link 
                  href="/dashboard/team"
                  onClick={handleNavigationClick}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-500/30 text-purple-200 rounded-lg hover:bg-purple-500/40 transition-colors"
                >
                  <Users className="w-4 h-4" />
                  <span>Team</span>
                </Link>
                <Link 
                  href="/dashboard/projects"
                  onClick={handleNavigationClick}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-500/30 text-orange-200 rounded-lg hover:bg-orange-500/40 transition-colors"
                >
                  <FolderOpen className="w-4 h-4" />
                  <span>Projects</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 