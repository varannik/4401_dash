"use client"

import React from "react"
import AnomalyDrawer from "./AnomalyDrawer"
import { useAnomalyStore } from "@/stores/anomaly-store"

export const AnomalyDrawerProvider: React.FC = () => {
  const { isDrawerOpen, toggleDrawer } = useAnomalyStore()

  return (
    <AnomalyDrawer 
      isOpen={isDrawerOpen} 
      onClose={toggleDrawer} 
    />
  )
}

export default AnomalyDrawerProvider
