/**
 * ComparisonView component - displays side-by-side product comparison
 * 
 * Shows two products with their impacts and highlights which is better/worse
 * for each environmental metric.
 */
import {
  formatCurrency,
  formatGreenhouseGas,
  formatWater,
  formatEnergy,
  formatLand,
} from '../utils/formatting.js';
import { compareProducts, getItemsPerYear } from '../utils/comparison.js';
import './ComparisonView.css';

export function ComparisonView({ product1, product2 }) {
  if (!product1 || !product2) {
    return null;
  }

  // Compare products for each impact metric
  const comparisons = {
    cost: compareProducts(product1, product2, 'cost_usd'),
    ghg: compareProducts(product1, product2, 'greenhouse_gas_kg'),
    water: compareProducts(product1, product2, 'water_liters'),
    energy: compareProducts(product1, product2, 'energy_kwh'),
    land: compareProducts(product1, product2, 'land_m2'),
  };

  // Determine which product wins overall
  const wins = Object.values(comparisons).reduce((acc, comp) => {
    if (comp.winner === product1.name) acc.product1++;
    else acc.product2++;
    return acc;
  }, { product1: 0, product2: 0 });

  const renderMetricRow = (label, comparison, formatFn) => {
    const p1Value = product1.impacts[Object.keys(comparison)[3].split('Impact')[0]];
    const p2Value = product2.impacts[Object.keys(comparison)[3].split('Impact')[0]];
    
    return (
      <div className="comparison__metric-row" key={label}>
        <div className="comparison__metric-label">{label}</div>
        
        <div className={`comparison__metric-value ${
          comparison.winner === product1.name ? 'winner' : 'loser'
        }`}>
          {formatFn(comparison.product1Impact)}
          {comparison.winner === product1.name && <span className="winner-badge">✓</span>}
        </div>
        
        <div className={`comparison__metric-value ${
          comparison.winner === product2.name ? 'winner' : 'loser'
        }`}>
          {formatFn(comparison.product2Impact)}
          {comparison.winner === product2.name && <span className="winner-badge">✓</span>}
        </div>
      </div>
    );
  };

  return (
    <div className="comparison">
      <div className="comparison__header">
        <h2>Product Comparison</h2>
        <p className="comparison__winner-text">
          {wins.product1 > wins.product2
            ? `${product1.name} is more sustainable (${wins.product1}/${Object.keys(comparisons).length} metrics)`
            : wins.product2 > wins.product1
            ? `${product2.name} is more sustainable (${wins.product2}/${Object.keys(comparisons).length} metrics)`
            : "It's a tie - both products have pros and cons"}
        </p>
      </div>

      <div className="comparison__table">
        <div className="comparison__header-row">
          <div className="comparison__metric-label">Metric</div>
          <div className="comparison__product-name">{product1.name}</div>
          <div className="comparison__product-name">{product2.name}</div>
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

        {/* Cost */}
        {renderMetricRow('Cost', comparisons.cost, (val) => formatCurrency(val))}

        {/* Greenhouse Gas */}
        {renderMetricRow('CO₂e Emissions', comparisons.ghg, (val) =>
          formatGreenhouseGas(val)
        )}

        {/* Water */}
        {renderMetricRow('Water Usage', comparisons.water, (val) =>
          formatWater(val)
        )}

        {/* Energy */}
        {renderMetricRow('Energy', comparisons.energy, (val) =>
          formatEnergy(val)
        )}

        {/* Land */}
        {renderMetricRow('Land Use', comparisons.land, (val) =>
          formatLand(val)
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
    </div>
  );
}
