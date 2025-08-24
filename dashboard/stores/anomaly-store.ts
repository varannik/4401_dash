import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { 
  AnomalyData, 
  ProcessedAnomaly, 
  AnomalyNotification, 
  AnomalyCorrectAction, 
  AnomalyModifyAction 
} from '../types/anomaly'

interface AnomalyStore {
  // State
  anomalies: ProcessedAnomaly[]
  notifications: AnomalyNotification[]
  isDrawerOpen: boolean
  unreadCount: number

  // Actions
  addAnomalyData: (data: AnomalyData) => void
  markAnomalyAsCorrect: (anomalyId: string, correctDetection: boolean, notes?: string) => void
  modifyAnomalyValue: (anomalyId: string, correctedValue: number, reason?: string) => void
  markNotificationAsRead: (notificationId: string) => void
  markAllNotificationsAsRead: () => void
  toggleDrawer: () => void
  clearProcessedAnomalies: () => void
  exportAnomaliesAsJSON: () => string
}

const getSeverity = (alarmType: string, status: string): 'low' | 'medium' | 'high' | 'critical' => {
  if (status === 'Anomaly') {
    switch (alarmType) {
      case 'High-High':
        return 'critical'
      case 'High':
        return 'high'
      case 'Low':
        return 'medium'
      case 'Low-Low':
        return 'critical'
      default:
        return 'medium'
    }
  }
  return 'low'
}

const getMetricDisplayName = (metricName: string): string => {
  const displayNames: Record<string, string> = {
    'WATER_FLOW_RATE': 'Water Flow Rate',
    'CO2_FLOW_RATE': 'CO₂ Flow Rate',
    'LIQUID_TRACER_FLOW_RATE': 'Tracer Flow Rate',
    'INJECTION_PRESSURE': 'Injection Pressure',
    'HASA_4_TUBING_PRESSURE': 'Tubing Pressure',
    'WATER_TO_CO2_RATIO': 'Water to CO₂ Ratio'
  }
  return displayNames[metricName] || metricName
}

export const useAnomalyStore = create<AnomalyStore>()(
  persist(
    (set, get) => ({
      // Initial State
      anomalies: [],
      notifications: [],
      isDrawerOpen: false,
      unreadCount: 0,

      // Actions
      addAnomalyData: (data: AnomalyData) => {
        const newAnomalies: ProcessedAnomaly[] = []
        const newNotifications: AnomalyNotification[] = []

        // Process each metric in the results
        Object.entries(data.results).forEach(([metricName, metricData]) => {
          if (metricData && metricData.status === 'Anomaly') {
            const anomalyId = `${data.timestamp}-${metricName}`
            const severity = getSeverity(metricData.alarm_type, metricData.status)

            const anomaly: ProcessedAnomaly = {
              id: anomalyId,
              timestamp: data.timestamp,
              metricName,
              metricDisplayName: getMetricDisplayName(metricName),
              originalData: metricData,
              isProcessed: false,
              severity
            }

            const notification: AnomalyNotification = {
              id: `notif-${anomalyId}`,
              title: `${severity.toUpperCase()} Anomaly Detected`,
              message: `${getMetricDisplayName(metricName)}: ${metricData.value} (${metricData.alarm_type})`,
              timestamp: data.timestamp,
              read: false,
              severity,
              anomaly
            }

            newAnomalies.push(anomaly)
            newNotifications.push(notification)
          }
        })

        if (newAnomalies.length > 0) {
          set(state => ({
            anomalies: [...newAnomalies, ...state.anomalies].slice(0, 100), // Keep last 100
            notifications: [...newNotifications, ...state.notifications].slice(0, 100),
            unreadCount: state.unreadCount + newNotifications.length
          }))

          // Save to JSON file
          get().exportAnomaliesAsJSON()
        }
      },

      markAnomalyAsCorrect: (anomalyId: string, correctDetection: boolean, notes?: string) => {
        const action: AnomalyCorrectAction = {
          type: 'correct',
          timestamp: new Date().toISOString(),
          correctDetection,
          notes
        }

        set(state => ({
          anomalies: state.anomalies.map(anomaly =>
            anomaly.id === anomalyId
              ? { ...anomaly, action, isProcessed: true }
              : anomaly
          )
        }))

        // Save to JSON file
        get().exportAnomaliesAsJSON()
      },

      modifyAnomalyValue: (anomalyId: string, correctedValue: number, reason?: string) => {
        const anomaly = get().anomalies.find(a => a.id === anomalyId)
        if (!anomaly) return

        const action: AnomalyModifyAction = {
          type: 'modify',
          timestamp: new Date().toISOString(),
          originalValue: anomaly.originalData.value,
          correctedValue,
          reason
        }

        set(state => ({
          anomalies: state.anomalies.map(a =>
            a.id === anomalyId
              ? { ...a, action, isProcessed: true }
              : a
          )
        }))

        // Save to JSON file
        get().exportAnomaliesAsJSON()
      },

      markNotificationAsRead: (notificationId: string) => {
        set(state => ({
          notifications: state.notifications.map(notif =>
            notif.id === notificationId
              ? { ...notif, read: true }
              : notif
          ),
          unreadCount: Math.max(0, state.unreadCount - 1)
        }))
      },

      markAllNotificationsAsRead: () => {
        set(state => ({
          notifications: state.notifications.map(notif => ({ ...notif, read: true })),
          unreadCount: 0
        }))
      },

      toggleDrawer: () => {
        set(state => ({ isDrawerOpen: !state.isDrawerOpen }))
      },

      clearProcessedAnomalies: () => {
        set(state => ({
          anomalies: state.anomalies.filter(anomaly => !anomaly.isProcessed),
          notifications: state.notifications.filter(notif => !notif.anomaly.isProcessed)
        }))
      },

      exportAnomaliesAsJSON: () => {
        const data = {
          anomalies: get().anomalies,
          notifications: get().notifications,
          exportedAt: new Date().toISOString()
        }
        
        const jsonString = JSON.stringify(data, null, 2)
        
        // In a real app, this would save to a file or send to an API
        // For now, we'll store in localStorage as a backup
        if (typeof window !== 'undefined') {
          localStorage.setItem('anomaly-data-backup', jsonString)
        }
        
        return jsonString
      }
    }),
    {
      name: 'anomaly-store',
      partialize: (state) => ({
        anomalies: state.anomalies,
        notifications: state.notifications,
        unreadCount: state.unreadCount
      })
    }
  )
)
