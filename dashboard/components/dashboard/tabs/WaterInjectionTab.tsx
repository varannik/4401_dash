"use client"

import { Droplets, Thermometer, BarChart3, Settings } from "lucide-react"

export const WaterInjectionTab = () => {
  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/20 rounded-lg">
              <Droplets className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-sm text-white/70">Flow Rate</p>
              <p className="text-xl font-bold text-white">1.8 m³/min</p>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <BarChart3 className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-white/70">Pressure</p>
              <p className="text-xl font-bold text-white">125 bar</p>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <Thermometer className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-white/70">Temperature</p>
              <p className="text-xl font-bold text-white">22°C</p>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Settings className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-white/70">Quality</p>
              <p className="text-xl font-bold text-white">98.5%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">Injection Parameters</h3>
          <p className="text-white/70 mb-4">Real-time monitoring of water injection system parameters.</p>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
              <span className="text-white/70">Injection Wells</span>
              <span className="text-white font-medium">12 Active</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
              <span className="text-white/70">Water Source</span>
              <span className="text-white font-medium">Aquifer A</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
              <span className="text-white/70">Treatment Status</span>
              <span className="text-green-400 font-medium">Operational</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
              <span className="text-white/70">Filtration Level</span>
              <span className="text-white font-medium">Stage 3</span>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">System Health</h3>
          <p className="text-white/70 mb-4">Monitor water injection system health and maintenance status.</p>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
              <span className="text-white/70">Pump Efficiency</span>
              <span className="text-white font-medium">96.3%</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
              <span className="text-white/70">Filter Status</span>
              <span className="text-green-400 font-medium">Clean</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
              <span className="text-white/70">Valve Positions</span>
              <span className="text-white font-medium">Nominal</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
              <span className="text-white/70">Next Maintenance</span>
              <span className="text-white font-medium">14 days</span>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
        <h3 className="text-lg font-semibold text-white mb-4">Water Quality Monitoring</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-cyan-400">7.2</p>
            <p className="text-white/70 text-sm">pH Level</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-400">45 ppm</p>
            <p className="text-white/70 text-sm">Total Dissolved Solids</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-400">0.1 NTU</p>
            <p className="text-white/70 text-sm">Turbidity</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WaterInjectionTab
