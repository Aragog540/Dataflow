import BaseNode from './BaseNode';
import usePipelineStore from '../store';

export default function RenameNode({ id, type, data }) {
  const update = usePipelineStore((s) => s.updateNodeData);
  const mapping = data.mapping ?? {};

  const addRow = (e) => {
    e.stopPropagation();
    update(id, { mapping: { ...mapping, '': '' } });
  };

  const updateRow = (oldKey, field, val) => {
    const next = { ...mapping };
    if (field === 'key') {
      const v = next[oldKey];
      delete next[oldKey];
      next[val] = v;
    } else {
      next[oldKey] = val;
    }
    update(id, { mapping: next });
  };

  return (
    <BaseNode id={id} type={type} data={data}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {Object.entries(mapping).map(([k, v], i) => (
          <div key={i} style={{ display: 'flex', gap: 4 }}>
            <input placeholder="old" value={k}
              onChange={(e) => { e.stopPropagation(); updateRow(k, 'key', e.target.value); }}
              onClick={(e) => e.stopPropagation()} style={{ ...inputStyle, width: '45%' }} />
            <span style={{ color: '#64748b', alignSelf: 'center' }}>→</span>
            <input placeholder="new" value={v}
              onChange={(e) => { e.stopPropagation(); updateRow(k, 'val', e.target.value); }}
              onClick={(e) => e.stopPropagation()} style={{ ...inputStyle, width: '45%' }} />
          </div>
        ))}
        <button onClick={addRow} style={btnStyle}>+ Add mapping</button>
      </div>
    </BaseNode>
  );
}
const inputStyle = {
  background: '#0f172a', border: '1px solid #334155', borderRadius: 4,
  color: '#e2e8f0', fontSize: 11, padding: '3px 6px', boxSizing: 'border-box',
};
const btnStyle = {
  background: '#1e3a5f', border: '1px solid #3b82f6', borderRadius: 4,
  color: '#93c5fd', cursor: 'pointer', fontSize: 10, padding: '3px 6px', marginTop: 2,
};
