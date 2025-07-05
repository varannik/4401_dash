"use client"

import React, { useState } from 'react'
import { 
  AlertCircle, 
  CheckCircle, 
  Zap, 
  Battery, 
  Gauge, 
  TrendingUp, 
  Globe, 
  Droplets, 
  Thermometer, 
  BarChart3
} from 'lucide-react'

import { ExpandableWidget } from '@/components/ui/ExpandableWidget'
import { 
  PlantOverviewDetails, 
  DACDetails, 
  CommercialDetails, 
  EnergyDetails, 
  BatteryDetails, 
  MMRVDetails, 
  CarbonCertifiedDetails, 
  CarbonCreditsDetails 
} from './detailed-widgets'

const MetricValue = ({ label, value, unit, trend, color = "text-gray-900" }: {
  label: string,
  value: string | number,
  unit?: string,
  trend?: 'up' | 'down' | 'stable',
  color?: string
}) => {
  return (
    <div className="flex flex-col">
      <div className="text-sm text-gray-500 mb-1">{label}</div>
      <div className={`text-2xl font-bold ${color} flex items-center gap-1`}>
        {value}
        {unit && <span className="text-sm text-gray-400">{unit}</span>}
        {trend && (
          <TrendingUp className={`w-4 h-4 ${trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-gray-400'}`} />
        )}
      </div>
    </div>
  )
}

const DateRange = ({ from, to }: { from: string, to: string }) => (
  <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
    <div className="w-2 h-2 bg-gray-400 rounded-full" />
    <span>{from} - {to}</span>
  </div>
)

const RevenueChart = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const data = [400, 600, 800, 1100, 900, 1200, 1300, 1100, 1000, 900, 800, 600]
  const maxValue = Math.max(...data)
  
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-700">AED (thousands)</h4>
        <div className="flex gap-4 text-xs text-gray-500">
          <span>AED 1M</span>
          <span>AED 800K</span>
          <span>AED 600K</span>
          <span>AED 400K</span>
          <span>AED 200K</span>
          <span>AED 0</span>
        </div>
      </div>
      <div className="flex items-end gap-1 h-32">
        {data.map((value, index) => (
          <div key={index} className="flex-1 flex flex-col items-center gap-1">
            <div 
              className="w-full bg-gradient-to-t from-orange-400 to-orange-300 rounded-t-sm"
              style={{ height: `${(value / maxValue) * 100}%` }}
            />
            <span className="text-xs text-gray-500 -rotate-45 mt-1">{months[index]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function MonitoringDashboard() {
  const [expandedWidget, setExpandedWidget] = useState<string | null>(null)

  const expandWidget = (widgetType: string) => {
    setExpandedWidget(widgetType)
  }

  const zoomOutWidget = () => {
    setExpandedWidget(null)
  }

  return (
    <div className="min-h-screen relative">
      {/* Main Dashboard - Absolute positioned widgets */}
      <div className="relative w-full h-screen">
        
        {/* Plant Overview */}
        <ExpandableWidget 
          title="Plant Overview" 
          icon={Gauge} 
          className="absolute w-80 h-64" 
          style={{ top: '280px', left: '80px' }}
          onClick={() => expandWidget('plant-overview')}
          isExpanded={expandedWidget === 'plant-overview'}
          onZoomOut={zoomOutWidget}
          expandedContent={<PlantOverviewDetails />}
        >
          <DateRange from="10/17/2024" to="11/13/2024" />
          <div className="grid grid-cols-2 gap-4">
            <MetricValue label="Water Flow" value="3.3" unit="(m³/hr)" color="text-blue-600" />
            <MetricValue label="Ratio" value="1:26" color="text-purple-600" />
            <MetricValue label="CO₂ Temp" value="57" unit="(Celsius)" color="text-orange-600" />
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4">
              <MetricValue label="Water Injected" value="319" unit="(m³)" color="text-blue-600" />
              <MetricValue label="Flow of CO₂" value="22.5" unit="(kg/hr)" color="text-green-600" />
            </div>
          </div>
        </ExpandableWidget>

        {/* DAC */}
        <ExpandableWidget 
          title="DAC" 
          icon={Globe} 
          className="absolute w-72 h-56" 
          style={{ top: '120px', left: '500px' }}
          onClick={() => expandWidget('dac')}
          isExpanded={expandedWidget === 'dac'}
          onZoomOut={zoomOutWidget}
          expandedContent={<DACDetails />}
        >
          <DateRange from="10/17/2024" to="11/13/2024" />
          <div className="grid grid-cols-2 gap-4">
            <MetricValue label="CO₂ Temp" value="57" unit="(Celsius)" color="text-orange-600" />
            <MetricValue label="CO₂ Flow Rate" value="2387" unit="(Tons)" color="text-green-600" />
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4">
              <MetricValue label="Injected CO₂" value="7.676" unit="(Tons)" color="text-blue-600" />
              <MetricValue label="CO₂ Flow" value="3892" unit="(Tons)" color="text-green-600" />
            </div>
          </div>
        </ExpandableWidget>

        {/* Commercial Revenue */}
        <ExpandableWidget 
          title="Commercial" 
          icon={BarChart3} 
          className="absolute w-96 h-80" 
          style={{ top: '100px', right: '80px' }}
          onClick={() => expandWidget('commercial')}
          isExpanded={expandedWidget === 'commercial'}
          onZoomOut={zoomOutWidget}
          expandedContent={<CommercialDetails />}
        >
          <div className="text-lg font-semibold text-gray-700 mb-2">Revenue Generated Per Month</div>
          <DateRange from="10/17/2024" to="11/13/2024" />
          <RevenueChart />
        </ExpandableWidget>

        {/* Energy */}
        <ExpandableWidget 
          title="Energy" 
          icon={Zap} 
          className="absolute w-80 h-72" 
          style={{ bottom: '80px', left: '80px' }}
          onClick={() => expandWidget('energy')}
          isExpanded={expandedWidget === 'energy'}
          onZoomOut={zoomOutWidget}
          expandedContent={<EnergyDetails />}
        >
          <DateRange from="10/17/2024" to="11/13/2024" />
          <div className="grid grid-cols-2 gap-4">
            <MetricValue label="Energy" value="165" unit="(kW)" color="text-yellow-600" />
            <MetricValue label="Out going Volts" value="154" unit="(kWh)" color="text-blue-600" />
            <MetricValue label="Battery" value="76%" unit="" color="text-green-600" />
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4">
              <MetricValue label="Energy Consumed" value="15.3" unit="(kWh)" color="text-orange-600" />
              <MetricValue label="Power Backup" value="off" unit="(kWh)" color="text-gray-600" />
            </div>
          </div>
        </ExpandableWidget>

        {/* Battery */}
        <ExpandableWidget 
          title="Battery" 
          icon={Battery} 
          className="absolute w-64 h-48" 
          style={{ top: '380px', right: '250px' }}
          onClick={() => expandWidget('battery')}
          isExpanded={expandedWidget === 'battery'}
          onZoomOut={zoomOutWidget}
          expandedContent={<BatteryDetails />}
        >
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">76%</div>
            <div className="text-sm text-gray-500">Battery Life</div>
            <div className="mt-4 bg-gray-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '76%' }} />
            </div>
          </div>
        </ExpandableWidget>

        {/* MMRV */}
        <ExpandableWidget 
          title="MMRV" 
          icon={Thermometer} 
          className="absolute w-72 h-56" 
          style={{ top: '320px', left: '450px' }}
          onClick={() => expandWidget('mmrv')}
          isExpanded={expandedWidget === 'mmrv'}
          onZoomOut={zoomOutWidget}
          expandedContent={<MMRVDetails />}
        >
          <DateRange from="10/17/2024" to="11/13/2024" />
          <div className="grid grid-cols-2 gap-4">
            <MetricValue label="Temp" value="57" unit="(Celsius)" color="text-orange-600" />
            <MetricValue label="Pressure" value="98.2" unit="(Bar)" color="text-blue-600" />
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <MetricValue label="CO₂ Mineralized" value="7.3" unit="(Tons)" color="text-green-600" />
          </div>
        </ExpandableWidget>

        {/* Carbon Certified */}
        <ExpandableWidget 
          title="Carbon Certified" 
          icon={CheckCircle} 
          className="absolute w-44 h-40" 
          style={{ top: '500px', right: '280px' }}
          onClick={() => expandWidget('carbon-certified')}
          isExpanded={expandedWidget === 'carbon-certified'}
          onZoomOut={zoomOutWidget}
          expandedContent={<CarbonCertifiedDetails />}
        >
          <DateRange from="10/17/2024" to="11/13/2024" />
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">71</div>
            <div className="text-sm text-gray-500">(Tons)</div>
          </div>
        </ExpandableWidget>

        {/* Carbon Credits */}
        <ExpandableWidget 
          title="Carbon Credits" 
          icon={TrendingUp} 
          className="absolute w-44 h-40" 
          style={{ top: '500px', right: '80px' }}
          onClick={() => expandWidget('carbon-credits')}
          isExpanded={expandedWidget === 'carbon-credits'}
          onZoomOut={zoomOutWidget}
          expandedContent={<CarbonCreditsDetails />}
        >
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">892</div>
            <div className="text-sm text-gray-500">Credits Available</div>
          </div>
        </ExpandableWidget>
      </div>
    </div>
  )
} 