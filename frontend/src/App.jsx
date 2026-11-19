import React, { Component, useState, useCallback, useRef } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  useReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import usePipelineStore from './store';
import nodeTypes from './nodes/index';
import NodePalette from './panels/NodePalette';
import AIChatDrawer from './panels/AIChatDrawer';
import ResultsDrawer from './panels/ResultsDrawer';
import TemplateGallery from './components/TemplateGallery';
import CodeExportModal from './components/CodeExportModal';

const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:8000' : '');

// ── Toolbar ───────────────────────────────────────────────────────────────
function Toolbar({ onOpenAi, onOpenTemplates, onOpenResults, onOpenCodeExport }) {
  const {
    nodes, edges, clearPipeline, getPipelineJson,
    setResults, setIsExecuting, setParseResult,
    isExecuting, parseResult, results, selectedNodeId,
  } = usePipelineStore();

  const handleParse = async () => {
    try {
      const res = await fetch(`${API_BASE}/pipelines/parse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(getPipelineJson()),
      });
      setParseResult(await res.json());
    } catch (e) {
      setParseResult({ error: e.message });
    }
  };

  const handleExecute = async () => {
    setIsExecuting(true);
    try {
      const res = await fetch(`${API_BASE}/pipelines/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(getPipelineJson()),
      });
      const data = await res.json();
      setResults(data.results ?? {});
      onOpenResults(); // Open results drawer upon execution
    } catch (e) {
      console.error(e);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleExportJson = () => {
    const json = JSON.stringify(getPipelineJson(), null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pipeline.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const errorCount = Object.values(results ?? {}).filter((r) => r?.error).length;

  return (
    <div style={toolbarStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ color: '#38bdf8', fontWeight: 800, fontSize: 16, letterSpacing: 0.5 }}>
          ⚡ DataFlow
        </span>
        <span style={{ color: '#64748b', fontSize: 12 }}>
          {nodes.length} nodes · {edges.length} edges
        </span>
      </div>

      <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
        {parseResult && !parseResult.error && (
          <span style={{
            fontSize: 11, padding: '3px 8px', borderRadius: 4,
            background: parseResult.is_dag ? '#14532d' : '#7f1d1d',
            color: parseResult.is_dag ? '#86efac' : '#fca5a5',
            fontWeight: 600,
          }}>
            {parseResult.is_dag ? '✓ Valid DAG' : '✗ Cycle Detected'}
          </span>
        )}

        {errorCount > 0 && (
          <span style={{ fontSize: 11, color: '#f87171', fontWeight: 600 }}>
            ⚠ {errorCount} error(s)
          </span>
        )}

        <Btn onClick={handleParse} color="#4f46e5">Validate DAG</Btn>
        <Btn onClick={handleExecute} color="#0284c7" disabled={isExecuting}>
          {isExecuting ? 'Running…' : '▶ Execute'}
        </Btn>
        <Btn onClick={onOpenTemplates} color="#475569">📚 Templates</Btn>
        <Btn onClick={onOpenAi} color="#8b5cf6">✨ AI Designer</Btn>
        <Btn onClick={onOpenCodeExport} color="#0d9488">💻 Code Export</Btn>
        <Btn onClick={onOpenResults} color="#0369a1">
          📊 Results {selectedNodeId ? `(${selectedNodeId})` : ''}
        </Btn>
        <Btn onClick={handleExportJson} color="#059669">Export JSON</Btn>
        <Btn onClick={clearPipeline} color="#dc2626">Clear</Btn>
      </div>
    </div>
  );
}

function Btn({ children, onClick, color, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background: disabled ? '#1e293b' : color,
      border: 'none', borderRadius: 6,
      color: disabled ? '#475569' : '#fff',
      cursor: disabled ? 'not-allowed' : 'pointer',
      fontSize: 12, fontWeight: 600,
      padding: '5px 11px',
      transition: 'opacity 0.15s',
    }}>
      {children}
    </button>
  );
}

// ── Canvas ────────────────────────────────────────────────────────────────
function Canvas({ onSelectNode }) {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, addNode, setSelectedNodeId } =
    usePipelineStore();
  const reactFlowWrapper = useRef(null);
  const { screenToFlowPosition } = useReactFlow();

  const onDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('application/reactflow');
    if (!type) return;
    const position = screenToFlowPosition({ x: e.clientX, y: e.clientY });
    addNode(type, position);
  }, [screenToFlowPosition, addNode]);

  const onNodeClick = useCallback((_e, node) => {
    setSelectedNodeId(node.id);
    onSelectNode?.(node.id);
  }, [setSelectedNodeId, onSelectNode]);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, [setSelectedNodeId]);

  return (
    <div ref={reactFlowWrapper} style={{ flex: 1, height: '100%', position: 'relative' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        style={{ background: '#020617' }}
        deleteKeyCode="Delete"
      >
        <Background variant={BackgroundVariant.Dots} gap={20} color="#1e293b" />
        <Controls style={{ background: '#0f172a', border: '1px solid #1e293b' }} />
        <MiniMap
          style={{ background: '#0f172a', border: '1px solid #1e293b' }}
          nodeColor={() => '#38bdf8'}
        />
      </ReactFlow>
    </div>
  );
}

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('DataFlow Caught Render Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: 32,
          background: '#0b1120',
          color: '#f8fafc',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif'
        }}>
          <h2 style={{ color: '#ef4444', marginBottom: 12 }}>⚠ Application Render Error</h2>
          <p style={{ color: '#94a3b8', marginBottom: 16, maxWidth: 500, textAlign: 'center', fontSize: 13 }}>
            {this.state.error?.message || 'An unexpected rendering error occurred.'}
          </p>
          <button
            onClick={() => {
              localStorage.removeItem('dataflow_pipeline');
              window.location.reload();
            }}
            style={{
              background: '#0284c7',
              border: 'none',
              borderRadius: 6,
              color: '#fff',
              padding: '8px 18px',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Reset Pipeline & Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── Root ──────────────────────────────────────────────────────────────────
export default function App() {
  const [aiOpen, setAiOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [resultsOpen, setResultsOpen] = useState(false);
  const [codeExportOpen, setCodeExportOpen] = useState(false);

  const { nodes, edges, loadPipeline } = usePipelineStore();

  const handleTemplateLoad = (template) => {
    if (template && template.nodes && template.edges) {
      loadPipeline(template.nodes, template.edges);
    }
  };

  return (
    <ErrorBoundary>
      <ReactFlowProvider>
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#020617' }}>
          <Toolbar
            onOpenAi={() => setAiOpen(true)}
            onOpenTemplates={() => setTemplatesOpen(true)}
            onOpenResults={() => setResultsOpen(true)}
            onOpenCodeExport={() => setCodeExportOpen(true)}
          />

          <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            <NodePalette />
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', position: 'relative' }}>
              <Canvas onSelectNode={() => setResultsOpen(true)} />
            </div>
          </div>

          {/* Slide-out & Modal Drawers */}
          <AIChatDrawer open={aiOpen} onClose={() => setAiOpen(false)} />
          <ResultsDrawer open={resultsOpen} onClose={() => setResultsOpen(false)} />
          <TemplateGallery
            open={templatesOpen}
            onClose={() => setTemplatesOpen(false)}
            onLoad={handleTemplateLoad}
          />
          <CodeExportModal
            open={codeExportOpen}
            onClose={() => setCodeExportOpen(false)}
            nodes={nodes}
            edges={edges}
          />
        </div>
      </ReactFlowProvider>
    </ErrorBoundary>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────
const toolbarStyle = {
  background: '#0b1120',
  borderBottom: '1px solid #1e293b',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '8px 16px',
  minHeight: 48,
  flexShrink: 0,
};
