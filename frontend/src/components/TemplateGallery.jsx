import { useState } from 'react';
import { PIPELINE_TEMPLATES } from '../pipelineTemplates';

export default function TemplateGallery({ open, onClose, onLoad }) {
  const [hovered, setHovered] = useState(null);

  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.75)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: '#0a0f1d',
          border: '1px solid #1e293b',
          borderRadius: 14,
          padding: 24,
          width: 760,
          maxWidth: '95vw',
          maxHeight: '85vh',
          overflowY: 'auto',
          boxShadow: '0 20px 50px rgba(0,0,0,0.7)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#f8fafc', margin: 0 }}>
              📚 Pre-Configured Pipeline Templates
            </h2>
            <p style={{ color: '#64748b', fontSize: 12, marginTop: 4, marginBottom: 0 }}>
              Select any recipe below. Each template comes fully pre-loaded with sample CSV datasets ready for 1-click execution.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              fontSize: 20,
              cursor: 'pointer',
              lineHeight: 1,
              padding: 4,
            }}
          >
            ✕
          </button>
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14, marginTop: 18 }}>
          {PIPELINE_TEMPLATES.map((tpl, i) => (
            <div
              key={i}
              onClick={() => { onLoad(tpl); onClose(); }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{
                background: hovered === i ? '#162238' : '#0f172a',
                borderRadius: 10,
                padding: 16,
                cursor: 'pointer',
                border: `1px solid ${hovered === i ? '#38bdf8' : '#1e293b'}`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.18s ease-in-out',
                transform: hovered === i ? 'translateY(-2px)' : 'none',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 22 }}>{tpl.emoji}</span>
                  {tpl.badge && (
                    <span
                      style={{
                        background: '#1e3a5f',
                        color: '#38bdf8',
                        fontSize: 10,
                        fontWeight: 700,
                        borderRadius: 4,
                        padding: '2px 6px',
                      }}
                    >
                      {tpl.badge}
                    </span>
                  )}
                </div>
                <div style={{ fontWeight: 700, color: '#f1f5f9', fontSize: 13, marginBottom: 6, lineHeight: 1.3 }}>
                  {tpl.name}
                </div>
                <div style={{ color: '#94a3b8', fontSize: 11, marginBottom: 12, lineHeight: 1.4 }}>
                  {tpl.description}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #1e293b', paddingTop: 8, marginTop: 4 }}>
                <span style={{ color: '#475569', fontSize: 11 }}>
                  {tpl.nodes.length} nodes · {tpl.edges.length} edges
                </span>
                <span style={{ color: '#10b981', fontSize: 10, fontWeight: 600 }}>
                  ✓ CSV Embedded
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
