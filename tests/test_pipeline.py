"""
tests/test_pipeline.py – pytest suite for /pipelines/parse and /pipelines/execute.
Run from: df-backend/backend/  →  pytest ../tests/
"""
from __future__ import annotations

import sys
import os

# Allow imports from backend/
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

import pytest
from fastapi.testclient import TestClient

from main import app

client = TestClient(app)

# Path to sample data relative to repo root
SAMPLE_CSV_PATH = os.path.join(
    os.path.dirname(__file__), "..", "sample-data", "sales_orders.csv"
)

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def sales_csv_content() -> str:
    with open(SAMPLE_CSV_PATH, encoding="utf-8") as f:
        return f.read()


def load_node(node_id: str = "n1") -> dict:
    return {
        "id": node_id,
        "type": "load",
        "data": {"fileContent": sales_csv_content(), "fileName": "sales_orders.csv"},
        "position": {"x": 0, "y": 0},
    }


# ---------------------------------------------------------------------------
# Health
# ---------------------------------------------------------------------------

def test_health():
    r = client.get("/")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


# ---------------------------------------------------------------------------
# /pipelines/parse
# ---------------------------------------------------------------------------

class TestParse:
    def test_simple_dag(self):
        body = {
            "nodes": [
                {"id": "a", "type": "load", "data": {}, "position": {"x": 0, "y": 0}},
                {"id": "b", "type": "preview", "data": {}, "position": {"x": 1, "y": 0}},
            ],
            "edges": [{"id": "e1", "source": "a", "target": "b"}],
        }
        r = client.post("/pipelines/parse", json=body)
        assert r.status_code == 200
        data = r.json()
        assert data["is_dag"] is True
        assert data["num_nodes"] == 2
        assert data["num_edges"] == 1

    def test_cycle_detected(self):
        body = {
            "nodes": [
                {"id": "a", "type": "load", "data": {}, "position": {"x": 0, "y": 0}},
                {"id": "b", "type": "preview", "data": {}, "position": {"x": 1, "y": 0}},
            ],
            "edges": [
                {"id": "e1", "source": "a", "target": "b"},
                {"id": "e2", "source": "b", "target": "a"},
            ],
        }
        r = client.post("/pipelines/parse", json=body)
        assert r.status_code == 200
        assert r.json()["is_dag"] is False

    def test_self_loop_cycle(self):
        body = {
            "nodes": [{"id": "a", "type": "load", "data": {}, "position": {"x": 0, "y": 0}}],
            "edges": [{"id": "e1", "source": "a", "target": "a"}],
        }
        r = client.post("/pipelines/parse", json=body)
        assert r.json()["is_dag"] is False

    def test_empty_graph(self):
        body = {"nodes": [], "edges": []}
        r = client.post("/pipelines/parse", json=body)
        assert r.status_code == 200
        assert r.json()["is_dag"] is True
        assert r.json()["num_nodes"] == 0

    def test_larger_dag(self):
        # a -> b -> d, a -> c -> d  (diamond, no cycle)
        body = {
            "nodes": [
                {"id": "a", "type": "load", "data": {}, "position": {"x": 0, "y": 0}},
                {"id": "b", "type": "dropNulls", "data": {}, "position": {"x": 1, "y": 0}},
                {"id": "c", "type": "dedupe", "data": {}, "position": {"x": 1, "y": 1}},
                {"id": "d", "type": "preview", "data": {}, "position": {"x": 2, "y": 0}},
            ],
            "edges": [
                {"id": "e1", "source": "a", "target": "b"},
                {"id": "e2", "source": "a", "target": "c"},
                {"id": "e3", "source": "b", "target": "d"},
                {"id": "e4", "source": "c", "target": "d"},
            ],
        }
        r = client.post("/pipelines/parse", json=body)
        assert r.json()["is_dag"] is True


# ---------------------------------------------------------------------------
# /pipelines/execute – individual node ops
# ---------------------------------------------------------------------------

class TestExecute:

    def _run(self, nodes: list[dict], edges: list[dict]) -> dict:
        r = client.post("/pipelines/execute", json={"nodes": nodes, "edges": edges})
        assert r.status_code == 200
        return r.json()["results"]

    # -- load ----------------------------------------------------------------
    def test_load_csv(self):
        nodes = [load_node("n1")]
        results = self._run(nodes, [])
        assert results["n1"]["error"] is None
        cols = results["n1"]["columns"]
        assert "order_id" in cols
        assert "revenue" in cols
        assert len(results["n1"]["rows"]) == 15  # 15 rows in sample

    # -- dropNulls -----------------------------------------------------------
    def test_drop_nulls(self):
        nodes = [
            load_node("n1"),
            {"id": "n2", "type": "dropNulls", "data": {}, "position": {"x": 1, "y": 0}},
        ]
        edges = [{"id": "e1", "source": "n1", "target": "n2"}]
        results = self._run(nodes, edges)
        assert results["n2"]["error"] is None
        # Row 11 has nulls -> should be dropped
        rows = results["n2"]["rows"]
        assert len(rows) == 14

    # -- dedupe --------------------------------------------------------------
    def test_dedupe(self):
        nodes = [
            load_node("n1"),
            {"id": "n2", "type": "dedupe", "data": {}, "position": {"x": 1, "y": 0}},
        ]
        edges = [{"id": "e1", "source": "n1", "target": "n2"}]
        results = self._run(nodes, edges)
        assert results["n2"]["error"] is None
        # Row 14 is a duplicate of row 1 (same values), dedupe should remove it
        rows = results["n2"]["rows"]
        assert len(rows) <= 15

    # -- fillMissing ---------------------------------------------------------
    def test_fill_missing_value(self):
        nodes = [
            load_node("n1"),
            {
                "id": "n2",
                "type": "fillMissing",
                "data": {"strategy": "value", "value": 0},
                "position": {"x": 1, "y": 0},
            },
        ]
        edges = [{"id": "e1", "source": "n1", "target": "n2"}]
        results = self._run(nodes, edges)
        assert results["n2"]["error"] is None
        # No nulls should remain after fill
        rows = results["n2"]["rows"]
        assert all(cell is not None for row in rows for cell in row)

    def test_fill_missing_mean(self):
        nodes = [
            load_node("n1"),
            {
                "id": "n2",
                "type": "fillMissing",
                "data": {"strategy": "mean", "columns": ["quantity", "revenue"]},
                "position": {"x": 1, "y": 0},
            },
        ]
        edges = [{"id": "e1", "source": "n1", "target": "n2"}]
        results = self._run(nodes, edges)
        assert results["n2"]["error"] is None

    # -- filterColumns -------------------------------------------------------
    def test_filter_columns_keep(self):
        nodes = [
            load_node("n1"),
            {
                "id": "n2",
                "type": "filterColumns",
                "data": {"columns": ["order_id", "region", "revenue"], "mode": "keep"},
                "position": {"x": 1, "y": 0},
            },
        ]
        edges = [{"id": "e1", "source": "n1", "target": "n2"}]
        results = self._run(nodes, edges)
        assert results["n2"]["error"] is None
        assert results["n2"]["columns"] == ["order_id", "region", "revenue"]

    def test_filter_columns_drop(self):
        nodes = [
            load_node("n1"),
            {
                "id": "n2",
                "type": "filterColumns",
                "data": {"columns": ["order_date"], "mode": "drop"},
                "position": {"x": 1, "y": 0},
            },
        ]
        edges = [{"id": "e1", "source": "n1", "target": "n2"}]
        results = self._run(nodes, edges)
        assert "order_date" not in results["n2"]["columns"]

    # -- groupBy -------------------------------------------------------------
    def test_group_by(self):
        nodes = [
            load_node("n1"),
            {
                "id": "n2",
                "type": "groupBy",
                "data": {"groupBy": ["region"], "agg": {"revenue": "sum"}},
                "position": {"x": 1, "y": 0},
            },
        ]
        edges = [{"id": "e1", "source": "n1", "target": "n2"}]
        results = self._run(nodes, edges)
        assert results["n2"]["error"] is None
        cols = results["n2"]["columns"]
        assert "region" in cols
        assert "revenue" in cols
        # 4 unique regions: North, South, East, West
        assert len(results["n2"]["rows"]) == 4

    # -- merge ---------------------------------------------------------------
    def test_merge(self):
        # Two load nodes with overlapping column, inner join on region
        csv2 = "region,discount\nNorth,0.1\nSouth,0.2\nEast,0.15\nWest,0.05\n"
        nodes = [
            load_node("n1"),
            {
                "id": "n2",
                "type": "load",
                "data": {"fileContent": csv2, "fileName": "discounts.csv"},
                "position": {"x": 0, "y": 1},
            },
            {
                "id": "n3",
                "type": "merge",
                "data": {"on": "region", "how": "inner"},
                "position": {"x": 1, "y": 0},
            },
        ]
        edges = [
            {"id": "e1", "source": "n1", "target": "n3"},
            {"id": "e2", "source": "n2", "target": "n3"},
        ]
        results = self._run(nodes, edges)
        assert results["n3"]["error"] is None
        assert "discount" in results["n3"]["columns"]

    # -- chained pipeline ----------------------------------------------------
    def test_chained_load_drop_filter_group(self):
        nodes = [
            load_node("n1"),
            {"id": "n2", "type": "dropNulls", "data": {}, "position": {"x": 1, "y": 0}},
            {
                "id": "n3",
                "type": "filterColumns",
                "data": {"columns": ["region", "revenue", "quantity"], "mode": "keep"},
                "position": {"x": 2, "y": 0},
            },
            {
                "id": "n4",
                "type": "groupBy",
                "data": {"groupBy": ["region"], "agg": {"revenue": "sum", "quantity": "sum"}},
                "position": {"x": 3, "y": 0},
            },
        ]
        edges = [
            {"id": "e1", "source": "n1", "target": "n2"},
            {"id": "e2", "source": "n2", "target": "n3"},
            {"id": "e3", "source": "n3", "target": "n4"},
        ]
        results = self._run(nodes, edges)
        for nid in ["n1", "n2", "n3", "n4"]:
            assert results[nid]["error"] is None
        assert len(results["n4"]["rows"]) == 4  # 4 regions

    # -- cycle aborts execute ------------------------------------------------
    def test_cycle_returns_errors(self):
        nodes = [
            {"id": "a", "type": "dropNulls", "data": {}, "position": {"x": 0, "y": 0}},
            {"id": "b", "type": "dropNulls", "data": {}, "position": {"x": 1, "y": 0}},
        ]
        edges = [
            {"id": "e1", "source": "a", "target": "b"},
            {"id": "e2", "source": "b", "target": "a"},
        ]
        results = self._run(nodes, edges)
        for nid in ["a", "b"]:
            assert results[nid]["error"] is not None


# ---------------------------------------------------------------------------
# /ai/generate-pipeline
# ---------------------------------------------------------------------------

class TestAIGenerator:
    def test_generate_pipeline_fallback(self):
        prompt = "filter revenue > 200, group by region, bar chart"
        r = client.post("/ai/generate-pipeline", json={"prompt": prompt})
        assert r.status_code == 200
        data = r.json()
        assert "nodes" in data
        assert "edges" in data
        node_types = [n["type"] for n in data["nodes"]]
        assert "load" in node_types
        assert "groupBy" in node_types
        assert "chart" in node_types
        assert len(data["edges"]) >= 2
