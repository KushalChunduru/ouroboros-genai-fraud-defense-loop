"""Layer B of the Generate pillar: entity-conditioned behavioral simulator.

Unlike row-independent tabular generators (CTGAN/TVAE/GaussianCopula), which a
2026 benchmark (arXiv:2604.13125) showed are 17x-100x worse than real data at
preserving temporal burst autocorrelation, device/IP graph fan-out motifs, and
velocity-rule calibration, this simulator gives every entity persistent state
(known devices, home merchant categories, typical amount distribution, session
history) and samples each transaction CONDITIONED on that entity's running
state. Attack vectors are implemented as explicit behavioral programs that
mutate entity state over time (bursts, device sharing, session anomalies)
rather than i.i.d. draws from a marginal distribution.
"""
import random
import uuid
from datetime import datetime, timedelta

from faker import Faker

from app.generate.narrative_agent import generate_narrative

fake = Faker()

MERCHANT_CATEGORIES = [
    "grocery", "electronics", "travel", "digital_goods", "fashion",
    "food_delivery", "utilities", "gaming", "crypto_exchange", "jewelry",
]
COUNTRIES = ["US", "GB", "IN", "DE", "SG", "BR", "NG", "AE"]
CHANNEL_BY_TAXONOMY = {
    "ecommerce_cnp": "ecommerce_cnp",
    "agentic_checkout": "agentic_checkout",
    "ivr_call_center": "ivr_call_center",
    "p2p_wallet": "p2p_wallet",
    "atm": "atm",
}


class Entity:
    """Persistent per-cardholder/agent state the simulator conditions on."""

    def __init__(self, entity_id: str, rng: random.Random):
        self.entity_id = entity_id
        self.home_country = rng.choice(COUNTRIES)
        self.home_categories = rng.sample(MERCHANT_CATEGORIES, k=rng.randint(1, 3))
        self.avg_amount = rng.uniform(15, 220)
        self.amount_sigma = self.avg_amount * 0.35
        self.devices = [f"dev_{uuid.uuid4().hex[:8]}"]
        self.ip_subnet = f"{rng.randint(1,223)}.{rng.randint(0,255)}.{rng.randint(0,255)}.0/24"
        self.history: list[datetime] = []

    def sample_amount(self, rng: random.Random) -> float:
        return max(1.0, rng.gauss(self.avg_amount, self.amount_sigma))

    def sample_device(self, rng: random.Random, new_device_p: float = 0.03) -> str:
        if rng.random() < new_device_p:
            d = f"dev_{uuid.uuid4().hex[:8]}"
            self.devices.append(d)
            return d
        return rng.choice(self.devices)


def _base_txn(entity: Entity, ts: datetime, amount: float, merchant_category: str,
              device_id: str, channel: str, rng: random.Random) -> dict:
    entity.history.append(ts)
    return {
        "id": f"txn_{uuid.uuid4().hex[:10]}",
        "entity_id": entity.entity_id,
        "timestamp": ts.isoformat(),
        "amount": round(amount, 2),
        "merchant_id": f"m_{uuid.uuid4().hex[:6]}",
        "merchant_category": merchant_category,
        "device_id": device_id,
        "ip_subnet": entity.ip_subnet,
        "channel": channel,
        "country": entity.home_country,
        "session_novelty": round(rng.uniform(0.0, 0.15), 3),
        "tool_call_burst": round(rng.uniform(0.0, 0.1), 3),
        "is_attack": False,
        "attack_vector_id": None,
        "attack_vector_name": None,
        "narrative_text": None,
    }


def generate_legit_batch(n: int, start: datetime, span_hours: int, rng: random.Random) -> list[dict]:
    entities = [Entity(f"ent_{uuid.uuid4().hex[:8]}", rng) for _ in range(max(1, n // 6))]

    # Realistic hard negatives: shared household/office devices across a few
    # entities, so device fan-out alone isn't a perfect legit/attack separator.
    # Needs at least 2 entities -- skipped for tiny batches (e.g. single
    # sample-transaction requests) rather than crashing.
    if len(entities) >= 2:
        for _ in range(max(1, len(entities) // 12)):
            a, b = rng.sample(entities, 2)
            shared = rng.choice(a.devices)
            b.devices.append(shared)

    out = []
    for _ in range(n):
        entity = rng.choice(entities)
        ts = start + timedelta(seconds=rng.uniform(0, span_hours * 3600))
        category = rng.choice(entity.home_categories) if rng.random() < 0.8 else rng.choice(MERCHANT_CATEGORIES)
        device = entity.sample_device(rng, new_device_p=0.06)
        channel = "ecommerce_cnp" if rng.random() < 0.65 else rng.choice(
            ["p2p_wallet", "atm", "ivr_call_center", "agentic_checkout"]
        )
        # Occasional legit outlier: one-off large purchase or unusually
        # exploratory session, so the decision boundary has real overlap.
        if rng.random() < 0.06:
            amount = entity.sample_amount(rng) * rng.uniform(2.5, 5.0)
        else:
            amount = entity.sample_amount(rng)
        txn = _base_txn(entity, ts, amount, category, device, channel, rng)
        if rng.random() < 0.05:
            txn["session_novelty"] = round(rng.uniform(0.2, 0.45), 3)
        if channel == "agentic_checkout" and rng.random() < 0.15:
            txn["tool_call_burst"] = round(rng.uniform(0.1, 0.3), 3)
        out.append(txn)
    return out


def _mutate_for_evasion(profile: dict, evasion_level: float) -> dict:
    """Self-play hook: as evasion_level rises, attack behavior drifts toward
    the legit distribution (tighter amounts, lower fan-out, longer spacing),
    modeling an adaptive attacker responding to a defender it keeps losing to."""
    p = dict(profile)
    p["burst_spacing_s"] = p["burst_spacing_s"] * (1 + 3 * evasion_level)
    p["fanout_devices"] = max(1, int(p["fanout_devices"] * (1 - 0.6 * evasion_level)))
    p["amount_jitter"] = p["amount_jitter"] * (1 - 0.5 * evasion_level)
    p["session_novelty_boost"] = p["session_novelty_boost"] * (1 - 0.5 * evasion_level)
    return p


ATTACK_PROFILES = {
    "deepfake_voice_ivr": dict(burst_spacing_s=1, fanout_devices=1, amount_jitter=0.5,
                                session_novelty_boost=0.15, amount_mult=2.4, channel="ivr_call_center"),
    "deepfake_video_executive": dict(burst_spacing_s=1, fanout_devices=1, amount_jitter=0.35,
                                      session_novelty_boost=0.12, amount_mult=6.0, channel="p2p_wallet"),
    "agentic_checkout_hijack": dict(burst_spacing_s=30, fanout_devices=1, amount_jitter=0.35,
                                     session_novelty_boost=0.55, amount_mult=1.6, channel="agentic_checkout"),
    "agentic_carding_burst": dict(burst_spacing_s=45, fanout_devices=6, amount_jitter=0.15,
                                   session_novelty_boost=0.3, amount_mult=0.2, channel="agentic_checkout"),
    "llm_low_slow_carding": dict(burst_spacing_s=280, fanout_devices=8, amount_jitter=0.15,
                                  session_novelty_boost=0.18, amount_mult=0.15, channel="ecommerce_cnp"),
    "synthetic_identity_origination": dict(burst_spacing_s=3600, fanout_devices=1, amount_jitter=0.2,
                                            session_novelty_boost=0.22, amount_mult=3.2, channel="ecommerce_cnp"),
    "romance_pig_butchering_bot": dict(burst_spacing_s=7200, fanout_devices=1, amount_jitter=0.25,
                                        session_novelty_boost=0.12, amount_mult=2.8, channel="p2p_wallet"),
    "faas_phishing_kit": dict(burst_spacing_s=600, fanout_devices=3, amount_jitter=0.25,
                               session_novelty_boost=0.2, amount_mult=1.4, channel="ecommerce_cnp"),
    "ai_dispute_narrative_abuse": dict(burst_spacing_s=1800, fanout_devices=1, amount_jitter=0.2,
                                        session_novelty_boost=0.06, amount_mult=1.15, channel="ecommerce_cnp"),
    "mule_network_llm_routing": dict(burst_spacing_s=900, fanout_devices=5, amount_jitter=0.2,
                                      session_novelty_boost=0.12, amount_mult=1.8, channel="p2p_wallet"),
    "voice_biometric_spoofing": dict(burst_spacing_s=1, fanout_devices=1, amount_jitter=0.2,
                                      session_novelty_boost=0.18, amount_mult=1.4, channel="ivr_call_center"),
    "synthetic_card_data_gan": dict(burst_spacing_s=15, fanout_devices=10, amount_jitter=0.1,
                                     session_novelty_boost=0.22, amount_mult=0.18, channel="ecommerce_cnp"),
    "agent_credential_exfil": dict(burst_spacing_s=20, fanout_devices=1, amount_jitter=0.25,
                                    session_novelty_boost=0.5, amount_mult=1.25, channel="agentic_checkout"),
    "atm_deepfake_video_auth": dict(burst_spacing_s=1, fanout_devices=1, amount_jitter=0.35,
                                     session_novelty_boost=0.12, amount_mult=2.3, channel="atm"),
    "wallet_sim_swap_genai": dict(burst_spacing_s=1, fanout_devices=1, amount_jitter=0.25,
                                   session_novelty_boost=0.18, amount_mult=2.6, channel="p2p_wallet"),
}


def generate_attack_batch(vector: dict, n: int, start: datetime, span_hours: int,
                           rng: random.Random, evasion_level: float = 0.0,
                           with_narrative_every: int = 5) -> list[dict]:
    profile = ATTACK_PROFILES.get(vector["id"])
    if profile is None:
        profile = dict(burst_spacing_s=60, fanout_devices=2, amount_jitter=0.2,
                        session_novelty_boost=0.3, amount_mult=2.0, channel="ecommerce_cnp")
    profile = _mutate_for_evasion(profile, evasion_level)

    shared_devices = [f"dev_{uuid.uuid4().hex[:8]}" for _ in range(profile["fanout_devices"])]
    shared_ip = f"{rng.randint(1,223)}.{rng.randint(0,255)}.{rng.randint(0,255)}.0/24"

    out = []
    t = start + timedelta(seconds=rng.uniform(0, span_hours * 3600 * 0.6))
    for i in range(n):
        entity = Entity(f"ent_{uuid.uuid4().hex[:8]}", rng)
        entity.ip_subnet = shared_ip if rng.random() < 0.55 else entity.ip_subnet
        # A fraction of attackers rotate a throwaway device instead of reusing
        # ring infrastructure, so the graph signal alone can't catch everything.
        device = f"dev_{uuid.uuid4().hex[:8]}" if rng.random() < 0.2 else rng.choice(shared_devices)
        category = rng.choice(MERCHANT_CATEGORIES)
        base_amount = entity.avg_amount * profile["amount_mult"]
        amount = max(0.5, rng.gauss(base_amount, base_amount * profile["amount_jitter"] + 0.01))

        txn = _base_txn(entity, t, amount, category, device, profile["channel"], rng)
        txn["is_attack"] = True
        txn["attack_vector_id"] = vector["id"]
        txn["attack_vector_name"] = vector["name"]
        novelty_boost = profile["session_novelty_boost"] * rng.uniform(0.6, 1.3)
        txn["session_novelty"] = round(min(1.0, max(0.0, rng.gauss(0.1, 0.05) + novelty_boost)), 3)
        burst_boost = 0.55 if vector["channel"] == "agentic_checkout" else 0.05
        txn["tool_call_burst"] = round(min(1.0, max(0.0, rng.gauss(0.05, 0.05) + burst_boost * rng.uniform(0.5, 1.2))), 3)
        if with_narrative_every and i % with_narrative_every == 0:
            txn["narrative_text"] = generate_narrative(vector, entity_id=entity.entity_id)
        out.append(txn)

        t = t + timedelta(seconds=max(0.5, rng.gauss(profile["burst_spacing_s"], profile["burst_spacing_s"] * 0.3 + 0.1)))
    return out


def compute_post_hoc_features(transactions: list[dict]) -> list[dict]:
    """Second pass that adds features an entity-aware detector would compute
    from the transaction log itself: trailing velocity and device fan-out.
    Kept separate from generation so the SAME feature code path can later be
    reused unmodified on real production logs."""
    by_entity: dict[str, list[dict]] = {}
    by_device: dict[str, set] = {}
    for t in transactions:
        by_entity.setdefault(t["entity_id"], []).append(t)
        by_device.setdefault(t["device_id"], set()).add(t["entity_id"])

    for t in transactions:
        ts = datetime.fromisoformat(t["timestamp"])
        window = [
            o for o in by_entity[t["entity_id"]]
            if 0 <= (ts - datetime.fromisoformat(o["timestamp"])).total_seconds() <= 3600
        ]
        t["velocity_1h"] = len(window)
        t["device_fanout_raw"] = len(by_device[t["device_id"]])
    return transactions


def simulate(taxonomy: list[dict], attack_ids: list[str], n_legit: int, n_attack_per_vector: int,
             evasion_level: float = 0.0, seed: int | None = None,
             evasion_by_vector: dict[str, float] | None = None) -> list[dict]:
    rng = random.Random(seed)
    start = datetime.utcnow() - timedelta(days=1)
    span_hours = 24

    vectors = [v for v in taxonomy if v["id"] in attack_ids] if attack_ids else taxonomy

    txns = generate_legit_batch(n_legit, start, span_hours, rng)
    for v in vectors:
        vector_evasion = (evasion_by_vector or {}).get(v["id"], evasion_level)
        txns.extend(generate_attack_batch(v, n_attack_per_vector, start, span_hours, rng, vector_evasion))

    rng.shuffle(txns)
    txns = compute_post_hoc_features(txns)
    return txns
