"use client"

import React from "react"
import dynamic from "next/dynamic"
import Card from "./Card"

// Dynamically import the gauge component to avoid SSR issues
const GaugeComponent = dynamic(() => import('react-gauge-component'), { 
  ssr: false,
  loading: () => (
    <div className="w-96 h-64 flex items-center justify-center bg-white/5 rounded-lg border border-white/10">
      <div className="flex flex-col items-center gap-2">
        <div className="w-16 h-16 border-4 border-white/20 border-t-white/60 rounded-full animate-spin"></div>
        <div className="text-white/70 text-xs">Loading...</div>
      </div>
    </div>
  )
})

interface InjectionWellAnnulusPressureGaugeProps {
  value: number
}

// Utility Functions
const formatValue = (value: number, decimals: number = 0): string => {
  return value.toFixed(decimals)
}

const getStatusTag = (gaugeValue: number): string => {
  if (gaugeValue <= 10) return "LL"
  if (gaugeValue <= 30) return "L"
  if (gaugeValue <= 70) return "Normal"
  if (gaugeValue <= 90) return "H"
  return "HH"
}

const getStatusColor = (gaugeValue: number): string => {
  if (gaugeValue <= 10) return "text-red-600"
  if (gaugeValue <= 30) return "text-red-400"
  if (gaugeValue <= 70) return "text-green-400"
  if (gaugeValue <= 90) return "text-red-400"
  return "text-red-600"
}

// Configuration Functions
const getGaugeConfiguration = () => ({
  minValue: 100,
  maxValue: 250,
  normalRange: { min: 160, max: 200 },
  unit: "Bar",
  title: "Injection Well Annulus Pressure"
})

const calculateGaugeValue = (value: number, minValue: number, maxValue: number): number => {
  const percentage = Math.min(Math.max((value - minValue) / (maxValue - minValue), 0), 1)
  return percentage * 100
}

const getTickLabels = (minValue: number, maxValue: number) => {
  const range = maxValue - minValue
  return [
    { value: 10, valueConfig: { formatTextValue: () => String(Math.round(minValue + 0.10 * range)) } },
    { value: 30, valueConfig: { formatTextValue: () => String(Math.round(minValue + 0.30 * range)) } },
    { value: 70, valueConfig: { formatTextValue: () => String(Math.round(minValue + 0.70 * range)) } },
    { value: 90, valueConfig: { formatTextValue: () => String(Math.round(minValue + 0.90 * range)) } }
  ]
}

const getArcConfiguration = () => ({
  width: 0.1,
  padding: 0.02,
  colorArray: ['#EF4444', '#F59E0B', '#10B981', '#F59E0B', '#EF4444'],
  cornerRadius: 1,
  subArcs: [
    {
      limit: 10,
      color: '#EF4444', // red-500
    },
    {
      limit: 30,
      color: '#F59E0B', // amber-500
    },
    {
      limit: 70,
      color: '#10B981', // emerald-500
    },
    {
      limit: 90,
      color: '#F59E0B', // amber-500
    },
    {
      color: '#EF4444' // red-500
    }
  ]
})

const getPointerConfiguration = () => ({
  type: "needle" as const,
  elastic: true,
  color: "#F6F1DE"
})

// Component Functions
const renderHeader = (title: string, gaugeValue: number) => (
  <div className="mb-4 flex items-center justify-between">
    <h3 className="text-lg font-semibold text-white">{title}</h3>
    <div className={`text-sm ${getStatusColor(gaugeValue)}`}>
      {getStatusTag(gaugeValue)}
    </div>
  </div>
)

const renderGaugeChart = (value: number, gaugeValue: number, minValue: number, maxValue: number, unit: string) => (
  <div className="w-96 h-64 relative">
    <GaugeComponent
      value={gaugeValue}
      type="radial"
      labels={{
        tickLabels: {
          type: "outer", 
          hideMinMax: true,
          ticks: getTickLabels(minValue, maxValue)
        },
        valueLabel: {
          style: { fontSize: '35px', fill: '#fff'},
          formatTextValue: () => `${formatValue(value, 0)} ${unit}`
        }
      }}
      arc={getArcConfiguration()}
      pointer={getPointerConfiguration()}
    />
  </div>
)

const renderFooter = (minValue: number, maxValue: number, unit: string) => (
  <div className="mt-4 text-center">
    <div className="text-xs text-white/40">
      Min: {minValue} {unit} | Max: {maxValue} {unit}
    </div>
  </div>
)

// Main Component
export const InjectionWellAnnulusPressureGauge: React.FC<InjectionWellAnnulusPressureGaugeProps> = ({ value }) => {
  const config = getGaugeConfiguration()
  const gaugeValue = calculateGaugeValue(value, config.minValue, config.maxValue)

  const getStatusBadgeColor = (gaugeValue: number): string => {
    if (gaugeValue > 30 && gaugeValue <= 70) return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
    if (gaugeValue <= 10 || gaugeValue > 90) return "bg-red-500/20 text-red-400 border-red-500/30"
    return "bg-amber-500/20 text-amber-400 border-amber-500/30"
  }

  const getOptimalStatus = (gaugeValue: number): string => {
    if (gaugeValue > 30 && gaugeValue <= 70) return "NORMAL"
    if (gaugeValue <= 30) return "LOW"
    return "HIGH"
  }

  const headerContent = (
    <div className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadgeColor(gaugeValue)} backdrop-blur-sm`}>
      <div className="flex items-center gap-1">
        <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></div>
        {getOptimalStatus(gaugeValue)}
      </div>
    </div>
  )

  const footerContent = (
    <div className="text-center">
      <div className="text-xs text-white/40">
        Min: {config.minValue} {config.unit} | Max: {config.maxValue} {config.unit}
      </div>
    </div>
  )

  return (
    <Card
      title={config.title}
      headerContent={headerContent}
      footerContent={footerContent}
      size="xl"
      variant="glass"
      padding="lg"
      hover={true}
    >
      <div className="flex flex-col items-center">
        {renderGaugeChart(value, gaugeValue, config.minValue, config.maxValue, config.unit)}
      </div>
    </Card>
  )
}

export default InjectionWellAnnulusPressureGauge