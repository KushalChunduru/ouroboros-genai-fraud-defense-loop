"""Fidelity Lab: proves the entity-conditioning claim with computed numbers
instead of citing a paper and asserting it applies here.

arXiv:2604.13125 showed row-independent tabular generators (CTGAN, TVAE,
GaussianCopula) destroy exactly three signals fraud detection depends on:
temporal burst clustering, device/IP fan-out concentration, and velocity-rule
calibration -- because they sample each row independently, with no memory of
an entity's prior transactions.

To test whether OUR generator actually avoids that failure, this module
builds the naive-generator baseline the paper describes -- not by training a
GAN, but by taking our own entity-conditioned batch and independently
shuffling the structural columns (entity_id, device_id, ip_subnet, timestamp)
across rows. That operation is mathematically exactly what a row-independent
generator does: it preserves every column's marginal distribution perfectly
(same amounts, same categories, same counts) while destroying all
cross-column joint structure. Comparing our real batch against this shuffled
twin isolates precisely the effect entity-conditioning is supposed to have.
"""
import random
from collections import defaultdict
from datetime import datetime


def _fano_factor(transactions: list[dict]) -> float:
    """Variance/mean of transaction counts in (device, 10-minute) buckets.
    Device is the right grouping key, not entity: most attacker entities in
    this simulator are single-shot (a fresh synthetic identity per attack
    transaction), so the actual burst signature -- many transactions in quick
    succession -- shows up as many DIFFERENT entities hitting the SAME shared
    device in a short window, not one entity repeating. A value near 1 means
    activity is memoryless/Poisson-like (no bursts); well above 1 means
    coordinated bursts through shared infrastructure -- exactly the signal
    naive per-row shuffling (which reassigns device_id independent of time)
    destroys."""
    counts: dict[tuple, int] = defaultdict(int)
    for t in transactions:
        ts = datetime.fromisoformat(t["timestamp"])
        bucket = ts.replace(minute=(ts.minute // 10) * 10, second=0, microsecond=0)
        counts[(t["device_id"], bucket.isoformat())] += 1
    values = list(counts.values())
    if not values:
        return 0.0
    mean = sum(values) / len(values)
    if mean == 0:
        return 0.0
    variance = sum((v - mean) ** 2 for v in values) / len(values)
    return variance / mean


def _single_owner_device_fraction(transactions: list[dict]) -> float:
    """Fraction of devices used by exactly one entity -- the customer-loyalty
    signature (a real person's phone/browser stays theirs across repeat
    visits) that lets a detector treat a device shared by many entities as
    suspicious in the first place. Independently shuffling entity_id and
    device_id preserves each column's marginal distribution but randomly
    re-pairs them, so a legitimate customer's device that appears N times in
    the data gets scattered across up to N different (fake) owners -- an
    ordinary repeat customer starts looking exactly like a fraud ring, for
    every device visited more than once. This is arguably a bigger practical
    failure than fabricating fraud badly: it corrupts the negative class."""
    device_entities: dict[str, set] = defaultdict(set)
    for t in transactions:
        device_entities[t["device_id"]].add(t["entity_id"])
    if not device_entities:
        return 0.0
    single_owner = sum(1 for entities in device_entities.values() if len(entities) == 1)
    return single_owner / len(device_entities)


def _velocity_exceed_rate(transactions: list[dict], threshold: int = 4) -> float:
    """Fraction of (device, hour) buckets exceeding a naive velocity rule
    (>threshold transactions/hour on one device) -- the calibration signal a
    rules engine's thresholds are tuned against. Device, not entity, for the
    same single-shot-entity reason as the burstiness metric above."""
    counts: dict[tuple, int] = defaultdict(int)
    for t in transactions:
        ts = datetime.fromisoformat(t["timestamp"])
        counts[(t["device_id"], ts.strftime("%Y-%m-%dT%H"))] += 1
    if not counts:
        return 0.0
    exceeding = sum(1 for v in counts.values() if v > threshold)
    return exceeding / len(counts)


def naive_shuffle(transactions: list[dict], seed: int = 0) -> list[dict]:
    """Independently permutes the structural columns across rows. Preserves
    every column's marginal distribution exactly (same amounts, categories,
    devices, timestamps overall) while destroying all cross-column joint
    structure -- mathematically what a row-independent tabular generator
    produces, without needing to actually train one."""
    rng = random.Random(seed)
    shuffled = [dict(t) for t in transactions]
    for key in ("entity_id", "device_id", "ip_subnet", "timestamp"):
        values = [t[key] for t in shuffled]
        rng.shuffle(values)
        for row, v in zip(shuffled, values):
            row[key] = v
    return shuffled


def compute_fidelity_report(transactions: list[dict], seed: int = 0) -> dict:
    naive = naive_shuffle(transactions, seed=seed)

    real = {
        "burstiness_fano_factor": round(_fano_factor(transactions), 3),
        "single_owner_device_fraction": round(_single_owner_device_fraction(transactions), 3),
        "velocity_exceed_rate": round(_velocity_exceed_rate(transactions), 4),
    }
    baseline = {
        "burstiness_fano_factor": round(_fano_factor(naive), 3),
        "single_owner_device_fraction": round(_single_owner_device_fraction(naive), 3),
        "velocity_exceed_rate": round(_velocity_exceed_rate(naive), 4),
    }
    return {"entity_conditioned": real, "naive_baseline": baseline, "n": len(transactions)}
