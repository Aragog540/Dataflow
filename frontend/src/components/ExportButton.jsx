export default function ExportButton({ columns = [], rows = [], filename = 'dataflow-export' }) {
  const download = (content, ext, mime) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportCsv = () => {
    if (!columns.length) return;
    const header = columns.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',');
    const body = rows
      .map((r) =>
        r.map((val) => `"${String(val ?? '').replace(/"/g, '""')}"`).join(',')
      )
      .join('\n');
    download(`${header}\n${body}`, 'csv', 'text/csv');
  };

  const exportJson = () => {
    const list = rows.map((r) =>
      Object.fromEntries(columns.map((c, i) => [c, r[i]]))
    );
    download(JSON.stringify(list, null, 2), 'json', 'application/json');
  };

  const exportJsonl = () => {
    const lines = rows
      .map((r) => JSON.stringify(Object.fromEntries(columns.map((c, i) => [c, r[i]]))))
      .join('\n');
    download(lines, 'jsonl', 'application/x-ndjson');
  };

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <button onClick={exportCsv} style={btnStyle}>⬇ CSV</button>
      <button onClick={exportJson} style={btnStyle}>⬇ JSON</button>
      <button onClick={exportJsonl} style={btnStyle}>⬇ JSONL</button>
    </div>
  );
}

const btnStyle = {
  background: '#1e293b',
  border: '1px solid #334155',
  color: '#e2e8f0',
  padding: '5px 12px',
  borderRadius: 6,
  cursor: 'pointer',
  fontSize: 12,
  fontWeight: 500,
  transition: 'background 0.15s',
};
