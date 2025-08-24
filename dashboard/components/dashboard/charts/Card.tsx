"use client"

import React from "react"
import { cn } from "@/lib/utils"

interface CardProps {
  title?: string
  subtitle?: string
  children: React.ReactNode
  className?: string
  headerContent?: React.ReactNode
  footerContent?: React.ReactNode
  variant?: "default" | "glass" | "bordered" | "elevated"
  size?: "sm" | "md" | "lg" | "xl"
  padding?: "none" | "sm" | "md" | "lg"
  onClick?: () => void
  hover?: boolean
}

const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  children,
  className = "",
  headerContent,
  footerContent,
  variant = "glass",
  size = "md",
  padding = "md",
  onClick,
  hover = true
}) => {
  const baseClasses = "relative overflow-hidden transition-all duration-300"
  
  const variantClasses = {
    default: "bg-white/5 border border-white/10 rounded-lg",
    glass: "bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg",
    bordered: "bg-white/5 border-2 border-white/30 rounded-xl",
    elevated: "bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg shadow-2xl"
  }
  
  const sizeClasses = {
    sm: "min-h-[200px]",
    md: "min-h-[250px]",
    lg: "min-h-[300px]",
    xl: "min-h-[400px]"
  }
  
  const paddingClasses = {
    none: "p-0",
    sm: "p-3",
    md: "p-4",
    lg: "p-6"
  }
  
  const hoverClasses = hover ? "hover:scale-105 hover:shadow-xl hover:border-white/30" : ""
  const clickableClasses = onClick ? "cursor-pointer" : ""

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        paddingClasses[padding],
        hoverClasses,
        clickableClasses,
        className
      )}
      onClick={onClick}
    >
      {/* Header */}
      {(title || subtitle || headerContent) && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            {title && (
              <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
            )}
            {subtitle && (
              <p className="text-sm text-white/70">{subtitle}</p>
            )}
          </div>
          {headerContent && (
            <div className="flex-shrink-0 ml-4">
              {headerContent}
            </div>
          )}
        </div>
      )}
      
      {/* Content */}
      <div className="flex-1">
        {children}
      </div>
      
      {/* Footer */}
      {footerContent && (
        <div className="mt-4">
          {footerContent}
        </div>
      )}
    </div>
  )
}

export default Card
