"""Fused detector: gradient-boosted tabular model + graph propagation model +
lightweight content model, combined into one fused risk score.

This mirrors, at hackathon scale, the shape of Mastercard's own Decision
Intelligence Pro architecture: a transformer/sequence model over transaction
features PLUS relationship (graph) signals between entities, rather than a
plain row-level classifier.
"""
from dataclasses import dataclass

import numpy as np
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.metrics import average_precision_score

from app.defend.features import build_feature_matrix, content_score
from app.defend.graph_model import GraphRiskModel

FUSION_WEIGHTS = {"gbm": 0.55, "graph": 0.30, "content": 0.15}
DECISION_THRESHOLD = 0.5


@dataclass
class ScoreBundle:
    gbm: float
    graph: float
    content: float
    fused: float


class FusedDetector:
    def __init__(self):
        self.gbm = HistGradientBoostingClassifier(max_depth=6, max_iter=150, learning_rate=0.08, random_state=42)
        self.graph_model = GraphRiskModel()
        self._fitted = False

    def fit(self, train_transactions: list[dict]):
        X = build_feature_matrix(train_transactions)
        y = np.array([1 if t["is_attack"] else 0 for t in train_transactions])
        if len(set(y.tolist())) < 2:
            # degenerate all-one-class batch; fall back to a trivial always-legit model
            self._degenerate_label = int(y[0]) if len(y) else 0
            self._fitted = "degenerate"
        else:
            self.gbm.fit(X, y)
            self._fitted = True
        self.graph_model.fit(train_transactions)
        return self

    def score(self, transactions: list[dict]) -> list[ScoreBundle]:
        X = build_feature_matrix(transactions)
        if self._fitted == "degenerate":
            gbm_scores = np.full(len(transactions), float(self._degenerate_label))
        else:
            gbm_scores = self.gbm.predict_proba(X)[:, 1]
        graph_scores = self.graph_model.score(transactions)
        content_scores = [content_score(t.get("narrative_text")) for t in transactions]

        bundles = []
        for g, gr, c in zip(gbm_scores, graph_scores, content_scores):
            fused = FUSION_WEIGHTS["gbm"] * g + FUSION_WEIGHTS["graph"] * gr + FUSION_WEIGHTS["content"] * c
            bundles.append(ScoreBundle(gbm=float(g), graph=float(gr), content=float(c), fused=float(fused)))
        return bundles

    def feature_importance(self) -> dict[str, float]:
        if self._fitted != True:
            return {}
        try:
            from sklearn.inspection import permutation_importance  # noqa: F401
        except Exception:
            return {}
        return {}


def compute_metrics(y_true: list[bool], y_pred: list[bool], y_score: list[float]) -> dict:
    y_true_arr = np.array(y_true, dtype=int)
    y_pred_arr = np.array(y_pred, dtype=int)
    y_score_arr = np.array(y_score, dtype=float)

    tp = int(np.sum((y_true_arr == 1) & (y_pred_arr == 1)))
    fp = int(np.sum((y_true_arr == 0) & (y_pred_arr == 1)))
    fn = int(np.sum((y_true_arr == 1) & (y_pred_arr == 0)))
    tn = int(np.sum((y_true_arr == 0) & (y_pred_arr == 0)))

    precision = tp / (tp + fp) if (tp + fp) else 0.0
    recall = tp / (tp + fn) if (tp + fn) else 0.0
    f1 = 2 * precision * recall / (precision + recall) if (precision + recall) else 0.0
    fpr = fp / (fp + tn) if (fp + tn) else 0.0
    try:
        pr_auc = float(average_precision_score(y_true_arr, y_score_arr)) if len(set(y_true_arr.tolist())) > 1 else 0.0
    except Exception:
        pr_auc = 0.0

    return {
        "precision": round(precision, 4),
        "recall": round(recall, 4),
        "f1": round(f1, 4),
        "pr_auc": round(pr_auc, 4),
        "false_positive_rate": round(fpr, 4),
        "n": int(len(y_true_arr)),
    }
