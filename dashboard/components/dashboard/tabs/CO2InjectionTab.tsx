"use client"

import { Activity, TrendingUp, Gauge, AlertCircle } from "lucide-react"

export const CO2InjectionTab = () => {
  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Gauge className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-white/70">Injection Rate</p>
              <p className="text-xl font-bold text-white">2.5 Mt/day</p>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-white/70">Pressure</p>
              <p className="text-xl font-bold text-white">185 bar</p>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Activity className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-white/70">Temperature</p>
              <p className="text-xl font-bold text-white">45°C</p>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <AlertCircle className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-white/70">Status</p>
              <p className="text-xl font-bold text-white">Optimal</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">Injection Controls</h3>
          <p className="text-white/70 mb-4">Monitor and control CO2 injection parameters in real-time.</p>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-white/70">Flow Rate Control</span>
              <span className="text-white font-medium">Active</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">Pressure Monitoring</span>
              <span className="text-white font-medium">Normal</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">Safety Systems</span>
              <span className="text-green-400 font-medium">Online</span>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">Performance Analytics</h3>
          <p className="text-white/70 mb-4">Historical data and performance trends for CO2 injection system.</p>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-white/70">Daily Average</span>
              <span className="text-white font-medium">2.3 Mt/day</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">Efficiency</span>
              <span className="text-white font-medium">94.2%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">Uptime</span>
              <span className="text-green-400 font-medium">99.1%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CO2InjectionTab
