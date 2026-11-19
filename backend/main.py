"""
main.py – FastAPI application & endpoints.
Owned by: Backend agent.
"""
from __future__ import annotations

from typing import Any

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from executor import execute_pipeline, has_cycle_dfs
from ai_generator import generate_pipeline

# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------

app = FastAPI(
    title="DataFlow Python Engine",
    version="1.0.0",
    description="Visual ETL pipeline execution engine powered by Pandas + FastAPI.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------

class NodePosition(BaseModel):
    x: float = 0
    y: float = 0


class Node(BaseModel):
    id: str
    type: str
    data: dict[str, Any] = {}
    position: NodePosition = NodePosition()


class Edge(BaseModel):
    id: str
    source: str
    target: str


class PipelineRequest(BaseModel):
    nodes: list[Node]
    edges: list[Edge]


class ParseResponse(BaseModel):
    is_dag: bool
    num_nodes: int
    num_edges: int


class NodeResult(BaseModel):
    columns: list[str]
    rows: list[list[Any]]
    error: str | None = None


class ExecuteResponse(BaseModel):
    results: dict[str, NodeResult]


class AIRequest(BaseModel):
    prompt: str
    apiKey: str | None = None


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/")
@app.get("/api")
def health() -> dict:
    return {
        "app": "DataFlow Python Engine",
        "status": "ok",
        "engine": "Pandas + FastAPI + Groq AI",
    }


@app.post("/pipelines/parse", response_model=ParseResponse)
@app.post("/api/pipelines/parse", response_model=ParseResponse)
def parse_pipeline(req: PipelineRequest) -> ParseResponse:
    """
    Validate graph topology.
    Uses DFS cycle detection to determine if the graph is a DAG.
    """
    nodes_raw = [n.model_dump() for n in req.nodes]
    edges_raw = [e.model_dump() for e in req.edges]

    cycle = has_cycle_dfs(nodes_raw, edges_raw)

    return ParseResponse(
        is_dag=not cycle,
        num_nodes=len(req.nodes),
        num_edges=len(req.edges),
    )


@app.post("/pipelines/execute", response_model=ExecuteResponse)
@app.post("/api/pipelines/execute", response_model=ExecuteResponse)
def execute(req: PipelineRequest) -> ExecuteResponse:
    """
    Execute pipeline in topological order using Pandas.
    Returns per-node result sets (columns + rows).
    """
    nodes_raw = [n.model_dump() for n in req.nodes]
    edges_raw = [e.model_dump() for e in req.edges]

    raw_results = execute_pipeline(nodes_raw, edges_raw)

    results = {
        nid: NodeResult(**res) for nid, res in raw_results.items()
    }

    return ExecuteResponse(results=results)


@app.post("/ai/generate-pipeline")
@app.post("/api/ai/generate-pipeline")
def generate_ai_pipeline(req: AIRequest) -> dict:
    """
    Generate pipeline graph from natural language using Groq LLM or rule-based fallback.
    """
    return generate_pipeline(req.prompt, req.apiKey)
