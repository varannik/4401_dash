"use client"

import React from "react"
import { Droplets } from "lucide-react"
import { HistoricalData } from "./types"
import Card from "./Card"

interface WaterFlowChartProps {
  data: HistoricalData[]
  currentValue: number
}

const formatValue = (value: number, decimals: number = 1): string => {
  return value.toFixed(decimals)
}

export const WaterFlowChart: React.FC<WaterFlowChartProps> = ({ data, currentValue }) => {
  const maxValue = 2.5
  const decimals = 1

  const headerContent = (
    <div className="p-2 bg-cyan-500/20 rounded-lg">
      <Droplets className="w-5 h-5 text-cyan-400" />
    </div>
  )

  const footerContent = (
    <div className="bg-cyan-500/10 rounded-lg p-3 border border-cyan-500/20">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
        <span className="text-cyan-400 text-sm font-medium">Current</span>
      </div>
      <p className="text-xl font-bold text-white">{formatValue(currentValue, decimals)} M3/Hr</p>
      <p className="text-xs text-white/50">
        24H Avg: {formatValue(data.reduce((sum, d) => sum + d.waterFlow, 0) / data.length, decimals)} M3/Hr
      </p>
    </div>
  )

  return (
    <Card
      title="Water Flow Trend"
      subtitle="Last 24 Hours (M3/Hr)"
      headerContent={headerContent}
      footerContent={footerContent}
      size="lg"
      variant="glass"
      padding="lg"
      hover={true}
      className="group hover:shadow-cyan-500/20"
    >

      <div className="relative h-48 bg-black/20 rounded-lg p-3 overflow-hidden">
        {/* Y-axis labels for Water */}
        <div className="absolute left-1 top-2 bottom-2 flex flex-col justify-between text-xs text-white/50">
          <span>2.5</span>
          <span>2.0</span>
          <span>1.5</span>
          <span>1.0</span>
          <span>0.5</span>
        </div>

        {/* Chart area */}
        <div className="ml-6 mr-2 h-full relative">
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

          {/* Water Flow Line */}
          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
            <polyline
              fill="none"
              stroke="#06b6d4"
              strokeWidth="2"
              points={data.map((d, i) => 
                `${(i / (data.length - 1)) * 100},${100 - ((d.waterFlow / maxValue) * 100)}`
              ).join(' ')}
            />
            {/* Data points */}
            {data.map((d, i) => (
              <circle
                key={i}
                cx={`${(i / (data.length - 1)) * 100}%`}
                cy={`${100 - ((d.waterFlow / maxValue) * 100)}%`}
                r="2"
                fill="#06b6d4"
              />
            ))}
          </svg>
        </div>

        {/* X-axis labels */}
        <div className="absolute bottom-1 left-6 right-2 flex justify-between text-xs text-white/50">
          {data.filter((_, i) => i % 6 === 0).map((d, i) => (
            <span key={i}>{d.timestamp}</span>
          ))}
        </div>
      </div>

    </Card>
  )
}
