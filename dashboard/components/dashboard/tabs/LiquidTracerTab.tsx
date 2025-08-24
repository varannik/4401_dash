"use client"

import { FlaskConical, Target, TrendingUp, MapPin, Clock, Zap } from "lucide-react"

export const LiquidTracerTab = () => {
  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <FlaskConical className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-white/70">Concentration</p>
              <p className="text-xl font-bold text-white">2.5 ppm</p>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Target className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-white/70">Detection Points</p>
              <p className="text-xl font-bold text-white">8/12</p>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-white/70">Coverage</p>
              <p className="text-xl font-bold text-white">67%</p>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <Clock className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-white/70">Transit Time</p>
              <p className="text-xl font-bold text-white">4.2 hrs</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">Tracer Analysis</h3>
          <p className="text-white/70 mb-4">Real-time analysis of liquid tracer distribution and movement patterns.</p>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
              <div className="flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-purple-400" />
                <span className="text-white/70">Tracer Type</span>
              </div>
              <span className="text-white font-medium">Fluorescein</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-white/70">Injection Rate</span>
              </div>
              <span className="text-white font-medium">0.5 L/min</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-400" />
                <span className="text-white/70">Injection Point</span>
              </div>
              <span className="text-white font-medium">Well A-12</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-400" />
                <span className="text-white/70">Detection Range</span>
              </div>
              <span className="text-green-400 font-medium">500m radius</span>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">Flow Patterns</h3>
          <p className="text-white/70 mb-4">Analyze fluid flow patterns and reservoir connectivity using tracer data.</p>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
              <span className="text-white/70">Primary Flow Direction</span>
              <span className="text-white font-medium">NE (45°)</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
              <span className="text-white/70">Average Velocity</span>
              <span className="text-white font-medium">12.3 m/day</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
              <span className="text-white/70">Dispersion Factor</span>
              <span className="text-white font-medium">0.85</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
              <span className="text-white/70">Breakthrough Time</span>
              <span className="text-green-400 font-medium">As Expected</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detection Points Grid */}
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
        <h3 className="text-lg font-semibold text-white mb-4">Detection Network Status</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 12 }, (_, i) => {
            const isActive = i < 8
            const hasDetection = i < 6
            return (
              <div key={i} className="text-center">
                <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-2 ${
                  hasDetection ? 'bg-green-500/20 border-2 border-green-500' :
                  isActive ? 'bg-blue-500/20 border-2 border-blue-500' :
                  'bg-gray-500/20 border-2 border-gray-500'
                }`}>
                  <span className={`text-sm font-bold ${
                    hasDetection ? 'text-green-400' :
                    isActive ? 'text-blue-400' :
                    'text-gray-400'
                  }`}>
                    {i + 1}
                  </span>
                </div>
                <p className="text-xs text-white/70">
                  {hasDetection ? 'Detected' : isActive ? 'Active' : 'Offline'}
                </p>
              </div>
            )
          })}
        </div>
        <div className="flex justify-center gap-6 mt-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-white/70">Tracer Detected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-white/70">Active Monitoring</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-500"></div>
            <span className="text-white/70">Offline</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LiquidTracerTab
