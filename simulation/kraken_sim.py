#!/usr/bin/env python3
# Kraken Simulation (stub) — runs planner -> builder -> policy and logs events.
import os, sys, json, datetime, importlib.util

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
LOGS = os.path.join(ROOT, "logs")
os.makedirs(LOGS, exist_ok=True)

def _load(module_path):
    spec = importlib.util.spec_from_file_location("mod", module_path)
    if not spec or not spec.loader: return None
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod

def safe_log(component, message, data=None):
    logger_path = os.path.join(ROOT, "logging", "meta_logger.py")
    event = {
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "component": component,
        "message": message,
        "data": data or {}
    }
    try:
        if os.path.exists(logger_path):
            logger = _load(logger_path)
            if hasattr(logger, "log_event"):
                logger.log_event(component, message, data or {})
                return event
    except Exception:
        pass
    with open(os.path.join(ROOT, "logs", "meta.log"), "a", encoding="utf-8") as f:
        f.write(json.dumps(event, ensure_ascii=False) + "\n")
    return event

def main():
    feature = "Legg til ruteplanlegger for selger"
    if len(sys.argv) > 1:
        feature = " ".join(sys.argv[1:])

    planner_path = os.path.join(ROOT, "services", "builder", "planner.py")
    builder_path = os.path.join(ROOT, "services", "builder", "builder.py")
    policy_path  = os.path.join(ROOT, "services", "builder", "policy.py")

    events = []

    plan = {"feature": feature, "subtasks": ["Analyse behov","Design forslag","Kode stub","Test stub","Review & merge"]}
    try:
        if os.path.exists(planner_path):
            planner = _load(planner_path)
            if hasattr(planner, "plan"):
                plan = planner.plan(feature)
    except Exception:
        pass
    events.append(safe_log("planner", "Generated plan", {"feature": feature, "subtasks": plan.get("subtasks", [])}))

    proposal = {"plan": plan, "proposed_diff": "// pseudo-code", "status":"proposed"}
    try:
        if os.path.exists(builder_path):
            builder = _load(builder_path)
            if hasattr(builder, "build"):
                proposal = builder.build(plan)
    except Exception:
        pass
    events.append(safe_log("builder", "Proposed diff", {"summary": proposal.get("proposed_diff","// pseudo")}))

    decision = {"decision":"approved","reason":"stub"}
    try:
        if os.path.exists(policy_path):
            policy = _load(policy_path)
            if hasattr(policy, "evaluate"):
                decision = policy.evaluate(proposal)
    except Exception:
        pass
    events.append(safe_log("policy", decision.get("decision","approved"), {"reason": decision.get("reason","stub")}))

    role_linker_path = os.path.join(ROOT, "services", "meta", "role_linker.py")
    role = "unknown"
    try:
        if os.path.exists(role_linker_path):
            role_linker = _load(role_linker_path)
            if hasattr(role_linker, "match_role"):
                role = role_linker.match_role(feature)
    except Exception:
        pass
    events.append(safe_log("role_linker", "Matched role", {"role": role}))

    sim_out = {
        "feature": feature,
        "plan": plan,
        "proposal": proposal,
        "decision": decision,
        "role": role,
        "events": events,
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z"
    }
    with open(os.path.join(LOGS, "kraken_sim.json"), "w", encoding="utf-8") as f:
        json.dump(sim_out, f, indent=2, ensure_ascii=False)
    print("Wrote logs/kraken_sim.json")

if __name__ == "__main__":
    main()
