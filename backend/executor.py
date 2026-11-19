"""
executor.py – Topological pipeline executor.
Owned by: Backend agent.
"""
from __future__ import annotations

from collections import defaultdict, deque
from typing import Any

import pandas as pd

from data_ops import (
    op_load,
    op_sql_database,
    op_rest_api_source,
    op_drop_nulls,
    op_dedupe,
    op_fill_missing,
    op_type_cast,
    op_trim_strings,
    op_scale_normalize,
    op_filter_columns,
    op_select_columns,
    op_rename,
    op_calc_field,
    op_add_column,
    op_string_ops,
    op_pivot,
    op_melt,
    op_merge,
    op_concat,
    op_rolling_window,
    op_group_by,
    op_aggregate,
    op_sort,
    op_slice,
    op_sample,
    op_describe,
    op_profiler,
    op_schema_validator,
    op_comment,
    op_preview,
    op_export,
    op_chart,
)


# ---------------------------------------------------------------------------
# Graph helpers
# ---------------------------------------------------------------------------

def _build_adjacency(
    nodes: list[dict], edges: list[dict]
) -> tuple[dict[str, list[str]], dict[str, list[str]], set[str]]:
    node_ids: set[str] = {n["id"] for n in nodes}
    successors: dict[str, list[str]] = defaultdict(list)
    predecessors: dict[str, list[str]] = defaultdict(list)

    for edge in edges:
        src, tgt = edge["source"], edge["target"]
        successors[src].append(tgt)
        predecessors[tgt].append(src)

    return dict(successors), dict(predecessors), node_ids


def has_cycle_dfs(nodes: list[dict], edges: list[dict]) -> bool:
    _, _, node_ids = _build_adjacency(nodes, edges)
    successors, _, _ = _build_adjacency(nodes, edges)

    WHITE, GREY, BLACK = 0, 1, 2
    color: dict[str, int] = {nid: WHITE for nid in node_ids}

    def dfs(nid: str) -> bool:
        color[nid] = GREY
        for child in successors.get(nid, []):
            if color[child] == GREY:
                return True
            if color[child] == WHITE and dfs(child):
                return True
        color[nid] = BLACK
        return False

    for nid in node_ids:
        if color[nid] == WHITE:
            if dfs(nid):
                return True
    return False


def topological_sort(nodes: list[dict], edges: list[dict]) -> list[str]:
    successors, predecessors, node_ids = _build_adjacency(nodes, edges)
    in_degree: dict[str, int] = {nid: len(predecessors.get(nid, [])) for nid in node_ids}

    queue: deque[str] = deque(nid for nid in node_ids if in_degree[nid] == 0)
    order: list[str] = []

    while queue:
        nid = queue.popleft()
        order.append(nid)
        for child in successors.get(nid, []):
            in_degree[child] -= 1
            if in_degree[child] == 0:
                queue.append(child)

    if len(order) != len(node_ids):
        raise ValueError("Graph contains a cycle; topological sort impossible.")
    return order


# ---------------------------------------------------------------------------
# Dispatch tables
# ---------------------------------------------------------------------------

_UNARY_OPS: dict[str, Any] = {
    "dropNulls": op_drop_nulls,
    "dedupe": op_dedupe,
    "deduplicate": op_dedupe,
    "fillMissing": op_fill_missing,
    "typeCast": op_type_cast,
    "trimStrings": op_trim_strings,
    "scaleNormalize": op_scale_normalize,
    "filterColumns": op_filter_columns,
    "selectColumns": op_select_columns,
    "rename": op_rename,
    "calcField": op_calc_field,
    "addColumn": op_add_column,
    "stringOps": op_string_ops,
    "pivot": op_pivot,
    "melt": op_melt,
    "rollingWindow": op_rolling_window,
    "groupBy": op_group_by,
    "aggregate": op_aggregate,
    "sort": op_sort,
    "slice": op_slice,
    "sample": op_sample,
    "describe": op_describe,
    "profiler": op_profiler,
    "schemaValidator": op_schema_validator,
    "comment": op_comment,
    "preview": op_preview,
    "export": op_export,
    "chart": op_chart,
}


# ---------------------------------------------------------------------------
# Main executor
# ---------------------------------------------------------------------------

def execute_pipeline(
    nodes: list[dict], edges: list[dict]
) -> dict[str, dict]:
    """
    Execute the pipeline in topological order.
    Returns:
      { nodeId: { "columns": [...], "rows": [[...], ...], "error": str | None } }
    """
    if has_cycle_dfs(nodes, edges):
        return {
            n["id"]: {"columns": [], "rows": [], "error": "Graph contains a cycle"}
            for n in nodes
        }

    order = topological_sort(nodes, edges)
    node_map: dict[str, dict] = {n["id"]: n for n in nodes}

    successors, predecessors, _ = _build_adjacency(nodes, edges)

    frames: dict[str, pd.DataFrame] = {}
    results: dict[str, dict] = {}

    for nid in order:
        node = node_map[nid]
        ntype: str = node.get("type", "")
        ndata: dict = node.get("data", {})

        try:
            parent_ids = predecessors.get(nid, [])

            if ntype == "load":
                df = op_load(ndata)

            elif ntype in ("sqlDatabase", "sql_database"):
                df = op_sql_database(ndata)

            elif ntype in ("apiSource", "restApi", "rest_api_source"):
                df = op_rest_api_source(ndata)

            elif ntype in ("merge", "join"):
                if len(parent_ids) < 2:
                    raise ValueError(f"{ntype} node requires 2 input edges.")
                left_df = frames.get(parent_ids[0], pd.DataFrame())
                right_df = frames.get(parent_ids[1], pd.DataFrame())
                df = op_merge(left_df, right_df, ndata)

            elif ntype == "concat":
                if not parent_ids:
                    raise ValueError("concat node requires at least 1 input edge.")
                input_frames = [frames.get(pid, pd.DataFrame()) for pid in parent_ids]
                df = op_concat(input_frames, ndata)

            elif ntype in _UNARY_OPS:
                if not parent_ids:
                    # Some unary nodes can also act without input if self-contained (e.g. comment)
                    if ntype == "comment":
                        df = pd.DataFrame()
                    else:
                        raise ValueError(f"Node '{ntype}' has no input.")
                else:
                    parent_df = frames.get(parent_ids[0], pd.DataFrame())
                    df = _UNARY_OPS[ntype](parent_df, ndata)

            else:
                if parent_ids:
                    df = frames.get(parent_ids[0], pd.DataFrame()).copy()
                else:
                    df = pd.DataFrame()

            frames[nid] = df

            # Limit preview size to 500 rows for JSON serialization
            preview_df = df.head(500)
            results[nid] = {
                "columns": preview_df.columns.tolist(),
                "rows": preview_df.where(pd.notnull(preview_df), None).values.tolist(),
                "error": None,
            }

        except Exception as exc:  # noqa: BLE001
            frames[nid] = pd.DataFrame()
            results[nid] = {"columns": [], "rows": [], "error": str(exc)}

    return results
