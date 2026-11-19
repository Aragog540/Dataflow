"""
data_ops.py – Pure Pandas transformation functions.
Each function receives a DataFrame and a node-data dict; returns a DataFrame.
Owned by: Backend agent.
"""
from __future__ import annotations

import io
import math
import re
import sqlite3
from pathlib import Path
from typing import Any

import httpx
import numpy as np
import pandas as pd


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _coerce_numeric(df: pd.DataFrame) -> pd.DataFrame:
    """Best-effort numeric coercion on object columns."""
    for col in df.select_dtypes(include="object").columns:
        try:
            df[col] = pd.to_numeric(df[col])
        except (ValueError, TypeError):
            pass
    return df


# ---------------------------------------------------------------------------
# Sources & Input
# ---------------------------------------------------------------------------

def op_load(node_data: dict[str, Any]) -> pd.DataFrame:
    """
    Load a CSV or JSON file from disk or in-memory content.
    """
    file_content: Any = node_data.get("fileContent")
    file_path: str | None = node_data.get("filePath")
    file_name: str = node_data.get("fileName", "data.csv")

    if isinstance(file_content, dict):
        file_content = file_content.get("value")

    if file_content is not None and isinstance(file_content, str) and file_content.strip():
        buf = io.StringIO(file_content)
        if file_name.endswith(".json"):
            return pd.read_json(buf)
        return pd.read_csv(buf)

    if file_path:
        path = Path(file_path)
        if not path.is_absolute():
            path = Path(__file__).parent.parent / file_path
        if file_name.endswith(".json") or str(path).endswith(".json"):
            return pd.read_json(path)
        return pd.read_csv(path)

    raise ValueError("Load node requires 'filePath' or 'fileContent' in node data.")


def op_sql_database(node_data: dict[str, Any]) -> pd.DataFrame:
    """
    Execute SQL against an in-memory SQLite DB or SQLite file.
    node_data keys:
      - query: SQL query string (e.g. 'SELECT * FROM data')
      - dbPath: optional SQLite database file path
      - sampleData: optional dict or list of dicts to seed as 'data' table
    """
    query: str = node_data.get("query", "SELECT 1 as id")
    db_path: str | None = node_data.get("dbPath")
    sample_data = node_data.get("sampleData")

    if db_path and Path(db_path).exists():
        conn = sqlite3.connect(db_path)
    else:
        conn = sqlite3.connect(":memory:")
        if sample_data:
            df_seed = pd.DataFrame(sample_data)
            df_seed.to_sql("data", conn, index=False, if_exists="replace")
        else:
            # Seed with default sample sales_orders table
            default_path = Path(__file__).parent.parent / "sample-data" / "sales_orders.csv"
            if default_path.exists():
                df_seed = pd.read_csv(default_path)
                df_seed.to_sql("sales_orders", conn, index=False, if_exists="replace")
                df_seed.to_sql("data", conn, index=False, if_exists="replace")

    try:
        return pd.read_sql_query(query, conn)
    finally:
        conn.close()


def op_rest_api_source(node_data: dict[str, Any]) -> pd.DataFrame:
    """
    Fetch tabular data from a REST API endpoint.
    node_data keys:
      - url: endpoint URL
      - method: 'GET' | 'POST' (default 'GET')
      - headers: dict of HTTP headers
      - responsePath: JSON key path to extract list of records (e.g. 'data' or 'results')
    """
    url: str = node_data.get("url", "")
    method: str = node_data.get("method", "GET").upper()
    headers: dict = node_data.get("headers", {})
    response_path: str | None = node_data.get("responsePath")

    if not url:
        raise ValueError("REST API Source requires a 'url'.")

    with httpx.Client(timeout=10.0) as client:
        if method == "POST":
            resp = client.post(url, headers=headers, json=node_data.get("body", {}))
        else:
            resp = client.get(url, headers=headers)
        resp.raise_for_status()
        data = resp.json()

    if response_path and isinstance(data, dict):
        for part in response_path.split("."):
            data = data.get(part, [])

    if isinstance(data, list):
        return pd.DataFrame(data)
    if isinstance(data, dict):
        return pd.DataFrame([data])
    raise ValueError("REST API response could not be converted to DataFrame.")


# ---------------------------------------------------------------------------
# Cleaning & Transformation
# ---------------------------------------------------------------------------

def op_drop_nulls(df: pd.DataFrame, node_data: dict[str, Any]) -> pd.DataFrame:
    columns = node_data.get("columns")
    if columns:
        return df.dropna(subset=columns).reset_index(drop=True)
    return df.dropna().reset_index(drop=True)


def op_dedupe(df: pd.DataFrame, node_data: dict[str, Any]) -> pd.DataFrame:
    columns = node_data.get("columns")
    keep = node_data.get("keep", "first")
    if columns:
        return df.drop_duplicates(subset=columns, keep=keep).reset_index(drop=True)
    return df.drop_duplicates(keep=keep).reset_index(drop=True)


def op_fill_missing(df: pd.DataFrame, node_data: dict[str, Any]) -> pd.DataFrame:
    strategy: str = node_data.get("strategy", "value")
    fill_value = node_data.get("value", 0)
    columns: list[str] | None = node_data.get("columns")
    target_cols = columns if columns else df.columns.tolist()

    df = df.copy()
    for col in target_cols:
        if col not in df.columns:
            continue
        if strategy == "value":
            df[col] = df[col].fillna(fill_value)
        elif strategy == "mean":
            df[col] = df[col].fillna(pd.to_numeric(df[col], errors="coerce").mean())
        elif strategy == "median":
            df[col] = df[col].fillna(pd.to_numeric(df[col], errors="coerce").median())
        elif strategy == "mode":
            mode_val = df[col].mode()
            df[col] = df[col].fillna(mode_val[0] if not mode_val.empty else fill_value)
        elif strategy == "ffill":
            df[col] = df[col].ffill()
        elif strategy == "bfill":
            df[col] = df[col].bfill()
    return df


def op_type_cast(df: pd.DataFrame, node_data: dict[str, Any]) -> pd.DataFrame:
    """
    Cast columns to specific dtypes.
    node_data keys:
      - casts: dict of { col_name: 'int' | 'float' | 'string' | 'boolean' | 'datetime' }
    """
    df = df.copy()
    casts: dict[str, str] = node_data.get("casts", {})
    for col, target_type in casts.items():
        if col not in df.columns:
            continue
        target_type = target_type.lower()
        if target_type in ("int", "integer"):
            df[col] = pd.to_numeric(df[col], errors="coerce").astype("Int64")
        elif target_type in ("float", "number"):
            df[col] = pd.to_numeric(df[col], errors="coerce").astype(float)
        elif target_type in ("str", "string", "text"):
            df[col] = df[col].astype(str)
        elif target_type in ("bool", "boolean"):
            df[col] = df[col].astype(bool)
        elif target_type in ("datetime", "date"):
            df[col] = pd.to_datetime(df[col], errors="coerce")
    return df


def op_trim_strings(df: pd.DataFrame, node_data: dict[str, Any]) -> pd.DataFrame:
    """
    Trim whitespace and optionally adjust case on string columns.
    node_data keys:
      - columns: optional list[str] (defaults to all string/object columns)
      - side: 'both' | 'left' | 'right' (default 'both')
      - case: 'none' | 'lower' | 'upper' | 'title'
    """
    df = df.copy()
    target_cols = node_data.get("columns") or df.select_dtypes(include=["object", "string"]).columns.tolist()
    side = node_data.get("side", "both")
    case = node_data.get("case", "none")

    for col in target_cols:
        if col not in df.columns:
            continue
        s = df[col].astype(str)
        if side == "left":
            s = s.str.lstrip()
        elif side == "right":
            s = s.str.rstrip()
        else:
            s = s.str.strip()

        if case == "lower":
            s = s.str.lower()
        elif case == "upper":
            s = s.str.upper()
        elif case == "title":
            s = s.str.title()
        df[col] = s
    return df


def op_scale_normalize(df: pd.DataFrame, node_data: dict[str, Any]) -> pd.DataFrame:
    """
    Scale numeric columns using min-max, z-score, or log normalization.
    node_data keys:
      - columns: optional list[str]
      - method: 'minmax' | 'zscore' | 'robust' | 'log' (default 'minmax')
    """
    df = df.copy()
    target_cols = node_data.get("columns") or df.select_dtypes(include="number").columns.tolist()
    method = node_data.get("method", "minmax").lower()

    for col in target_cols:
        if col not in df.columns:
            continue
        vals = pd.to_numeric(df[col], errors="coerce")
        if method == "minmax":
            mn, mx = vals.min(), vals.max()
            df[col] = (vals - mn) / (mx - mn) if mx > mn else 0.0
        elif method == "zscore":
            std = vals.std()
            df[col] = (vals - vals.mean()) / std if std > 0 else 0.0
        elif method == "robust":
            q25, q75 = vals.quantile(0.25), vals.quantile(0.75)
            iqr = q75 - q25
            df[col] = (vals - vals.median()) / iqr if iqr > 0 else 0.0
        elif method == "log":
            df[col] = np.log1p(vals.clip(lower=0))
    return df


def op_filter_columns(df: pd.DataFrame, node_data: dict[str, Any]) -> pd.DataFrame:
    columns: list[str] = node_data.get("columns", [])
    mode: str = node_data.get("mode", "keep")
    if not columns:
        return df
    existing = [c for c in columns if c in df.columns]
    if mode == "drop":
        return df.drop(columns=existing)
    return df[existing]


def op_select_columns(df: pd.DataFrame, node_data: dict[str, Any]) -> pd.DataFrame:
    """Alias for keeping explicit columns in specified order."""
    cols = node_data.get("columns", [])
    if not cols:
        return df
    existing = [c for c in cols if c in df.columns]
    return df[existing]


def op_rename(df: pd.DataFrame, node_data: dict[str, Any]) -> pd.DataFrame:
    mapping: dict[str, str] = node_data.get("mapping", {})
    return df.rename(columns=mapping)


def op_calc_field(df: pd.DataFrame, node_data: dict[str, Any]) -> pd.DataFrame:
    new_col: str = node_data.get("newColumn", "calc")
    expression: str = node_data.get("expression", "0")
    df = df.copy()
    local_vars = {col: df[col] for col in df.columns}
    try:
        df[new_col] = eval(expression, {"__builtins__": {}}, local_vars)  # noqa: S307
    except Exception as exc:
        raise ValueError(f"calcField expression error: {exc}") from exc
    return df


def op_add_column(df: pd.DataFrame, node_data: dict[str, Any]) -> pd.DataFrame:
    """
    Add a new column with constant, formula, or row index.
    node_data keys:
      - columnName: str
      - mode: 'constant' | 'index' | 'row_number' | 'expression'
      - value: Any
    """
    col_name = node_data.get("columnName", "new_col")
    mode = node_data.get("mode", "constant")
    df = df.copy()

    if mode == "index":
        df[col_name] = df.index
    elif mode == "row_number":
        df[col_name] = np.arange(1, len(df) + 1)
    elif mode == "expression":
        return op_calc_field(df, {"newColumn": col_name, "expression": str(node_data.get("value", "0"))})
    else:
        df[col_name] = node_data.get("value", "")
    return df


def op_string_ops(df: pd.DataFrame, node_data: dict[str, Any]) -> pd.DataFrame:
    """
    String operations: replace, regex, uppercase, lowercase, length, split.
    """
    df = df.copy()
    col = node_data.get("column")
    if not col or col not in df.columns:
        return df
    op = node_data.get("operation", "lower")
    out_col = node_data.get("newColumn") or col
    s = df[col].astype(str)

    if op == "lower":
        df[out_col] = s.str.lower()
    elif op == "upper":
        df[out_col] = s.str.upper()
    elif op == "replace":
        find_val = node_data.get("find", "")
        rep_val = node_data.get("replaceWith", "")
        df[out_col] = s.str.replace(find_val, rep_val, regex=False)
    elif op == "regex_replace":
        find_val = node_data.get("find", "")
        rep_val = node_data.get("replaceWith", "")
        df[out_col] = s.str.replace(find_val, rep_val, regex=True)
    elif op == "length":
        df[out_col] = s.str.len()
    elif op == "contains":
        pattern = node_data.get("find", "")
        df[out_col] = s.str.contains(pattern, regex=False, na=False)
    return df


# ---------------------------------------------------------------------------
# Reshape & Combine
# ---------------------------------------------------------------------------

def op_pivot(df: pd.DataFrame, node_data: dict[str, Any]) -> pd.DataFrame:
    """
    Pivot table / reshape wide.
    node_data keys:
      - index: list[str] | str
      - columns: str
      - values: str
      - aggfunc: 'sum' | 'mean' | 'count' | 'min' | 'max'
    """
    idx = node_data.get("index")
    cols = node_data.get("columns")
    vals = node_data.get("values")
    agg = node_data.get("aggfunc", "sum")

    if not idx or not cols or not vals:
        raise ValueError("Pivot requires 'index', 'columns', and 'values'.")

    pivoted = df.pivot_table(index=idx, columns=cols, values=vals, aggfunc=agg).reset_index()
    # Flatten multiindex columns if present
    if isinstance(pivoted.columns, pd.MultiIndex):
        pivoted.columns = ["_".join([str(c) for c in col if str(c)]).strip("_") for col in pivoted.columns]
    return pivoted


def op_melt(df: pd.DataFrame, node_data: dict[str, Any]) -> pd.DataFrame:
    """
    Melt (Unpivot) from wide to long format.
    node_data keys:
      - idVars: list[str]
      - valueVars: list[str]
      - varName: str (default 'variable')
      - valueName: str (default 'value')
    """
    id_vars = node_data.get("idVars") or []
    val_vars = node_data.get("valueVars")
    var_name = node_data.get("varName", "variable")
    value_name = node_data.get("valueName", "value")

    return df.melt(id_vars=id_vars, value_vars=val_vars, var_name=var_name, value_name=value_name)


def op_merge(left: pd.DataFrame, right: pd.DataFrame, node_data: dict[str, Any]) -> pd.DataFrame:
    how: str = node_data.get("how", "inner")
    on = node_data.get("on")
    left_on = node_data.get("leftOn")
    right_on = node_data.get("rightOn")

    if on:
        return pd.merge(left, right, on=on, how=how)
    if left_on and right_on:
        return pd.merge(left, right, left_on=left_on, right_on=right_on, how=how)
    common = list(set(left.columns) & set(right.columns))
    if not common:
        raise ValueError("merge node: no common columns and no 'on' key specified.")
    return pd.merge(left, right, on=common, how=how)


def op_concat(frames: list[pd.DataFrame], node_data: dict[str, Any]) -> pd.DataFrame:
    """
    Concatenate multiple DataFrames along rows (axis=0) or columns (axis=1).
    """
    if not frames:
        return pd.DataFrame()
    axis = int(node_data.get("axis", 0))
    return pd.concat(frames, axis=axis, ignore_index=True)


# ---------------------------------------------------------------------------
# Window, Analytics & Aggregations
# ---------------------------------------------------------------------------

def op_rolling_window(df: pd.DataFrame, node_data: dict[str, Any]) -> pd.DataFrame:
    """
    Compute rolling window statistics (mean, sum, min, max, std).
    """
    df = df.copy()
    col = node_data.get("column")
    window = int(node_data.get("window", 3))
    agg = node_data.get("agg", "mean").lower()
    out_col = node_data.get("newColumn") or f"{col}_rolling_{agg}_{window}"

    if not col or col not in df.columns:
        raise ValueError("Rolling window requires a valid 'column'.")

    s = pd.to_numeric(df[col], errors="coerce").rolling(window=window, min_periods=1)
    if agg == "sum":
        df[out_col] = s.sum()
    elif agg == "min":
        df[out_col] = s.min()
    elif agg == "max":
        df[out_col] = s.max()
    elif agg == "std":
        df[out_col] = s.std()
    else:
        df[out_col] = s.mean()
    return df


def op_group_by(df: pd.DataFrame, node_data: dict[str, Any]) -> pd.DataFrame:
    group_cols: list[str] = node_data.get("groupBy", [])
    agg_spec = node_data.get("agg", {})

    if not group_cols:
        raise ValueError("groupBy node: 'groupBy' list is required.")

    df = _coerce_numeric(df.copy())
    if isinstance(agg_spec, dict) and agg_spec:
        result = df.groupby(group_cols, dropna=False).agg(agg_spec).reset_index()
    else:
        numeric_cols = df.select_dtypes(include="number").columns.tolist()
        agg_dict = {c: "sum" for c in numeric_cols if c not in group_cols}
        result = df.groupby(group_cols, dropna=False).agg(agg_dict).reset_index()
    return result


def op_aggregate(df: pd.DataFrame, node_data: dict[str, Any]) -> pd.DataFrame:
    """
    Dataset-wide aggregate (without grouping).
    node_data keys:
      - aggregations: dict of { column: 'sum' | 'mean' | 'min' | 'max' | 'count' }
    """
    df = _coerce_numeric(df.copy())
    aggs = node_data.get("aggregations", {})
    if not aggs:
        # Default: sum all numeric columns
        numeric_cols = df.select_dtypes(include="number").columns.tolist()
        aggs = {c: "sum" for c in numeric_cols}

    res = df.agg(aggs)
    return pd.DataFrame([res.to_dict()])


def op_sort(df: pd.DataFrame, node_data: dict[str, Any]) -> pd.DataFrame:
    """
    Sort rows by one or more columns.
    node_data keys:
      - by: str | list[str]
      - ascending: bool (default True)
    """
    by = node_data.get("by") or df.columns[0]
    asc = bool(node_data.get("ascending", True))
    return df.sort_values(by=by, ascending=asc).reset_index(drop=True)


def op_slice(df: pd.DataFrame, node_data: dict[str, Any]) -> pd.DataFrame:
    """
    Slice DataFrame by row range or head/tail.
    node_data keys:
      - mode: 'head' | 'tail' | 'range'
      - start: int (default 0)
      - end: int
      - count: int (for head/tail)
    """
    mode = node_data.get("mode", "head")
    count = int(node_data.get("count", 10))
    if mode == "tail":
        return df.tail(count).reset_index(drop=True)
    if mode == "range":
        start = int(node_data.get("start", 0))
        end = int(node_data.get("end", len(df)))
        return df.iloc[start:end].reset_index(drop=True)
    return df.head(count).reset_index(drop=True)


def op_sample(df: pd.DataFrame, node_data: dict[str, Any]) -> pd.DataFrame:
    """
    Random sample of rows.
    node_data keys:
      - n: int
      - frac: float (0.0 to 1.0)
      - seed: int | None
    """
    seed = node_data.get("seed")
    if "frac" in node_data and node_data["frac"] is not None:
        frac = float(node_data["frac"])
        return df.sample(frac=frac, random_state=seed).reset_index(drop=True)
    n = min(int(node_data.get("n", 5)), len(df))
    return df.sample(n=n, random_state=seed).reset_index(drop=True)


def op_describe(df: pd.DataFrame, _node_data: dict[str, Any]) -> pd.DataFrame:
    """
    Extended statistical description including percentiles, skew, nulls.
    """
    desc = df.describe(include="all").T
    desc["null_count"] = df.isnull().sum()
    desc["null_pct"] = (df.isnull().mean() * 100).round(2)
    desc["unique_count"] = df.nunique()
    desc["dtype"] = df.dtypes.astype(str)
    return desc.reset_index().rename(columns={"index": "column"})


def op_profiler(df: pd.DataFrame, _node_data: dict[str, Any]) -> pd.DataFrame:
    return op_describe(df, _node_data)


def op_schema_validator(df: pd.DataFrame, node_data: dict[str, Any]) -> pd.DataFrame:
    """
    Assert column presence, maximum null tolerance, and minimum row count.
    node_data keys:
      - requiredColumns: list[str]
      - maxNullPct: float (e.g. 10.0 for max 10% nulls)
      - minRows: int
    """
    req_cols = node_data.get("requiredColumns", [])
    missing = [c for c in req_cols if c not in df.columns]
    if missing:
        raise ValueError(f"Schema Validation Failed: Missing required columns: {missing}")

    max_null = float(node_data.get("maxNullPct", 100.0))
    for col in df.columns:
        pct = (df[col].isnull().mean()) * 100
        if pct > max_null:
            raise ValueError(f"Schema Validation Failed: Column '{col}' null rate {pct:.1f}% exceeds max {max_null}%.")

    min_rows = int(node_data.get("minRows", 0))
    if len(df) < min_rows:
        raise ValueError(f"Schema Validation Failed: Row count {len(df)} is below minimum {min_rows}.")

    return df


def op_comment(df: pd.DataFrame, _node_data: dict[str, Any]) -> pd.DataFrame:
    """Pass-through for canvas documentation note."""
    return df


def op_preview(df: pd.DataFrame, node_data: dict[str, Any]) -> pd.DataFrame:
    n: int = int(node_data.get("rows", 100))
    return df.head(n)


def op_export(df: pd.DataFrame, _node_data: dict[str, Any]) -> pd.DataFrame:
    return df


def op_chart(df: pd.DataFrame, _node_data: dict[str, Any]) -> pd.DataFrame:
    return df
