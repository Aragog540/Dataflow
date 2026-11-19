"""
data_ops.py – Pure Pandas transformation functions.
Each function receives a DataFrame and a node-data dict; returns a DataFrame.
Owned by: Backend agent.
"""
from __future__ import annotations

import ast
import io
import os
from pathlib import Path
from typing import Any

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
# Node operations
# ---------------------------------------------------------------------------

def op_load(node_data: dict[str, Any]) -> pd.DataFrame:
    """
    Load a CSV or JSON file from disk or in-memory content.
    node_data keys:
      - filePath   : absolute or repo-relative path
      - fileContent: raw CSV/JSON text (or dict with value)
      - fileName   : original filename (used to detect format)
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


def op_drop_nulls(df: pd.DataFrame, node_data: dict[str, Any]) -> pd.DataFrame:
    """Drop rows that contain any null value (or only in specified columns)."""
    columns = node_data.get("columns")  # optional list[str]
    if columns:
        return df.dropna(subset=columns).reset_index(drop=True)
    return df.dropna().reset_index(drop=True)


def op_dedupe(df: pd.DataFrame, node_data: dict[str, Any]) -> pd.DataFrame:
    """Remove duplicate rows, optionally scoped to a subset of columns."""
    columns = node_data.get("columns")  # optional list[str]
    keep = node_data.get("keep", "first")
    if columns:
        return df.drop_duplicates(subset=columns, keep=keep).reset_index(drop=True)
    return df.drop_duplicates(keep=keep).reset_index(drop=True)


def op_fill_missing(df: pd.DataFrame, node_data: dict[str, Any]) -> pd.DataFrame:
    """
    Fill missing values.
    node_data keys:
      - strategy : 'value' | 'mean' | 'median' | 'mode' | 'ffill' | 'bfill'
      - value    : fill value when strategy == 'value'
      - columns  : optional list[str] to scope operation
    """
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
            df[col] = df[col].fillna(df[col].mean())
        elif strategy == "median":
            df[col] = df[col].fillna(df[col].median())
        elif strategy == "mode":
            mode_val = df[col].mode()
            df[col] = df[col].fillna(mode_val[0] if not mode_val.empty else fill_value)
        elif strategy == "ffill":
            df[col] = df[col].ffill()
        elif strategy == "bfill":
            df[col] = df[col].bfill()
    return df


def op_filter_columns(df: pd.DataFrame, node_data: dict[str, Any]) -> pd.DataFrame:
    """
    Keep or drop columns.
    node_data keys:
      - columns : list[str] – columns to keep (if mode=='keep') or drop
      - mode    : 'keep' (default) | 'drop'
    """
    columns: list[str] = node_data.get("columns", [])
    mode: str = node_data.get("mode", "keep")
    if not columns:
        return df
    existing = [c for c in columns if c in df.columns]
    if mode == "drop":
        return df.drop(columns=existing)
    return df[existing]


def op_rename(df: pd.DataFrame, node_data: dict[str, Any]) -> pd.DataFrame:
    """
    Rename columns.
    node_data keys:
      - mapping : dict[str, str]  old_name -> new_name
    """
    mapping: dict[str, str] = node_data.get("mapping", {})
    return df.rename(columns=mapping)


def op_calc_field(df: pd.DataFrame, node_data: dict[str, Any]) -> pd.DataFrame:
    """
    Add a calculated column using a safe eval expression.
    node_data keys:
      - newColumn  : str  name of the new column
      - expression : str  Python expression referencing column names as variables
                         e.g. "quantity * unit_price"
    """
    new_col: str = node_data.get("newColumn", "calc")
    expression: str = node_data.get("expression", "0")

    df = df.copy()
    local_vars = {col: df[col] for col in df.columns}
    try:
        df[new_col] = eval(expression, {"__builtins__": {}}, local_vars)  # noqa: S307
    except Exception as exc:
        raise ValueError(f"calcField expression error: {exc}") from exc
    return df


def op_merge(
    left: pd.DataFrame,
    right: pd.DataFrame,
    node_data: dict[str, Any],
) -> pd.DataFrame:
    """
    Merge two DataFrames.
    node_data keys:
      - on       : str | list[str]  join key(s)
      - how      : 'inner' | 'left' | 'right' | 'outer'  (default 'inner')
      - leftOn   : str | list[str]  (alternative to 'on')
      - rightOn  : str | list[str]
    """
    how: str = node_data.get("how", "inner")
    on = node_data.get("on")
    left_on = node_data.get("leftOn")
    right_on = node_data.get("rightOn")

    if on:
        return pd.merge(left, right, on=on, how=how)
    if left_on and right_on:
        return pd.merge(left, right, left_on=left_on, right_on=right_on, how=how)
    # fallback: merge on common columns
    common = list(set(left.columns) & set(right.columns))
    if not common:
        raise ValueError("merge node: no common columns and no 'on' key specified.")
    return pd.merge(left, right, on=common, how=how)


def op_group_by(df: pd.DataFrame, node_data: dict[str, Any]) -> pd.DataFrame:
    """
    Group and aggregate.
    node_data keys:
      - groupBy  : list[str]        columns to group on
      - agg      : dict[str, str]   col -> agg_func  e.g. {"revenue": "sum"}
                   OR list[str] of agg funcs applied to all numeric cols
    """
    group_cols: list[str] = node_data.get("groupBy", [])
    agg_spec = node_data.get("agg", {})

    if not group_cols:
        raise ValueError("groupBy node: 'groupBy' list is required.")

    # Coerce object columns that look numeric before aggregating
    df = _coerce_numeric(df.copy())

    if isinstance(agg_spec, dict) and agg_spec:
        result = df.groupby(group_cols, dropna=False).agg(agg_spec).reset_index()
    else:
        # default: sum all numeric columns
        numeric_cols = df.select_dtypes(include="number").columns.tolist()
        agg_dict = {c: "sum" for c in numeric_cols if c not in group_cols}
        result = df.groupby(group_cols, dropna=False).agg(agg_dict).reset_index()

    return result


def op_profiler(df: pd.DataFrame, _node_data: dict[str, Any]) -> pd.DataFrame:
    """Return a column-statistics summary DataFrame."""
    desc = df.describe(include="all").T
    desc["null_count"] = df.isnull().sum()
    desc["null_pct"] = (df.isnull().mean() * 100).round(2)
    desc["dtype"] = df.dtypes.astype(str)
    return desc.reset_index().rename(columns={"index": "column"})


def op_preview(df: pd.DataFrame, node_data: dict[str, Any]) -> pd.DataFrame:
    """Return first N rows (default 100)."""
    n: int = int(node_data.get("rows", 100))
    return df.head(n)


def op_export(df: pd.DataFrame, _node_data: dict[str, Any]) -> pd.DataFrame:
    """Pass-through; actual file export is a frontend concern."""
    return df


def op_chart(df: pd.DataFrame, _node_data: dict[str, Any]) -> pd.DataFrame:
    """Pass-through; rendering is a frontend concern."""
    return df
