"use client"

import { useSearchParams } from 'next/navigation'
import ProtectedRoute from "@/components/auth/protected-route"
import DashboardLayout from "@/components/layout/mainLayoutDash"
import { 
  PlantOverviewTab, 
  CO2InjectionTab, 
  WaterInjectionTab, 
  LiquidTracerTab 
} from "../../../components/dashboard/tabs"

export default function MonitoringPage() {
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

  return (
    <ProtectedRoute>
      <DashboardLayout>
        {renderTabContent()}
      </DashboardLayout>
    </ProtectedRoute>
  )
} 