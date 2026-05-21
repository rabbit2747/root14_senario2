import json
import re
from pathlib import Path

import yaml
from flask import Flask, jsonify


LOG_ROOT = Path("/logs")
RULES = yaml.safe_load(Path("/app/rules.yaml").read_text(encoding="utf-8"))
app = Flask(__name__)


def iter_log(relative: str):
    path = LOG_ROOT / relative
    if not path.exists():
        return
    for line in path.read_text(encoding="utf-8", errors="ignore").splitlines():
        try:
            yield json.loads(line)
        except json.JSONDecodeError:
            continue


def rule_matches(rule: dict) -> bool:
    for record in iter_log(rule["log"]) or []:
        if record.get("event") != rule.get("event"):
            continue
        if "where" in rule and not all(record.get(k) == v for k, v in rule["where"].items()):
            continue
        if "sample_regex" in rule and not re.search(rule["sample_regex"], str(record.get("sample", ""))):
            continue
        return True
    return False


def stage_matches(spec: dict) -> bool:
    if "any_of" in spec:
        return any(rule_matches(rule) for rule in spec["any_of"])
    if "all_of" in spec:
        return all(rule_matches(rule) for rule in spec["all_of"])
    return False


def evaluate():
    result = {"stages": {}, "paths": {}, "bonuses": {}}
    score = 0
    max_score = 0
    for stage, spec in RULES.items():
        matched = stage_matches(spec)
        points = int(spec.get("points", 1))
        max_score += points
        if matched:
            score += points

        bucket = "bonuses" if stage.startswith("bonus_") else "stages"
        result[bucket][stage] = {
            "matched": matched,
            "points": points if matched else 0,
            "max_points": points,
            "label": spec.get("label", stage),
        }
        result[stage] = matched

    result["paths"]["stage2_support_path"] = result["stages"].get("stage2a_support_evidence", {}).get("matched", False)
    result["paths"]["stage2_rce_path"] = result["stages"].get("stage2b_rce_evidence", {}).get("matched", False)
    result["stage1_ssti"] = result["stages"].get("stage1_ssti", {}).get("matched", False)
    result["stage2_evidence"] = result["paths"]["stage2_support_path"] or result["paths"]["stage2_rce_path"]
    result["stage3_wiki"] = result["stages"].get("stage3_wiki", {}).get("matched", False)
    result["score"] = score
    result["max_score"] = max_score
    return result


@app.get("/healthz")
def healthz():
    return "ok"


@app.get("/status")
def status():
    return jsonify(evaluate())


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=9000)
