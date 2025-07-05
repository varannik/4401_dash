"use client"

import React from 'react'
import { Thermometer, Gauge, Globe, CheckCircle, Activity } from 'lucide-react'
import { DetailedMetric, TimeSeriesChart } from './shared'
import type { VerificationStatus } from '@/types/widgets'

/**
 * Mock data for MMRV system
 */
const MOCK_TEMP_DATA = [55, 57, 56, 58, 57, 59, 57, 58, 56, 57, 55, 58]
const MOCK_PRESSURE_DATA = [96, 98.2, 97, 99, 98.2, 100, 98.2, 99, 97, 98.2, 96, 99]

/**
 * MMRV verification status
 */
const VERIFICATION_STATUS: VerificationStatus = {
  realTimeMonitoring: true,
  dataValidation: true,
  accuracy: 99.2
}

/**
 * VerificationStatusCard component displays the current verification status
 */
const VerificationStatusCard: React.FC<{ status: VerificationStatus }> = ({ status }) => (
  <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-white/30">
    <h4 className="text-lg font-semibold mb-2 text-gray-800">Verification Status</h4>
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-green-600">
        <CheckCircle className="w-4 h-4" aria-hidden="true" />
        <span className="text-sm">
          {status.realTimeMonitoring ? 'Real-time monitoring active' : 'Real-time monitoring inactive'}
        </span>
      </div>
      <div className="flex items-center gap-2 text-green-600">
        <CheckCircle className="w-4 h-4" aria-hidden="true" />
        <span className="text-sm">
          {status.dataValidation ? 'Data validation complete' : 'Data validation pending'}
        </span>
      </div>
      <div className="mt-2 text-sm text-gray-600">
        <span className="font-medium">Data Accuracy:</span> {status.accuracy}%
      </div>
    </div>
  </div>
)

/**
 * MMRVDetails component displays Monitoring, Measurement, Reporting, and Verification metrics
 * Includes temperature, pressure, CO₂ mineralization data, and verification status
 */
export const MMRVDetails: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* MMRV Metrics Section */}
      <section className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-800">MMRV Metrics</h3>
        
        <DetailedMetric 
          label="Current Temperature" 
          value="57" 
          unit="°C" 
          change={1.8} 
          changeType="increase" 
          icon={Thermometer} 
        />
        
        <DetailedMetric 
          label="System Pressure" 
          value="98.2" 
          unit="Bar" 
          change={-0.3} 
          changeType="decrease" 
          icon={Gauge} 
        />
        
        <DetailedMetric 
          label="CO₂ Mineralized" 
          value="7.3" 
          unit="tons" 
          change={12.5} 
          changeType="increase" 
          icon={Globe} 
        />
        
        <DetailedMetric 
          label="Monitoring Efficiency" 
          value="97.8" 
          unit="%" 
          change={2.1} 
          changeType="increase" 
          icon={CheckCircle} 
        />
        
        <DetailedMetric 
          label="Data Accuracy" 
          value="99.2" 
          unit="%" 
          change={0.5} 
          changeType="increase" 
          icon={Activity} 
        />
      </section>
      
      {/* MMRV Analytics Section */}
      <section className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-800">MMRV Analytics</h3>
        
        <TimeSeriesChart 
          data={MOCK_TEMP_DATA} 
          label="Temperature (Last 12 Hours)" 
          color="#EF4444" 
        />
        
        <TimeSeriesChart 
          data={MOCK_PRESSURE_DATA} 
          label="Pressure (Last 12 Hours)" 
          color="#3B82F6" 
        />
        
        <VerificationStatusCard status={VERIFICATION_STATUS} />
      </section>
    </div>
  )
} 