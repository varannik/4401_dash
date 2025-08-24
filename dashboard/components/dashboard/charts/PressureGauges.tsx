"use client"

import React from "react"
import { InjectionWellAnnulusPressureGauge } from "./InjectionWellAnnulusPressureGauge"
import { InjectionWellTubingPressureGauge } from "./InjectionWellTubingPressureGauge"
import { InjectionPressureGauge } from "./InjectionPressureGauge"

interface PressureGaugesProps {
  injectionWellAnnulusPressure: number
  injectionWellTubingPressure: number
  injectionPressure: number
}

export const PressureGauges: React.FC<PressureGaugesProps> = ({
  injectionWellAnnulusPressure,
  injectionWellTubingPressure,
  injectionPressure
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <InjectionWellAnnulusPressureGauge value={injectionWellAnnulusPressure} />
      <InjectionWellTubingPressureGauge value={injectionWellTubingPressure} />
      <InjectionPressureGauge value={injectionPressure} />
    </div>
  )
}

export default PressureGauges
