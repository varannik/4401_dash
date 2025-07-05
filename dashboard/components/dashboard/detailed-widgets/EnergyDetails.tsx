"use client"

import React from 'react'
import { Zap, Activity, Battery, CheckCircle } from 'lucide-react'
import { DetailedMetric, TimeSeriesChart } from './shared'
import type { EnergyConfig } from '@/types/widgets'

/**
 * Mock data for energy system
 */
const MOCK_ENERGY_DATA = [160, 165, 162, 168, 165, 170, 165, 168, 162, 165, 160, 168]
const MOCK_VOLTAGE_DATA = [150, 154, 152, 156, 154, 158, 154, 156, 152, 154, 150, 156]

/**
 * Energy system configuration
 */
const ENERGY_CONFIG: EnergyConfig = {
  gridPowerStable: true,
  backupRequired: false,
  status: 'Backup system: Offline'
}

/**
 * EnergyDetails component displays energy system metrics
 * Includes energy output, voltage, battery status, and power backup information
 */
export const EnergyDetails: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Energy Metrics Section */}
      <section className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-800">Energy Metrics</h3>
        
        <DetailedMetric 
          label="Current Energy Output" 
          value="165" 
          unit="kW" 
          change={3.1} 
          changeType="increase" 
          icon={Zap} 
        />
        
        <DetailedMetric 
          label="Outgoing Voltage" 
          value="154" 
          unit="kWh" 
          change={-0.5} 
          changeType="decrease" 
          icon={Activity} 
        />
        
        <DetailedMetric 
          label="Battery Level" 
          value="76" 
          unit="%" 
          change={-2.3} 
          changeType="decrease" 
          icon={Battery} 
        />
        
        <DetailedMetric 
          label="Energy Consumed" 
          value="15.3" 
          unit="kWh" 
          change={-5.2} 
          changeType="decrease" 
          icon={Activity} 
        />
        
        <DetailedMetric 
          label="Grid Efficiency" 
          value="92.7" 
          unit="%" 
          change={1.8} 
          changeType="increase" 
          icon={CheckCircle} 
        />
      </section>
      
      {/* Energy Analytics Section */}
      <section className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-800">Energy Analytics</h3>
        
        <TimeSeriesChart 
          data={MOCK_ENERGY_DATA} 
          label="Energy Output (Last 12 Hours)" 
          color="#EAB308" 
        />
        
        <TimeSeriesChart 
          data={MOCK_VOLTAGE_DATA} 
          label="Voltage (Last 12 Hours)" 
          color="#3B82F6" 
        />
        
        {/* Power Backup Status Card */}
        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-white/30">
          <h4 className="text-lg font-semibold mb-2 text-gray-800">Power Backup Status</h4>
          <div className="flex items-center gap-2 text-gray-600">
            <div 
              className={`w-3 h-3 rounded-full ${
                ENERGY_CONFIG.gridPowerStable ? 'bg-gray-400' : 'bg-red-500'
              }`} 
            />
            <span>{ENERGY_CONFIG.status}</span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {ENERGY_CONFIG.gridPowerStable 
              ? 'Grid power stable, backup not required'
              : 'Grid power unstable, backup system active'
            }
          </p>
        </div>
      </section>
    </div>
  )
} 