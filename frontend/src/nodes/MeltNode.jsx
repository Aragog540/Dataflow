import BaseNode from './BaseNode';
import usePipelineStore from '../store';

export default function MeltNode({ id, type, data }) {
  const update = usePipelineStore((s) => s.updateNodeData);
  return (
    <BaseNode id={id} type={type} data={data}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <label style={labelStyle}>Identifier Columns (id_vars)</label>
        <input
          placeholder="order_id, region"
          value={data.idVars?.join(', ') ?? ''}
          onChange={(e) =>
            update(id, { idVars: e.target.value.split(',').map((c) => c.trim()).filter(Boolean) })
          }
          onClick={(e) => e.stopPropagation()}
          style={inputStyle}
        />
        <label style={labelStyle}>Unpivot Value Columns (value_vars)</label>
        <input
          placeholder="blank = unpivot all others"
          value={data.valueVars?.join(', ') ?? ''}
          onChange={(e) =>
            update(id, { valueVars: e.target.value.split(',').map((c) => c.trim()).filter(Boolean) })
          }
          onClick={(e) => e.stopPropagation()}
          style={inputStyle}
        />
        <label style={labelStyle}>Variable Name</label>
        <input
          placeholder="variable"
          value={data.varName ?? 'variable'}
          onChange={(e) => update(id, { varName: e.target.value })}
          onClick={(e) => e.stopPropagation()}
          style={inputStyle}
        />
        <label style={labelStyle}>Value Name</label>
        <input
          placeholder="value"
          value={data.valueName ?? 'value'}
          onChange={(e) => update(id, { valueName: e.target.value })}
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
