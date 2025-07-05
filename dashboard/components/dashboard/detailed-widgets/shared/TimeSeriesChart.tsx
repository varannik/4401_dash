"use client"

import React, { useMemo } from 'react'
import type { TimeSeriesChartProps } from '@/types/widgets'

/**
 * TimeSeriesChart component displays time-series data as a bar chart
 * Automatically scales data to fit within the container height
 */
export const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({
  data,
  label,
  color
}) => {
  // Memoize calculations for performance
  const chartMetrics = useMemo(() => {
    const maxValue = Math.max(...data)
    const minValue = Math.min(...data)
    const range = maxValue - minValue
    
    return { maxValue, minValue, range }
  }, [data])

  /**
   * Calculate the height percentage for a data point
   */
  const getBarHeight = (value: number): string => {
    const { minValue, range } = chartMetrics
    if (range === 0) return '100%' // Handle case where all values are the same
    
    const percentage = ((value - minValue) / range) * 100
    return `${Math.max(percentage, 1)}%` // Ensure minimum 1% height for visibility
  }

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-white/30">
      {/* Chart title */}
      <h4 className="text-lg font-semibold mb-4 text-gray-800">{label}</h4>
      
      {/* Chart container */}
      <div 
        className="h-40 flex items-end gap-1"
        role="img"
        aria-label={`Time series chart showing ${label}`}
      >
        {data.map((value, index) => (
          <div
            key={`bar-${index}`}
            className="flex-1 rounded-t-sm transition-all duration-300 hover:opacity-80 cursor-pointer"
            style={{
              height: getBarHeight(value),
              backgroundColor: color,
              minHeight: '4px'
            }}
            title={`Data point ${index + 1}: ${value}`}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                // Could trigger a tooltip or detailed view
                console.log(`Data point ${index + 1}: ${value}`)
              }
            }}
          />
        ))}
      </div>
      
      {/* Chart metadata */}
      <div className="mt-2 text-xs text-gray-500 flex justify-between">
        <span>Min: {chartMetrics.minValue}</span>
        <span>Max: {chartMetrics.maxValue}</span>
      </div>
    </div>
  )
} 