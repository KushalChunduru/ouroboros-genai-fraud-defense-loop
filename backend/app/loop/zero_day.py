"""Zero-day discovery agent: closes the loop back into Pillar 1 (Identify).

Runs unsupervised outlier detection (Isolation Forest) restricted to
transactions the CURRENT fused detector already considers low-risk -- i.e.
the defender's blind spot -- clusters the resulting anomalies, and asks an
LLM reasoning agent to draft a natural-language hypothesis for a new,
not-yet-catalogued attack pattern per cluster. This makes taxonomy growth an
automated output of the system rather than a one-time research document.
"""
import uuid
from collections import Counter

import numpy as np
from sklearn.cluster import KMeans
from sklearn.ensemble import IsolationForest

from app.defend.detector import FusedDetector
from app.defend.features import build_feature_matrix
from app.generate.narrative_agent import generate_zero_day_hypothesis


def discover_zero_day_patterns(transactions: list[dict], detector: FusedDetector,
                                blind_spot_threshold: float = 0.5,
                                anomaly_fraction: float = 0.15,
                                max_clusters: int = 3) -> list[dict]:
    bundles = detector.score(transactions)
    candidates = [t for t, b in zip(transactions, bundles) if b.fused < blind_spot_threshold]
    if len(candidates) < 6:
        return []

    X = build_feature_matrix(candidates)
    iso = IsolationForest(contamination=min(0.3, max(0.05, anomaly_fraction)), random_state=42)
    iso.fit(X)
    anomaly_scores = -iso.score_samples(X)  # higher = more anomalous
    n_anomalous = max(3, int(len(candidates) * anomaly_fraction))
    top_idx = np.argsort(anomaly_scores)[-n_anomalous:]

    anomalous_txns = [candidates[i] for i in top_idx]
    anomalous_scores = anomaly_scores[top_idx]
    X_anom = build_feature_matrix(anomalous_txns)

    k = min(max_clusters, max(1, len(anomalous_txns) // 4))
    labels = KMeans(n_clusters=k, n_init=4, random_state=42).fit_predict(X_anom) if k > 1 else np.zeros(len(anomalous_txns), dtype=int)

    hypotheses = []
    for cluster_id in sorted(set(labels.tolist())):
        members = [t for t, lab in zip(anomalous_txns, labels) if lab == cluster_id]
        member_scores = [s for s, lab in zip(anomalous_scores, labels) if lab == cluster_id]
        if not members:
            continue
        channels = Counter(t["channel"] for t in members)
        categories = Counter(t["merchant_category"] for t in members)
        stats = {
            "size": len(members),
            "mean_amount": float(np.mean([t["amount"] for t in members])),
            "channel": channels.most_common(1)[0][0],
            "category": categories.most_common(1)[0][0],
            "fanout": float(np.mean([t["device_fanout_raw"] for t in members])),
            "novelty": float(np.mean([t["session_novelty"] for t in members])),
        }
        hypothesis_text = generate_zero_day_hypothesis(stats)
        hypotheses.append({
            "cluster_id": f"zd_{uuid.uuid4().hex[:6]}",
            "size": stats["size"],
            "mean_amount": round(stats["mean_amount"], 2),
            "dominant_channel": stats["channel"],
            "dominant_merchant_category": stats["category"],
            "hypothesis": hypothesis_text,
            "confidence": round(float(min(1.0, np.mean(member_scores) / (np.max(anomaly_scores) + 1e-6))), 3),
        })
    return hypotheses
