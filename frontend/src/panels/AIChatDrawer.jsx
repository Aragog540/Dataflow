// store must expose: loadPipeline(nodes, edges) -> set({nodes, edges})
// Call via: usePipelineStore.getState().loadPipeline?.(nodes, edges)
import { useState } from 'react';
import usePipelineStore from '../store';

const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:8000' : '');

const styles = {
  drawer: {
    position: 'fixed',
    right: 0,
    top: 0,
    width: 400,
    height: '100vh',
    background: '#0f172a',
    borderLeft: '1px solid #1e293b',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'sans-serif',
    color: '#e2e8f0',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    background: '#1e293b',
    borderBottom: '1px solid #334155',
    flexShrink: 0,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: '#e2e8f0',
    margin: 0,
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    fontSize: 18,
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: 4,
    lineHeight: 1,
  },
  historyContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '12px 16px',
    display: 'flex',
    flexDirection: 'column-reverse',
    gap: 8,
  },
  historyItem: {
    background: '#1e293b',
    borderRadius: 8,
    padding: '10px 14px',
    border: '1px solid #334155',
  },
  historyPrompt: {
    fontSize: 13,
    color: '#e2e8f0',
    marginBottom: 4,
    wordBreak: 'break-word',
  },
  historyMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 11,
    color: '#64748b',
  },
  badgeSuccess: {
    background: '#14532d',
    color: '#86efac',
    padding: '2px 8px',
    borderRadius: 4,
    fontSize: 11,
  },
  badgeError: {
    background: '#450a0a',
    color: '#fca5a5',
    padding: '2px 8px',
    borderRadius: 4,
    fontSize: 11,
  },
  form: {
    padding: '16px',
    background: '#1e293b',
    borderTop: '1px solid #334155',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    flexShrink: 0,
  },
  textarea: {
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: 6,
    color: '#e2e8f0',
    padding: '10px 12px',
    fontSize: 13,
    resize: 'vertical',
    minHeight: 72,
    outline: 'none',
    fontFamily: 'sans-serif',
  },
  passwordInput: {
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: 6,
    color: '#e2e8f0',
    padding: '8px 12px',
    fontSize: 13,
    outline: 'none',
  },
  submitBtn: {
    background: '#3b82f6',
    border: 'none',
    borderRadius: 6,
    color: '#fff',
    padding: '10px 16px',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background 0.15s',
  },
  submitBtnDisabled: {
    background: '#1e3a5f',
    cursor: 'not-allowed',
    color: '#93c5fd',
  },
  errorBox: {
    background: '#450a0a',
    border: '1px solid #7f1d1d',
    borderRadius: 6,
    color: '#fca5a5',
    padding: '8px 12px',
    fontSize: 12,
  },
  emptyState: {
    color: '#475569',
    fontSize: 13,
    textAlign: 'center',
    padding: '24px 0',
  },
};

export default function AIChatDrawer({ open, onClose }) {
  const [prompt, setPrompt] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setError(null);

    const submittedPrompt = prompt.trim();
    try {
      const body = { prompt: submittedPrompt };
      if (apiKey.trim()) body.apiKey = apiKey.trim();

      const res = await fetch(`${API_BASE}/ai/generate-pipeline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Server error ${res.status}: ${text}`);
      }

      const data = await res.json();
      const { nodes, edges } = data;

      // Load into canvas store
      if (nodes && edges) {
        usePipelineStore.getState().loadPipeline?.(nodes, edges);
      }

      setHistory((h) => [
        {
          prompt: submittedPrompt,
          status: 'ok',
          nodeCount: nodes?.length ?? 0,
          timestamp: new Date().toLocaleTimeString(),
        },
        ...h,
      ]);
      setPrompt('');
    } catch (err) {
      setError(err.message || 'Unknown error');
      setHistory((h) => [
        {
          prompt: submittedPrompt,
          status: 'error',
          nodeCount: 0,
          timestamp: new Date().toLocaleTimeString(),
        },
        ...h,
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.drawer}>
      {/* Header */}
      <div style={styles.header}>
        <span style={styles.headerTitle}>✨ AI Pipeline Generator</span>
        <button style={styles.closeBtn} onClick={onClose} aria-label="Close">
          ✕
        </button>
      </div>

      {/* History */}
      <div style={styles.historyContainer}>
        {history.length === 0 ? (
          <p style={styles.emptyState}>
            Describe a data pipeline and click Generate.
          </p>
        ) : (
          history.map((item, idx) => (
            <div key={idx} style={styles.historyItem}>
              <div style={styles.historyPrompt}>{item.prompt}</div>
              <div style={styles.historyMeta}>
                {item.status === 'ok' ? (
                  <span style={styles.badgeSuccess}>✓ {item.nodeCount} nodes</span>
                ) : (
                  <span style={styles.badgeError}>✗ error</span>
                )}
                <span>{item.timestamp}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Form */}
      <form style={styles.form} onSubmit={handleSubmit}>
        {error && <div style={styles.errorBox}>{error}</div>}
        <textarea
          style={styles.textarea}
          rows={3}
          placeholder="e.g. Load CSV, drop nulls, group by region, bar chart"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={loading}
        />
        <input
          type="password"
          style={styles.passwordInput}
          placeholder="Groq API key (optional)"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          style={loading ? { ...styles.submitBtn, ...styles.submitBtnDisabled } : styles.submitBtn}
          disabled={loading}
        >
          {loading ? 'Generating…' : 'Generate Pipeline'}
        </button>
      </form>
    </div>
  );
}
