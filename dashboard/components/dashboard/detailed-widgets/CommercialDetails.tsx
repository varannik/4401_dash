"use client"

import React from 'react'
import { BarChart3, TrendingUp, CheckCircle } from 'lucide-react'
import { DetailedMetric } from './shared'

/**
 * Financial data for revenue and profit analysis
 */
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const
const REVENUE_DATA = [400000, 600000, 800000, 1100000, 900000, 1200000, 1300000, 1100000, 1000000, 900000, 800000, 600000]
const PROFIT_DATA = [200000, 350000, 500000, 700000, 600000, 800000, 900000, 750000, 650000, 600000, 520000, 400000]

/**
 * Revenue vs Profit Chart Component
 */
const RevenueVsProfitChart: React.FC = () => {
  const maxRevenue = Math.max(...REVENUE_DATA)
  const maxProfit = Math.max(...PROFIT_DATA)
  
  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-lg p-6 border border-white/30">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">Revenue vs Profit Analysis</h3>
      
      {/* Chart */}
      <div className="h-64 flex items-end gap-1 mb-4">
        {REVENUE_DATA.map((revenue, index) => {
          const profit = PROFIT_DATA[index]
          const month = MONTHS[index]
          
          return (
            <div key={month} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex gap-1">
                <div
                  className="flex-1 bg-blue-500 rounded-t-sm transition-all duration-300 hover:opacity-80"
                  style={{ height: `${(revenue / maxRevenue) * 200}px` }}
                  title={`Revenue: ${revenue.toLocaleString()} AED`}
                />
                <div
                  className="flex-1 bg-green-500 rounded-t-sm transition-all duration-300 hover:opacity-80"
                  style={{ height: `${(profit / maxProfit) * 200}px` }}
                  title={`Profit: ${profit.toLocaleString()} AED`}
                />
              </div>
              <span className="text-xs text-gray-500 -rotate-45 mt-1" title={month}>
                {month}
              </span>
            </div>
          )
        })}
      </div>
      
      {/* Legend */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full" />
          <span className="text-sm">Revenue</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full" />
          <span className="text-sm">Profit</span>
        </div>
      </div>
    </div>
  )
}

/**
 * CommercialDetails component displays commercial and financial metrics
 * Includes revenue analysis, profit margins, and financial insights
 */
export const CommercialDetails: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Key Metrics Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DetailedMetric 
          label="Total Revenue (YTD)" 
          value="10.2M" 
          unit="AED" 
          change={15.3} 
          changeType="increase" 
          icon={BarChart3} 
        />
        
        <DetailedMetric 
          label="Monthly Average" 
          value="850K" 
          unit="AED" 
          change={8.7} 
          changeType="increase" 
          icon={TrendingUp} 
        />
        
        <DetailedMetric 
          label="Profit Margin" 
          value="68.5" 
          unit="%" 
          change={2.1} 
          changeType="increase" 
          icon={CheckCircle} 
        />
      </section>
      
      {/* Revenue Analysis Chart */}
      <section>
        <RevenueVsProfitChart />
      </section>
    </div>
  )
} 