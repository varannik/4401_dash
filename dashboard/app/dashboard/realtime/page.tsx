"use client"

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import ProtectedRoute from "@/components/auth/protected-route"
import DashboardLayout from "@/components/layout/mainLayoutDash"
import { 
  PlantOverviewTab, 
  CO2InjectionTab, 
  WaterInjectionTab, 
  LiquidTracerTab 
} from "../../../components/dashboard/tabs"

function TabContent() {
  const searchParams = useSearchParams()
  const activeTab = searchParams.get('tab') || 'plant-overview'

  const renderTabContent = () => {
    switch (activeTab) {
      case 'plant-overview':
        return <PlantOverviewTab />
      case 'co2-injection':
        return <CO2InjectionTab />
      case 'water-injection':
        return <WaterInjectionTab />
      case 'liquid-tracer':
        return <LiquidTracerTab />
      default:
        return <PlantOverviewTab />
    }
  }

  return <>{renderTabContent()}</>
}

function TabFallback() {
  return <PlantOverviewTab />
}

export default function MonitoringPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <Suspense fallback={<TabFallback />}>
          <TabContent />
        </Suspense>
      </DashboardLayout>
    </ProtectedRoute>
  )
} 