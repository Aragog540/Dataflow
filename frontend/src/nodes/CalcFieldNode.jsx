import BaseNode from './BaseNode';
import usePipelineStore from '../store';

export default function CalcFieldNode({ id, type, data }) {
  const update = usePipelineStore((s) => s.updateNodeData);
  return (
    <BaseNode id={id} type={type} data={data}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <label style={labelStyle}>New column name</label>
        <input
          placeholder="calc_col"
          value={data.newColumn ?? ''}
          onChange={(e) => update(id, { newColumn: e.target.value })}
          onClick={(e) => e.stopPropagation()}
          style={inputStyle}
        />
        <label style={labelStyle}>Expression</label>
        <input
          placeholder="quantity * unit_price"
          value={data.expression ?? ''}
          onChange={(e) => update(id, { expression: e.target.value })}
          onClick={(e) => e.stopPropagation()}
          style={inputStyle}
        />
      </div>
    </BaseNode>
  );
}
const labelStyle = { color: '#94a3b8', fontSize: 10 };
const inputStyle = {
  background: '#0f172a', border: '1px solid #334155', borderRadius: 4,
  color: '#e2e8f0', fontSize: 11, padding: '3px 6px', width: '100%', boxSizing: 'border-box',
};
