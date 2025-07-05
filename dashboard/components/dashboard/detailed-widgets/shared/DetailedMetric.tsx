"use client"

import React from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import type { DetailedMetricProps } from '@/types/widgets'

/**
 * DetailedMetric component displays a metric with optional trend indicators
 * Used across various dashboard widgets for consistent metric presentation
 */
export const DetailedMetric: React.FC<DetailedMetricProps> = ({
  label,
  value,
  unit,
  change,
  changeType,
  icon: Icon
}) => {
  const getTrendColor = (): string => {
    switch (changeType) {
      case 'increase':
        return 'text-green-600'
      case 'decrease':
        return 'text-red-600'
      default:
        return 'text-gray-500'
    }
  }

  const formatChange = (): string => {
    if (typeof change !== 'number') return ''
    return change > 0 ? `+${change}%` : `${change}%`
  }

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-white/30">
      {/* Header with icon and label */}
      <div className="flex items-center gap-3 mb-2">
        {Icon && <Icon className="w-5 h-5 text-gray-600" aria-hidden="true" />}
        <span className="text-sm font-medium text-gray-600">{label}</span>
      </div>
      
      {/* Value and trend display */}
      <div className="flex items-center gap-2">
        <span className="text-2xl font-bold text-gray-900">{value}</span>
        {unit && <span className="text-sm text-gray-500">{unit}</span>}
        
        {/* Trend indicator */}
        {change !== undefined && changeType && (
          <div className={`flex items-center gap-1 text-sm ${getTrendColor()}`}>
            {changeType === 'increase' && <TrendingUp className="w-4 h-4" aria-hidden="true" />}
            {changeType === 'decrease' && <TrendingDown className="w-4 h-4" aria-hidden="true" />}
            <span>{formatChange()}</span>
          </div>
        )}
      </div>
    </div>
  )
} 