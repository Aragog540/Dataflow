import { useState } from 'react';

const TEMPLATES = [
  {
    emoji: '👁',
    name: 'Quick Preview',
    description: 'Load data and immediately preview it.',
    nodes: [
      { id: 't1-load', type: 'load', data: {}, position: { x: 100, y: 100 } },
      { id: 't1-prev', type: 'preview', data: {}, position: { x: 320, y: 100 } },
    ],
    edges: [{ id: 'e1', source: 't1-load', target: 't1-prev' }],
  },
  {
    emoji: '🧹',
    name: 'Clean & Export',
    description: 'Drop nulls, deduplicate, fill missing values, then export.',
    nodes: [
      { id: 't2-load', type: 'load', data: {}, position: { x: 100, y: 100 } },
      { id: 't2-drop', type: 'dropNulls', data: {}, position: { x: 320, y: 100 } },
      { id: 't2-dedup', type: 'dedupe', data: {}, position: { x: 540, y: 100 } },
      { id: 't2-fill', type: 'fillMissing', data: {}, position: { x: 760, y: 100 } },
      { id: 't2-exp', type: 'export', data: {}, position: { x: 980, y: 100 } },
    ],
    edges: [
      { id: 'e1', source: 't2-load', target: 't2-drop' },
      { id: 'e2', source: 't2-drop', target: 't2-dedup' },
      { id: 'e3', source: 't2-dedup', target: 't2-fill' },
      { id: 'e4', source: 't2-fill', target: 't2-exp' },
    ],
  },
  {
    emoji: '📊',
    name: 'Data Profile',
    description: 'Load data and run a statistical profiler.',
    nodes: [
      { id: 't3-load', type: 'load', data: {}, position: { x: 100, y: 100 } },
      { id: 't3-prof', type: 'profiler', data: {}, position: { x: 320, y: 100 } },
    ],
    edges: [{ id: 'e1', source: 't3-load', target: 't3-prof' }],
  },
  {
    emoji: '📈',
    name: 'Group & Chart',
    description: 'Clean data, group by a column, and visualize.',
    nodes: [
      { id: 't4-load', type: 'load', data: {}, position: { x: 100, y: 100 } },
      { id: 't4-drop', type: 'dropNulls', data: {}, position: { x: 320, y: 100 } },
      { id: 't4-grp', type: 'groupBy', data: {}, position: { x: 540, y: 100 } },
      { id: 't4-chart', type: 'chart', data: {}, position: { x: 760, y: 100 } },
    ],
    edges: [
      { id: 'e1', source: 't4-load', target: 't4-drop' },
      { id: 'e2', source: 't4-drop', target: 't4-grp' },
      { id: 'e3', source: 't4-grp', target: 't4-chart' },
    ],
  },
  {
    emoji: '🔄',
    name: 'Full ETL',
    description: 'Complete pipeline: clean, transform, filter, rename, export.',
    nodes: [
      { id: 't5-load', type: 'load', data: {}, position: { x: 100, y: 100 } },
      { id: 't5-drop', type: 'dropNulls', data: {}, position: { x: 320, y: 100 } },
      { id: 't5-dedup', type: 'dedupe', data: {}, position: { x: 540, y: 100 } },
      { id: 't5-fill', type: 'fillMissing', data: {}, position: { x: 760, y: 100 } },
      { id: 't5-filt', type: 'filterColumns', data: {}, position: { x: 980, y: 100 } },
      { id: 't5-ren', type: 'rename', data: {}, position: { x: 1200, y: 100 } },
      { id: 't5-exp', type: 'export', data: {}, position: { x: 1420, y: 100 } },
    ],
    edges: [
      { id: 'e1', source: 't5-load', target: 't5-drop' },
      { id: 'e2', source: 't5-drop', target: 't5-dedup' },
      { id: 'e3', source: 't5-dedup', target: 't5-fill' },
      { id: 'e4', source: 't5-fill', target: 't5-filt' },
      { id: 'e5', source: 't5-filt', target: 't5-ren' },
      { id: 'e6', source: 't5-ren', target: 't5-exp' },
    ],
  },
];

export default function TemplateGallery({ open, onClose, onLoad }) {
  const [hovered, setHovered] = useState(null);

  if (!open) return null;

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: 24, width: 640, maxHeight: '80vh', overflowY: 'auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: '#e2e8f0' }}>📚 Pipeline Templates</span>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: 20, cursor: 'pointer', lineHeight: 1 }}
          >
            ✕
          </button>
        </div>
        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {TEMPLATES.map((tpl, i) => (
            <div
              key={i}
              onClick={() => { onLoad(tpl); onClose(); }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{
                background: '#1e293b',
                borderRadius: 8,
                padding: 16,
                cursor: 'pointer',
                border: `1px solid ${hovered === i ? '#3b82f6' : '#334155'}`,
                transition: 'border-color 0.15s',
              }}
            >
              <div style={{ fontWeight: 700, color: '#e2e8f0', fontSize: 13, marginBottom: 6 }}>
                {tpl.emoji} {tpl.name}
              </div>
              <div style={{ color: '#94a3b8', fontSize: 11, marginBottom: 10, lineHeight: 1.4 }}>
                {tpl.description}
              </div>
              <span style={{ background: '#1e3a5f', color: '#93c5fd', fontSize: 10, borderRadius: 4, padding: '1px 6px' }}>
                {tpl.nodes.length} nodes
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
