'use server'

import { DatabaseQueries } from './query-manager'

/**
 * Dashboard Server Actions
 * Provides secure server-side data fetching for dashboard widgets
 * Uses cached AAD tokens and organized SQL queries
 */

// =============================================================================
// PLANT OVERVIEW ACTIONS
// =============================================================================

export async function getPlantOverviewData() {
  try {
    console.log('🌱 Fetching Plant Overview data...')
    
    // Fetch current metrics and historical data in parallel
    const [metrics, historicalData, systemStatus] = await Promise.all([
      DatabaseQueries.getPlantOverviewMetrics(),
      DatabaseQueries.getPlantHistoricalData(),
      DatabaseQueries.getPlantSystemStatus()
    ])
    
    return {
      success: true,
      data: {
        current: metrics[0] || null,
        historical: historicalData,
        systemStatus: systemStatus,
        timestamp: new Date().toISOString()
      }
    }
  } catch (error) {
    console.error('❌ Plant Overview data fetch failed:', error)
    return {
      success: false,
      error: (error as Error).message,
      timestamp: new Date().toISOString()
    }
  }
}

// =============================================================================
// DAC ACTIONS
// =============================================================================

export async function getDACData() {
  try {
    console.log('🌍 Fetching DAC data...')
    
    const [metrics, trends, maintenance, alerts] = await Promise.all([
      DatabaseQueries.getDACMetrics(),
      DatabaseQueries.getDACTrends(),
      DatabaseQueries.getDACMaintenance(),
      DatabaseQueries.getDACAlerts()
    ])
    
    return {
      success: true,
      data: {
        current: metrics[0] || null,
        trends: trends,
        maintenance: maintenance,
        alerts: alerts,
        timestamp: new Date().toISOString()
      }
    }
  } catch (error) {
    console.error('❌ DAC data fetch failed:', error)
    return {
      success: false,
      error: (error as Error).message,
      timestamp: new Date().toISOString()
    }
  }
}

// =============================================================================
// COMMERCIAL ACTIONS
// =============================================================================

export async function getCommercialData() {
  try {
    console.log('💰 Fetching Commercial data...')
    
    const [summary, monthlyData, breakdown, kpis] = await Promise.all([
      DatabaseQueries.getCommercialSummary(),
      DatabaseQueries.getCommercialMonthlyData(),
      DatabaseQueries.getCommercialBreakdown(),
      DatabaseQueries.getCommercialKPIs()
    ])
    
    return {
      success: true,
      data: {
        summary: summary[0] || null,
        monthlyData: monthlyData,
        breakdown: breakdown,
        kpis: kpis,
        timestamp: new Date().toISOString()
      }
    }
  } catch (error) {
    console.error('❌ Commercial data fetch failed:', error)
    return {
      success: false,
      error: (error as Error).message,
      timestamp: new Date().toISOString()
    }
  }
}

// =============================================================================
// ENERGY ACTIONS
// =============================================================================

export async function getEnergyData() {
  try {
    console.log('⚡ Fetching Energy data...')
    
    const [metrics, consumption, systemConfig, backupInfo] = await Promise.all([
      DatabaseQueries.getEnergyMetrics(),
      DatabaseQueries.getEnergyConsumption(),
      DatabaseQueries.getEnergySystemConfig(),
      DatabaseQueries.getEnergyBackupInfo()
    ])
    
    return {
      success: true,
      data: {
        current: metrics[0] || null,
        consumption: consumption,
        systemConfig: systemConfig,
        backupInfo: backupInfo,
        timestamp: new Date().toISOString()
      }
    }
  } catch (error) {
    console.error('❌ Energy data fetch failed:', error)
    return {
      success: false,
      error: (error as Error).message,
      timestamp: new Date().toISOString()
    }
  }
}

// =============================================================================
// BATTERY ACTIONS
// =============================================================================

export async function getBatteryData() {
  try {
    console.log('🔋 Fetching Battery data...')
    
    const [status, history, config, alerts] = await Promise.all([
      DatabaseQueries.getBatteryStatus(),
      DatabaseQueries.getBatteryHistory(),
      DatabaseQueries.getBatteryConfig(),
      DatabaseQueries.getBatteryAlerts()
    ])
    
    return {
      success: true,
      data: {
        current: status[0] || null,
        history: history,
        config: config,
        alerts: alerts,
        timestamp: new Date().toISOString()
      }
    }
  } catch (error) {
    console.error('❌ Battery data fetch failed:', error)
    return {
      success: false,
      error: (error as Error).message,
      timestamp: new Date().toISOString()
    }
  }
}

// =============================================================================
// MMRV ACTIONS
// =============================================================================

export async function getMMRVData() {
  try {
    console.log('🌡️ Fetching MMRV data...')
    
    const [metrics, trends, verification, equipment, reports] = await Promise.all([
      DatabaseQueries.getMMRVMetrics(),
      DatabaseQueries.getMMRVTrends(),
      DatabaseQueries.getMMRVVerification(),
      DatabaseQueries.getMMRVEquipment(),
      DatabaseQueries.getMMRVReports()
    ])
    
    return {
      success: true,
      data: {
        current: metrics[0] || null,
        trends: trends,
        verification: verification,
        equipment: equipment,
        reports: reports,
        timestamp: new Date().toISOString()
      }
    }
  } catch (error) {
    console.error('❌ MMRV data fetch failed:', error)
    return {
      success: false,
      error: (error as Error).message,
      timestamp: new Date().toISOString()
    }
  }
}

// =============================================================================
// CARBON CERTIFIED ACTIONS
// =============================================================================

export async function getCarbonCertifiedData() {
  try {
    console.log('✅ Fetching Carbon Certified data...')
    
    const [summary, timeline, progress, methodologies, activities] = await Promise.all([
      DatabaseQueries.getCarbonCertificationSummary(),
      DatabaseQueries.getCarbonCertificationTimeline(),
      DatabaseQueries.getCarbonCertificationProgress(),
      DatabaseQueries.getCarbonCertificationMethodologies(),
      DatabaseQueries.getCarbonVerificationActivities()
    ])
    
    return {
      success: true,
      data: {
        summary: summary[0] || null,
        timeline: timeline,
        progress: progress,
        methodologies: methodologies,
        activities: activities,
        timestamp: new Date().toISOString()
      }
    }
  } catch (error) {
    console.error('❌ Carbon Certified data fetch failed:', error)
    return {
      success: false,
      error: (error as Error).message,
      timestamp: new Date().toISOString()
    }
  }
}

// =============================================================================
// CARBON CREDITS ACTIONS
// =============================================================================

export async function getCarbonCreditsData() {
  try {
    console.log('📈 Fetching Carbon Credits data...')
    
    const [summary, history, opportunities, pricing, registry] = await Promise.all([
      DatabaseQueries.getCarbonCreditsSummary(),
      DatabaseQueries.getCarbonCreditsHistory(),
      DatabaseQueries.getCarbonCreditsOpportunities(),
      DatabaseQueries.getCarbonCreditsPricing(),
      DatabaseQueries.getCarbonCreditsRegistry()
    ])
    
    return {
      success: true,
      data: {
        summary: summary[0] || null,
        history: history,
        opportunities: opportunities,
        pricing: pricing,
        registry: registry,
        timestamp: new Date().toISOString()
      }
    }
  } catch (error) {
    console.error('❌ Carbon Credits data fetch failed:', error)
    return {
      success: false,
      error: (error as Error).message,
      timestamp: new Date().toISOString()
    }
  }
}

// =============================================================================
// COMBINED DASHBOARD DATA
// =============================================================================

export async function getAllDashboardData() {
  try {
    console.log('📊 Fetching all dashboard data...')
    
    const [
      plantOverview,
      dac,
      commercial,
      energy,
      battery,
      mmrv,
      carbonCertified,
      carbonCredits
    ] = await Promise.all([
      getPlantOverviewData(),
      getDACData(),
      getCommercialData(),
      getEnergyData(),
      getBatteryData(),
      getMMRVData(),
      getCarbonCertifiedData(),
      getCarbonCreditsData()
    ])
    
    return {
      success: true,
      data: {
        plantOverview: plantOverview.data,
        dac: dac.data,
        commercial: commercial.data,
        energy: energy.data,
        battery: battery.data,
        mmrv: mmrv.data,
        carbonCertified: carbonCertified.data,
        carbonCredits: carbonCredits.data,
        timestamp: new Date().toISOString()
      },
      errors: [
        ...(plantOverview.success ? [] : [{ widget: 'plantOverview', error: plantOverview.error }]),
        ...(dac.success ? [] : [{ widget: 'dac', error: dac.error }]),
        ...(commercial.success ? [] : [{ widget: 'commercial', error: commercial.error }]),
        ...(energy.success ? [] : [{ widget: 'energy', error: energy.error }]),
        ...(battery.success ? [] : [{ widget: 'battery', error: battery.error }]),
        ...(mmrv.success ? [] : [{ widget: 'mmrv', error: mmrv.error }]),
        ...(carbonCertified.success ? [] : [{ widget: 'carbonCertified', error: carbonCertified.error }]),
        ...(carbonCredits.success ? [] : [{ widget: 'carbonCredits', error: carbonCredits.error }])
      ]
    }
  } catch (error) {
    console.error('❌ Dashboard data fetch failed:', error)
    return {
      success: false,
      error: (error as Error).message,
      timestamp: new Date().toISOString()
    }
  }
}

/**
 * Usage Examples:
 * 
 * // In your React component:
 * import { getPlantOverviewData, getAllDashboardData } from '@/lib/dashboard-server-actions'
 * 
 * // Fetch specific widget data
 * const plantData = await getPlantOverviewData()
 * 
 * // Fetch all dashboard data at once
 * const allData = await getAllDashboardData()
 * 
 * // Handle the response
 * if (plantData.success) {
 *   console.log('Current metrics:', plantData.data.current)
 *   console.log('Historical data:', plantData.data.historical)
 * } else {
 *   console.error('Error:', plantData.error)
 * }
 */ 