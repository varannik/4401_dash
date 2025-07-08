"use client"

import React from 'react'
import { X, ZoomOut } from 'lucide-react'

export interface ExpandableWidgetProps {
  title: string
  icon?: React.ElementType
  className?: string
  style?: React.CSSProperties
  onClick?: () => void
  isExpanded?: boolean
  onZoomOut?: () => void
  expandedContent?: React.ReactNode
  children?: React.ReactNode
}

export const ExpandableWidget: React.FC<ExpandableWidgetProps> = ({
  title,
  icon: Icon,
  className = '',
  style,
  onClick,
  isExpanded = false,
  onZoomOut,
  expandedContent,
  children
}) => {
  return (
    <div
      className={`
        ${className}
        transition-all duration-500 ease-in-out
        bg-white/70 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200
        cursor-pointer overflow-hidden
        ${isExpanded 
          ? 'fixed left-0 w-full z-50 rounded-none' 
          : 'w-[100px] h-[70px]'
        }
      `}
      style={isExpanded 
        ? { top: '4rem', height: 'calc(100% - 4rem)' } 
        : style}
      onClick={!isExpanded ? onClick : undefined}
    >
      {/* Header */}
      <div className={`
        flex items-center justify-between p-3
        ${isExpanded ? 'border-b border-gray-200' : ''}
      `}>
        <div className="flex items-center space-x-2">
          {Icon && <Icon className="w-5 h-5 text-blue-600" />}
          <span className={`
            font-medium text-gray-800
            ${isExpanded ? 'text-lg' : 'text-sm'}
            transition-all duration-300
          `}>
            {title}
          </span>
        </div>
        {isExpanded && (
          <div className="flex items-center space-x-2">
            {onZoomOut && (
              <button
                onClick={e => { e.stopPropagation(); onZoomOut(); }}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <ZoomOut className="w-5 h-5 text-gray-600" />
              </button>
            )}
          </div>
        )}
      </div>
      {/* Content */}
      {isExpanded && (
        <div className="p-4 h-full overflow-auto">
          {expandedContent}
        </div>
      )}
      {/* Collapsed content */}
      {!isExpanded && children && (
        <div className="px-3 pb-2 text-xs text-gray-600">
          {children}
        </div>
      )}
    </div>
  );
}

export default ExpandableWidget 