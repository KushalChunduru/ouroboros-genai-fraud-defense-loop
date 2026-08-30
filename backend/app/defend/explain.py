from app.defend.detector import ScoreBundle
from app.generate.narrative_agent import generate_explanation


def explain_transaction(t: dict, bundle: ScoreBundle) -> str:
    # Only the three bounded [0,1] fusion components compete for "top signal" --
    # raw counts (fanout, velocity) are supporting context, not comparable
    # magnitudes, and would otherwise always dominate a naive max().
    signals = {
        "tabular_behavior_score": round(bundle.gbm, 3),
        "graph_shared_infrastructure_score": round(bundle.graph, 3),
        "content_language_score": round(bundle.content, 3),
    }
    context = {
        "velocity_1h": t["velocity_1h"],
        "device_fanout": t["device_fanout_raw"],
        "session_novelty": t["session_novelty"],
    }
    return generate_explanation(signals, bundle.fused, t.get("attack_vector_name"), context)
