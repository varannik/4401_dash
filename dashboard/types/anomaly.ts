export interface AnomalyDetectionResult {
  value: number
  alarm_type: string
  status: string
  context: string
}

export interface AnomalyData {
  timestamp: string
  method: string
  results: {
    WATER_FLOW_RATE?: AnomalyDetectionResult
    CO2_FLOW_RATE?: AnomalyDetectionResult
    LIQUID_TRACER_FLOW_RATE?: AnomalyDetectionResult
    INJECTION_PRESSURE?: AnomalyDetectionResult
    HASA_4_TUBING_PRESSURE?: AnomalyDetectionResult
    WATER_TO_CO2_RATIO?: AnomalyDetectionResult
  }
  processing_time_ms: number
}

export interface AnomalyAction {
  type: 'correct' | 'modify'
  timestamp: string
  userId?: string
  notes?: string
}

export interface AnomalyCorrectAction extends AnomalyAction {
  type: 'correct'
  correctDetection: boolean // true if anomaly detection was correct, false if wrong
}

export interface AnomalyModifyAction extends AnomalyAction {
  type: 'modify'
  originalValue: number
  correctedValue: number
  reason?: string
}

export interface ProcessedAnomaly {
  id: string
  timestamp: string
  metricName: string
  metricDisplayName: string
  originalData: AnomalyDetectionResult
  action?: AnomalyCorrectAction | AnomalyModifyAction
  isProcessed: boolean
  severity: 'low' | 'medium' | 'high' | 'critical'
}

export interface AnomalyNotification {
  id: string
  title: string
  message: string
  timestamp: string
  read: boolean
  severity: 'low' | 'medium' | 'high' | 'critical'
  anomaly: ProcessedAnomaly
}
