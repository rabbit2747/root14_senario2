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


def evaluate():
    result = {}
    for stage, spec in RULES.items():
        if "any_of" in spec:
            result[stage] = any(rule_matches(rule) for rule in spec["any_of"])
        elif "all_of" in spec:
            result[stage] = all(rule_matches(rule) for rule in spec["all_of"])
        else:
            result[stage] = False
    result["score"] = sum(1 for key, value in result.items() if key != "score" and value)
    return result


@app.get("/healthz")
def healthz():
    return "ok"


@app.get("/status")
def status():
    return jsonify(evaluate())


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=9000)
