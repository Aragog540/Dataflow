import { create } from 'zustand';
import { addEdge } from '@xyflow/react';
import { applyNodeChanges, applyEdgeChanges } from '@xyflow/system';

const STORAGE_KEY = 'dataflow_pipeline';

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return { nodes: [], edges: [] };
}

function saveToStorage(nodes, edges) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ nodes, edges }));
  } catch (_) {}
}

const { nodes: savedNodes, edges: savedEdges } = loadFromStorage();

const usePipelineStore = create((set, get) => ({
  nodes: savedNodes,
  edges: savedEdges,

  // ── ReactFlow change handlers ──────────────────────────────────────────
  onNodesChange: (changes) => {
    const nodes = applyNodeChanges(changes, get().nodes);
    saveToStorage(nodes, get().edges);
    set({ nodes });
  },

  onEdgesChange: (changes) => {
    const edges = applyEdgeChanges(changes, get().edges);
    saveToStorage(get().nodes, edges);
    set({ edges });
  },

  onConnect: (connection) => {
    const edges = addEdge({ ...connection, animated: true }, get().edges);
    saveToStorage(get().nodes, edges);
    set({ edges });
  },

  // ── Node CRUD ─────────────────────────────────────────────────────────
  addNode: (type, position, extraData = {}) => {
    const id = `${type}-${Date.now()}`;
    const node = {
      id,
      type,
      position,
      data: { label: type, ...extraData },
    };
    const nodes = [...get().nodes, node];
    saveToStorage(nodes, get().edges);
    set({ nodes });
  },

  updateNodeData: (id, patch) => {
    const nodes = get().nodes.map((n) =>
      n.id === id ? { ...n, data: { ...n.data, ...patch } } : n
    );
    saveToStorage(nodes, get().edges);
    set({ nodes });
  },

  deleteNode: (id) => {
    const nodes = get().nodes.filter((n) => n.id !== id);
    const edges = get().edges.filter(
      (e) => e.source !== id && e.target !== id
    );
    saveToStorage(nodes, edges);
    set({ nodes, edges });
  },

  // ── Selected node ──────────────────────────────────────────────────────
  selectedNodeId: null,
  setSelectedNodeId: (id) => set({ selectedNodeId: id }),

  // ── Pipeline helpers ───────────────────────────────────────────────────
  loadPipeline: (nodes, edges) => {
    saveToStorage(nodes, edges);
    set({ nodes, edges, selectedNodeId: null, results: {}, parseResult: null });
  },

  clearPipeline: () => {
    saveToStorage([], []);
    set({ nodes: [], edges: [], selectedNodeId: null });
  },

  getPipelineJson: () => {
    const { nodes, edges } = get();
    return { nodes, edges };
  },

  // ── Execution results ──────────────────────────────────────────────────
  results: {},            // { nodeId: { columns, rows, error } }
  isExecuting: false,
  parseResult: null,      // { is_dag, num_nodes, num_edges }

  setResults: (results) => set({ results }),
  setIsExecuting: (v) => set({ isExecuting: v }),
  setParseResult: (r) => set({ parseResult: r }),
}));

export default usePipelineStore;
