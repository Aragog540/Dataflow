// index.js – re-exports every node component keyed by its type name.
// Used by App.jsx as the `nodeTypes` prop to ReactFlow.

import LoadNode from './LoadNode';
import DropNullsNode from './DropNullsNode';
import DedupeNode from './DedupeNode';
import FillMissingNode from './FillMissingNode';
import FilterColumnsNode from './FilterColumnsNode';
import RenameNode from './RenameNode';
import CalcFieldNode from './CalcFieldNode';
import MergeNode from './MergeNode';
import GroupByNode from './GroupByNode';
import ProfilerNode from './ProfilerNode';
import ChartNode from './ChartNode';
import PreviewNode from './PreviewNode';
import ExportNode from './ExportNode';

const nodeTypes = {
  load: LoadNode,
  dropNulls: DropNullsNode,
  dedupe: DedupeNode,
  fillMissing: FillMissingNode,
  filterColumns: FilterColumnsNode,
  rename: RenameNode,
  calcField: CalcFieldNode,
  merge: MergeNode,
  groupBy: GroupByNode,
  profiler: ProfilerNode,
  chart: ChartNode,
  preview: PreviewNode,
  export: ExportNode,
};

export default nodeTypes;
