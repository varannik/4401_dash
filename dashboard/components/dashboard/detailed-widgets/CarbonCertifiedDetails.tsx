"use client"

import React from 'react'
import { CheckCircle, Activity } from 'lucide-react'
import { DetailedMetric, TimeSeriesChart } from './shared'
import type { TimelineEntry } from '@/types/widgets'

/**
 * Mock data for carbon certification
 */
const MOCK_CERTIFIED_DATA = [65, 71, 68, 73, 71, 75, 71, 73, 69, 71, 67, 73]

/**
 * Certification timeline data
 */
const CERTIFICATION_TIMELINE: TimelineEntry[] = [
  {
    event: 'Application Submitted',
    date: 'Nov 1, 2024',
    status: 'completed'
  },
  {
    event: 'Initial Review',
    date: 'Nov 5, 2024',
    status: 'completed'
  },
  {
    event: 'Final Certification',
    date: 'Nov 13, 2024',
    status: 'completed'
  }
]

/**
 * CertificationStatusDisplay component shows the main certification metric
 */
const CertificationStatusDisplay: React.FC<{ tons: number }> = ({ tons }) => (
  <div className="bg-white/60 backdrop-blur-sm rounded-lg p-6 border border-white/30 text-center">
    <div className="text-6xl font-bold text-green-600 mb-4" aria-label={`${tons} tons certified`}>
      {tons}
    </div>
    <div className="text-lg text-gray-600 mb-4">Tons Certified</div>
    <div className="flex items-center justify-center gap-2 text-green-600">
      <CheckCircle className="w-5 h-5" aria-hidden="true" />
      <span>Verified & Certified</span>
    </div>
  </div>
)

/**
 * CertificationTimelineCard component displays the certification process timeline
 */
const CertificationTimelineCard: React.FC<{ timeline: TimelineEntry[] }> = ({ timeline }) => (
  <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-white/30">
    <h4 className="text-lg font-semibold mb-2 text-gray-800">Certification Timeline</h4>
    <div className="space-y-2">
      {timeline.map((entry, index) => (
        <div key={index} className="flex justify-between text-sm">
          <span className="text-gray-700">{entry.event}</span>
          <span className="text-green-600 font-medium">{entry.date}</span>
        </div>
      ))}
    </div>
  </div>
)

/**
 * CarbonCertifiedDetails component displays carbon certification metrics
 * Includes certification status, pending certifications, and certification timeline
 */
export const CarbonCertifiedDetails: React.FC = () => {
  const certifiedTons = 71

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Certification Status Section */}
      <section className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-800">Certification Status</h3>
        
        <CertificationStatusDisplay tons={certifiedTons} />
        
        <DetailedMetric 
          label="Pending Certification" 
          value="12" 
          unit="tons" 
          change={-15.2} 
          changeType="decrease" 
          icon={Activity} 
        />
        
        <DetailedMetric 
          label="Certification Rate" 
          value="85.5" 
          unit="%" 
          change={8.3} 
          changeType="increase" 
          icon={CheckCircle} 
        />
        
        <DetailedMetric 
          label="Quality Score" 
          value="96.8" 
          unit="%" 
          change={2.1} 
          changeType="increase" 
          icon={CheckCircle} 
        />
      </section>
      
      {/* Certification Analytics Section */}
      <section className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-800">Certification Analytics</h3>
        
        <TimeSeriesChart 
          data={MOCK_CERTIFIED_DATA} 
          label="Certified Tons (Last 12 Months)" 
          color="#10B981" 
        />
        
        <CertificationTimelineCard timeline={CERTIFICATION_TIMELINE} />
      </section>
    </div>
  )
} 