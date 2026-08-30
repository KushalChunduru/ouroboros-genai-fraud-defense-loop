"use client";

import { useMemo, useState } from "react";
import { ScoredTransaction, Transaction } from "@/lib/api";

type GraphNode = {
  id: string;
  count: number;
  maxFused: number;
  isAttack: boolean;
  vectorName?: string;
  devices: Set<string>;
  x: number;
  y: number;
};

const W = 640;
const H = 380;
const MAX_NODES = 70;

function riskColor(t: number) {
  // 0 = legit (teal), 1 = high risk (danger red) -- the same scale the
  // fused detector itself uses, not an arbitrary palette choice.
  const legit = [53, 226, 194];
  const danger = [255, 92, 122];
  const c = legit.map((v, i) => Math.round(v + (danger[i] - v) * t));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}

function buildGraph(transactions: Transaction[], scored: ScoredTransaction[]) {
  const txnById = new Map(transactions.map((t) => [t.id, t]));
  const entities = new Map<string, GraphNode>();
  const deviceGroups = new Map<string, Set<string>>();

  for (const s of scored) {
    const t = txnById.get(s.id);
    if (!t) continue;
    const e = entities.get(t.entity_id) ?? {
      id: t.entity_id,
      count: 0,
      maxFused: 0,
      isAttack: false,
      devices: new Set<string>(),
      x: 0,
      y: 0,
    };
    e.count += 1;
    e.maxFused = Math.max(e.maxFused, s.fused_score);
    if (s.is_attack) {
      e.isAttack = true;
      e.vectorName = t.attack_vector_name ?? e.vectorName;
    }
    e.devices.add(t.device_id);
    entities.set(t.entity_id, e);

    if (!deviceGroups.has(t.device_id)) deviceGroups.set(t.device_id, new Set());
    deviceGroups.get(t.device_id)!.add(t.entity_id);
  }

  // Keep the most decision-relevant entities: attacks first, then by risk.
  // Guarantee a mix of attack and legit entities -- otherwise the risk-color
  // legend is meaningless (an all-red or all-teal graph proves nothing).
  const all = Array.from(entities.values());
  const attacks = all.filter((n) => n.isAttack).sort((a, b) => b.maxFused - a.maxFused);
  const legits = all.filter((n) => !n.isAttack).sort((a, b) => b.count - a.count);
  const attackBudget = Math.min(attacks.length, Math.ceil(MAX_NODES * 0.6));
  const legitBudget = Math.min(legits.length, MAX_NODES - attackBudget);
  const nodeList = [...attacks.slice(0, attackBudget), ...legits.slice(0, legitBudget)];
  const keep = new Set(nodeList.map((n) => n.id));

  const edges: [string, string][] = [];
  for (const group of deviceGroups.values()) {
    const members = Array.from(group).filter((id) => keep.has(id));
    for (let i = 0; i < members.length; i++) {
      for (let j = i + 1; j < members.length; j++) edges.push([members[i], members[j]]);
    }
  }

  // Lightweight force layout: repulsion between all nodes, springs along
  // edges pulling shared-infrastructure entities together -- run once,
  // synchronously, no animation loop needed.
  for (const n of nodeList) {
    n.x = W / 2 + (Math.random() - 0.5) * W * 0.8;
    n.y = H / 2 + (Math.random() - 0.5) * H * 0.8;
  }
  const idx = new Map(nodeList.map((n, i) => [n.id, i]));
  for (let iter = 0; iter < 140; iter++) {
    const fx = new Array(nodeList.length).fill(0);
    const fy = new Array(nodeList.length).fill(0);
    for (let i = 0; i < nodeList.length; i++) {
      for (let j = i + 1; j < nodeList.length; j++) {
        let dx = nodeList[i].x - nodeList[j].x;
        let dy = nodeList[i].y - nodeList[j].y;
        const d2 = dx * dx + dy * dy || 0.01;
        const d = Math.sqrt(d2);
        const rep = 900 / d2;
        dx /= d;
        dy /= d;
        fx[i] += dx * rep;
        fy[i] += dy * rep;
        fx[j] -= dx * rep;
        fy[j] -= dy * rep;
      }
    }
    for (const [a, b] of edges) {
      const i = idx.get(a)!;
      const j = idx.get(b)!;
      const dx = nodeList[j].x - nodeList[i].x;
      const dy = nodeList[j].y - nodeList[i].y;
      const d = Math.sqrt(dx * dx + dy * dy) || 0.01;
      const targetLen = 46;
      const spring = (d - targetLen) * 0.04;
      fx[i] += (dx / d) * spring;
      fy[i] += (dy / d) * spring;
      fx[j] -= (dx / d) * spring;
      fy[j] -= (dy / d) * spring;
    }
    for (let i = 0; i < nodeList.length; i++) {
      nodeList[i].x += Math.max(-8, Math.min(8, fx[i]));
      nodeList[i].y += Math.max(-8, Math.min(8, fy[i]));
      nodeList[i].x = Math.max(16, Math.min(W - 16, nodeList[i].x));
      nodeList[i].y = Math.max(16, Math.min(H - 16, nodeList[i].y));
    }
  }

  return { nodes: nodeList, edges };
}

export default function EntityGraph({ transactions, scored }: { transactions: Transaction[]; scored: ScoredTransaction[] }) {
  const { nodes, edges } = useMemo(() => buildGraph(transactions, scored), [transactions, scored]);
  const [selected, setSelected] = useState<string | null>(null);
  const byId = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);
  const active = selected ? byId.get(selected) : null;

  if (nodes.length === 0) return null;

  return (
    <div className="grid md:grid-cols-[1fr_220px] gap-4">
      <div className="card-2 p-2">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          {edges.map(([a, b], i) => {
            const na = byId.get(a);
            const nb = byId.get(b);
            if (!na || !nb) return null;
            return (
              <line
                key={i}
                x1={na.x} y1={na.y} x2={nb.x} y2={nb.y}
                stroke="var(--border-strong)"
                strokeWidth={1}
              />
            );
          })}
          {nodes.map((n) => {
            const r = Math.min(14, 3.5 + n.count * 1.1);
            const isSelected = selected === n.id;
            return (
              <circle
                key={n.id}
                cx={n.x}
                cy={n.y}
                r={r}
                fill={riskColor(n.maxFused)}
                opacity={selected && !isSelected ? 0.35 : 0.9}
                stroke={isSelected ? "white" : "none"}
                strokeWidth={isSelected ? 1.5 : 0}
                style={{ cursor: "pointer" }}
                onClick={() => setSelected(isSelected ? null : n.id)}
              >
                <title>{`${n.id} · ${n.count} txn · fused ${n.maxFused.toFixed(2)}`}</title>
              </circle>
            );
          })}
        </svg>
        <div className="flex items-center justify-between px-2 pb-1 pt-2 text-[11px]" style={{ color: "var(--muted)" }}>
          <span>node size = transaction count · edges = shared device</span>
          <span className="flex items-center gap-1.5">
            legit
            <span className="inline-block h-2 w-10 rounded-full" style={{ background: `linear-gradient(90deg, ${riskColor(0)}, ${riskColor(1)})` }} />
            high risk
          </span>
        </div>
      </div>

      <div className="card-2 p-4 text-xs">
        {active ? (
          <div className="space-y-2">
            <div className="data font-medium" style={{ color: "var(--foreground)" }}>{active.id}</div>
            <Row label="Transactions" value={String(active.count)} />
            <Row label="Devices" value={String(active.devices.size)} />
            <Row label="Max fused score" value={active.maxFused.toFixed(2)} />
            <Row label="Status" value={active.isAttack ? "attack" : "legit"} color={active.isAttack ? "var(--danger)" : "var(--legit)"} />
            {active.vectorName && <Row label="Matched vector" value={active.vectorName} />}
          </div>
        ) : (
          <p style={{ color: "var(--muted)" }}>
            Click a node to inspect the entity — its transaction count, shared devices, and worst fused score. Dense
            red clusters share device infrastructure: that&apos;s the graph-propagation signal the fused detector
            uses to catch rings, made visible.
          </p>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span style={{ color: "var(--muted)" }}>{label}</span>
      <span className="data" style={{ color: color ?? "var(--foreground)" }}>{value}</span>
    </div>
  );
}
