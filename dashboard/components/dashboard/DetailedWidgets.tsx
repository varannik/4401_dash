"use client"

/**
 * DetailedWidgets.tsx - Re-exports all detailed widget components
 * This file maintains backward compatibility while using the new modular structure
 */

// Re-export all detailed widget components from the new structure
export {
  PlantOverviewDetails,
  DACDetails,
  CommercialDetails,
  EnergyDetails,
  BatteryDetails,
  MMRVDetails,
  CarbonCertifiedDetails,
  CarbonCreditsDetails,
  // Shared components
  DetailedMetric,
  TimeSeriesChart
} from './detailed-widgets' 