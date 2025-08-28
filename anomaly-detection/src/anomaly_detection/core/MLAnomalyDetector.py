from typing import Dict, Any
import numpy as np
import pandas as pd
import joblib
import json
from pathlib import Path

from ..models.schemas import MLAnomalyResult, SensorData


class MLAnomalyDetector:
    """
    ML-based anomaly detector using PCA reconstruction error.
    Uses pre-trained models (scaler, PCA, threshold) to detect anomalies
    in real-time records based on reconstruction error.
    """
    
    def __init__(self, model_path: str) -> None:
        self.model_path = Path(model_path)
        self.scaler = None
        self.pca = None
        self.threshold = None
        self.features = None
        self._load_models()
    
    def _load_models(self) -> None:
        """Load pre-trained models and features list."""
        try:
            self.scaler = joblib.load(self.model_path / "scaler.pkl")
            self.pca = joblib.load(self.model_path / "pca.pkl")
            self.threshold = joblib.load(self.model_path / "threshold.pkl")
            with open(self.model_path / "features.json", "r") as f:
                self.features = json.load(f)
            print(f"ML models & features loaded successfully from {self.model_path}")
        except FileNotFoundError as e:
            raise FileNotFoundError(f"Could not load ML models from {self.model_path}: {e}")
        except Exception as e:
            raise RuntimeError(f"Error loading ML models: {e}")
    
    
    def _prepare_data(self, record: SensorData) -> np.ndarray:
        """Prepare input data for ML model prediction."""
        if not hasattr(record, 'data') or not isinstance(record.data, dict):
            raise ValueError("Record must contain a 'data' dictionary")
        
        data = record.data
        
        missing = [f for f in self.features if f not in data]
        if missing:
            raise ValueError(f"Missing required features: {missing}")
        
        # Align in correct order using the expected feature names
        df = pd.DataFrame([[data[f] for f in self.features]], columns=self.features)
        return df
    
    def _calculate_reconstruction_error(self, data_point: np.ndarray) -> float:
        """Calculate reconstruction error using PCA."""
        X_scaled = self.scaler.transform(data_point)
        X_pca = self.pca.transform(X_scaled)
        X_reconstructed = self.pca.inverse_transform(X_pca)
        reconstruction_error = np.mean((X_scaled - X_reconstructed)**2, axis=1)[0]
        return reconstruction_error
    

    def evaluate_anomaly(self, record: SensorData) -> MLAnomalyResult:
        
        try:
            data_point = self._prepare_data(record)
            reconstruction_error = self._calculate_reconstruction_error(data_point)
            is_anomaly = reconstruction_error > self.threshold
            status = "Anomaly" if is_anomaly else "Normal"
            
            results = MLAnomalyResult(
                values=record.data,
                status=status
            )

            return results

        except Exception as e:
            print(f"ML detection error: {e}")
            return MLAnomalyResult(
                values=record.data or {},
                status="Error"
            )

    
    def get_model_info(self) -> Dict[str, Any]:
        """Get information about the loaded ML models."""
        return {
            "model_path": str(self.model_path),
            "threshold": float(self.threshold) if self.threshold is not None else None,
            "pca_components": int(self.pca.n_components_) if self.pca is not None else None,
            "scaler_type": type(self.scaler).__name__ if self.scaler is not None else None,
            "features": self.features,
            "models_loaded": all([self.scaler, self.pca, self.threshold, self.features])
        }


