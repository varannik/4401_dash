"use client"

import React from "react"
import dynamic from "next/dynamic"
import { Gauge } from "lucide-react"

// Dynamically import the gauge component to avoid SSR issues
const GaugeComponent = dynamic(() => import('react-gauge-component'), { 
  ssr: false,
  loading: () => (
    <div className="w-48 h-32 flex items-center justify-center bg-white/5 rounded-lg border border-white/10">
      <div className="flex flex-col items-center gap-2">
        <div className="w-16 h-16 border-4 border-white/20 border-t-white/60 rounded-full animate-spin"></div>
        <div className="text-white/70 text-xs">Loading...</div>
      </div>
    </div>
  )
})

interface GradientWithArrowGaugeProps {
  value: number
  minValue: number
  maxValue: number
  title: string
  unit: string
  normalRange: {
    min: number
    max: number
  }
  icon?: React.ComponentType<{ className?: string }>
  color?: string
}

const formatValue = (value: number, decimals: number = 0): string => {
  return value.toFixed(decimals)
}

const getStatusColor = (value: number, min: number, max: number): string => {
  if (value < min || value > max) return "text-red-400"
  if (value < min * 1.1 || value > max * 0.9) return "text-yellow-400"
  return "text-green-400"
}

const getIconBgClass = (color: string = "red"): string => {
  const classMap: { [key: string]: string } = {
    red: 'bg-red-500/20',
    green: 'bg-green-500/20',
    blue: 'bg-blue-500/20',
    yellow: 'bg-yellow-500/20',
    purple: 'bg-purple-500/20',
    cyan: 'bg-cyan-500/20',
    orange: 'bg-orange-500/20'
  }
  return classMap[color] || 'bg-red-500/20'
}

const getIconTextClass = (color: string = "red"): string => {
  const classMap: { [key: string]: string } = {
    red: 'text-red-400',
    green: 'text-green-400',
    blue: 'text-blue-400',
    yellow: 'text-yellow-400',
    purple: 'text-purple-400',
    cyan: 'text-cyan-400',
    orange: 'text-orange-400'
  }
  return classMap[color] || 'text-red-400'
}

export const GradientWithArrowGauge: React.FC<GradientWithArrowGaugeProps> = ({
  value,
  minValue,
  maxValue,
  title,
  unit,
  normalRange,
  icon: Icon = Gauge,
  color = "red"
}) => {
  // Calculate percentage for gauge (0-100 for the gauge display)
  const percentage = Math.min(Math.max((value - minValue) / (maxValue - minValue), 0), 1)
  const gaugeValue = percentage * 100
  
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-lg ${getIconBgClass(color)}`}>
          <Icon className={`w-5 h-5 ${getIconTextClass(color)}`} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <p className="text-sm text-white/70">Current Reading</p>
        </div>
      </div>
      
      <div className="flex flex-col items-center">
        <div className="w-48 h-32 relative">
          <GaugeComponent
            id={`gauge-${title.replace(/\s+/g, '-').toLowerCase()}`}
            arc={{
              gradient: true,
              width: 0.15,
              padding: 0,
              subArcs: [
                {
                  limit: 15,
                  color: '#EA4228',
                  showTick: true
                },
                {
                  limit: 37,
                  color: '#F5CD19',
                  showTick: true
                },
                {
                  limit: 58,
                  color: '#5BE12C',
                  showTick: true
                },
                {
                  limit: 75,
                  color: '#F5CD19',
                  showTick: true
                },
                { color: '#EA4228' }
              ]
            }}
            value={gaugeValue}
            pointer={{
              type: "arrow", 
              elastic: true
            }}
            labels={{
              valueLabel: {
                style: { fontSize: '35px', fill: '#fff' },
                formatTextValue: () => `${formatValue(value, 0)} ${unit}`
              }
            }}
          />
        </div>
        
        <div className="mt-2 text-center">
          <div className="text-xs text-white/50">
            Status: {value >= normalRange.min && value <= normalRange.max ? 'Normal' : 'Alert'}
          </div>
          <div className="text-xs text-white/40 mt-1">
            Normal: {normalRange.min}-{normalRange.max} {unit}
          </div>
        </div>
      </div>
    </div>
  )
}

export default GradientWithArrowGauge