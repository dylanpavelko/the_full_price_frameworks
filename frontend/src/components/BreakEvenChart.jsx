import React, { useState, useMemo } from 'react';
import './BreakEvenChart.css';
import { 
  formatCurrency, 
  formatGreenhouseGas, 
  formatWater, 
  formatEnergy, 
  formatLand 
} from '../utils/formatting';
import { getItemsPerYear, getBreakEvenParams } from '../utils/comparison';

export function BreakEvenChart({ product1, product2 }) {
  const [activeMetric, setActiveMetric] = useState('cost_usd');

  const metrics = [
    { key: 'cost_usd', label: 'Cost', format: formatCurrency },
    { key: 'greenhouse_gas_kg', label: 'CO₂e', format: formatGreenhouseGas },
    { key: 'water_liters', label: 'Water', format: formatWater },
    { key: 'energy_kwh', label: 'Energy', format: formatEnergy },
    { key: 'land_m2', label: 'Land Use', format: formatLand },
  ];

  // Calculate chart data based on product properties
  const chartData = useMemo(() => {
    if (!product1 || !product2) return null;

    const p1 = getBreakEvenParams(product1, activeMetric);
    const p2 = getBreakEvenParams(product2, activeMetric);

    // Calculate break-even year (intersection point)
    // p1.init + p1.slope * t = p2.init + p2.slope * t
    // t * (p1.slope - p2.slope) = p2.init - p1.init
    // t = (p2.init - p1.init) / (p1.slope - p2.slope)
    let breakEvenYear = null;
    const slopeDiff = p1.slope - p2.slope;
    
    if (Math.abs(slopeDiff) > 0.000001) {
      const t = (p2.initial - p1.initial) / slopeDiff;
      if (t > 0 && t < 50) {
        breakEvenYear = t;
      }
    }

    // Determine time range: at least 5 years, or slightly past break-even
    const maxYear = breakEvenYear ? Math.min(Math.ceil(breakEvenYear * 1.5), 20) : 5;
    // Generate data points for 0 to maxYear
    const numPoints = 20; // Resolution
    const step = maxYear / numPoints;
    const points = [];
    
    // Always include integer years for grid, but calculate lines finely? 
    // Actually for straight lines, start and end is enough, but break-even needs to be on graph.
    // SVG is simple polyline. Just 2 points is enough for line chart, but grid is nice.
    
    const years = [0, maxYear];
    const p1Points = years.map(y => p1.initial + p1.slope * y);
    const p2Points = years.map(y => p2.initial + p2.slope * y);

    const allValues = [...p1Points, ...p2Points];
    const maxY = Math.max(...allValues) * 1.1 || 10; // Add headroom

    return { maxYear, maxY, p1, p2, breakEvenYear };
  }, [product1, product2, activeMetric]);

  if (!chartData) return null;

  const { maxYear, maxY, p1, p2, breakEvenYear } = chartData;
  const height = 400; /* Increased height for better mobile scaling */
  const width = 600;
  const padding = { top: 50, right: 150, bottom: 100, left: 130 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  const getX = (year) => padding.left + (year / maxYear) * graphWidth;
  const getY = (val) => height - padding.bottom - (val / maxY) * graphHeight;

  // Formatting helper
  const activeFormat = metrics.find(m => m.key === activeMetric)?.format || ((v) => v);
  const formatY = (val) => {
    // Simplified formatting for axis
    if (activeMetric === 'cost_usd') return `$${val.toFixed(0)}`;
    if (val >= 1000) return `${(val/1000).toFixed(1)}k`;
    return val.toFixed(1);
  };

  return (
    <div className="breakeven-chart">
      <h3>Cumulative Impact Over Time</h3>
      
      <div className="breakeven-chart__tabs">
        {metrics.map(m => (
          <button
            key={m.key}
            className={`breakeven-chart__tab ${activeMetric === m.key ? 'active' : ''}`}
            onClick={() => setActiveMetric(m.key)}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="breakeven-chart__graph">
        <svg viewBox={`0 0 ${width} ${height}`} className="breakeven-chart__svg">
          {/* Y Axis Grid & Labels */}
          {[0, 0.25, 0.5, 0.75, 1].map(ratio => {
            const val = maxY * ratio;
            const y = getY(val);
            return (
              <g key={ratio}>
                <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#eee" />
                <text x={padding.left - 15} y={y + 8} textAnchor="end" className="chart-axis-label" fill="#666">
                  {formatY(val)}
                </text>
              </g>
            );
          })}

          {/* X Axis Grid & Labels (Years) */}
          {Array.from({ length: Math.ceil(maxYear) + 1 }).map((_, i) => {
            // Show every year or every 2 years if crowded
            if (maxYear > 10 && i % 2 !== 0) return null;
            const x = getX(i);
            return (
              <g key={i}>
                <line x1={x} y1={padding.top} x2={x} y2={height - padding.bottom} stroke="#f5f5f5" />
                <text x={x} y={height - padding.bottom + 40} textAnchor="middle" className="chart-axis-label" fill="#666">
                  {i}
                </text>
              </g>
            );
          })}
          
          {/* Axis Titles */}
          <text x={width/2} y={height - 20} textAnchor="middle" className="chart-axis-title" fill="#333">Years Owned</text>
          
          {/* Product Lines */}
          {/* Product 1 */}
          <line 
            x1={getX(0)} y1={getY(p1.initial)} 
            x2={getX(maxYear)} y2={getY(p1.initial + p1.slope * maxYear)} 
            stroke="#e76f51" strokeWidth="3" 
          />
          {/* Product 2 */}
          <line 
            x1={getX(0)} y1={getY(p2.initial)} 
            x2={getX(maxYear)} y2={getY(p2.initial + p2.slope * maxYear)} 
            stroke="#264653" strokeWidth="3" 
          />

          {/* Product Labels at end of lines */}
          <text x={width - padding.right + 15} y={getY(p1.initial + p1.slope * maxYear)} fill="#e76f51" className="chart-product-label" alignmentBaseline="middle">{product1.name}</text>
          <text x={width - padding.right + 15} y={getY(p2.initial + p2.slope * maxYear)} fill="#264653" className="chart-product-label" alignmentBaseline="middle">{product2.name}</text>

          {/* Break-even Point */}
          {breakEvenYear && (
            <g>
              <circle 
                cx={getX(breakEvenYear)} 
                cy={getY(p1.initial + p1.slope * breakEvenYear)} 
                r="14" fill="#2a9d8f" stroke="white" strokeWidth="3" 
              />
              {/* White background rect/halo for readability */}
               <text 
                x={getX(breakEvenYear)} 
                y={getY(p1.initial + p1.slope * breakEvenYear) - 35} 
                textAnchor="middle" 
                stroke="white" 
                strokeLinejoin="round"
                className="chart-breakeven-label chart-breakeven-halo"
                fontWeight="bold"
                opacity="0.8"
              >
                {breakEvenYear < 1 ? `${Math.round(breakEvenYear * 365)} days` : `${breakEvenYear.toFixed(1)} yrs`}
              </text>
              <text 
                x={getX(breakEvenYear)} 
                y={getY(p1.initial + p1.slope * breakEvenYear) - 35} 
                textAnchor="middle" 
                fill="#2a9d8f" 
                className="chart-breakeven-label"
                fontWeight="bold"
              >
                {breakEvenYear < 1 ? `${Math.round(breakEvenYear * 365)} days` : `${breakEvenYear.toFixed(1)} yrs`}
              </text>
            </g>
          )}

        </svg>
      </div>

      <p className="breakeven-chart__note">
        This graph plots cumulative impact over time. The intersection point shows the 
        <strong> break-even time</strong> — when the sustainable option's lower annual impact makes up for its higher upfront cost.
        <br/>
        <span style={{color: '#e76f51', fontWeight: 'bold'}}>— {product1.name}</span> &nbsp;
        <span style={{color: '#264653', fontWeight: 'bold'}}>— {product2.name}</span>
      </p>
    </div>
  );
}
