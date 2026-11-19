import BaseNode from './BaseNode';

export default function ProfilerNode({ id, type, data }) {
  return (
    <BaseNode id={id} type={type} data={data}>
      <span style={{ color: '#94a3b8', fontSize: 10 }}>Outputs column statistics</span>
    </BaseNode>
  );
}
