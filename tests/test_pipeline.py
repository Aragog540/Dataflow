"""
tests/test_pipeline.py – pytest suite for /pipelines/parse, /pipelines/execute, and all node operations.
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
# Health & Parse
# ---------------------------------------------------------------------------

def test_health():
    r = client.get("/")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


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


# ---------------------------------------------------------------------------
# Core & Extended Node Operations
# ---------------------------------------------------------------------------

class TestExecute:
    def _run(self, nodes: list[dict], edges: list[dict]) -> dict:
        r = client.post("/pipelines/execute", json={"nodes": nodes, "edges": edges})
        assert r.status_code == 200
        return r.json()["results"]

    def test_load_csv(self):
        nodes = [load_node("n1")]
        results = self._run(nodes, [])
        assert results["n1"]["error"] is None
        assert "revenue" in results["n1"]["columns"]
        assert len(results["n1"]["rows"]) == 15

    def test_sql_database(self):
        nodes = [
            {
                "id": "s1",
                "type": "sqlDatabase",
                "data": {"query": "SELECT order_id, region, revenue FROM sales_orders WHERE revenue > 200"},
                "position": {"x": 0, "y": 0},
            }
        ]
        results = self._run(nodes, [])
        assert results["s1"]["error"] is None
        assert results["s1"]["columns"] == ["order_id", "region", "revenue"]
        assert len(results["s1"]["rows"]) >= 1

    def test_drop_nulls(self):
        nodes = [
            load_node("n1"),
            {"id": "n2", "type": "dropNulls", "data": {}, "position": {"x": 1, "y": 0}},
        ]
        edges = [{"id": "e1", "source": "n1", "target": "n2"}]
        results = self._run(nodes, edges)
        assert results["n2"]["error"] is None
        assert len(results["n2"]["rows"]) == 14

    def test_dedupe(self):
        nodes = [
            load_node("n1"),
            {"id": "n2", "type": "deduplicate", "data": {}, "position": {"x": 1, "y": 0}},
        ]
        edges = [{"id": "e1", "source": "n1", "target": "n2"}]
        results = self._run(nodes, edges)
        assert results["n2"]["error"] is None
        assert len(results["n2"]["rows"]) <= 15

    def test_type_cast(self):
        nodes = [
            load_node("n1"),
            {"id": "n2", "type": "typeCast", "data": {"casts": {"revenue": "string"}}, "position": {"x": 1, "y": 0}},
        ]
        edges = [{"id": "e1", "source": "n1", "target": "n2"}]
        results = self._run(nodes, edges)
        assert results["n2"]["error"] is None

    def test_trim_strings(self):
        nodes = [
            load_node("n1"),
            {"id": "n2", "type": "trimStrings", "data": {"columns": ["product"], "case": "upper"}, "position": {"x": 1, "y": 0}},
        ]
        edges = [{"id": "e1", "source": "n1", "target": "n2"}]
        results = self._run(nodes, edges)
        assert results["n2"]["error"] is None
        prod_idx = results["n2"]["columns"].index("product")
        assert results["n2"]["rows"][0][prod_idx] == "WIDGET A"

    def test_scale_normalize(self):
        nodes = [
            load_node("n1"),
            {"id": "n2", "type": "scaleNormalize", "data": {"columns": ["revenue"], "method": "minmax"}, "position": {"x": 1, "y": 0}},
        ]
        edges = [{"id": "e1", "source": "n1", "target": "n2"}]
        results = self._run(nodes, edges)
        assert results["n2"]["error"] is None
        rev_idx = results["n2"]["columns"].index("revenue")
        vals = [r[rev_idx] for r in results["n2"]["rows"] if r[rev_idx] is not None]
        assert all(0.0 <= v <= 1.0 for v in vals)

    def test_select_columns(self):
        nodes = [
            load_node("n1"),
            {"id": "n2", "type": "selectColumns", "data": {"columns": ["region", "revenue"]}, "position": {"x": 1, "y": 0}},
        ]
        edges = [{"id": "e1", "source": "n1", "target": "n2"}]
        results = self._run(nodes, edges)
        assert results["n2"]["error"] is None
        assert results["n2"]["columns"] == ["region", "revenue"]

    def test_add_column(self):
        nodes = [
            load_node("n1"),
            {"id": "n2", "type": "addColumn", "data": {"columnName": "row_num", "mode": "row_number"}, "position": {"x": 1, "y": 0}},
        ]
        edges = [{"id": "e1", "source": "n1", "target": "n2"}]
        results = self._run(nodes, edges)
        assert results["n2"]["error"] is None
        assert "row_num" in results["n2"]["columns"]
        row_idx = results["n2"]["columns"].index("row_num")
        assert results["n2"]["rows"][0][row_idx] == 1

    def test_string_ops(self):
        nodes = [
            load_node("n1"),
            {"id": "n2", "type": "stringOps", "data": {"column": "product", "operation": "replace", "find": "Widget", "replaceWith": "Gadget"}, "position": {"x": 1, "y": 0}},
        ]
        edges = [{"id": "e1", "source": "n1", "target": "n2"}]
        results = self._run(nodes, edges)
        assert results["n2"]["error"] is None
        prod_idx = results["n2"]["columns"].index("product")
        assert "Gadget" in results["n2"]["rows"][0][prod_idx]

    def test_rolling_window(self):
        nodes = [
            load_node("n1"),
            {"id": "n2", "type": "dropNulls", "data": {}, "position": {"x": 1, "y": 0}},
            {"id": "n3", "type": "rollingWindow", "data": {"column": "revenue", "window": 3, "agg": "mean", "newColumn": "rolling_rev"}, "position": {"x": 2, "y": 0}},
        ]
        edges = [
            {"id": "e1", "source": "n1", "target": "n2"},
            {"id": "e2", "source": "n2", "target": "n3"},
        ]
        results = self._run(nodes, edges)
        assert results["n3"]["error"] is None
        assert "rolling_rev" in results["n3"]["columns"]

    def test_pivot(self):
        nodes = [
            load_node("n1"),
            {"id": "n2", "type": "dropNulls", "data": {}, "position": {"x": 1, "y": 0}},
            {"id": "n3", "type": "pivot", "data": {"index": "region", "columns": "product", "values": "revenue", "aggfunc": "sum"}, "position": {"x": 2, "y": 0}},
        ]
        edges = [
            {"id": "e1", "source": "n1", "target": "n2"},
            {"id": "e2", "source": "n2", "target": "n3"},
        ]
        results = self._run(nodes, edges)
        assert results["n3"]["error"] is None
        assert "region" in results["n3"]["columns"]

    def test_melt(self):
        nodes = [
            load_node("n1"),
            {"id": "n2", "type": "melt", "data": {"idVars": ["order_id", "region"], "valueVars": ["quantity", "revenue"]}, "position": {"x": 1, "y": 0}},
        ]
        edges = [{"id": "e1", "source": "n1", "target": "n2"}]
        results = self._run(nodes, edges)
        assert results["n2"]["error"] is None
        assert "variable" in results["n2"]["columns"]
        assert "value" in results["n2"]["columns"]

    def test_sort(self):
        nodes = [
            load_node("n1"),
            {"id": "n2", "type": "dropNulls", "data": {}, "position": {"x": 1, "y": 0}},
            {"id": "n3", "type": "sort", "data": {"by": "revenue", "ascending": False}, "position": {"x": 2, "y": 0}},
        ]
        edges = [
            {"id": "e1", "source": "n1", "target": "n2"},
            {"id": "e2", "source": "n2", "target": "n3"},
        ]
        results = self._run(nodes, edges)
        assert results["n3"]["error"] is None
        rev_idx = results["n3"]["columns"].index("revenue")
        assert results["n3"]["rows"][0][rev_idx] == 400.0  # max revenue

    def test_slice(self):
        nodes = [
            load_node("n1"),
            {"id": "n2", "type": "slice", "data": {"mode": "head", "count": 3}, "position": {"x": 1, "y": 0}},
        ]
        edges = [{"id": "e1", "source": "n1", "target": "n2"}]
        results = self._run(nodes, edges)
        assert results["n2"]["error"] is None
        assert len(results["n2"]["rows"]) == 3

    def test_sample(self):
        nodes = [
            load_node("n1"),
            {"id": "n2", "type": "sample", "data": {"n": 4, "seed": 42}, "position": {"x": 1, "y": 0}},
        ]
        edges = [{"id": "e1", "source": "n1", "target": "n2"}]
        results = self._run(nodes, edges)
        assert results["n2"]["error"] is None
        assert len(results["n2"]["rows"]) == 4

    def test_aggregate(self):
        nodes = [
            load_node("n1"),
            {"id": "n2", "type": "dropNulls", "data": {}, "position": {"x": 1, "y": 0}},
            {"id": "n3", "type": "aggregate", "data": {"aggregations": {"revenue": "sum", "quantity": "mean"}}, "position": {"x": 2, "y": 0}},
        ]
        edges = [
            {"id": "e1", "source": "n1", "target": "n2"},
            {"id": "e2", "source": "n2", "target": "n3"},
        ]
        results = self._run(nodes, edges)
        assert results["n3"]["error"] is None
        assert len(results["n3"]["rows"]) == 1

    def test_join(self):
        csv2 = "region,tax_rate\nNorth,0.05\nSouth,0.08\nEast,0.06\nWest,0.07\n"
        nodes = [
            load_node("n1"),
            {
                "id": "n2",
                "type": "load",
                "data": {"fileContent": csv2, "fileName": "tax.csv"},
                "position": {"x": 0, "y": 1},
            },
            {
                "id": "n3",
                "type": "join",
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
        assert "tax_rate" in results["n3"]["columns"]

    def test_concat(self):
        nodes = [
            load_node("n1"),
            load_node("n2"),
            {"id": "n3", "type": "concat", "data": {"axis": 0}, "position": {"x": 1, "y": 0}},
        ]
        edges = [
            {"id": "e1", "source": "n1", "target": "n3"},
            {"id": "e2", "source": "n2", "target": "n3"},
        ]
        results = self._run(nodes, edges)
        assert results["n3"]["error"] is None
        assert len(results["n3"]["rows"]) == 30  # 15 + 15

    def test_schema_validator(self):
        # Successful validation
        nodes = [
            load_node("n1"),
            {"id": "n2", "type": "schemaValidator", "data": {"requiredColumns": ["order_id", "region", "revenue"], "minRows": 5}, "position": {"x": 1, "y": 0}},
        ]
        edges = [{"id": "e1", "source": "n1", "target": "n2"}]
        results = self._run(nodes, edges)
        assert results["n2"]["error"] is None

        # Failing validation
        nodes_fail = [
            load_node("n1"),
            {"id": "n2", "type": "schemaValidator", "data": {"requiredColumns": ["non_existent_column"]}, "position": {"x": 1, "y": 0}},
        ]
        edges_fail = [{"id": "e1", "source": "n1", "target": "n2"}]
        results_fail = self._run(nodes_fail, edges_fail)
        assert results_fail["n2"]["error"] is not None
        assert "Missing required columns" in results_fail["n2"]["error"]

    def test_comment_pass_through(self):
        nodes = [
            load_node("n1"),
            {"id": "n2", "type": "comment", "data": {"text": "Sticky note annotation"}, "position": {"x": 1, "y": 0}},
        ]
        edges = [{"id": "e1", "source": "n1", "target": "n2"}]
        results = self._run(nodes, edges)
        assert results["n2"]["error"] is None
        assert len(results["n2"]["rows"]) == 15


# ---------------------------------------------------------------------------
# AI Generator
# ---------------------------------------------------------------------------

class TestAIGenerator:
    def test_generate_pipeline_fallback(self):
        prompt = "query sql database, cast type, pivot table, rolling window, sort by revenue, bar chart"
        r = client.post("/ai/generate-pipeline", json={"prompt": prompt})
        assert r.status_code == 200
        data = r.json()
        assert "nodes" in data
        assert "edges" in data
        node_types = [n["type"] for n in data["nodes"]]
        assert "sqlDatabase" in node_types
        assert "typeCast" in node_types
        assert "pivot" in node_types
        assert "rollingWindow" in node_types
        assert "sort" in node_types
        assert "chart" in node_types
