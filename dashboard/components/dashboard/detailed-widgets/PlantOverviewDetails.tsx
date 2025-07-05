"use client"

import React from 'react'
import { CheckCircle, Droplets, Activity, Thermometer } from 'lucide-react'
import { DetailedMetric, TimeSeriesChart } from './shared'
import type { SystemStatus } from '@/types/widgets'

/**
 * Mock data - In a real application, this would come from props or API calls
 */
const MOCK_FLOW_DATA = [3.1, 3.3, 3.2, 3.5, 3.4, 3.6, 3.3, 3.4, 3.2, 3.3, 3.1, 3.4]
const MOCK_TEMP_DATA = [55, 57, 56, 58, 57, 59, 57, 58, 56, 57, 55, 58]

/**
 * System status configuration
 */
const SYSTEM_STATUS: SystemStatus = {
  isOperational: true,
  message: 'All systems operational',
  details: 'Plant operations running within normal parameters'
}

/**
 * PlantOverviewDetails component displays comprehensive plant operation metrics
 * Includes current metrics, historical trends, and system status
 */
export const PlantOverviewDetails: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Current Metrics Section */}
      <section className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-800">Current Metrics</h3>
        
        <DetailedMetric 
          label="Water Flow Rate" 
          value="3.3" 
          unit="m³/hr" 
          change={2.5} 
          changeType="increase" 
          icon={Droplets} 
        />
        
        <DetailedMetric 
          label="Injection Ratio" 
          value="1:26" 
          change={0} 
          changeType="stable" 
          icon={Activity} 
        />
        
        <DetailedMetric 
          label="CO₂ Temperature" 
          value="57" 
          unit="°C" 
          change={-1.2} 
          changeType="decrease" 
          icon={Thermometer} 
        />
        
        <DetailedMetric 
          label="Water Injected (Total)" 
          value="319" 
          unit="m³" 
          change={8.5} 
          changeType="increase" 
          icon={Droplets} 
        />
        
        <DetailedMetric 
          label="CO₂ Flow Rate" 
          value="22.5" 
          unit="kg/hr" 
          change={3.2} 
          changeType="increase" 
          icon={Activity} 
        />
      </section>
      
      {/* Historical Trends Section */}
      <section className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-800">Historical Trends</h3>
        
        <TimeSeriesChart 
          data={MOCK_FLOW_DATA} 
          label="Water Flow (Last 12 Hours)" 
          color="#3B82F6" 
        />
        
        <TimeSeriesChart 
          data={MOCK_TEMP_DATA} 
          label="Temperature (Last 12 Hours)" 
          color="#F59E0B" 
        />
        
        {/* System Status Card */}
        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-white/30">
          <h4 className="text-lg font-semibold mb-2 text-gray-800">System Status</h4>
          <div className={`flex items-center gap-2 ${
            SYSTEM_STATUS.isOperational ? 'text-green-600' : 'text-red-600'
          }`}>
            <CheckCircle className="w-5 h-5" aria-hidden="true" />
            <span>{SYSTEM_STATUS.message}</span>
          </div>
          {SYSTEM_STATUS.details && (
            <p className="text-sm text-gray-500 mt-1">{SYSTEM_STATUS.details}</p>
          )}
        </div>
      </section>
    </div>
  )
} 