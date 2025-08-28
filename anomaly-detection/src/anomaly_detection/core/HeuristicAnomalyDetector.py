from typing import Dict, Any, Optional
import json
import os

from .context_processor import AlarmContextProcessor
from ..integrations.llm import LLM
from ..models.schemas import SensorData, AnomalyResult
"""
HeuristicAnomalyDetector is a class to detect anomalies in real-time records based on defined thresholds.
"""

class HeuristicAnomalyDetector:
    """

    Threshold schema (per variable):
        { 
            "variable_1" : {"Low-Low": float, "Low": float, "High": float, "High-High": float }
        }

    Alarm logic:
      - OK : Low ≤ value ≤ High
      - Low-Low  : Low-Low ≤ value < Low
      - Low-Low : value < Low-Low
      - High  : High < value ≤ High-High
      - High-High : value > High-High
      
    """



    #Initializing the thresholds (L,LL,H,HH) from thresholds.json, the context processor to derive context from Questionnaire.xlsx and the llm from llm.py
    def __init__(self, 
                 *,
                 thresholds: Dict[str, Dict[str, float]], 
                 context_processor: [AlarmContextProcessor], 
                 llm: [LLM]) -> None:

        self.thresholds = thresholds
        self.context_processor = context_processor
        self.llm = llm

    #Evaluates anomaly based on the thresholds
    def evaluate_anomaly(self, record: SensorData) -> Dict[str, AnomalyResult]:
        
        timestamp = record.timestamp
        data = record.data
        results: Dict[str, AnomalyResult] = {}

        for var, limits in self.thresholds.items():
            if var not in data:
                continue
            
            value = data[var]

            if value < limits["Low-Low"]:
                alarm_type = "Low-Low"
                status = "Anomaly"
            elif value < limits["Low"]:
                alarm_type = "Low"
                status = "Anomaly"
            elif value <= limits["High"]:
                alarm_type = "OK"
                status = "Normal"
            elif value <= limits["High-High"]:
                alarm_type = "High"
                status = "Anomaly"
            else:
                alarm_type = "High-High"
                status = "Anomaly"

            results[var] = AnomalyResult(
                value=value,
                alarm_type=alarm_type,
                status=status,
                context=""
            )

        # Handle variables that don't have thresholds defined
        for var, value in data.items():
            if var not in self.thresholds:
                results[var] = AnomalyResult(
                    value=value,
                    alarm_type="OK",
                    status="Normal",
                    context=""
                )

        # If anomaly attach context and summarize via LLM
        for var, info in results.items():
            if info.alarm_type != "OK":
                raw_ctx = self.context_processor.lookup_context(var, info.alarm_type)
                text = self.llm.summarize(var, info.alarm_type, raw_ctx) if raw_ctx else None
                info.context = text or (str(raw_ctx) if raw_ctx else "")

        return results
        
