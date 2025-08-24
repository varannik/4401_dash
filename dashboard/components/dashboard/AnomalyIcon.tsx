"use client"

import React from "react"
import { AlertTriangle, Bell } from "lucide-react"

interface AnomalyIconProps {
  unreadCount: number
  onClick: () => void
  isOpen: boolean
}

export const AnomalyIcon: React.FC<AnomalyIconProps> = ({ 
  unreadCount, 
  onClick, 
  isOpen 
}) => {
  return (
    <button
      onClick={onClick}
      className={`
        relative p-2 rounded-lg transition-all duration-200 group
        ${isOpen 
          ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
          : 'bg-white/5 text-white/70 hover:bg-red-500/10 hover:text-red-400 border border-white/10'
        }
        backdrop-blur-sm
      `}
      title="Anomaly Notifications"
    >
      {/* Main Icon */}
      <div className="relative">
        <AlertTriangle className="w-5 h-5" />
        
        {/* Pulse animation for active anomalies */}
        {unreadCount > 0 && (
          <div className="absolute inset-0">
            <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />
          </div>
        )}
      </div>

      {/* Notification Badge */}
      {unreadCount > 0 && (
        <div className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-red-500 rounded-full blur-sm animate-pulse"></div>
          
          {/* Badge */}
          <div className="relative bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center border-2 border-white/20">
            {unreadCount > 99 ? '99+' : unreadCount}
          </div>
        </div>
      )}

      {/* Hover glow effect */}
      <div className={`
        absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200
        ${unreadCount > 0 
          ? 'bg-red-500/10 border border-red-500/30' 
          : 'bg-white/5 border border-white/20'
        }
        backdrop-blur-sm
      `} />
    </button>
  )
}

export default AnomalyIcon
