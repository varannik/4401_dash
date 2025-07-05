"use client"

import React from 'react'
import { Globe, Thermometer, Activity, CheckCircle } from 'lucide-react'
import { DetailedMetric, TimeSeriesChart } from './shared'
import type { MaintenanceInfo } from '@/types/widgets'

/**
 * Mock data for DAC system
 */
const MOCK_CO2_DATA = [2300, 2387, 2400, 2350, 2387, 2420, 2380, 2387, 2360, 2387, 2390, 2387]
const MOCK_FLOW_DATA = [3800, 3892, 3850, 3900, 3892, 3920, 3880, 3892, 3870, 3892, 3885, 3892]

/**
 * Maintenance information
 */
const MAINTENANCE_INFO: MaintenanceInfo = {
  scheduledDate: 'December 15, 2024',
  type: 'Routine filter replacement',
  description: 'Scheduled maintenance to ensure optimal performance'
}

/**
 * DACDetails component displays Direct Air Capture system metrics
 * Includes performance metrics, analytics, and maintenance information
 */
export const DACDetails: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* DAC Performance Section */}
      <section className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-800">DAC Performance</h3>
        
        <DetailedMetric 
          label="CO₂ Capture Rate" 
          value="2387" 
          unit="tons" 
          change={4.2} 
          changeType="increase" 
          icon={Globe} 
        />
        
        <DetailedMetric 
          label="CO₂ Temperature" 
          value="57" 
          unit="°C" 
          change={0} 
          changeType="stable" 
          icon={Thermometer} 
        />
        
        <DetailedMetric 
          label="Injected CO₂" 
          value="7.676" 
          unit="tons" 
          change={6.8} 
          changeType="increase" 
          icon={Activity} 
        />
        
        <DetailedMetric 
          label="Total CO₂ Flow" 
          value="3892" 
          unit="tons" 
          change={2.1} 
          changeType="increase" 
          icon={Activity} 
        />
        
        <DetailedMetric 
          label="Capture Efficiency" 
          value="94.2" 
          unit="%" 
          change={1.5} 
          changeType="increase" 
          icon={CheckCircle} 
        />
      </section>
      
      {/* DAC Analytics Section */}
      <section className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-800">DAC Analytics</h3>
        
        <TimeSeriesChart 
          data={MOCK_CO2_DATA} 
          label="CO₂ Capture (Last 12 Hours)" 
          color="#10B981" 
        />
        
        <TimeSeriesChart 
          data={MOCK_FLOW_DATA} 
          label="Flow Rate (Last 12 Hours)" 
          color="#8B5CF6" 
        />
        
        {/* Maintenance Card */}
        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-white/30">
          <h4 className="text-lg font-semibold mb-2 text-gray-800">Next Maintenance</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p>
              <span className="font-medium">Scheduled:</span> {MAINTENANCE_INFO.scheduledDate}
            </p>
            <p>
              <span className="font-medium">Type:</span> {MAINTENANCE_INFO.type}
            </p>
            {MAINTENANCE_INFO.description && (
              <p className="text-gray-500 mt-2">{MAINTENANCE_INFO.description}</p>
            )}
          </div>
        </div>
      </section>
    </div>
  )
} 