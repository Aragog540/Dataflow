import BaseNode from './BaseNode';
import usePipelineStore from '../store';

export default function TypeCastNode({ id, type, data }) {
  const update = usePipelineStore((s) => s.updateNodeData);
  const casts = data.casts ?? {};

  const addRow = (e) => {
    e.stopPropagation();
    update(id, { casts: { ...casts, '': 'int' } });
  };

  const updateCol = (oldCol, newCol) => {
    const next = { ...casts };
    const val = next[oldCol];
    delete next[oldCol];
    next[newCol] = val;
    update(id, { casts: next });
  };

  const updateType = (col, newType) => {
    update(id, { casts: { ...casts, [col]: newType } });
  };

  return (
    <BaseNode id={id} type={type} data={data}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <label style={labelStyle}>Column Type Casts</label>
        {Object.entries(casts).map(([col, targetType], i) => (
          <div key={i} style={{ display: 'flex', gap: 4 }}>
            <input
              placeholder="column"
              value={col}
              onChange={(e) => updateCol(col, e.target.value)}
              onClick={(e) => e.stopPropagation()}
              style={{ ...inputStyle, flex: 1 }}
            />
            <select
              value={targetType}
              onChange={(e) => updateType(col, e.target.value)}
              onClick={(e) => e.stopPropagation()}
              style={{ ...inputStyle, width: 80 }}
            >
              <option value="int">Integer</option>
              <option value="float">Float</option>
              <option value="string">String</option>
              <option value="boolean">Boolean</option>
              <option value="datetime">Datetime</option>
            </select>
          </div>
        ))}
        <button onClick={addRow} style={btnStyle}>+ Add Cast</button>
      </div>
    </BaseNode>
  );
}

const labelStyle = { color: '#94a3b8', fontSize: 10 };
const inputStyle = {
  background: '#0f172a', border: '1px solid #334155', borderRadius: 4,
  color: '#e2e8f0', fontSize: 11, padding: '3px 6px', boxSizing: 'border-box',
};
const btnStyle = {
  background: '#1e3a5f', border: '1px solid #3b82f6', borderRadius: 4,
  color: '#93c5fd', cursor: 'pointer', fontSize: 10, padding: '3px 6px', marginTop: 2,
};
