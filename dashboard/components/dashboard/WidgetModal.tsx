"use client"

import React from 'react'
import { createPortal } from 'react-dom'
import { X, Maximize2, Minimize2 } from 'lucide-react'

interface WidgetModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export function WidgetModal({ isOpen, onClose, title, children }: WidgetModalProps) {
  if (!isOpen) return null

  const modalContent = (
    <div className="fixed inset-0 z-[9999] overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative flex items-center justify-center min-h-screen p-4">
        <div className="relative w-full max-w-6xl h-[90vh] bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 overflow-hidden transform transition-all duration-300 scale-100">
          
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200/50 bg-white/90 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <Maximize2 className="w-6 h-6 text-gray-600" />
              <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100/50 rounded-lg transition-colors duration-200"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>
          
          {/* Content */}
          <div className="p-6 h-full overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  )

  // Use createPortal to render the modal at the document root level
  return createPortal(modalContent, document.body)
} 