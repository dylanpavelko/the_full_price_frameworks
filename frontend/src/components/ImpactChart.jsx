/**
 * ImpactChart component visualizes product impacts
 * 
 * Shows a simple bar-style representation of different impact dimensions.
 * Makes it easy to compare relative impacts at a glance.
 */
import {
  formatGreenhouseGas,
  formatWater,
  formatEnergy,
  formatLand,
  formatCurrency,
  getVal,
} from '../utils/formatting.js';
import './ImpactChart.css';

export function ImpactChart({ product }) {
  const { impacts } = product;
  
  // Normalize impacts to a 0-100 scale for visualization
  // Find max values to determine scale
  const ghgVal = getVal(impacts.greenhouse_gas_kg);
  const waterVal = getVal(impacts.water_liters);
  const energyVal = getVal(impacts.energy_kwh);
  const landVal = getVal(impacts.land_m2);
  
  const maxGhg = ghgVal || 1;
  const maxWater = waterVal || 1;
  const maxEnergy = energyVal || 1;
  const maxLand = landVal || 1;
  
  const impactCategories = [
    {
      label: 'Greenhouse Gas',
      value: ghgVal,
      formatted: formatGreenhouseGas(impacts.greenhouse_gas_kg),
      percentage: (ghgVal / maxGhg) * 100,
      color: '#e74c3c',
    },
    {
      label: 'Water Usage',
      value: waterVal,
      formatted: formatWater(impacts.water_liters),
      percentage: (waterVal / maxWater) * 100,
      color: '#3498db',
    },
    {
      label: 'Energy',
      value: energyVal,
      formatted: formatEnergy(impacts.energy_kwh),
      percentage: (energyVal / maxEnergy) * 100,
      color: '#f39c12',
    },
    {
      label: 'Land Use',
      value: landVal,
      formatted: formatLand(impacts.land_m2),
      percentage: (landVal / maxLand) * 100,
      color: '#27ae60',
    },
  ];
  
  return (
    <div className="impact-chart">
      <h3 className="impact-chart__title">Environmental Impact Breakdown</h3>
      
      <div className="impact-chart__items">
        {impactCategories.map((category) => (
          <div key={category.label} className="chart-item">
            <div className="chart-item__header">
              <span className="chart-item__label">{category.label}</span>
              <span className="chart-item__value">{category.formatted}</span>
            </div>
            
            <div className="chart-item__bar">
              <div
                className="chart-item__bar-fill"
                style={{
                  width: `${category.percentage}%`,
                  backgroundColor: category.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
      
      {product.impacts.cost_usd !== undefined && (
        <div className="impact-chart__cost">
          <span className="cost-label">Material Cost:</span>
          <span className="cost-value">
            {formatCurrency(product.impacts.cost_usd)}
          </span>
        </div>
      )}
    </div>
  );
}
