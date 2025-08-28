import requests
import time
import json
from datetime import datetime, timezone

# Values to test
values = [
    {"WATER_FLOW_RATE": 2,"CO2_FLOW_RATE": 20,"LIQUID_TRACER_FLOW_RATE": 0.5,"INJECTION_PRESSURE": 30,"HASA-4_TUBING_PRESSURE": 30, 
     "WATER_TO_CO2_RATIO": 30, "HASA-4_ANNULUS_PRESSURE": 0, "TRACER_TO_CO2_RATIO": 0.019},
    {"WATER_FLOW_RATE": 3,"CO2_FLOW_RATE": 21,"LIQUID_TRACER_FLOW_RATE": 0.6,"INJECTION_PRESSURE": 50,"HASA-4_TUBING_PRESSURE": 40, 
     "WATER_TO_CO2_RATIO": 20, "HASA-4_ANNULUS_PRESSURE": 0.2, "TRACER_TO_CO2_RATIO": 0.19},
    {"WATER_FLOW_RATE": 4,"CO2_FLOW_RATE": 23,"LIQUID_TRACER_FLOW_RATE": 0.7,"INJECTION_PRESSURE": 20,"HASA-4_TUBING_PRESSURE": 10, 
     "WATER_TO_CO2_RATIO": 40, "HASA-4_ANNULUS_PRESSURE": 0.1, "TRACER_TO_CO2_RATIO": 0.2},
    {"WATER_FLOW_RATE": 5,"CO2_FLOW_RATE": 24,"LIQUID_TRACER_FLOW_RATE": 0.8,"INJECTION_PRESSURE": 10,"HASA-4_TUBING_PRESSURE": 20, 
     "WATER_TO_CO2_RATIO": 50, "HASA-4_ANNULUS_PRESSURE": 0.6, "TRACER_TO_CO2_RATIO": 0.3},
    {"WATER_FLOW_RATE": 6,"CO2_FLOW_RATE": 25,"LIQUID_TRACER_FLOW_RATE": 0.8,"INJECTION_PRESSURE": 40,"HASA-4_TUBING_PRESSURE": 30, 
     "WATER_TO_CO2_RATIO": 20, "HASA-4_ANNULUS_PRESSURE": 0.9, "TRACER_TO_CO2_RATIO": 0.1},
    {"WATER_FLOW_RATE": 7,"CO2_FLOW_RATE": 26,"LIQUID_TRACER_FLOW_RATE": 0.5,"INJECTION_PRESSURE": 20,"HASA-4_TUBING_PRESSURE": 10, 
     "WATER_TO_CO2_RATIO": 10, "HASA-4_ANNULUS_PRESSURE": 0.4, "TRACER_TO_CO2_RATIO": 0.9
    }

]

# Choose what to test: "heuristic", "statistical", "ml", "all", or any combination
# Options: "heuristic", "statistical", "ml", "all", 
#          "heuristic,statistical", "heuristic,ml", "statistical,ml"
TEST_MODE = "all"

BASE_URL = "http://localhost:8000/detect"

def parse_test_modes(test_mode: str) -> list:
    """Parse TEST_MODE string and return list of methods to test."""
    if test_mode.lower() == "all":
        return ["heuristic", "statistical", "ml"]
    elif test_mode.lower() == "both":  # backward compatibility
        return ["heuristic", "statistical"]
    else:
        # Split by comma and clean whitespace
        return [mode.strip().lower() for mode in test_mode.split(",")]

def send_request(i: int, v: dict):
    payload = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "data": v,
    }

    print(f"\n=== Sending request #{i}: {v} ===")
    
    methods_to_test = parse_test_modes(TEST_MODE)

    # Test Heuristic
    if "heuristic" in methods_to_test:
        try:
            r_heur = requests.post(f"{BASE_URL}/heuristic", json=payload)
            r_heur.raise_for_status()
            print("🔍 Heuristic result:")
            print(json.dumps(r_heur.json(), indent=2, ensure_ascii=False))
        except Exception as e:
            print(f"❌ Heuristic request failed: {e}")

    # Test Statistical
    if "statistical" in methods_to_test:
        try:
            r_stat = requests.post(f"{BASE_URL}/statistical", json=payload)
            r_stat.raise_for_status()
            print("📊 Statistical result:")
            print(json.dumps(r_stat.json(), indent=2, ensure_ascii=False))
        except Exception as e:
            print(f"❌ Statistical request failed: {e}")

    # Test ML
    if "ml" in methods_to_test:
        try:
            r_ml = requests.post(f"{BASE_URL}/ml", json=payload)
            r_ml.raise_for_status()
            print("🤖 ML result:")
            print(json.dumps(r_ml.json(), indent=2, ensure_ascii=False))
        except Exception as e:
            print(f"❌ ML request failed: {e}")

def test_health_endpoint():
    """Test the health endpoint to ensure all detectors are working."""
    print("🏥 Testing health endpoint...")
    try:
        response = requests.get("http://localhost:8000/health")
        response.raise_for_status()
        health_data = response.json()
        print("Health check result:")
        print(json.dumps(health_data, indent=2, ensure_ascii=False))
        
        # Check if ML models are loaded
        ml_health = health_data.get("system_health", {}).get("ml_health", {})
        if ml_health:
            models_loaded = ml_health.get("models_loaded", False)
            print(f"🤖 ML Models loaded: {'✅' if models_loaded else '❌'}")
        
        return True
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return False

if __name__ == "__main__":
    print(f"🚀 Starting anomaly detection test with mode: {TEST_MODE}")
    print(f"📍 Testing methods: {parse_test_modes(TEST_MODE)}")
    
    # Test health endpoint first
    if not test_health_endpoint():
        print("⚠️  Health check failed, but continuing with tests...")
    
    print(f"\n🔄 Testing with {len(values)} data points...")
    
    for i, v in enumerate(values, 1):
        send_request(i, v)
        if i < len(values):  # Don't sleep after the last request
            print(f"⏳ Waiting 20 seconds before next request...")
            time.sleep(20)
    
    print("\n✅ All tests completed!")