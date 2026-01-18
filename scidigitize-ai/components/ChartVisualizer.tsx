import React from 'react';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, BarChart, Bar, Legend, ReferenceLine, ReferenceDot, Label
} from 'recharts';
import { ExtractedData, ExtractedChartData } from '../types';

interface ChartVisualizerProps {
  data: ExtractedData;
}

const ChartVisualizer: React.FC<ChartVisualizerProps> = ({ data }) => {
  // Guard clause: if it's not a chart, don't render this visualizer
  if (data.dataType !== 'chart') {
    return <div className="flex items-center justify-center h-full text-slate-400">Not a chart data type</div>;
  }

  const {
    chartType,
    dataPoints,
    xAxisLabel,
    yAxisLabel,
    xAxisConfig,
    yAxisConfig,
    referenceLines = [],
    annotations = [],
    colors: extractedColors,
    aspectRatio
  } = data as ExtractedChartData;

  // Group data by series if available
  const seriesGroups: { [key: string]: any[] } = {};
  const hasMultipleSeries = dataPoints.some(p => p.series);

  if (hasMultipleSeries) {
    dataPoints.forEach(p => {
      const s = p.series || 'Default';
      if (!seriesGroups[s]) seriesGroups[s] = [];
      seriesGroups[s].push(p);
    });
  } else {
    seriesGroups['Default'] = dataPoints;
  }

  // Use extracted colors if available, otherwise fallback to default palette
  const defaultColors = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];
  const chartColors = (extractedColors && extractedColors.length > 0) ? extractedColors : defaultColors;

  // Helper to determine axis domain and scale properties
  const getAxisProps = (axisConfig?: { min?: number, max?: number, scaleType?: 'linear' | 'log' }, isX: boolean = false) => {
    const props: any = {};

    if (axisConfig) {
      if (axisConfig.min !== undefined && axisConfig.max !== undefined) {
        props.domain = [axisConfig.min, axisConfig.max];
        props.allowDataOverflow = true;
      } else {
        props.domain = ['auto', 'auto'];
      }

      if (axisConfig.scaleType === 'log') {
        props.scale = 'log';
      }
    }

    return props;
  };

  const xAxisProps = getAxisProps(xAxisConfig, true);
  const yAxisProps = getAxisProps(yAxisConfig, false);

  const CommonAxis = () => (
    <>
      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
      <XAxis
        type={typeof dataPoints[0]?.x === 'number' ? 'number' : 'category'}
        dataKey="x"
        name={xAxisLabel}
        stroke="#64748b"
        fontSize={12}
        tickLine={false}
        axisLine={{ stroke: '#cbd5e1' }}
        label={{ value: xAxisLabel, position: 'bottom', offset: 0, fill: '#64748b', fontSize: 12 }}
        {...xAxisProps}
      />
      <YAxis
        type="number"
        dataKey="y"
        name={yAxisLabel}
        stroke="#64748b"
        fontSize={12}
        tickLine={false}
        axisLine={{ stroke: '#cbd5e1' }}
        label={{ value: yAxisLabel, angle: -90, position: 'left', fill: '#64748b', fontSize: 12 }}
        {...yAxisProps}
      />
      <Tooltip
        cursor={{ strokeDasharray: '3 3' }}
        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
        formatter={(value: any, name: any, props: any) => {
          const pointLabel = props.payload.label;
          return [value, pointLabel ? `${name} (${pointLabel})` : name];
        }}
      />
      <Legend />

      {/* Reference Lines */}
      {referenceLines.map((line, idx) => (
        <ReferenceLine
          key={`ref-${idx}`}
          x={line.axis === 'x' ? line.value : undefined}
          y={line.axis === 'y' ? line.value : undefined}
          stroke={line.color || '#94a3b8'}
          strokeDasharray={line.lineStyle === 'dashed' ? '5 5' : line.lineStyle === 'dotted' ? '3 3' : ''}
          label={{
            value: line.label,
            position: line.axis === 'y' ? 'insideTopRight' : 'insideTopRight',
            fill: '#64748b',
            fontSize: 10
          }}
        />
      ))}

      {/* Annotations using ReferenceDot (invisible dot with label) */}
      {annotations.map((anno, idx) => (
        <ReferenceDot
          key={`anno-${idx}`}
          x={anno.x}
          y={anno.y}
          r={0}
          fill="none"
          stroke="none"
          label={{
            value: anno.text,
            position: 'top',
            fill: '#ef4444',
            fontWeight: 'bold',
            fontSize: 11
          }}
        />
      ))}
    </>
  );

  if (chartType === 'scatter') {
    return (
      <ResponsiveContainer width="100%" height="100%" aspect={aspectRatio}>
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CommonAxis />
          {Object.keys(seriesGroups).map((seriesName, index) => (
            <Scatter
              key={seriesName}
              name={seriesName}
              data={seriesGroups[seriesName]}
              fill={chartColors[index % chartColors.length]}
            />
          ))}
        </ScatterChart>
      </ResponsiveContainer>
    );
  }

  if (chartType === 'bar') {
    return (
      <ResponsiveContainer width="100%" height="100%" aspect={aspectRatio}>
        <BarChart data={dataPoints} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CommonAxis />
          <Bar dataKey="y" fill={chartColors[0]} name={yAxisLabel} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  // Line Chart
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis
          dataKey="x"
          type={typeof dataPoints[0]?.x === 'number' ? 'number' : 'category'}
          allowDuplicatedCategory={false}
          stroke="#64748b"
          fontSize={12}
          {...xAxisProps}
        />
        <YAxis
          stroke="#64748b"
          fontSize={12}
          {...yAxisProps}
        />
        <Tooltip />
        <Legend />

        {/* Render Reference Lines & Annotations again for Line Chart specifically if needed, 
             but typically CommonAxis children don't work inside LineChart as direct children the same way 
             ScatterChart does. We need to duplicate children here or structured differently.
             Recharts architecture allows ReferenceLine inside LineChart.
         */}

        {referenceLines.map((line, idx) => (
          <ReferenceLine
            key={`ref-${idx}`}
            x={line.axis === 'x' ? line.value : undefined}
            y={line.axis === 'y' ? line.value : undefined}
            stroke={line.color || '#94a3b8'}
            strokeDasharray={line.lineStyle === 'dashed' ? '5 5' : line.lineStyle === 'dotted' ? '3 3' : ''}
            label={{
              value: line.label,
              position: 'insideTopRight',
              fill: '#64748b',
              fontSize: 10
            }}
          />
        ))}

        {annotations.map((anno, idx) => (
          <ReferenceDot
            key={`anno-${idx}`}
            x={anno.x}
            y={anno.y}
            r={3} // Small dot to show location
            fill="#ef4444"
            stroke="none"
            label={{
              value: anno.text,
              position: 'top',
              fill: '#ef4444',
              fontWeight: 'bold',
              fontSize: 11
            }}
          />
        ))}

        {Object.keys(seriesGroups).map((seriesName, index) => (
          <Line
            key={seriesName}
            data={seriesGroups[seriesName]}
            type="monotone"
            dataKey="y"
            name={seriesName}
            stroke={chartColors[index % chartColors.length]}
            strokeWidth={2}
            dot={{ r: 4, fill: chartColors[index % chartColors.length] }}
            activeDot={{ r: 6 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default ChartVisualizer;
