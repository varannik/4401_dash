from typing import Dict, Any, Optional
import json
import re
import pandas as pd

"""
AlarmContextProcessor handles both Excel extraction (to JSON) and context lookup (from JSON).
"""

class AlarmContextProcessor:
    def __init__(self, alarm_context: Optional[Dict[str, Any]] = None):
        self.alarm_context = alarm_context or {}

    def clean_text(self, text: Any) -> str:
        """Clean whitespace from text fields."""
        if isinstance(text, str):
            return re.sub(r'\s+', ' ', text.strip())
        return ""

    @staticmethod
    def create_json_from_excel(excel_path: str, output_json_path: str) -> None:
        """One-off: extract alarm context from Excel file and save to JSON."""

        def clean_text(text: Any) -> str:
            if isinstance(text, str):
                return re.sub(r'\s+', ' ', text.strip())
            return ""

        df = pd.read_excel(excel_path)
        df.columns = [clean_text(col) for col in df.columns]
        df = df.map(clean_text)

        result: Dict[str, Any] = {}
        for _, row in df.iterrows():
            tag = row["Process Tag"]
            alarm_type = row["Alarm type"]
            cause = row["Cause of Alarm"]
            actions = row["Action by Operations Team"]

            entry = {"Cause": cause, "Actions": actions}
            result.setdefault(tag, {})[alarm_type] = entry

        with open(output_json_path, "w", encoding="utf-8") as f:
            json.dump(result, f, indent=2)

    @classmethod
    def from_json_file(cls, context_path: str) -> "AlarmContextProcessor":
        """Load alarm context from a JSON file."""
        with open(context_path, "r", encoding="utf-8") as f:
            context = json.load(f)
        return cls(context)

    def lookup_context(self, var: str, alarm_label: str) -> Dict[str, str]:
        """Return {"Cause": str, "Actions": str} or {} if not found."""
        var_ctx = self.alarm_context.get(var)
        if not isinstance(var_ctx, dict):
            return {}
        bucket = var_ctx.get(alarm_label)
        if not isinstance(bucket, dict):
            return {}

        return {
            "Cause": bucket.get("Cause", ""),
            "Actions": bucket.get("Actions", "")
        }
