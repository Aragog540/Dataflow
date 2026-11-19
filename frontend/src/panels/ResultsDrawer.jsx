import { useState } from 'react';
import DataTable from '../components/DataTable';
import ChartRenderer from '../components/ChartRenderer';
import ProfilerView from '../components/ProfilerView';
import ExportButton from '../components/ExportButton';
import usePipelineStore from '../store';

export default function ResultsDrawer({ open, onClose }) {
  const [activeTab, setActiveTab] = useState('Table');

  if (!open) return null;

  const storeState = usePipelineStore();
  const results = storeState.results || {};
  const selectedNodeId = storeState.selectedNodeId;
  const nodes = storeState.nodes || [];

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);
  const result = selectedNodeId ? results[selectedNodeId] : null;

  const tabs = ['Table', 'Chart', 'Profile', 'Export'];

  return (
    <aside style={drawerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <div>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#f8fafc' }}>
            📊 Node Results
          </span>
          {selectedNodeId && (
            <span style={{ marginLeft: 8, fontSize: 11, color: '#38bdf8' }}>
              ({selectedNode?.type || selectedNodeId})
            </span>
          )}
        </div>
        <button onClick={onClose} style={closeBtnStyle}>✕</button>
      </div>

      {/* Content */}
      {!selectedNodeId ? (
        <div style={emptyStyle}>
          Click a node on the canvas to inspect its execution results.
        </div>
      ) : !result ? (
        <div style={emptyStyle}>
          No results for this node yet. Hit ▶ Execute in the toolbar.
        </div>
      ) : result.error ? (
        <div style={errorStyle}>
          <strong>Error executing node:</strong>
          <pre style={{ marginTop: 6, whiteSpace: 'pre-wrap', fontSize: 11 }}>
            {result.error}
          </pre>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          {/* Tabs */}
          <div style={tabBarStyle}>
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  ...tabItemStyle,
                  background: activeTab === tab ? '#1e3a5f' : 'transparent',
                  color: activeTab === tab ? '#93c5fd' : '#94a3b8',
                  borderBottom: activeTab === tab ? '2px solid #38bdf8' : '2px solid transparent',
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab contents */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
            {activeTab === 'Table' && (
              <DataTable columns={result.columns} rows={result.rows} />
            )}

            {activeTab === 'Chart' && (
              <ChartRenderer
                chartType={selectedNode?.data?.chartType || 'bar'}
                columns={result.columns}
                rows={result.rows}
                xCol={selectedNode?.data?.xAxis || (result.columns[0] ?? '')}
                yCol={selectedNode?.data?.yAxis || (result.columns[1] ?? '')}
              />
            )}

            {activeTab === 'Profile' && (
              <ProfilerView columns={result.columns} rows={result.rows} />
            )}

            {activeTab === 'Export' && (
              <div style={{ padding: 16, background: '#1e293b', borderRadius: 8 }}>
                <div style={{ marginBottom: 12, fontSize: 12, color: '#94a3b8' }}>
                  Export processed output for node <strong>{selectedNodeId}</strong> ({result.rows.length} rows, {result.columns.length} columns):
                </div>
                <ExportButton
                  columns={result.columns}
                  rows={result.rows}
                  filename={`dataflow-${selectedNodeId}`}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}

const drawerStyle = {
  position: 'fixed',
  right: 0,
  top: 0,
  height: '100vh',
  width: 520,
  background: '#0f172a',
  borderLeft: '1px solid #1e293b',
  zIndex: 500,
  display: 'flex',
  flexDirection: 'column',
  boxShadow: '-4px 0 20px rgba(0,0,0,0.5)',
  fontFamily: 'sans-serif',
};

const headerStyle = {
  padding: '12px 16px',
  borderBottom: '1px solid #1e293b',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
};

const closeBtnStyle = {
  background: 'transparent',
  border: 'none',
  color: '#94a3b8',
  cursor: 'pointer',
  fontSize: 14,
};

const tabBarStyle = {
  display: 'flex',
  borderBottom: '1px solid #1e293b',
  background: '#090d16',
};

const tabItemStyle = {
  flex: 1,
  padding: '8px 12px',
  cursor: 'pointer',
  fontSize: 12,
  fontWeight: 600,
  border: 'none',
};

const emptyStyle = {
  padding: 32,
  textAlign: 'center',
  color: '#64748b',
  fontSize: 12,
};

const errorStyle = {
  margin: 16,
  padding: 12,
  background: '#450a0a',
  border: '1px solid #ef4444',
  borderRadius: 8,
  color: '#fca5a5',
  fontSize: 12,
};
