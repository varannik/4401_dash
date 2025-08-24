"use client"

import React from "react"
import { Droplets, TrendingUp, AlertCircle } from "lucide-react"
import Card from "./Card"

interface WaterFlowCardProps {
  value: number
}

// Utility Functions
const formatValue = (value: number, decimals: number = 1): string => {
  return value.toFixed(decimals)
}

const getStatus = (value: number, ranges: any): string => {
  const percentage = ((value - ranges.min) / (ranges.max - ranges.min)) * 100
  if (percentage <= 10) return 'LL'
  if (percentage <= 30) return 'L'
  if (percentage <= 70) return 'Normal'
  if (percentage <= 90) return 'H'
  return 'HH'
}

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'LL': return "text-red-500"
    case 'L': return "text-amber-500"
    case 'Normal': return "text-emerald-500"
    case 'H': return "text-amber-500"
    case 'HH': return "text-red-500"
    default: return "text-gray-400"
  }
}

const getStatusBadgeColor = (status: string): string => {
  switch (status) {
    case 'LL': return "bg-red-500/20 text-red-500 border-red-500/30"
    case 'L': return "bg-amber-500/20 text-amber-500 border-amber-500/30"
    case 'Normal': return "bg-emerald-500/20 text-emerald-500 border-emerald-500/30"
    case 'H': return "bg-amber-500/20 text-amber-500 border-amber-500/30"
    case 'HH': return "bg-red-500/20 text-red-500 border-red-500/30"
    default: return "bg-gray-500/20 text-gray-400 border-gray-500/30"
  }
}

const getProgressColor = (status: string): string => {
  switch (status) {
    case 'LL': return "from-red-500 to-red-600"
    case 'L': return "from-amber-500 to-amber-600"
    case 'Normal': return "from-emerald-500 to-emerald-400"
    case 'H': return "from-amber-500 to-amber-600"
    case 'HH': return "from-red-500 to-red-600"
    default: return "from-gray-500 to-gray-400"
  }
}

// Configuration Functions
const getCardConfiguration = () => ({
  title: "Water Flow Rate",
  unit: "M³/Hr",
  ranges: { min: 1.0, max: 3.0 },
  normalRange: { min: 1.5, max: 2.2 },
  description: "Critical injection parameter"
})

const renderIcon = () => (
  <div className="relative">
    <div className="absolute inset-0 bg-cyan-500/20 rounded-xl blur-sm"></div>
    <div className="relative p-3 bg-gradient-to-br from-cyan-500/30 to-cyan-600/20 rounded-xl border border-cyan-400/30 backdrop-blur-sm">
      <Droplets className="w-6 h-6 text-cyan-300" />
      <div className="absolute top-1 right-1 w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
    </div>
  </div>
)

const renderStatusBadge = (value: number, config: ReturnType<typeof getCardConfiguration>) => {
  const status = getStatus(value, config.ranges)
  const badgeColor = getStatusBadgeColor(status)
  
  return (
    <div className={`px-3 py-1 rounded-full text-xs font-bold border ${badgeColor} backdrop-blur-sm`}>
      <div className="flex items-center gap-1">
        <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></div>
        {status}
      </div>
    </div>
  )
}

const renderContent = (value: number) => {
  const config = getCardConfiguration()
  const status = getStatus(value, config.ranges)
  const statusColor = getStatusColor(status)
  const progressColor = getProgressColor(status)
  const progressWidth = Math.min(Math.max((value / config.ranges.max) * 100, 0), 100)
  
  return (
    <div className="space-y-4">
      {/* Main Value Display */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {renderIcon()}
          <div>
            <div className="flex items-baseline gap-1">
              <span className={`text-3xl font-black ${statusColor} tracking-tight`}>
                {formatValue(value)}
              </span>
              <span className={`text-lg font-semibold ${statusColor} opacity-80`}>
                {config.unit}
              </span>
            </div>
            <p className="text-xs text-white/60 font-medium mt-0.5">Real-time monitoring</p>
          </div>
        </div>
        
        {/* Trend Indicator */}
        <div className="flex flex-col items-end gap-1">
          <TrendingUp className="w-4 h-4 text-green-400" />
          <span className="text-xs text-green-400 font-medium">+1.8%</span>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-white/50">Target Range</span>
          <span className="text-xs text-white/40">{config.normalRange.min} - {config.normalRange.max} {config.unit}</span>
        </div>
        <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
          <div 
            className={`h-full bg-gradient-to-r ${progressColor} rounded-full transition-all duration-1000 relative overflow-hidden`}
            style={{ width: `${progressWidth}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
          </div>
          {/* Range Indicators */}
          <div 
            className="absolute top-0 w-0.5 h-full bg-white/60"
            style={{ left: `${(config.normalRange.min / config.normalRange.max) * 100}%` }}
          ></div>
        </div>
      </div>
      
      {/* Critical Status Alert */}
      {(value < config.normalRange.min * 0.9 || value > config.normalRange.max * 1.1) && (
        <div className="flex items-center gap-2 p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <span className="text-xs text-red-400 font-medium">
            Critical: Value outside acceptable range
          </span>
        </div>
      )}
    </div>
  )
}

// Main Component
export const WaterFlowCard: React.FC<WaterFlowCardProps> = ({ value }) => {
  const config = getCardConfiguration()
  
  return (
    <Card
      title={config.title}
      subtitle={config.description}
      headerContent={renderStatusBadge(value, config)}
      size="md"
      variant="elevated"
      hover={true}
      className="group hover:shadow-cyan-500/20"
    >
      {renderContent(value)}
    </Card>
  )
}

export default WaterFlowCard