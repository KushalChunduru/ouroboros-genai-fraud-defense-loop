"""Lightweight graph-propagation risk model (GNN-inspired).

Fraud rings are a topological signal invisible at the row level: shared
devices/IPs/merchants across many distinct entities. We build a heterogeneous
graph (entity - device - ip_subnet - merchant) and run belief-propagation-style
message passing (the same family of algorithm graph neural networks generalize)
to spread risk from a labeled training seed across shared infrastructure, so an
attacker who reuses even one device with a known-bad entity gets flagged.
"""
import networkx as nx


def build_graph(transactions: list[dict]) -> nx.Graph:
    g = nx.Graph()
    for t in transactions:
        e, d, ip, m = f"E:{t['entity_id']}", f"D:{t['device_id']}", f"IP:{t['ip_subnet']}", f"M:{t['merchant_id']}"
        for node in (e, d, ip, m):
            if node not in g:
                g.add_node(node)
        g.add_edge(e, d)
        g.add_edge(e, ip)
        g.add_edge(e, m)
    return g


def propagate_risk(graph: nx.Graph, seed_risk: dict[str, float], iterations: int = 3, damping: float = 0.6) -> dict[str, float]:
    risk = {n: seed_risk.get(n, 0.0) for n in graph.nodes}
    for _ in range(iterations):
        new_risk = {}
        for n in graph.nodes:
            neighbors = list(graph.neighbors(n))
            neighbor_avg = sum(risk[nb] for nb in neighbors) / len(neighbors) if neighbors else 0.0
            base = seed_risk.get(n, 0.0)
            new_risk[n] = damping * neighbor_avg + (1 - damping) * base
            new_risk[n] = max(new_risk[n], base)
        risk = new_risk
    return risk


class GraphRiskModel:
    def __init__(self):
        self.graph: nx.Graph | None = None
        self.risk: dict[str, float] = {}

    def fit(self, train_transactions: list[dict]):
        self.graph = build_graph(train_transactions)
        seed = {}
        for t in train_transactions:
            if t.get("is_attack"):
                e, d, ip, m = f"E:{t['entity_id']}", f"D:{t['device_id']}", f"IP:{t['ip_subnet']}", f"M:{t['merchant_id']}"
                for node in (e, d, ip, m):
                    seed[node] = max(seed.get(node, 0.0), 1.0)
        self.risk = propagate_risk(self.graph, seed)
        return self

    def score(self, test_transactions: list[dict]) -> list[float]:
        combined_graph = build_graph(test_transactions)
        combined_graph.add_nodes_from(self.graph.nodes) if self.graph else None
        if self.graph:
            for u, v in self.graph.edges:
                combined_graph.add_edge(u, v)
        seed = {n: r for n, r in self.risk.items()}
        risk = propagate_risk(combined_graph, seed, iterations=2)
        scores = []
        for t in test_transactions:
            e, d, ip, m = f"E:{t['entity_id']}", f"D:{t['device_id']}", f"IP:{t['ip_subnet']}", f"M:{t['merchant_id']}"
            scores.append(max(risk.get(e, 0.0), risk.get(d, 0.0), risk.get(ip, 0.0), risk.get(m, 0.0)))
        return scores
