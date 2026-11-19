import { useState } from 'react';

export default function CodeExportModal({ open, onClose, nodes = [], edges = [] }) {
  const [lang, setLang] = useState('python');
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  const generatePython = () => {
    let code = `import pandas as pd\n\n# DataFlow Generated ETL Script\n`;
    nodes.forEach((n, idx) => {
      const varName = `df_${n.id.replace(/[^a-zA-Z0-9]/g, '_')}`;
      const parentEdges = edges.filter((e) => e.target === n.id);
      const parentVar = parentEdges.length > 0 ? `df_${parentEdges[0].source.replace(/[^a-zA-Z0-9]/g, '_')}` : 'df';

      if (n.type === 'load') {
        const path = n.data?.filePath || 'sample-data/sales_orders.csv';
        code += `${varName} = pd.read_csv("${path}")\n`;
      } else if (n.type === 'dropNulls') {
        code += `${varName} = ${parentVar}.dropna().reset_index(drop=True)\n`;
      } else if (n.type === 'dedupe') {
        code += `${varName} = ${parentVar}.drop_duplicates().reset_index(drop=True)\n`;
      } else if (n.type === 'fillMissing') {
        const val = n.data?.value ?? 0;
        code += `${varName} = ${parentVar}.fillna(${JSON.stringify(val)})\n`;
      } else if (n.type === 'filterColumns') {
        const cols = JSON.stringify(n.data?.columns || []);
        if (n.data?.mode === 'drop') {
          code += `${varName} = ${parentVar}.drop(columns=${cols})\n`;
        } else {
          code += `${varName} = ${parentVar}[${cols}]\n`;
        }
      } else if (n.type === 'calcField') {
        const col = n.data?.newColumn || 'calc';
        const expr = n.data?.expression || '0';
        code += `${varName} = ${parentVar}.copy()\n${varName}["${col}"] = ${expr}\n`;
      } else if (n.type === 'groupBy') {
        const gCols = JSON.stringify(n.data?.groupBy || []);
        const agg = JSON.stringify(n.data?.agg || {});
        code += `${varName} = ${parentVar}.groupby(${gCols}).agg(${agg}).reset_index()\n`;
      } else if (n.type === 'export') {
        code += `${parentVar}.to_csv("output.csv", index=False)\nprint("Pipeline exported to output.csv")\n`;
      } else {
        code += `${varName} = ${parentVar}.copy()\n`;
      }
    });

    code += `\nprint("Pipeline execution finished successfully.")\n`;
    return code;
  };

  const generateSQL = () => {
    let sql = `-- DataFlow Generated SQL Pipeline\nWITH \n`;
    const ctes = [];
    nodes.forEach((n, idx) => {
      const cteName = `step_${n.id.replace(/[^a-zA-Z0-9]/g, '_')}`;
      const parentEdges = edges.filter((e) => e.target === n.id);
      const parentName = parentEdges.length > 0 ? `step_${parentEdges[0].source.replace(/[^a-zA-Z0-9]/g, '_')}` : 'raw_table';

      if (n.type === 'load') {
        ctes.push(`  ${cteName} AS (\n    SELECT * FROM sales_orders\n  )`);
      } else if (n.type === 'dropNulls') {
        ctes.push(`  ${cteName} AS (\n    SELECT * FROM ${parentName} WHERE id IS NOT NULL\n  )`);
      } else if (n.type === 'filterColumns') {
        const cols = (n.data?.columns || ['*']).join(', ');
        ctes.push(`  ${cteName} AS (\n    SELECT ${cols} FROM ${parentName}\n  )`);
      } else if (n.type === 'groupBy') {
        const gCols = (n.data?.groupBy || []).join(', ');
        ctes.push(`  ${cteName} AS (\n    SELECT ${gCols}, SUM(revenue) as total_revenue FROM ${parentName} GROUP BY ${gCols}\n  )`);
      } else {
        ctes.push(`  ${cteName} AS (\n    SELECT * FROM ${parentName}\n  )`);
      }
    });

    sql += ctes.join(',\n');
    const lastCte = ctes.length > 0 ? `step_${nodes[nodes.length - 1].id.replace(/[^a-zA-Z0-9]/g, '_')}` : 'raw_table';
    sql += `\nSELECT * FROM ${lastCte};`;
    return sql;
  };

  const codeText = lang === 'python' ? generatePython() : generateSQL();

  const handleCopy = () => {
    navigator.clipboard.writeText(codeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div style={headerStyle}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#f8fafc' }}>
              💻 Code Export (Python & SQL)
            </span>
          </div>
          <button onClick={onClose} style={closeBtnStyle}>✕</button>
        </div>

        <div style={{ display: 'flex', gap: 8, margin: '12px 0' }}>
          <button
            onClick={() => setLang('python')}
            style={{
              ...tabBtnStyle,
              background: lang === 'python' ? '#2563eb' : '#1e293b',
              color: lang === 'python' ? '#fff' : '#94a3b8',
            }}
          >
            Python (Pandas)
          </button>
          <button
            onClick={() => setLang('sql')}
            style={{
              ...tabBtnStyle,
              background: lang === 'sql' ? '#2563eb' : '#1e293b',
              color: lang === 'sql' ? '#fff' : '#94a3b8',
            }}
          >
            SQL (CTEs)
          </button>
          <button
            onClick={handleCopy}
            style={{
              ...tabBtnStyle,
              marginLeft: 'auto',
              background: copied ? '#16a34a' : '#334155',
              color: '#fff',
            }}
          >
            {copied ? '✓ Copied' : '📋 Copy Code'}
          </button>
        </div>

        <pre style={preStyle}>
          <code>{codeText}</code>
        </pre>
      </div>
    </div>
  );
}

const overlayStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.7)',
  zIndex: 1000,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const modalStyle = {
  background: '#0f172a',
  border: '1px solid #1e293b',
  borderRadius: 12,
  padding: 20,
  width: 640,
  maxHeight: '80vh',
  display: 'flex',
  flexDirection: 'column',
};

const headerStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderBottom: '1px solid #1e293b',
  paddingBottom: 10,
};

const closeBtnStyle = {
  background: 'transparent',
  border: 'none',
  color: '#94a3b8',
  cursor: 'pointer',
  fontSize: 16,
};

const tabBtnStyle = {
  border: 'none',
  padding: '6px 14px',
  borderRadius: 6,
  cursor: 'pointer',
  fontSize: 12,
  fontWeight: 600,
};

const preStyle = {
  flex: 1,
  overflowY: 'auto',
  background: '#020617',
  border: '1px solid #1e293b',
  borderRadius: 8,
  padding: 14,
  color: '#93c5fd',
  fontSize: 11,
  lineHeight: 1.5,
  fontFamily: 'Consolas, monospace',
};
