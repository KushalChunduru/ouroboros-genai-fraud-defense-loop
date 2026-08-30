import math
from datetime import datetime

import numpy as np

MERCHANT_CATEGORIES = [
    "grocery", "electronics", "travel", "digital_goods", "fashion",
    "food_delivery", "utilities", "gaming", "crypto_exchange", "jewelry",
]
CHANNELS = ["ecommerce_cnp", "agentic_checkout", "ivr_call_center", "p2p_wallet", "atm"]

FEATURE_NAMES = (
    ["log_amount", "velocity_1h", "device_fanout_raw", "session_novelty", "tool_call_burst", "hour_of_day"]
    + [f"cat_{c}" for c in MERCHANT_CATEGORIES]
    + [f"chan_{c}" for c in CHANNELS]
)


def transaction_to_vector(t: dict) -> np.ndarray:
    hour = datetime.fromisoformat(t["timestamp"]).hour
    base = [
        math.log1p(t["amount"]),
        float(t["velocity_1h"]),
        float(t["device_fanout_raw"]),
        float(t["session_novelty"]),
        float(t["tool_call_burst"]),
        float(hour),
    ]
    cat_onehot = [1.0 if t["merchant_category"] == c else 0.0 for c in MERCHANT_CATEGORIES]
    chan_onehot = [1.0 if t["channel"] == c else 0.0 for c in CHANNELS]
    return np.array(base + cat_onehot + chan_onehot, dtype=float)


def build_feature_matrix(transactions: list[dict]) -> np.ndarray:
    return np.vstack([transaction_to_vector(t) for t in transactions])


_URGENCY_LEXICON = [
    "urgent", "immediately", "before my trip", "verify now", "avoid suspension", "confirm once",
    "never told anyone", "trust", "resend", "without further confirmation", "automatically approved",
    "flagged", "suspended", "wire", "within the hour",
]


def content_score(narrative_text: str | None) -> float:
    """Lightweight lexicon heuristic standing in for a fine-tuned GenAI-content
    classifier: scores urgency/social-engineering/exfil language density.
    In production this slot is where a fine-tuned classifier head would sit."""
    if not narrative_text:
        return 0.0
    text = narrative_text.lower()
    hits = sum(1 for kw in _URGENCY_LEXICON if kw in text)
    return float(min(1.0, hits / 4.0))
