# DataFlow – shared rules (all agents read this first)

## Stack
Backend: Python 3.11, FastAPI, Pandas, Pydantic v2. Frontend: React + Vite, ReactFlow, Zustand.

## Folder ownership (never edit outside your folder)
- Backend agent: backend/main.py, executor.py, data_ops.py
- Canvas agent: frontend/src/nodes, store.js, App.jsx
- AI agent: backend/ai_generator.py, frontend/src/panels/AIChatDrawer.jsx
- UI agent: frontend/src/components, frontend/src/panels (except AIChatDrawer)

## Data contracts
Node: { id, type, data, position:{x,y} }   Edge: { id, source, target }
POST /pipelines/parse     body {nodes, edges} -> {is_dag: bool, num_nodes, num_edges}
POST /pipelines/execute   body {nodes, edges} -> {results: {nodeId: {columns, rows, error?}}}
POST /ai/generate-pipeline body {prompt, apiKey?} -> {nodes, edges}
Node types: load, dropNulls, dedupe, fillMissing, filterColumns, rename, calcField, merge, groupBy, profiler, chart, preview, export

## Rules
- Commit small and often. Do not change these contracts; if one must change, stop and ask me.
- Done = code runs, and you state exactly how to test it.