import { ElementType } from 'react'

/**
 * Change type for metrics indicating trend direction
 */
export type ChangeType = 'increase' | 'decrease' | 'stable'

/**
 * Props for DetailedMetric component
 */
export interface DetailedMetricProps {
  label: string
  value: string | number
  unit?: string
  change?: number
  changeType?: ChangeType
  icon?: ElementType
}

/**
 * Props for TimeSeriesChart component
 */
export interface TimeSeriesChartProps {
  data: number[]
  label: string
  color: string
}

/**
 * Financial data structure for revenue/profit analysis
 */
export interface FinancialData {
  revenue: number
  profit: number
  month: string
}

/**
 * Alert configuration for systems
 */
export interface SystemAlert {
  type: 'warning' | 'error' | 'info' | 'success'
  message: string
  icon?: ElementType
}

/**
 * Timeline entry for certifications or events
 */
export interface TimelineEntry {
  event: string
  date: string
  status?: 'completed' | 'pending' | 'in-progress'
}

/**
 * Market opportunity data
 */
export interface MarketOpportunity {
  type: 'demand' | 'price' | 'buyers'
  description: string
  icon?: ElementType
}

/**
 * System status information
 */
export interface SystemStatus {
  isOperational: boolean
  message: string
  details?: string
}

/**
 * Energy system configuration
 */
export interface EnergyConfig {
  gridPowerStable: boolean
  backupRequired: boolean
  status: string
}

/**
 * Battery configuration and alerts
 */
export interface BatteryConfig {
  lowBatteryThreshold: number
  autoChargingEnabled: boolean
  estimatedHoursRemaining: number
}

/**
 * Maintenance schedule information
 */
export interface MaintenanceInfo {
  scheduledDate: string
  type: string
  description?: string
}

/**
 * Verification status for MMRV systems
 */
export interface VerificationStatus {
  realTimeMonitoring: boolean
  dataValidation: boolean
  accuracy: number
} 