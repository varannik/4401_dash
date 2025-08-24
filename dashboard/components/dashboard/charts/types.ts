export interface HistoricalData {
  timestamp: string
  co2Flow: number
  waterFlow: number
  tracerFlow: number
}

export interface TimelineChartProps {
  data: HistoricalData[]
  currentValue: number
  title: string
  unit: string
  color: string
  icon: React.ComponentType<{ className?: string }>
  maxValue: number
  dataKey: keyof Pick<HistoricalData, 'co2Flow' | 'waterFlow' | 'tracerFlow'>
}
