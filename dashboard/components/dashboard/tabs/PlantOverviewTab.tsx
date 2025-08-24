"use client"

import { useState, useEffect } from "react"
import { CO2FlowChart, WaterFlowChart, TracerFlowChart, PressureGauges, CO2FlowCard, WaterFlowCard, TracerFlowCard, CO2WaterRatioCard } from "../charts"
import AnomalyDemo from "../AnomalyDemo"

interface PlantMetrics {
  co2Flow: number
  waterFlow: number
  tracerFlow: number
  co2WaterRatio: number
  injectionWellAnnulusPressure: number
  injectionWellTubingPressure: number
  injectionPressure: number
  timestamp?: Date
}

interface HistoricalData {
  timestamp: string
  co2Flow: number
  waterFlow: number
  tracerFlow: number
}

// Simulate real-time data updates
const generateMockData = (): PlantMetrics => ({
  co2Flow: 2.3 + (Math.random() - 0.5) * 0.4, // Kg/Hr
  waterFlow: 1.8 + (Math.random() - 0.5) * 0.3, // M3/Hr
  tracerFlow: 0.15 + (Math.random() - 0.5) * 0.05, // L/Hr
  co2WaterRatio: 65 + (Math.random() - 0.5) * 10, // %
  injectionWellAnnulusPressure: 180 + (Math.random() - 0.5) * 20, // Bar
  injectionWellTubingPressure: 145 + (Math.random() - 0.5) * 15, // Bar
  injectionPressure: 125 + (Math.random() - 0.5) * 10, // Bar
  timestamp: new Date()
})

// Generate 24 hours of historical data
const generateHistoricalData = (): HistoricalData[] => {
  const data: HistoricalData[] = []
  const now = new Date()
  
  for (let i = 23; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - (i * 60 * 60 * 1000))
    data.push({
      timestamp: timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      co2Flow: 2.3 + (Math.random() - 0.5) * 0.6,
      waterFlow: 1.8 + (Math.random() - 0.5) * 0.4,
      tracerFlow: 0.15 + (Math.random() - 0.5) * 0.08,
    })
  }
  return data
}

export const PlantOverviewTab = () => {
  const [metrics, setMetrics] = useState<PlantMetrics>(generateMockData())
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [historicalData] = useState<HistoricalData[]>(generateHistoricalData())

  // Initialize lastUpdate on client side only to prevent hydration mismatch
  useEffect(() => {
    setLastUpdate(new Date())
  }, [])

  useEffect(() => {
    if (!lastUpdate) return // Don't start interval until lastUpdate is initialized

    const interval = setInterval(() => {
      setIsUpdating(true)
      
      // Simulate network delay
      setTimeout(() => {
        setMetrics(generateMockData())
        setLastUpdate(new Date())
        setIsUpdating(false)
      }, 200)
    }, 10000) // Update every 10 seconds

    return () => clearInterval(interval)
  }, [lastUpdate])



  return (
    <div className="space-y-6">
      {/* Flow Measurements */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <CO2FlowCard value={metrics.co2Flow} />
        <WaterFlowCard value={metrics.waterFlow} />
        <TracerFlowCard value={metrics.tracerFlow} />
        <CO2WaterRatioCard value={metrics.co2WaterRatio} />
      </div>

      {/* Pressure Measurements */}
      <PressureGauges
        injectionWellAnnulusPressure={metrics.injectionWellAnnulusPressure}
        injectionWellTubingPressure={metrics.injectionWellTubingPressure}
        injectionPressure={metrics.injectionPressure}
      />

      {/* 24-Hour Timeline Charts - Separated by Flow Type */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <CO2FlowChart 
          data={historicalData} 
          currentValue={metrics.co2Flow} 
        />
        <WaterFlowChart 
          data={historicalData} 
          currentValue={metrics.waterFlow} 
        />
        <TracerFlowChart 
          data={historicalData} 
          currentValue={metrics.tracerFlow} 
        />
      </div>

      {/* Anomaly Detection Demo */}
      <div className="mt-8">
        <AnomalyDemo />
      </div>
    </div>
  )
}

export default PlantOverviewTab
