from typing import Optional
from pydantic import BaseModel


class GenerateRequest(BaseModel):
    attack_ids: list[str] = []
    n_legit: int = 400
    n_attack_per_vector: int = 60
    evasion_level: float = 0.0  # 0..1, how hard the round should be (used by self-play)
    seed: Optional[int] = None


class Transaction(BaseModel):
    id: str
    entity_id: str
    timestamp: str
    amount: float
    merchant_id: str
    merchant_category: str
    device_id: str
    ip_subnet: str
    channel: str
    country: str
    velocity_1h: int
    device_fanout_raw: int
    session_novelty: float
    tool_call_burst: float
    narrative_text: Optional[str] = None
    is_attack: bool
    attack_vector_id: Optional[str] = None
    attack_vector_name: Optional[str] = None


class GenerateResponse(BaseModel):
    batch_id: str
    transactions: list[Transaction]
    narratives_sample: list[dict]
    counts: dict


class DetectRequest(BaseModel):
    batch_id: Optional[str] = None
    transactions: Optional[list[Transaction]] = None
    retrain: bool = False


class ScoredTransaction(BaseModel):
    id: str
    fused_score: float
    gbm_score: float
    graph_score: float
    content_score: float
    predicted_attack: bool
    is_attack: bool
    attack_vector_id: Optional[str] = None
    explanation: str


class Metrics(BaseModel):
    precision: float
    recall: float
    f1: float
    pr_auc: float
    false_positive_rate: float
    n: int


class DetectResponse(BaseModel):
    scored: list[ScoredTransaction]
    overall: Metrics
    per_vector: dict[str, Metrics]


class SelfPlayRequest(BaseModel):
    rounds: int = 5
    n_legit: int = 400
    n_attack_per_vector: int = 60
    attack_ids: list[str] = []


class SelfPlayRoundResult(BaseModel):
    round_index: int
    evasion_level: float
    overall: Metrics
    per_vector: dict[str, Metrics]
    arms_race_score: float


class SelfPlayResponse(BaseModel):
    rounds: list[SelfPlayRoundResult]


class ZeroDayHypothesis(BaseModel):
    cluster_id: str
    size: int
    mean_amount: float
    dominant_channel: str
    dominant_merchant_category: str
    hypothesis: str
    confidence: float


class ZeroDayResponse(BaseModel):
    hypotheses: list[ZeroDayHypothesis]
