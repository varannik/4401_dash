"use client"

import React, { useEffect } from "react"
import { X, Download, Trash2, Filter, Search, CheckCircle } from "lucide-react"
import { useAnomalyStore } from "../../stores/anomaly-store"
import AnomalyItem from "./AnomalyItem"

interface AnomalyDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export const AnomalyDrawer: React.FC<AnomalyDrawerProps> = ({ isOpen, onClose }) => {
  const {
    anomalies,
    notifications,
    unreadCount,
    markAllNotificationsAsRead,
    clearProcessedAnomalies,
    exportAnomaliesAsJSON
  } = useAnomalyStore()

  const [filter, setFilter] = React.useState<'all' | 'unprocessed' | 'processed'>('unprocessed')
  const [severityFilter, setSeverityFilter] = React.useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all')
  const [searchQuery, setSearchQuery] = React.useState('')
  const [isVisible, setIsVisible] = React.useState(false)

  // Handle visibility state for smooth transitions
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300) // Match transition duration
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  // Disable background scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      // Save current scroll position
      const scrollY = window.scrollY
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = '100%'
      document.body.style.overflow = 'hidden'
    } else {
      // Restore scrolling and position
      const scrollY = document.body.style.top
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      document.body.style.overflow = ''
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1)
      }
    }

    // Cleanup function
    return () => {
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Mark notifications as read when drawer opens
  useEffect(() => {
    if (isOpen && unreadCount > 0) {
      markAllNotificationsAsRead()
    }
  }, [isOpen, unreadCount, markAllNotificationsAsRead])

  const filteredAnomalies = anomalies.filter(anomaly => {
    // Filter by processing status
    if (filter === 'unprocessed' && anomaly.isProcessed) return false
    if (filter === 'processed' && !anomaly.isProcessed) return false

    // Filter by severity
    if (severityFilter !== 'all' && anomaly.severity !== severityFilter) return false

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        anomaly.metricDisplayName.toLowerCase().includes(query) ||
        anomaly.originalData.alarm_type.toLowerCase().includes(query) ||
        anomaly.originalData.value.toString().includes(query)
      )
    }

    return true
  })

  const handleExportJSON = () => {
    const jsonData = exportAnomaliesAsJSON()
    const blob = new Blob([jsonData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `anomaly-data-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const processedCount = anomalies.filter(a => a.isProcessed).length
  const unprocessedCount = anomalies.filter(a => !a.isProcessed).length

  // Don't render anything if not visible
  if (!isVisible) return null

  return (
    <>
      {/* Backdrop - covers entire screen when drawer is open */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-all duration-300 ease-in-out ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div className={`
        fixed top-0 right-0 h-full w-full max-w-md bg-neutral-900/95 backdrop-blur-md border-l border-white/10 z-50
        transform transition-transform duration-300 ease-in-out flex flex-col
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        {/* Header */}
        <div className="flex-shrink-0 p-4 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Anomaly Detection</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
            >
              <X className="w-5 h-5 text-white/70" />
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-2">
              <div className="text-orange-400 text-sm font-medium">Unprocessed</div>
              <div className="text-orange-300 text-lg font-bold">{unprocessedCount}</div>
            </div>
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-2">
              <div className="text-green-400 text-sm font-medium">Processed</div>
              <div className="text-green-300 text-lg font-bold">{processedCount}</div>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Search anomalies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 text-sm"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2 mb-3">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="flex-1 p-2 bg-white/5 border border-white/20 rounded text-white text-sm"
            >
              <option value="all">All</option>
              <option value="unprocessed">Unprocessed</option>
              <option value="processed">Processed</option>
            </select>
            
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value as any)}
              className="flex-1 p-2 bg-white/5 border border-white/20 rounded text-white text-sm"
            >
              <option value="all">All Severity</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleExportJSON}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded text-blue-400 text-sm font-medium transition-colors duration-200"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            
            {processedCount > 0 && (
              <button
                onClick={clearProcessedAnomalies}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded text-red-400 text-sm font-medium transition-colors duration-200"
              >
                <Trash2 className="w-4 h-4" />
                Clear Processed
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 min-h-0">
          {filteredAnomalies.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-500/50 mx-auto mb-3" />
              <p className="text-white/60 text-sm">
                {anomalies.length === 0 
                  ? "No anomalies detected yet"
                  : filter === 'unprocessed' 
                    ? "All anomalies have been processed"
                    : "No anomalies match your filters"
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAnomalies.map((anomaly) => (
                <AnomalyItem
                  key={anomaly.id}
                  anomaly={anomaly}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 p-4 border-t border-white/10 bg-neutral-900/50">
          <p className="text-xs text-white/50 text-center">
            {filteredAnomalies.length} of {anomalies.length} anomalies shown
          </p>
        </div>
      </div>
    </>
  )
}

export default AnomalyDrawer
