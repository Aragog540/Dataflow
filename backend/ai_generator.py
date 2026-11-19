"""ai_generator.py – Groq LLM pipeline generator with rule-based fallback."""
import os
import json
import httpx

ALLOWED_TYPES = {
    # Core types
    "load", "dropNulls", "dedupe", "deduplicate", "fillMissing", "filterColumns",
    "rename", "calcField", "merge", "join", "groupBy", "profiler",
    "chart", "preview", "export",
    # New extended features
    "sqlDatabase", "apiSource", "typeCast", "trimStrings", "scaleNormalize",
    "selectColumns", "addColumn", "pivot", "melt", "rollingWindow",
    "stringOps", "describe", "sample", "sort", "slice",
    "aggregate", "concat", "schemaValidator", "comment"
}


def validate_pipeline(pipeline: dict) -> None:
    """Raises ValueError if the pipeline structure is invalid."""
    if "nodes" not in pipeline or "edges" not in pipeline:
        raise ValueError("Pipeline must have 'nodes' and 'edges' keys.")

    node_ids = set()
    for node in pipeline["nodes"]:
        for field in ("id", "type", "data", "position"):
            if field not in node:
                raise ValueError(f"Node missing field '{field}': {node}")
        if node["type"] not in ALLOWED_TYPES:
            raise ValueError(f"Unknown node type '{node['type']}'.")
        node_ids.add(node["id"])

    for edge in pipeline["edges"]:
        for field in ("id", "source", "target"):
            if field not in edge:
                raise ValueError(f"Edge missing field '{field}': {edge}")
        if edge["source"] not in node_ids:
            raise ValueError(f"Edge source '{edge['source']}' is not a valid node id.")
        if edge["target"] not in node_ids:
            raise ValueError(f"Edge target '{edge['target']}' is not a valid node id.")


def rule_based_pipeline(prompt: str) -> dict:
    """Generate a pipeline from keyword matching, always starting with an input node."""
    p = prompt.lower()
    nodes = []
    edges = []
    seen_types = set()

    def add_node(node_type: str, data: dict = None):
        if data is None:
            data = {}
        if node_type in seen_types:
            return
        seen_types.add(node_type)
        i = len(nodes)
        node_id = f"{node_type}-{i + 1}"
        nodes.append({
            "id": node_id,
            "type": node_type,
            "data": data,
            "position": {"x": 100 + i * 220, "y": 100},
        })
        if len(nodes) > 1:
            edges.append({
                "id": f"e{len(edges) + 1}",
                "source": nodes[-2]["id"],
                "target": nodes[-1]["id"],
            })

    # Determine primary source: SQL, API, or CSV load
    if any(k in p for k in ("sql", "database", "sqlite", "postgres", "query")):
        nodes.append({
            "id": "sqlDatabase-1",
            "type": "sqlDatabase",
            "data": {"query": "SELECT * FROM sales_orders"},
            "position": {"x": 100, "y": 100},
        })
        seen_types.add("sqlDatabase")
    elif any(k in p for k in ("api", "endpoint", "rest", "fetch", "http")):
        nodes.append({
            "id": "apiSource-1",
            "type": "apiSource",
            "data": {"url": "https://jsonplaceholder.typicode.com/todos"},
            "position": {"x": 100, "y": 100},
        })
        seen_types.add("apiSource")
    else:
        nodes.append({
            "id": "load-1",
            "type": "load",
            "data": {},
            "position": {"x": 100, "y": 100},
        })
        seen_types.add("load")

    # Keyword -> node_type rules
    rules = [
        (["null", "missing", "drop null"], "dropNulls", {}),
        (["dedupe", "duplicate", "deduplicate"], "dedupe", {}),
        (["fill"], "fillMissing", {}),
        (["type cast", "cast type", "convert type", "to int", "to float"], "typeCast", {}),
        (["trim", "strip whitespace", "clean strings"], "trimStrings", {}),
        (["scale", "normalize", "standardize", "z-score", "min-max"], "scaleNormalize", {}),
        (["select cols", "select columns", "choose columns"], "selectColumns", {}),
        (["filter col", "keep col"], "filterColumns", {}),
        (["revenue", "filter", "where", "> ", "< "], "filterColumns", {"mode": "keep"}),
        (["add column", "new column"], "addColumn", {}),
        (["calc", "formula", "multiply", "expression"], "calcField", {}),
        (["string op", "replace text", "uppercase", "lowercase", "regex"], "stringOps", {}),
        (["rolling", "moving average", "window"], "rollingWindow", {}),
        (["pivot", "unstack", "crosstab"], "pivot", {}),
        (["melt", "unpivot", "wide to long"], "melt", {}),
        (["group", "by region", "by product"], "groupBy", {}),
        (["aggregate", "dataset sum", "total"], "aggregate", {}),
        (["sort", "order by", "rank"], "sort", {}),
        (["slice", "head", "tail", "top rows", "limit"], "slice", {}),
        (["sample", "random rows"], "sample", {}),
        (["schema", "validate schema", "assert columns"], "schemaValidator", {}),
        (["bar"], "chart", {"chartType": "bar"}),
        (["line chart"], "chart", {"chartType": "line"}),
        (["pie"], "chart", {"chartType": "pie"}),
        (["scatter"], "chart", {"chartType": "scatter"}),
        (["chart", "visuali"], "chart", {}),
        (["describe", "summary stats"], "describe", {}),
        (["profile", "stats", "profil"], "profiler", {}),
        (["rename"], "rename", {}),
        (["join"], "join", {}),
        (["merge"], "merge", {}),
        (["concat", "stack", "append"], "concat", {}),
        (["comment", "note", "sticky"], "comment", {}),
        (["preview", "show"], "preview", {}),
        (["export", "download", "save"], "export", {}),
    ]

    for keywords, node_type, data in rules:
        if node_type in seen_types:
            continue
        for kw in keywords:
            if kw in p:
                add_node(node_type, data)
                break

    return {"nodes": nodes, "edges": edges}


def call_groq(prompt: str, api_key: str) -> dict:
    """Call the Groq API and return a validated pipeline dict."""
    types_str = ",".join(ALLOWED_TYPES)
    system_msg = (
        "You are a data pipeline generator. Return ONLY valid JSON with keys 'nodes' and 'edges'. "
        "Each node: {id:string, type:string, data:{}, position:{x:number,y:number}}. "
        "Each edge: {id:string, source:string, target:string}. "
        f"Use these node types only: {types_str}. "
        "Space nodes 220px apart horizontally starting at x=100,y=100."
    )
    payload = {
        "model": "llama-3.3-70b-versatile",
        "temperature": 0,
        "response_format": {"type": "json_object"},
        "messages": [
            {"role": "system", "content": system_msg},
            {"role": "user", "content": prompt},
        ],
    }
    response = httpx.post(
        "https://api.groq.com/openai/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        json=payload,
        timeout=30,
    )
    response.raise_for_status()
    content = response.json()["choices"][0]["message"]["content"]
    result = json.loads(content)
    validate_pipeline(result)
    return result


def generate_pipeline(prompt: str, api_key: str | None = None) -> dict:
    """Generate a pipeline using Groq if an API key is available, else rule-based fallback."""
    key = api_key or os.environ.get("GROQ_API_KEY")
    if key:
        try:
            return call_groq(prompt, key)
        except Exception:
            pass
    return rule_based_pipeline(prompt)
