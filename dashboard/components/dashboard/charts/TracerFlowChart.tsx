"use client"

import React from "react"
import { TrendingUp } from "lucide-react"
import { HistoricalData } from "./types"
import Card from "./Card"

interface TracerFlowChartProps {
  data: HistoricalData[]
  currentValue: number
}

const formatValue = (value: number, decimals: number = 2): string => {
  return value.toFixed(decimals)
}

export const TracerFlowChart: React.FC<TracerFlowChartProps> = ({ data, currentValue }) => {
  const maxValue = 0.25
  const decimals = 2

  const headerContent = (
    <div className="p-2 bg-purple-500/20 rounded-lg">
      <TrendingUp className="w-5 h-5 text-purple-400" />
    </div>
  )

  const footerContent = (
    <div className="bg-purple-500/10 rounded-lg p-3 border border-purple-500/20">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-2 h-2 rounded-full bg-purple-500"></div>
        <span className="text-purple-400 text-sm font-medium">Current</span>
      </div>
      <p className="text-xl font-bold text-white">{formatValue(currentValue, decimals)} L/Hr</p>
      <p className="text-xs text-white/50">
        24H Avg: {formatValue(data.reduce((sum, d) => sum + d.tracerFlow, 0) / data.length, decimals)} L/Hr
      </p>
    </div>
  )

  return (
    <Card
      title="Tracer Flow Trend"
      subtitle="Last 24 Hours (L/Hr)"
      headerContent={headerContent}
      footerContent={footerContent}
      size="lg"
      variant="glass"
      padding="lg"
      hover={true}
      className="group hover:shadow-purple-500/20"
    >

      <div className="relative h-48 bg-black/20 rounded-lg p-3 overflow-hidden">
        {/* Y-axis labels for Tracer */}
        <div className="absolute left-1 top-2 bottom-2 flex flex-col justify-between text-xs text-white/50">
          <span>0.25</span>
          <span>0.20</span>
          <span>0.15</span>
          <span>0.10</span>
          <span>0.05</span>
        </div>

        {/* Chart area */}
        <div className="ml-8 mr-2 h-full relative">
          {/* Grid lines */}
          <div className="absolute inset-0">
            {[...Array(6)].map((_, i) => (
              <div 
                key={i} 
                className="absolute w-full border-t border-white/10" 
                style={{ top: `${(i / 5) * 100}%` }}
              />
            ))}
            {[...Array(7)].map((_, i) => (
              <div 
                key={i} 
                className="absolute h-full border-l border-white/10" 
                style={{ left: `${(i / 6) * 100}%` }}
              />
            ))}
          </div>

          {/* Tracer Flow Line */}
          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
            <polyline
              fill="none"
              stroke="#8b5cf6"
              strokeWidth="2"
              points={data.map((d, i) => 
                `${(i / (data.length - 1)) * 100},${100 - ((d.tracerFlow / maxValue) * 100)}`
              ).join(' ')}
            />
            {/* Data points */}
            {data.map((d, i) => (
              <circle
                key={i}
                cx={`${(i / (data.length - 1)) * 100}%`}
                cy={`${100 - ((d.tracerFlow / maxValue) * 100)}%`}
                r="2"
                fill="#8b5cf6"
              />
            ))}
          </svg>
        </div>

        {/* X-axis labels */}
        <div className="absolute bottom-1 left-8 right-2 flex justify-between text-xs text-white/50">
          {data.filter((_, i) => i % 6 === 0).map((d, i) => (
            <span key={i}>{d.timestamp}</span>
          ))}
        </div>
      </div>

    </Card>
  )
}
