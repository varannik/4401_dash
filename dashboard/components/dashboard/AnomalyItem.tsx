"use client"

import React, { useState } from "react"
import { Check, X, Edit3, AlertTriangle, Clock, User } from "lucide-react"
import { ProcessedAnomaly } from "../../types/anomaly"
import { useAnomalyStore } from "../../stores/anomaly-store"

interface AnomalyItemProps {
  anomaly: ProcessedAnomaly
}

export const AnomalyItem: React.FC<AnomalyItemProps> = ({ anomaly }) => {
  const [showActions, setShowActions] = useState(false)
  const [showModifyForm, setShowModifyForm] = useState(false)
  const [correctedValue, setCorrectedValue] = useState(anomaly.originalData.value.toString())
  const [reason, setReason] = useState('')
  const [notes, setNotes] = useState('')

  const { markAnomalyAsCorrect, modifyAnomalyValue } = useAnomalyStore()

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-red-500 bg-red-500/10 text-red-400'
      case 'high': return 'border-orange-500 bg-orange-500/10 text-orange-400'
      case 'medium': return 'border-yellow-500 bg-yellow-500/10 text-yellow-400'
      case 'low': return 'border-blue-500 bg-blue-500/10 text-blue-400'
      default: return 'border-gray-500 bg-gray-500/10 text-gray-400'
    }
  }

  const getSeverityIcon = (severity: string) => {
    const baseClass = "w-4 h-4"
    switch (severity) {
      case 'critical': return <AlertTriangle className={`${baseClass} text-red-500`} />
      case 'high': return <AlertTriangle className={`${baseClass} text-orange-500`} />
      case 'medium': return <AlertTriangle className={`${baseClass} text-yellow-500`} />
      case 'low': return <AlertTriangle className={`${baseClass} text-blue-500`} />
      default: return <AlertTriangle className={`${baseClass} text-gray-500`} />
    }
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  const handleCorrectDetection = (isCorrect: boolean) => {
    markAnomalyAsCorrect(anomaly.id, isCorrect, notes || undefined)
    setShowActions(false)
    setNotes('')
  }

  const handleModifyValue = () => {
    const newValue = parseFloat(correctedValue)
    if (!isNaN(newValue)) {
      modifyAnomalyValue(anomaly.id, newValue, reason || undefined)
      setShowModifyForm(false)
      setShowActions(false)
      setCorrectedValue(anomaly.originalData.value.toString())
      setReason('')
    }
  }

  const isProcessed = anomaly.isProcessed

  return (
    <div className={`
      border rounded-lg p-4 mb-3 backdrop-blur-sm transition-all duration-200
      ${getSeverityColor(anomaly.severity)}
      ${isProcessed ? 'opacity-60' : 'opacity-100'}
    `}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {getSeverityIcon(anomaly.severity)}
          <div>
            <h3 className="font-semibold text-white">{anomaly.metricDisplayName}</h3>
            <div className="flex items-center gap-2 text-xs text-white/60">
              <Clock className="w-3 h-3" />
              {formatTimestamp(anomaly.timestamp)}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className={`
            px-2 py-1 rounded text-xs font-medium
            ${anomaly.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
              anomaly.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
              anomaly.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-blue-500/20 text-blue-400'}
          `}>
            {anomaly.severity.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Anomaly Details */}
      <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
        <div>
          <span className="text-white/60">Value:</span>
          <span className="ml-2 font-mono text-white">{anomaly.originalData.value}</span>
        </div>
        <div>
          <span className="text-white/60">Alarm Type:</span>
          <span className="ml-2 text-white">{anomaly.originalData.alarm_type}</span>
        </div>
      </div>

      {/* Context */}
      {anomaly.originalData.context && (
        <div className="mb-3 p-2 bg-white/5 rounded text-xs text-white/80">
          <strong>Context:</strong> {anomaly.originalData.context}
        </div>
      )}

      {/* Processed Status */}
      {isProcessed && anomaly.action && (
        <div className="mb-3 p-3 bg-green-500/10 border border-green-500/30 rounded">
          <div className="flex items-center gap-2 mb-2">
            <Check className="w-4 h-4 text-green-400" />
            <span className="font-medium text-green-400">
              {anomaly.action.type === 'correct' ? 'Reviewed' : 'Modified'}
            </span>
            <span className="text-xs text-white/60">
              {formatTimestamp(anomaly.action.timestamp)}
            </span>
          </div>
          
          {anomaly.action.type === 'correct' && (
            <p className="text-sm text-white/80">
              Detection marked as: <strong>
                {anomaly.action.correctDetection ? 'Correct' : 'Incorrect'}
              </strong>
              {anomaly.action.notes && (
                <span className="block mt-1 text-xs">Notes: {anomaly.action.notes}</span>
              )}
            </p>
          )}
          
          {anomaly.action.type === 'modify' && (
            <div className="text-sm text-white/80">
              <p>
                <span className="text-white/60">Original:</span> {anomaly.action.originalValue} → 
                <span className="text-green-400 font-mono ml-1">{anomaly.action.correctedValue}</span>
              </p>
              {anomaly.action.reason && (
                <p className="text-xs mt-1">Reason: {anomaly.action.reason}</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      {!isProcessed && (
        <div className="space-y-2">
          {!showActions && !showModifyForm && (
            <button
              onClick={() => setShowActions(true)}
              className="w-full py-2 px-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded text-blue-400 text-sm font-medium transition-colors duration-200"
            >
              Process Anomaly
            </button>
          )}

          {showActions && !showModifyForm && (
            <div className="space-y-2">
              {/* Notes Input */}
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes (optional)..."
                className="w-full p-2 bg-white/5 border border-white/20 rounded text-white text-sm resize-none"
                rows={2}
              />
              
              {/* Correct Detection Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleCorrectDetection(true)}
                  className="flex items-center justify-center gap-2 py-2 px-3 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded text-green-400 text-sm font-medium transition-colors duration-200"
                >
                  <Check className="w-4 h-4" />
                  Correct Detection
                </button>
                <button
                  onClick={() => handleCorrectDetection(false)}
                  className="flex items-center justify-center gap-2 py-2 px-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded text-red-400 text-sm font-medium transition-colors duration-200"
                >
                  <X className="w-4 h-4" />
                  Wrong Detection
                </button>
              </div>
              
              {/* Modify Value Button */}
              <button
                onClick={() => setShowModifyForm(true)}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 rounded text-orange-400 text-sm font-medium transition-colors duration-200"
              >
                <Edit3 className="w-4 h-4" />
                Modify Value
              </button>
              
              {/* Cancel */}
              <button
                onClick={() => setShowActions(false)}
                className="w-full py-2 px-3 bg-gray-500/20 hover:bg-gray-500/30 border border-gray-500/30 rounded text-gray-400 text-sm font-medium transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          )}

          {showModifyForm && (
            <div className="space-y-2">
              <div>
                <label className="block text-xs text-white/60 mb-1">Corrected Value:</label>
                <input
                  type="number"
                  value={correctedValue}
                  onChange={(e) => setCorrectedValue(e.target.value)}
                  className="w-full p-2 bg-white/5 border border-white/20 rounded text-white text-sm"
                  step="any"
                />
              </div>
              
              <div>
                <label className="block text-xs text-white/60 mb-1">Reason (optional):</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Why was this value incorrect?"
                  className="w-full p-2 bg-white/5 border border-white/20 rounded text-white text-sm resize-none"
                  rows={2}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleModifyValue}
                  className="flex items-center justify-center gap-2 py-2 px-3 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded text-green-400 text-sm font-medium transition-colors duration-200"
                >
                  <Check className="w-4 h-4" />
                  Save
                </button>
                <button
                  onClick={() => {
                    setShowModifyForm(false)
                    setCorrectedValue(anomaly.originalData.value.toString())
                    setReason('')
                  }}
                  className="flex items-center justify-center gap-2 py-2 px-3 bg-gray-500/20 hover:bg-gray-500/30 border border-gray-500/30 rounded text-gray-400 text-sm font-medium transition-colors duration-200"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AnomalyItem
