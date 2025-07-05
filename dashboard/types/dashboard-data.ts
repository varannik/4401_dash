/**
 * Dashboard Data Types
 * Type definitions for all dashboard widget data structures
 */

// =============================================================================
// COMMON TYPES
// =============================================================================

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  timestamp: string
}

export interface ApiError {
  widget: string
  error: string
}

// =============================================================================
// PLANT OVERVIEW TYPES
// =============================================================================

export interface PlantOverviewMetrics {
  water_flow_rate: number
  water_temp: number
  injection_ratio: string
  co2_temp: number
  co2_flow_rate: number
  total_water_injected: number
  system_status: string
  last_updated: string
}

export interface PlantHistoricalData {
  hour_of_day: number
  avg_flow_rate: number
  avg_co2_temp: number
  measurement_count: number
}

export interface PlantSystemStatus {
  system_component: string
  status: string
  last_maintenance: string
  next_maintenance: string
  operational_hours: number
  efficiency_rating: number
}

export interface PlantOverviewData {
  current: PlantOverviewMetrics | null
  historical: PlantHistoricalData[]
  systemStatus: PlantSystemStatus[]
  timestamp: string
}

// =============================================================================
// DAC TYPES
// =============================================================================

export interface DACMetrics {
  co2_temp: number
  co2_flow_rate: number
  injected_co2_total: number
  co2_concentration: number
  capture_efficiency: number
  processing_rate: number
  system_pressure: number
  last_updated: string
}

export interface DACTrends {
  hour_of_day: number
  avg_flow_rate: number
  avg_temperature: number
  total_injected: number
  avg_efficiency: number
}

export interface DACMaintenance {
  equipment_id: string
  equipment_name: string
  maintenance_type: string
  scheduled_date: string
  completion_status: string
  estimated_downtime: number
  priority_level: string
}

export interface DACAlerts {
  alert_type: string
  severity: string
  message: string
  created_at: string
  resolved_at: string | null
  affected_component: string
}

export interface DACData {
  current: DACMetrics | null
  trends: DACTrends[]
  maintenance: DACMaintenance[]
  alerts: DACAlerts[]
  timestamp: string
}

// =============================================================================
// COMMERCIAL TYPES
// =============================================================================

export interface CommercialSummary {
  total_revenue: number
  monthly_target: number
  revenue_growth: number
  profit_margin: number
  active_contracts: number
  new_customers: number
  last_updated: string
}

export interface CommercialMonthlyData {
  month_year: string
  total_revenue: number
  profit: number
  expenses: number
  contracts_count: number
  growth_percentage: number
}

export interface CommercialBreakdown {
  revenue_source: string
  amount: number
  percentage_of_total: number
  contract_type: string
  customer_segment: string
}

export interface CommercialKPIs {
  kpi_name: string
  current_value: number
  target_value: number
  variance: number
  trend: string
  last_updated: string
}

export interface CommercialData {
  summary: CommercialSummary | null
  monthlyData: CommercialMonthlyData[]
  breakdown: CommercialBreakdown[]
  kpis: CommercialKPIs[]
  timestamp: string
}

// =============================================================================
// ENERGY TYPES
// =============================================================================

export interface EnergyMetrics {
  current_consumption: number
  current_generation: number
  outgoing_volts: number
  battery_level: number
  power_backup_status: string
  grid_connection_status: string
  efficiency_rating: number
  last_updated: string
}

export interface EnergyConsumption {
  hour_of_day: number
  avg_consumption: number
  avg_generation: number
  avg_battery_level: number
  peak_demand: number
}

export interface EnergySystemConfig {
  system_component: string
  capacity_kw: number
  operational_status: string
  efficiency_rating: number
  maintenance_due: string
  installation_date: string
}

export interface EnergyBackupInfo {
  backup_system_id: string
  backup_type: string
  capacity: number
  current_charge: number
  estimated_runtime: number
  last_test_date: string
  test_result: string
}

export interface EnergyData {
  current: EnergyMetrics | null
  consumption: EnergyConsumption[]
  systemConfig: EnergySystemConfig[]
  backupInfo: EnergyBackupInfo[]
  timestamp: string
}

// =============================================================================
// BATTERY TYPES
// =============================================================================

export interface BatteryStatus {
  battery_id: string
  battery_name: string
  current_charge_level: number
  health_percentage: number
  voltage: number
  temperature: number
  charging_status: string
  estimated_runtime: number
  last_updated: string
}

export interface BatteryHistory {
  hour_of_day: number
  avg_charge_level: number
  avg_health: number
  avg_temperature: number
  measurement_count: number
}

export interface BatteryConfig {
  battery_id: string
  battery_type: string
  capacity_kwh: number
  max_charge_rate: number
  max_discharge_rate: number
  installation_date: string
  warranty_expiry: string
  manufacturer: string
}

export interface BatteryAlerts {
  alert_type: string
  severity: string
  battery_id: string
  message: string
  created_at: string
  resolved_at: string | null
  recommended_action: string
}

export interface BatteryData {
  current: BatteryStatus | null
  history: BatteryHistory[]
  config: BatteryConfig[]
  alerts: BatteryAlerts[]
  timestamp: string
}

// =============================================================================
// MMRV TYPES
// =============================================================================

export interface MMRVMetrics {
  measurement_type: string
  current_value: number
  unit_of_measure: string
  temperature: number
  pressure: number
  co2_mineralized: number
  verification_status: string
  last_updated: string
}

export interface MMRVTrends {
  measurement_date: string
  avg_temperature: number
  avg_pressure: number
  total_co2_mineralized: number
  measurement_count: number
}

export interface MMRVVerification {
  verification_type: string
  status: string
  verifier_name: string
  verification_date: string
  expiry_date: string
  compliance_level: string
  notes: string
}

export interface MMRVEquipment {
  equipment_id: string
  equipment_name: string
  equipment_type: string
  location: string
  operational_status: string
  last_calibration: string
  next_calibration: string
  accuracy_rating: number
}

export interface MMRVReports {
  report_type: string
  report_period: string
  submission_date: string
  approval_status: string
  compliance_score: number
  findings: string
  corrective_actions: string
}

export interface MMRVData {
  current: MMRVMetrics | null
  trends: MMRVTrends[]
  verification: MMRVVerification[]
  equipment: MMRVEquipment[]
  reports: MMRVReports[]
  timestamp: string
}

// =============================================================================
// CARBON CERTIFIED TYPES
// =============================================================================

export interface CarbonCertificationSummary {
  total_certified_tons: number
  certification_type: string
  certification_body: string
  issued_date: string
  expiry_date: string
  verification_status: string
  last_updated: string
}

export interface CarbonCertificationTimeline {
  milestone_type: string
  milestone_name: string
  target_date: string
  completion_date: string | null
  status: string
  certified_amount: number
  verification_body: string
  notes: string
}

export interface CarbonCertificationProgress {
  month_year: string
  tons_certified: number
  tons_pending: number
  tons_rejected: number
  certification_rate: number
  cumulative_certified: number
}

export interface CarbonCertificationMethodologies {
  methodology_name: string
  methodology_version: string
  tons_certified: number
  average_verification_time: number
  success_rate: number
  certification_body: string
}

export interface CarbonVerificationActivities {
  verification_id: string
  verification_type: string
  verifier_name: string
  scheduled_date: string
  completion_date: string | null
  status: string
  findings: string
  certified_amount: number
}

export interface CarbonCertifiedData {
  summary: CarbonCertificationSummary | null
  timeline: CarbonCertificationTimeline[]
  progress: CarbonCertificationProgress[]
  methodologies: CarbonCertificationMethodologies[]
  activities: CarbonVerificationActivities[]
  timestamp: string
}

// =============================================================================
// CARBON CREDITS TYPES
// =============================================================================

export interface CarbonCreditsSummary {
  total_credits_available: number
  credits_sold: number
  credits_pending: number
  average_price: number
  market_value: number
  last_transaction_date: string
  last_updated: string
}

export interface CarbonCreditsHistory {
  month_year: string
  credits_generated: number
  credits_sold: number
  credits_retired: number
  average_selling_price: number
  total_revenue: number
  market_demand_score: number
}

export interface CarbonCreditsOpportunities {
  opportunity_id: string
  buyer_name: string
  buyer_type: string
  requested_credits: number
  offered_price: number
  contract_duration: number
  delivery_date: string
  opportunity_status: string
  risk_rating: string
}

export interface CarbonCreditsPricing {
  price_date: string
  market_price: number
  our_price: number
  volume_traded: number
  price_volatility: number
  market_sentiment: string
}

export interface CarbonCreditsRegistry {
  registry_name: string
  credit_type: string
  vintage_year: number
  credits_issued: number
  credits_retired: number
  credits_available: number
  verification_standard: string
  project_type: string
}

export interface CarbonCreditsData {
  summary: CarbonCreditsSummary | null
  history: CarbonCreditsHistory[]
  opportunities: CarbonCreditsOpportunities[]
  pricing: CarbonCreditsPricing[]
  registry: CarbonCreditsRegistry[]
  timestamp: string
}

// =============================================================================
// COMBINED DASHBOARD DATA
// =============================================================================

export interface AllDashboardData {
  plantOverview: PlantOverviewData
  dac: DACData
  commercial: CommercialData
  energy: EnergyData
  battery: BatteryData
  mmrv: MMRVData
  carbonCertified: CarbonCertifiedData
  carbonCredits: CarbonCreditsData
  timestamp: string
}

export interface DashboardResponse {
  success: boolean
  data: AllDashboardData
  errors: ApiError[]
} 