export const PIPELINE_TEMPLATES = [
  {
    name: 'Quick Preview',
    emoji: '👁️',
    description: 'Load sample dataset and preview the top rows.',
    nodes: [
      { id: 't1-load', type: 'load', data: { filePath: 'sample-data/sales_orders.csv', format: 'csv' }, position: { x: 100, y: 150 } },
      { id: 't1-preview', type: 'preview', data: { rows: 20 }, position: { x: 340, y: 150 } },
    ],
    edges: [
      { id: 't1-e1', source: 't1-load', target: 't1-preview', animated: true },
    ],
  },
  {
    name: 'Clean & Export',
    emoji: '🧹',
    description: 'Drop nulls, deduplicate records, impute missing values, and export.',
    nodes: [
      { id: 't2-load', type: 'load', data: { filePath: 'sample-data/sales_orders.csv', format: 'csv' }, position: { x: 100, y: 150 } },
      { id: 't2-drop', type: 'dropNulls', data: {}, position: { x: 320, y: 150 } },
      { id: 't2-dedupe', type: 'dedupe', data: { keep: 'first' }, position: { x: 540, y: 150 } },
      { id: 't2-fill', type: 'fillMissing', data: { strategy: 'value', value: 0 }, position: { x: 760, y: 150 } },
      { id: 't2-export', type: 'export', data: { format: 'csv' }, position: { x: 980, y: 150 } },
    ],
    edges: [
      { id: 't2-e1', source: 't2-load', target: 't2-drop', animated: true },
      { id: 't2-e2', source: 't2-drop', target: 't2-dedupe', animated: true },
      { id: 't2-e3', source: 't2-dedupe', target: 't2-fill', animated: true },
      { id: 't2-e4', source: 't2-fill', target: 't2-export', animated: true },
    ],
  },
  {
    name: 'Data Profiling',
    emoji: '📈',
    description: 'Inspect column statistics, null distributions, and data types.',
    nodes: [
      { id: 't3-load', type: 'load', data: { filePath: 'sample-data/sales_orders.csv', format: 'csv' }, position: { x: 100, y: 150 } },
      { id: 't3-prof', type: 'profiler', data: {}, position: { x: 340, y: 150 } },
      { id: 't3-prev', type: 'preview', data: { rows: 50 }, position: { x: 560, y: 150 } },
    ],
    edges: [
      { id: 't3-e1', source: 't3-load', target: 't3-prof', animated: true },
      { id: 't3-e2', source: 't3-prof', target: 't3-prev', animated: true },
    ],
  },
  {
    name: 'Group & Chart',
    emoji: '📊',
    description: 'Group sales by region and render an interactive bar chart.',
    nodes: [
      { id: 't4-load', type: 'load', data: { filePath: 'sample-data/sales_orders.csv', format: 'csv' }, position: { x: 100, y: 150 } },
      { id: 't4-drop', type: 'dropNulls', data: {}, position: { x: 320, y: 150 } },
      { id: 't4-group', type: 'groupBy', data: { groupBy: ['region'], agg: { revenue: 'sum', quantity: 'sum' } }, position: { x: 540, y: 150 } },
      { id: 't4-chart', type: 'chart', data: { chartType: 'bar', xAxis: 'region', yAxis: 'revenue' }, position: { x: 760, y: 150 } },
    ],
    edges: [
      { id: 't4-e1', source: 't4-load', target: 't4-drop', animated: true },
      { id: 't4-e2', source: 't4-drop', target: 't4-group', animated: true },
      { id: 't4-e3', source: 't4-group', target: 't4-chart', animated: true },
    ],
  },
  {
    name: 'Full ETL Pipeline',
    emoji: '⚡',
    description: 'End-to-end load, cleaning, calculation, transformation, and export.',
    nodes: [
      { id: 't5-load', type: 'load', data: { filePath: 'sample-data/sales_orders.csv', format: 'csv' }, position: { x: 100, y: 150 } },
      { id: 't5-drop', type: 'dropNulls', data: {}, position: { x: 300, y: 150 } },
      { id: 't5-calc', type: 'calcField', data: { newColumn: 'margin', expression: 'revenue * 0.2' }, position: { x: 500, y: 150 } },
      { id: 't5-filter', type: 'filterColumns', data: { mode: 'keep', columns: ['region', 'product', 'revenue', 'margin'] }, position: { x: 700, y: 150 } },
      { id: 't5-group', type: 'groupBy', data: { groupBy: ['region'], agg: { revenue: 'sum', margin: 'sum' } }, position: { x: 900, y: 150 } },
      { id: 't5-export', type: 'export', data: { format: 'csv' }, position: { x: 1100, y: 150 } },
    ],
    edges: [
      { id: 't5-e1', source: 't5-load', target: 't5-drop', animated: true },
      { id: 't5-e2', source: 't5-drop', target: 't5-calc', animated: true },
      { id: 't5-e3', source: 't5-calc', target: 't5-filter', animated: true },
      { id: 't5-e4', source: 't5-filter', target: 't5-group', animated: true },
      { id: 't5-e5', source: 't5-group', target: 't5-export', animated: true },
    ],
  },
];
