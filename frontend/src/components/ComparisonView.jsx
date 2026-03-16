

/**
 * ComparisonView component - displays side-by-side product comparison
 * 
 * Shows two products with their impacts and highlights which is better/worse
 * for each environmental metric. Now includes lifecycle phase breakdown.
 */
import React, { useEffect, useState } from 'react';
import {
  formatCurrency,
  formatGreenhouseGas,
  formatWater,
  formatEnergy,
  formatLand,
  formatGreenhouseGasImperial,
  formatWaterImperial,
  formatEnergyImperial,
  formatLandImperial,
} from '../utils/formatting.js';
import {
  compareProducts,
  getItemsPerYear,
  getAnnualImpactByPhase,
  getBreakEvenParams,
  calculateBreakEvenIntersection,
} from '../utils/comparison.js';
import { applyAssumptionsToProduct, getDefaultAssumptionSelections, getExposedAssumptions } from '../utils/assumptions.js';
import { CalculationModal } from './CalculationModal';
import { BreakEvenChart } from './BreakEvenChart';
import './ComparisonView.css';

export function ComparisonView({ product1, product2 }) {
  const [modalData, setModalData] = useState(null);
  const [assumptionSelections, setAssumptionSelections] = useState({ product1: {}, product2: {} });
  // Toggle between grouping by phase or by metric
  const [groupByPhase, setGroupByPhase] = useState(false);
  // Toggle between metric and imperial units
  const [useImperial, setUseImperial] = useState(false);

  useEffect(() => {
    if (!product1 || !product2) {
      return;
    }

    setAssumptionSelections({
      product1: getDefaultAssumptionSelections(product1),
      product2: getDefaultAssumptionSelections(product2),
    });
  }, [product1?.id, product2?.id]);

  if (!product1 || !product2) {
    return null;
  }

  const exposedAssumptions1 = getExposedAssumptions(product1);
  const exposedAssumptions2 = getExposedAssumptions(product2);

  product1 = applyAssumptionsToProduct(product1, assumptionSelections.product1);
  product2 = applyAssumptionsToProduct(product2, assumptionSelections.product2);

  const updateAssumptionSelection = (side, assumptionKey, optionId) => {
    setAssumptionSelections((prev) => ({
      ...prev,
      [side]: {
        ...prev[side],
        [assumptionKey]: optionId,
      },
    }));
  };

  const renderAssumptionControls = (product, side, exposedAssumptions) => {
    if (!exposedAssumptions || exposedAssumptions.length === 0) {
      return null;
    }

    return (
      <div className="comparison__assumption-card">
        <h4>{product.name}</h4>
        {exposedAssumptions.map((assumption) => {
          const selected = assumptionSelections[side]?.[assumption.key]
            || assumption.default_option_id
            || assumption.options?.[0]?.id
            || '';

          return (
            <div className="comparison__assumption-field" key={`${side}-${assumption.key}`}>
              <label className="comparison__assumption-label" htmlFor={`${side}-${assumption.key}`}>
                {assumption.label}
              </label>
              <select
                id={`${side}-${assumption.key}`}
                className="comparison__assumption-select"
                value={selected}
                onChange={(event) => updateAssumptionSelection(side, assumption.key, event.target.value)}
              >
                {(assumption.options || []).map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
              {assumption.description && (
                <p className="comparison__assumption-desc">{assumption.description}</p>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // ...existing code...

  // ...existing code...

  // Calculate break-even for all metrics (cost, ghg, water, energy, land)
  const breakEvenMetrics = [
    { key: 'cost_usd', label: 'Cost' },
    { key: 'greenhouse_gas_kg', label: 'CO₂e Emissions' },
    { key: 'water_liters', label: 'Water Usage' },
    { key: 'energy_kwh', label: 'Energy' },
    { key: 'land_m2', label: 'Land Use' },
  ];

  // DEBUG: Show raw break-even calculation values for all metrics
  const debugBreakEvens = breakEvenMetrics.map(({ key, label }) => {
    const p1Annual = product1.impacts[key];
    const p2Annual = product2.impacts[key];
    const t = getAdvancedBreakEven(product1, product2, key);
    return {
      metric: label,
      p1: p1Annual,
      p2: p2Annual,
      break_even: t,
    };
  });

  // Helper to get annual impact (all phases if available)
  function getFullAnnualImpact(product, metric) {
    if (metric === 'cost_usd') {
      // Annual cost = purchase price * items needed per year
      const usesPerYear = product.uses_per_year || 1;
      const lifespanUses = product.average_lifespan_uses || 1;
      const itemsPerYear = usesPerYear / lifespanUses;
      return (product.purchase_price_usd || 0) * itemsPerYear;
    }
    const phase = getAnnualImpactByPhase(product, metric);
    if (phase && typeof phase.total === 'number') return phase.total;
    return product.impacts[metric] || 0;
  }

  // Compare products for each impact metric using full annual impact
  function compareProductsFull(product1, product2, metric) {
    const impact1 = getFullAnnualImpact(product1, metric);
    const impact2 = getFullAnnualImpact(product2, metric);
    const difference = impact1 - impact2;
    const percentDifference = impact2 !== 0 ? (difference / impact2) * 100 : 0;
    return {
      difference,
      percentDifference,
      winner: difference > 0 ? product2.name : product1.name,
      product1Impact: impact1,
      product2Impact: impact2,
    };
  }

  const comparisons = {
    cost: compareProductsFull(product1, product2, 'cost_usd'),
    ghg: compareProductsFull(product1, product2, 'greenhouse_gas_kg'),
    water: compareProductsFull(product1, product2, 'water_liters'),
    energy: compareProductsFull(product1, product2, 'energy_kwh'),
    land: compareProductsFull(product1, product2, 'land_m2'),
  };

  // Choose formatters based on unit toggle
  const formatters = {
    cost: formatCurrency,
    ghg: useImperial ? formatGreenhouseGasImperial : formatGreenhouseGas,
    water: useImperial ? formatWaterImperial : formatWater,
    energy: useImperial ? formatEnergyImperial : formatEnergy,
    land: useImperial ? formatLandImperial : formatLand,
  };

  const getUnitAndFactor = (metricKey) => {
    if (!useImperial) {
       switch(metricKey) {
         case 'cost_usd': return { unit: 'USD', factor: 1 };
         case 'greenhouse_gas_kg': return { unit: 'kg CO₂e', factor: 1 };
         case 'water_liters': return { unit: 'liters', factor: 1 };
         case 'energy_kwh': return { unit: 'kWh', factor: 1 };
         case 'land_m2': return { unit: 'm²', factor: 1 };
         default: return { unit: '', factor: 1 };
       }
    } else {
       // Imperial
       switch(metricKey) {
         case 'cost_usd': return { unit: 'USD', factor: 1 };
         case 'greenhouse_gas_kg': return { unit: 'lbs CO₂e', factor: 2.20462 };
         case 'water_liters': return { unit: 'gallons', factor: 0.264172 };
         case 'energy_kwh': return { unit: 'BTU', factor: 3412.14 };
         case 'land_m2': return { unit: 'ft²', factor: 10.7639 };
         default: return { unit: '', factor: 1 };
       }
    }
  };

  // Get phase breakdowns for each metric
  const phaseBreakdowns = {
    ghg: {
      product1: getAnnualImpactByPhase(product1, 'greenhouse_gas_kg'),
      product2: getAnnualImpactByPhase(product2, 'greenhouse_gas_kg'),
    },
    water: {
      product1: getAnnualImpactByPhase(product1, 'water_liters'),
      product2: getAnnualImpactByPhase(product2, 'water_liters'),
    },
    energy: {
      product1: getAnnualImpactByPhase(product1, 'energy_kwh'),
      product2: getAnnualImpactByPhase(product2, 'energy_kwh'),
    },
  };

  // Calculate break-even points for each metric
  function getBreakEvenPoints(product1, product2) {
    const metrics = [
      { key: 'cost_usd', label: 'Cost', format: formatCurrency },
      { key: 'greenhouse_gas_kg', label: 'CO₂e Emissions', format: formatGreenhouseGas },
      { key: 'water_liters', label: 'Water Usage', format: formatWater },
      { key: 'energy_kwh', label: 'Energy', format: formatEnergy },
      { key: 'land_m2', label: 'Land Use', format: formatLand },
    ];
    const breakEvens = [];
    metrics.forEach(({ key }) => {
      const p1Annual = product1.impacts[key];
      const p2Annual = product2.impacts[key];
      if (p1Annual === p2Annual || p1Annual === 0 || p2Annual === 0) {
        breakEvens.push(null);
        return;
      }
      let years = null;
      if (key === 'cost_usd') {
        const priceDiff = product1.purchase_price_usd - product2.purchase_price_usd;
        const annualDiff = p2Annual - p1Annual;
        if (annualDiff !== 0) {
          years = priceDiff / annualDiff;
        }
      }
      if (years && years > 0 && years < 100) {
        breakEvens.push(years);
      } else {
        breakEvens.push(null);
      }
    });
    return breakEvens;
  }

  // Break-even calculation for each metric (aligned with BreakEvenChart)
  function getAdvancedBreakEven(productA, productB, metric) {
    const paramsA = getBreakEvenParams(productA, metric);
    const paramsB = getBreakEvenParams(productB, metric);
    return calculateBreakEvenIntersection(paramsA, paramsB);
  }

  // (removed duplicate breakEvenMetrics declaration)
  // Calculate break-even independently per metric.
  const breakEvenValues = breakEvenMetrics.map(({ key }) => getAdvancedBreakEven(product1, product2, key));

  // Prepare break-even display for all metrics
  const breakEvenDisplay = breakEvenMetrics.map(({ key, label }, idx) => {
    const val = breakEvenValues[idx];
    if (val && val > 0 && val < 100) {
      if (val < 0.5) {
        const days = Math.round(val * 365);
        return (<div key={key}><strong>{label}:</strong> {days} days</div>);
      } else {
        return (<div key={key}><strong>{label}:</strong> {val.toFixed(1)} years</div>);
      }
    }
    return null;
  }).filter(Boolean);

  // Determine which product wins overall
  const wins = Object.values(comparisons).reduce((acc, comp) => {
    if (comp.winner === product1.name) acc.product1++;
    else acc.product2++;
    return acc;
  }, { product1: 0, product2: 0 });

  const overallWinnerName = wins.product1 > wins.product2
    ? product1.name
    : wins.product2 > wins.product1
      ? product2.name
      : null;

  const winnerByMetricKey = {
    cost_usd: comparisons.cost.winner,
    greenhouse_gas_kg: comparisons.ghg.winner,
    water_liters: comparisons.water.winner,
    energy_kwh: comparisons.energy.winner,
    land_m2: comparisons.land.winner,
  };

  const longestBreakEvenForWinner = overallWinnerName
    ? breakEvenMetrics.reduce((max, { key }, idx) => {
        const val = breakEvenValues[idx];
        if (winnerByMetricKey[key] !== overallWinnerName || val === null) {
          return max;
        }
        return val > max ? val : max;
      }, 0)
    : 0;

  let breakEvenText = '';
  if (longestBreakEvenForWinner > 0) {
    if (longestBreakEvenForWinner < 0.5) {
      breakEvenText = ` (longest break-even: ${Math.round(longestBreakEvenForWinner * 365)} days)`;
    } else {
      breakEvenText = ` (longest break-even: ${longestBreakEvenForWinner.toFixed(1)} years)`;
    }
  }

  const renderMetricRow = (label, comparison, formatFn, metricKey) => {
    const p1Data = metricKey ? product1.impacts[metricKey] : null;
    const p2Data = metricKey ? product2.impacts[metricKey] : null;

    // Always use 'liters' for metric and 'gallons' for imperial in modal
    let unitOverride = label;
    if (metricKey === 'water_liters') {
      unitOverride = useImperial ? 'gallons' : 'liters';
    }

    // Patch the formatter for water to always show liters (not m³ or ML) in metric
    let patchedFormatFn = formatFn;
    if (metricKey === 'water_liters' && !useImperial) {
      patchedFormatFn = (val) => {
        const v = typeof val === 'object' && val !== null && 'value' in val ? val.value : (val || 0);
        return `${v.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 })} liters`;
      };
    }

    const handleClick = (data, name) => {
      if (data && typeof data === 'object' && 'sources' in data) {
        const product = name === product1.name ? product1 : product2;
        const { unit, factor } = getUnitAndFactor(metricKey);
        setModalData({ 
          data, 
          title: `${name} - ${label}`, 
          unit: unit,
          productsPerYear: getItemsPerYear(product),
          conversionFactor: factor
        });
      }
    };

    return (
      <div className="comparison__metric-row" key={label}>
        <div className="comparison__metric-label">{label}</div>
        <div className={`comparison__metric-value ${comparison.winner === product1.name ? 'winner' : 'loser'}`}> 
          {p1Data && typeof p1Data === 'object' && 'sources' in p1Data ? (
            <>
              <span className="metric-link" onClick={() => handleClick(p1Data, product1.name)} title="Click for breakdown">
                {patchedFormatFn(comparison.product1Impact)}
              </span>
              <span className="info-icon" onClick={() => handleClick(p1Data, product1.name)} title="Click for breakdown">ℹ</span>
            </>
          ) : (
            patchedFormatFn(comparison.product1Impact)
          )}
          {comparison.winner === product1.name && <span className="winner-badge">✓</span>}
        </div>
        <div className={`comparison__metric-value ${comparison.winner === product2.name ? 'winner' : 'loser'}`}>
          {p2Data && typeof p2Data === 'object' && 'sources' in p2Data ? (
             <>
               <span className="metric-link" onClick={() => handleClick(p2Data, product2.name)} title="Click for breakdown">
                 {patchedFormatFn(comparison.product2Impact)}
               </span>
               <span className="info-icon" onClick={() => handleClick(p2Data, product2.name)} title="Click for breakdown">ℹ</span>
             </>
          ) : (
             patchedFormatFn(comparison.product2Impact)
          )}
          {comparison.winner === product2.name && <span className="winner-badge">✓</span>}
        </div>
      </div>
    );
  };

  // Render a side-by-side table for a metric, grouped by phase (rows = phases, columns = products), with total row at bottom
  const renderMetricTable = (label, impactKey, formatFn, breakdown, sumKey) => {
    const phases = [
      { key: 'production', label: 'Production' },
      { key: 'transport', label: 'Transport' },
      { key: 'use', label: 'Use & Care' },
      { key: 'end_of_life', label: 'End of Life' },
    ];

    const getVal = (v) => (typeof v === 'object' && v !== null && 'value' in v) ? v.value : (v || 0);

    // Always use 'liters' for metric and 'gallons' for imperial in modal
    let unitOverride = label;
    if (impactKey === 'water_liters') {
      unitOverride = useImperial ? 'gallons' : 'liters';
    }

    // Patch the formatter for water to always show liters (not m³ or ML) in metric
    let patchedFormatFn = formatFn;
    if (impactKey === 'water_liters' && !useImperial) {
      patchedFormatFn = (val) => {
        const v = typeof val === 'object' && val !== null && 'value' in val ? val.value : (val || 0);
        return `${v.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 })} liters`;
      };
    }

    const handlePhaseClick = (data, pName, phaseLabel) => {
      if (data && typeof data === 'object' && 'sources' in data) {
        const product = pName === product1.name ? product1 : product2;
        const { unit, factor } = getUnitAndFactor(impactKey);
        setModalData({ 
          data, 
          title: `${pName} - ${phaseLabel} (${label})`, 
          unit: unit,
          productsPerYear: getItemsPerYear(product),
          conversionFactor: factor
        });
      }
    };

    return (
      <div className="comparison__phase-table" key={label}>
        <div className="comparison__phase-table-header-row">
          <div className="comparison__phase-table-label">{label}</div>
          <div className="comparison__phase-table-product">{product1.name}</div>
          <div className="comparison__phase-table-product">{product2.name}</div>
        </div>
        {phases.map(phase => {
          const p1Phase = breakdown.product1?.[phase.key];
          const p2Phase = breakdown.product2?.[phase.key];
          return (
            <div className="comparison__phase-table-row" key={phase.key}>
              <div className="comparison__phase-table-phase">{phase.label}</div>
              <div className="comparison__phase-table-value">
                {p1Phase && typeof p1Phase === 'object' && 'sources' in p1Phase ? (
                  <>
                    <span className="metric-link" onClick={() => handlePhaseClick(p1Phase, product1.name, phase.label)} title="Click for breakdown">
                      {patchedFormatFn(getVal(p1Phase))}
                    </span>
                    <span className="info-icon" onClick={() => handlePhaseClick(p1Phase, product1.name, phase.label)} title="Click for breakdown">ℹ</span>
                  </>
                ) : (
                  patchedFormatFn(getVal(p1Phase))
                )}
              </div>
              <div className="comparison__phase-table-value">
                {p2Phase && typeof p2Phase === 'object' && 'sources' in p2Phase ? (
                  <>
                    <span className="metric-link" onClick={() => handlePhaseClick(p2Phase, product2.name, phase.label)} title="Click for breakdown">
                      {patchedFormatFn(getVal(p2Phase))}
                    </span>
                    <span className="info-icon" onClick={() => handlePhaseClick(p2Phase, product2.name, phase.label)} title="Click for breakdown">ℹ</span>
                  </>
                ) : (
                  patchedFormatFn(getVal(p2Phase))
                )}
              </div>
            </div>
          );
        })}
        {/* Total row at the bottom */}
        <div className="comparison__phase-table-row" key="sum">
          <div className="comparison__phase-table-phase"><strong>Total</strong></div>
          <div className="comparison__phase-table-value">
            {patchedFormatFn(getVal(product1.impacts[sumKey]))}
          </div>
          <div className="comparison__phase-table-value">
            {patchedFormatFn(getVal(product2.impacts[sumKey]))}
          </div>
        </div>
      </div>
    );
  };

  // Render a table for a phase, grouped by metric (rows = metrics, columns = products), with total row at bottom
  const renderPhaseTable = (phaseKey, phaseLabel) => {
    const metrics = [
      { key: 'greenhouse_gas_kg', label: 'CO₂e Emissions', format: formatters.ghg },
      { key: 'water_liters', label: 'Water Usage', format: formatters.water },
      { key: 'energy_kwh', label: 'Energy', format: formatters.energy },
      { key: 'land_m2', label: 'Land Use', format: formatters.land },
      { key: 'cost_usd', label: 'Cost', format: formatters.cost },
    ];
    // Helper to get phase value for a product and metric
    const getVal = (product, metric) => {
      if (!product.impacts_by_phase || !product.impacts_by_phase[phaseKey]) return 0;
      return product.impacts_by_phase[phaseKey][metric] || 0;
    };
    return (
      <div className="comparison__phase-table" key={phaseKey}>
        <div className="comparison__phase-table-header-row">
          <div className="comparison__phase-table-label">{phaseLabel}</div>
          <div className="comparison__phase-table-product">{product1.name}</div>
          <div className="comparison__phase-table-product">{product2.name}</div>
        </div>
        {metrics.map(metric => (
          <div className="comparison__phase-table-row" key={metric.key}>
            <div className="comparison__phase-table-phase">{metric.label}</div>
            <div className="comparison__phase-table-value">
              {metric.format(getVal(product1, metric.key))}
            </div>
            <div className="comparison__phase-table-value">
              {metric.format(getVal(product2, metric.key))}
            </div>
          </div>
        ))}
        {/* No total row for phase tables (group by phase) */}
      </div>
    );
  };
  // (end of helpers, main return block should follow)

  return (

    <div className="comparison">
      {/* Header, break-even (no debug) */}
      <div className="comparison__header">
        <h2>Product Comparison</h2>
        <p className="comparison__winner-text">
          {wins.product1 > wins.product2
            ? `${product1.name} is more sustainable (${wins.product1}/${Object.keys(comparisons).length} metrics)${breakEvenText}`
            : wins.product2 > wins.product1
            ? `${product2.name} is more sustainable (${wins.product2}/${Object.keys(comparisons).length} metrics)${breakEvenText}`
            : `It's a tie - both products have pros and cons${breakEvenText}`}
        </p>
        {/* Removed break-even section as requested */}
      </div>

      {(exposedAssumptions1.length > 0 || exposedAssumptions2.length > 0) && (
        <div className="comparison__assumptions">
          <h3>Adjustable Assumptions</h3>
          <p className="comparison__assumptions-note">
            All values are assumptions internally; only the selected assumptions below are editable.
          </p>
          <div className="comparison__assumptions-grid">
            {renderAssumptionControls(product1, 'product1', exposedAssumptions1)}
            {renderAssumptionControls(product2, 'product2', exposedAssumptions2)}
          </div>
        </div>
      )}

      {/* SUMMARY TABLE */}
      <div className="comparison__table">
        <div className="comparison__header-row">
          <div className="comparison__metric-label">Metric</div>
          <div className="comparison__product-name">{product1.name}</div>
          <div className="comparison__product-name">{product2.name}</div>
        </div>
        {/* Product Price (per item) */}
        <div className="comparison__metric-row comparison__metric-row--info" key="product-price">
          <div className="comparison__metric-label">Product Price (per item)</div>
          <div className="comparison__metric-value">
            {formatCurrency(product1.purchase_price_usd)}
          </div>
          <div className="comparison__metric-value">
            {formatCurrency(product2.purchase_price_usd)}
          </div>
        </div>
        {/* Items needed per year */}
        <div className="comparison__metric-row comparison__metric-row--info" key="items-per-year">
          <div className="comparison__metric-label">Products needed per year</div>
          <div className="comparison__metric-value">
            {(() => {
              try {
                const val1 = (product1?.uses_per_year || 0) / (product1?.average_lifespan_uses || 1);
                return val1 >= 1 ? Math.round(val1) : val1.toFixed(1);
              } catch (e) {
                return 'N/A';
              }
            })()}
          </div>
          <div className="comparison__metric-value">
            {(() => {
              try {
                const val2 = (product2?.uses_per_year || 0) / (product2?.average_lifespan_uses || 1);
                return val2 >= 1 ? Math.round(val2) : val2.toFixed(1);
              } catch (e) {
                return 'N/A';
              }
            })()}
          </div>
        </div>
        {/* Annual Cost (normalized by usage) */}
        {renderMetricRow('Annual Cost', comparisons.cost, formatters.cost, 'cost_usd')}
        {renderMetricRow('CO₂e Emissions', comparisons.ghg, formatters.ghg, 'greenhouse_gas_kg')}
        {renderMetricRow('Water Usage', comparisons.water, formatters.water, 'water_liters')}
        {renderMetricRow('Energy', comparisons.energy, formatters.energy, 'energy_kwh')}
        {renderMetricRow('Land Use', comparisons.land, formatters.land, 'land_m2')}
      </div>

      {/* Unit toggle below summary table */}
      <div className="comparison__unit-toggle-row">
        <div className="comparison__unit-toggle-segmented" role="group" aria-label="Unit Toggle">
          <button
            className={useImperial ? 'comparison__unit-toggle' : 'comparison__unit-toggle active'}
            aria-pressed={!useImperial}
            onClick={() => setUseImperial(false)}
            tabIndex={useImperial ? 0 : -1}
          >
            Metric
          </button>
          <button
            className={useImperial ? 'comparison__unit-toggle active' : 'comparison__unit-toggle'}
            aria-pressed={useImperial}
            onClick={() => setUseImperial(true)}
            tabIndex={!useImperial ? 0 : -1}
          >
            Imperial
          </button>
        </div>
      </div>

      <BreakEvenChart product1={product1} product2={product2} />

      {/* PHASE BREAKDOWNS */}
      <div className="comparison__phase-section">
        <h3>Environmental Impact Details</h3>
        <div className="comparison__phase-toggle-row">
          <button
            className={!groupByPhase ? 'comparison__phase-toggle active' : 'comparison__phase-toggle'}
            onClick={() => setGroupByPhase(false)}
          >
            Group by Metric
          </button>
          <button
            className={groupByPhase ? 'comparison__phase-toggle active' : 'comparison__phase-toggle'}
            onClick={() => setGroupByPhase(true)}
          >
            Group by Phase
          </button>
        </div>
        {!groupByPhase ? (
          <>
            {renderMetricTable('CO₂e Emissions', 'greenhouse_gas_kg', formatters.ghg, phaseBreakdowns.ghg, 'greenhouse_gas_kg')}
            {renderMetricTable('Water Usage', 'water_liters', formatters.water, phaseBreakdowns.water, 'water_liters')}
            {renderMetricTable('Energy', 'energy_kwh', formatters.energy, phaseBreakdowns.energy, 'energy_kwh')}
            {renderMetricTable('Land Use', 'land_m2', formatters.land, {
              product1: getAnnualImpactByPhase(product1, 'land_m2'),
              product2: getAnnualImpactByPhase(product2, 'land_m2'),
            }, 'land_m2')}
            {renderMetricTable('Cost', 'cost_usd', formatters.cost, {
              product1: getAnnualImpactByPhase(product1, 'cost_usd'),
              product2: getAnnualImpactByPhase(product2, 'cost_usd'),
            }, 'cost_usd')}
          </>
        ) : (
          <>
            {renderPhaseTable('production', 'Production')}
            {renderPhaseTable('transport', 'Transport')}
            {renderPhaseTable('use', 'Use & Care')}
            {renderPhaseTable('end_of_life', 'End of Life')}
          </>
        )}
      </div>

      <div className="comparison__footer">
        <p>
          <strong>Lower is better</strong> for all environmental metrics.
          The ✓ indicates the winner in each category.
        </p>
        <p className="comparison__lifecycle-note">
          💡 <strong>Annual impacts shown:</strong> All values represent the yearly environmental cost. The "products needed per year" 
          row shows how many items you'd need to purchase annually based on your usage patterns.
        </p>
      </div>

      <CalculationModal 
        isOpen={!!modalData}
        onClose={() => setModalData(null)}
        data={modalData?.data}
        title={modalData?.title}
        unit={modalData?.unit}
        productsPerYear={modalData?.productsPerYear}
        conversionFactor={modalData?.conversionFactor || 1}
      />
    </div>
  );
}
