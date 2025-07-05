"use client"

import React from 'react'
import { Zap, Activity, CheckCircle, AlertTriangle } from 'lucide-react'
import { DetailedMetric, TimeSeriesChart } from './shared'
import type { BatteryConfig, SystemAlert } from '@/types/widgets'

/**
 * Mock data for battery system
 */
const MOCK_BATTERY_DATA = [78, 76, 77, 75, 76, 74, 76, 75, 77, 76, 78, 76]
const MOCK_CHARGE_DATA = [2.1, 2.3, 2.2, 2.4, 2.3, 2.5, 2.3, 2.4, 2.2, 2.3, 2.1, 2.4]

/**
 * Battery configuration
 */
const BATTERY_CONFIG: BatteryConfig = {
  lowBatteryThreshold: 20,
  autoChargingEnabled: true,
  estimatedHoursRemaining: 18
}

/**
 * Battery alerts configuration
 */
const BATTERY_ALERTS: SystemAlert[] = [
  {
    type: 'warning',
    message: 'Low battery warning at 20%',
    icon: AlertTriangle
  },
  {
    type: 'success',
    message: 'Auto-charging enabled',
    icon: CheckCircle
  }
]

/**
 * Battery Level Display Component
 */
const BatteryLevelDisplay: React.FC<{ level: number; hoursRemaining: number }> = ({ 
  level, 
  hoursRemaining 
}) => (
  <div className="bg-white/60 backdrop-blur-sm rounded-lg p-6 border border-white/30 text-center">
    <div className="text-6xl font-bold text-green-600 mb-4" aria-label={`Battery level ${level}%`}>
      {level}%
    </div>
    <div className="text-lg text-gray-600 mb-4">Battery Life Remaining</div>
    
    {/* Progress Bar */}
    <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
      <div 
        className="bg-green-500 h-4 rounded-full transition-all duration-300"
        style={{ width: `${level}%` }}
        role="progressbar"
        aria-valuenow={level}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
    
    <div className="text-sm text-gray-500">
      Estimated {hoursRemaining} hours remaining
    </div>
  </div>
)

/**
 * BatteryDetails component displays comprehensive battery system information
 * Includes battery level, charge/discharge rates, health status, and alerts
 */
export const BatteryDetails: React.FC = () => {
  const currentBatteryLevel = 76

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Battery Status Section */}
      <section className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-800">Battery Status</h3>
        
        <BatteryLevelDisplay 
          level={currentBatteryLevel}
          hoursRemaining={BATTERY_CONFIG.estimatedHoursRemaining}
        />
        
        <DetailedMetric 
          label="Charge Rate" 
          value="2.3" 
          unit="kW" 
          change={4.5} 
          changeType="increase" 
          icon={Zap} 
        />
        
        <DetailedMetric 
          label="Discharge Rate" 
          value="1.8" 
          unit="kW" 
          change={-2.1} 
          changeType="decrease" 
          icon={Activity} 
        />
        
        <DetailedMetric 
          label="Battery Health" 
          value="94" 
          unit="%" 
          change={0} 
          changeType="stable" 
          icon={CheckCircle} 
        />
      </section>
      
      {/* Battery Analytics Section */}
      <section className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-800">Battery Analytics</h3>
        
        <TimeSeriesChart 
          data={MOCK_BATTERY_DATA} 
          label="Battery Level (Last 12 Hours)" 
          color="#10B981" 
        />
        
        <TimeSeriesChart 
          data={MOCK_CHARGE_DATA} 
          label="Charge Rate (Last 12 Hours)" 
          color="#F59E0B" 
        />
        
        {/* Battery Alerts Card */}
        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-white/30">
          <h4 className="text-lg font-semibold mb-2 text-gray-800">Battery Alerts</h4>
          <div className="space-y-2">
            {BATTERY_ALERTS.map((alert, index) => {
              const Icon = alert.icon
              const colorClass = alert.type === 'warning' ? 'text-yellow-600' : 'text-green-600'
              
              return (
                <div key={index} className={`flex items-center gap-2 ${colorClass}`}>
                  {Icon && <Icon className="w-4 h-4" aria-hidden="true" />}
                  <span className="text-sm">{alert.message}</span>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
} 