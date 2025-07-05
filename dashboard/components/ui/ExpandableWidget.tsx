"use client"

import React from 'react'

export interface ExpandableWidgetProps {
  /** Widget title */
  title: string
  /** Optional icon component */
  icon?: React.ElementType
  /** Summary content shown in collapsed state */
  children: React.ReactNode
  /** Detailed content shown in expanded state */
  expandedContent?: React.ReactNode
  /** Additional CSS classes */
  className?: string
  /** Inline styles for positioning */
  style?: React.CSSProperties
  /** Click handler for expansion */
  onClick?: () => void
  /** Whether the widget is currently expanded */
  isExpanded?: boolean
  /** Handler for zoom out/collapse */
  onZoomOut?: () => void
  /** Whether the widget is clickable */
  clickable?: boolean
  /** Custom background opacity */
  backgroundOpacity?: number
}

/**
 * ExpandableWidget - A reusable base component for expandable widgets
 * 
 * Features:
 * - Smooth expansion animation to full screen
 * - Stays below header menu (respects z-index hierarchy)
 * - Backdrop overlay with click-to-close
 * - Responsive design with proper spacing
 * - TypeScript support with full type safety
 * 
 * @example
 * ```tsx
 * <ExpandableWidget
 *   title="My Widget"
 *   icon={SomeIcon}
 *   isExpanded={expanded}
 *   onClick={() => setExpanded(true)}
 *   onZoomOut={() => setExpanded(false)}
 *   expandedContent={<DetailedView />}
 * >
 *   <SummaryView />
 * </ExpandableWidget>
 * ```
 */
export const ExpandableWidget: React.FC<ExpandableWidgetProps> = ({
  title,
  icon: Icon,
  children,
  expandedContent,
  className = "",
  style,
  onClick,
  isExpanded = false,
  onZoomOut,
  clickable = true,
  backgroundOpacity = 30
}) => {
  return (
    <>
      {/* Backdrop when expanded */}
      {isExpanded && (
        <div 
          className="fixed inset-0 backdrop-blur-sm z-20 transition-opacity duration-500"
          style={{ backgroundColor: `rgba(0, 0, 0, 0.${backgroundOpacity})` }}
          onClick={onZoomOut}
        />
      )}

      <div 
        className={`bg-white/95 backdrop-blur-sm shadow-lg border border-white/20 rounded-xl transition-all duration-800 ease-out ${
          clickable && onClick && !isExpanded ? 'cursor-pointer hover:bg-white/100 hover:shadow-xl' : ''
        } ${isExpanded ? 'flex flex-col' : ''} ${className}`}
        onClick={!isExpanded && clickable ? onClick : undefined}
        style={{
          transformOrigin: 'center center',
          ...(isExpanded ? {
            position: 'fixed',
            top: '7rem', // Below header menu
            left: '1rem',
            right: '1rem',
            bottom: '1rem',
            zIndex: 25,
            width: 'calc(100vw - 2rem)',
            height: 'calc(100vh - 8rem)',
            padding: '2rem',
            overflow: 'hidden',
            transform: 'scale(1)',
            transition: 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          } : {
            position: 'relative',
            padding: '1.5rem',
            transform: 'scale(1)',
            transition: 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            ...style
          })
        }}
        role={clickable ? "button" : "widget"}
        tabIndex={clickable && !isExpanded ? 0 : -1}
        aria-expanded={isExpanded}
        aria-label={isExpanded ? `${title} - Expanded view` : `${title} - Click to expand`}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          {Icon && (
            <Icon 
              className={`${isExpanded ? 'w-8 h-8' : 'w-5 h-5'} text-gray-600 transition-all duration-500 ease-out`}
              aria-hidden="true"
            />
          )}
          <h3 className={`${isExpanded ? 'text-3xl' : 'text-lg'} font-semibold text-gray-800 transition-all duration-500 ease-out flex-1`}>
            {title}
          </h3>
          
          {/* Expand indicator */}
          {!isExpanded && clickable && onClick && (
            <div 
              className="ml-auto text-gray-400 hover:text-gray-600 transition-colors"
              aria-hidden="true"
            >
              ⤴
            </div>
          )}
          
          {/* Zoom out button */}
          {isExpanded && onZoomOut && (
            <button
              onClick={onZoomOut}
              className="ml-auto flex items-center gap-2 px-4 py-2 bg-gray-100/50 hover:bg-gray-200/50 rounded-lg transition-colors duration-200 group"
              title="Zoom out to main view"
              aria-label="Close expanded view"
            >
              <div className="w-5 h-5 text-gray-600 group-hover:text-gray-800">⤸</div>
              <span className="text-sm font-medium text-gray-600 group-hover:text-gray-800">
                Zoom Out
              </span>
            </button>
          )}
        </div>
        
        {/* Content Area */}
        <div 
          className={`transition-all duration-500 ease-out ${
            isExpanded ? 'flex-1 overflow-y-auto min-h-0' : 'overflow-hidden'
          }`}
        >
          {isExpanded && expandedContent ? (
            <div className="w-full h-full">
              {expandedContent}
            </div>
          ) : (
            children
          )}
        </div>
      </div>
    </>
  )
}

export default ExpandableWidget 