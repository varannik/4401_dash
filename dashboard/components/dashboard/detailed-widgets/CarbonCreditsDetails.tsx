"use client"

import React from 'react'
import { TrendingUp, Activity, BarChart3, CheckCircle } from 'lucide-react'
import { DetailedMetric, TimeSeriesChart } from './shared'
import type { MarketOpportunity } from '@/types/widgets'

/**
 * Mock data for carbon credits
 */
const MOCK_CREDITS_DATA = [850, 892, 870, 920, 892, 950, 892, 920, 880, 892, 860, 920]
const MOCK_PRICE_DATA = [45, 48, 46, 50, 48, 52, 48, 50, 47, 48, 45, 50]

/**
 * Market opportunities data
 */
const MARKET_OPPORTUNITIES: MarketOpportunity[] = [
  {
    type: 'demand',
    description: 'High demand period - Dec 2024',
    icon: TrendingUp
  },
  {
    type: 'buyers',
    description: 'Premium buyers interested',
    icon: CheckCircle
  }
]

/**
 * CarbonCreditsStatusDisplay component shows the main credits metric
 */
const CarbonCreditsStatusDisplay: React.FC<{ credits: number; marketValue: number }> = ({ 
  credits, 
  marketValue 
}) => (
  <div className="bg-white/60 backdrop-blur-sm rounded-lg p-6 border border-white/30 text-center">
    <div className="text-6xl font-bold text-blue-600 mb-4" aria-label={`${credits} credits available`}>
      {credits}
    </div>
    <div className="text-lg text-gray-600 mb-4">Credits Available</div>
    <div className="text-sm text-gray-500">
      Market value: ~${marketValue.toLocaleString()}
    </div>
  </div>
)

/**
 * MarketOpportunitiesCard component displays current market opportunities
 */
const MarketOpportunitiesCard: React.FC<{ opportunities: MarketOpportunity[] }> = ({ 
  opportunities 
}) => (
  <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-white/30">
    <h4 className="text-lg font-semibold mb-2 text-gray-800">Market Opportunities</h4>
    <div className="space-y-2">
      {opportunities.map((opportunity, index) => {
        const Icon = opportunity.icon
        const colorClass = opportunity.type === 'demand' ? 'text-blue-600' : 'text-green-600'
        
        return (
          <div key={index} className={`flex items-center gap-2 ${colorClass}`}>
            {Icon && <Icon className="w-4 h-4" aria-hidden="true" />}
            <span className="text-sm">{opportunity.description}</span>
          </div>
        )
      })}
    </div>
  </div>
)

/**
 * CarbonCreditsDetails component displays carbon credits metrics
 * Includes available credits, market value, pricing trends, and opportunities
 */
export const CarbonCreditsDetails: React.FC = () => {
  const availableCredits = 892
  const marketValue = 42816

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Carbon Credits Section */}
      <section className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-800">Carbon Credits</h3>
        
        <CarbonCreditsStatusDisplay 
          credits={availableCredits}
          marketValue={marketValue}
        />
        
        <DetailedMetric 
          label="Credits Issued" 
          value="124" 
          unit="this month" 
          change={18.5} 
          changeType="increase" 
          icon={TrendingUp} 
        />
        
        <DetailedMetric 
          label="Credits Sold" 
          value="67" 
          unit="this month" 
          change={-5.2} 
          changeType="decrease" 
          icon={Activity} 
        />
        
        <DetailedMetric 
          label="Average Price" 
          value="$48" 
          unit="per credit" 
          change={6.7} 
          changeType="increase" 
          icon={BarChart3} 
        />
        
        <DetailedMetric 
          label="Total Revenue" 
          value="$3,216" 
          unit="this month" 
          change={12.3} 
          changeType="increase" 
          icon={CheckCircle} 
        />
      </section>
      
      {/* Credits Analytics Section */}
      <section className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-800">Credits Analytics</h3>
        
        <TimeSeriesChart 
          data={MOCK_CREDITS_DATA} 
          label="Available Credits (Last 12 Months)" 
          color="#3B82F6" 
        />
        
        <TimeSeriesChart 
          data={MOCK_PRICE_DATA} 
          label="Credit Price (Last 12 Months)" 
          color="#10B981" 
        />
        
        <MarketOpportunitiesCard opportunities={MARKET_OPPORTUNITIES} />
      </section>
    </div>
  )
} 