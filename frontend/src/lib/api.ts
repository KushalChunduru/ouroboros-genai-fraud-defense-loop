export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

export type AttackVector = {
  id: string;
  name: string;
  channel: string;
  rail: string;
  social_surface: string;
  technique: string;
  description: string;
  source: string;
  severity_base: number;
};

export type Transaction = {
  id: string;
  entity_id: string;
  timestamp: string;
  amount: number;
  merchant_id: string;
  merchant_category: string;
  device_id: string;
  ip_subnet: string;
  channel: string;
  country: string;
  velocity_1h: number;
  device_fanout_raw: number;
  session_novelty: number;
  tool_call_burst: number;
  narrative_text?: string | null;
  is_attack: boolean;
  attack_vector_id?: string | null;
  attack_vector_name?: string | null;
};

export type Metrics = {
  precision: number;
  recall: number;
  f1: number;
  pr_auc: number;
  false_positive_rate: number;
  n: number;
};

export type GenerateResponse = {
  batch_id: string;
  transactions: Transaction[];
  narratives_sample: { attack_vector_id: string; attack_vector_name: string; text: string }[];
  counts: Record<string, number>;
};

export type ScoredTransaction = {
  id: string;
  fused_score: number;
  gbm_score: number;
  graph_score: number;
  content_score: number;
  predicted_attack: boolean;
  is_attack: boolean;
  attack_vector_id?: string | null;
  explanation: string;
};

export type DetectResponse = {
  scored: ScoredTransaction[];
  overall: Metrics;
  per_vector: Record<string, Metrics>;
};

export type SelfPlayRound = {
  round_index: number;
  evasion_level: number;
  overall: Metrics;
  per_vector: Record<string, Metrics>;
  arms_race_score: number;
};

export type ZeroDayHypothesis = {
  cluster_id: string;
  size: number;
  mean_amount: number;
  dominant_channel: string;
  dominant_merchant_category: string;
  hypothesis: string;
  confidence: number;
};

export type BatchReport = {
  batch_id: string;
  counts: Record<string, number>;
  overall: Metrics;
  per_vector: Record<string, Metrics>;
  n_test: number;
};

export type LiveScoreResponse = {
  fused_score: number;
  gbm_score: number;
  graph_score: number;
  content_score: number;
  predicted_attack: boolean;
  latency_ms: number;
};

async function req<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status} ${res.statusText}: ${text}`);
  }
  return res.json();
}

export const api = {
  health: () => req<{ status: string; gemini_enabled: boolean; vectors: number }>("/api/health"),
  taxonomy: () => req<{ vectors: AttackVector[] }>("/api/taxonomy"),
  generate: (body: {
    attack_ids: string[];
    n_legit: number;
    n_attack_per_vector: number;
    evasion_level?: number;
  }) => req<GenerateResponse>("/api/generate", { method: "POST", body: JSON.stringify(body) }),
  detect: (body: { batch_id: string }) =>
    req<DetectResponse>("/api/detect", { method: "POST", body: JSON.stringify(body) }),
  selfplay: (body: { rounds: number; n_legit: number; n_attack_per_vector: number; attack_ids: string[] }) =>
    req<{ rounds: SelfPlayRound[] }>("/api/selfplay", { method: "POST", body: JSON.stringify(body) }),
  zeroday: (body: { batch_id: string }) =>
    req<{ hypotheses: ZeroDayHypothesis[] }>("/api/zeroday", { method: "POST", body: JSON.stringify(body) }),
  sampleTransaction: (kind: "legit" | "attack", attackId?: string) =>
    req<Transaction>(`/api/sample_transaction?kind=${kind}${attackId ? `&attack_id=${attackId}` : ""}`),
  scoreLive: (txn: Transaction) =>
    req<LiveScoreResponse>("/api/score_live", { method: "POST", body: JSON.stringify(txn) }),
  report: (batchId: string) => req<BatchReport>(`/api/report/${batchId}`),
};
