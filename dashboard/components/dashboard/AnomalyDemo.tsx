"use client"

import React from "react"
import { Play, RotateCcw, Database } from "lucide-react"
import { useAnomalyStore } from "@/stores/anomaly-store"
import { AnomalyData } from "@/types/anomaly"

export const AnomalyDemo: React.FC = () => {
  const { addAnomalyData } = useAnomalyStore()

  // Sample anomaly data based on your provided JSON
  const sampleAnomalyData: AnomalyData = {
    "timestamp": "2025-08-26T10:40:29.652000Z",
    "method": "statistical",
    "results": {
      "WATER_FLOW_RATE": {
        "value": 2,
        "alarm_type": "OK",
        "status": "Normal",
        "context": ""
      },
      "CO2_FLOW_RATE": {
        "value": 40,
        "alarm_type": "OK", 
        "status": "Normal",
        "context": ""
      },
      "LIQUID_TRACER_FLOW_RATE": {
        "value": 0.5,
        "alarm_type": "OK",
        "status": "Normal", 
        "context": ""
      },
      "INJECTION_PRESSURE": {
        "value": 55,
        "alarm_type": "High-High",
        "status": "Anomaly",
        "context": "The alarm is for high-high injection pressure. This situation occurs when the water or CO2 injection pumps operate at a speed higher than the expected setpoint. To address this, verify the variable frequency drive setpoints and observe the soft start ramp. Monitor the pressure rise and avoid sudden spikes. Regularly record the flow and listen for unusual sounds. Cross-check the readings with a manual gauge and report any strange measurements. Conduct a walk inspection to check for leaks, pressure spikes, or blockages."
      },
      "HASA_4_TUBING_PRESSURE": {
        "value": 35,
        "alarm_type": "OK",
        "status": "Normal",
        "context": ""
      },
      "WATER_TO_CO2_RATIO": {
        "value": 25,
        "alarm_type": "OK", 
        "status": "Normal",
        "context": ""
      }
    },
    "processing_time_ms": 2468.2736396789955
  }

  // Generate random anomaly for testing
  const generateRandomAnomaly = (): AnomalyData => {
    const metrics = [
      "WATER_FLOW_RATE",
      "CO2_FLOW_RATE", 
      "LIQUID_TRACER_FLOW_RATE",
      "INJECTION_PRESSURE",
      "HASA_4_TUBING_PRESSURE",
      "WATER_TO_CO2_RATIO"
    ]

    const alarmTypes = ["Low-Low", "Low", "High", "High-High"]
    const contexts = [
      "Critical pressure threshold exceeded. Immediate attention required.",
      "Flow rate deviation detected. Check pump settings and pipeline integrity.",
      "Temperature anomaly detected. Verify cooling system operation.",
      "Unusual pattern detected in historical data comparison.",
      "Sensor reading outside normal operational parameters."
    ]

    const randomMetric = metrics[Math.floor(Math.random() * metrics.length)]
    const randomAlarmType = alarmTypes[Math.floor(Math.random() * alarmTypes.length)]
    const randomContext = contexts[Math.floor(Math.random() * contexts.length)]

    const baseData = { ...sampleAnomalyData }
    baseData.timestamp = new Date().toISOString()
    baseData.processing_time_ms = Math.random() * 3000 + 1000

    // Clear all results first
    Object.keys(baseData.results).forEach(key => {
      if (baseData.results[key as keyof typeof baseData.results]) {
        baseData.results[key as keyof typeof baseData.results]!.status = "Normal"
        baseData.results[key as keyof typeof baseData.results]!.alarm_type = "OK"
        baseData.results[key as keyof typeof baseData.results]!.context = ""
      }
    })

    // Set the anomaly
    if (baseData.results[randomMetric as keyof typeof baseData.results]) {
      const metricData = baseData.results[randomMetric as keyof typeof baseData.results]!
      metricData.status = "Anomaly"
      metricData.alarm_type = randomAlarmType
      metricData.context = randomContext
      
      // Adjust value based on alarm type
      switch (randomAlarmType) {
        case "High-High":
          metricData.value = metricData.value * (1.5 + Math.random() * 0.5)
          break
        case "High": 
          metricData.value = metricData.value * (1.2 + Math.random() * 0.3)
          break
        case "Low":
          metricData.value = metricData.value * (0.5 + Math.random() * 0.3)
          break
        case "Low-Low":
          metricData.value = metricData.value * (0.1 + Math.random() * 0.3)
          break
      }
      metricData.value = Math.round(metricData.value * 100) / 100
    }

    return baseData
  }

  const handleAddSampleAnomaly = () => {
    addAnomalyData(sampleAnomalyData)
  }

  const handleAddRandomAnomaly = () => {
    const randomAnomaly = generateRandomAnomaly()
    addAnomalyData(randomAnomaly)
  }

  const handleAddMultipleAnomalies = () => {
    // Add 3-5 random anomalies with slight delays
    const count = 3 + Math.floor(Math.random() * 3)
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const randomAnomaly = generateRandomAnomaly()
        addAnomalyData(randomAnomaly)
      }, i * 1000) // 1 second apart
    }
  }

  return (
    <div className="p-6 bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-lg">
      <div className="flex items-center gap-3 mb-4">
        <Database className="w-6 h-6 text-blue-400" />
        <h3 className="text-xl font-semibold text-white">Anomaly Detection Demo</h3>
      </div>
      
      <p className="text-white/70 text-sm mb-6">
        Use these buttons to simulate anomaly detection events and test the anomaly management system.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={handleAddSampleAnomaly}
          className="flex items-center justify-center gap-2 p-4 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-400 font-medium transition-colors duration-200"
        >
          <Play className="w-5 h-5" />
          Add Sample Anomaly
        </button>

        <button
          onClick={handleAddRandomAnomaly}
          className="flex items-center justify-center gap-2 p-4 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 rounded-lg text-orange-400 font-medium transition-colors duration-200"
        >
          <RotateCcw className="w-5 h-5" />
          Add Random Anomaly
        </button>

        <button
          onClick={handleAddMultipleAnomalies}
          className="flex items-center justify-center gap-2 p-4 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-400 font-medium transition-colors duration-200"
        >
          <Database className="w-5 h-5" />
          Add Multiple Anomalies
        </button>
      </div>

      <div className="mt-6 p-4 bg-white/5 rounded-lg">
        <h4 className="text-white font-medium mb-2">Sample Data Structure:</h4>
        <pre className="text-xs text-white/60 overflow-x-auto">
{JSON.stringify(sampleAnomalyData, null, 2).slice(0, 500)}...
        </pre>
      </div>
    </div>
  )
}

export default AnomalyDemo
