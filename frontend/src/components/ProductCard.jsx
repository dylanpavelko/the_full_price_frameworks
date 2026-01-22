/**
 * ProductCard component displays a summary of a product's impacts
 * 
 * Shows key impact metrics and a link to view full details.
 * Used in product lists and comparisons.
 */
import { Link } from 'react-router-dom';
import {
  formatCurrency,
  formatGreenhouseGas,
  formatWater,
  formatEnergy,
  formatLand,
} from '../utils/formatting.js';
import './ProductCard.css';

export function ProductCard({ product }) {
  const { impacts } = product;
  
  return (
    <Link to={`/products/${product.slug}`} className="product-card">
      <div className="product-card__content">
        <h3 className="product-card__name">{product.name}</h3>
        
        {product.description && (
          <p className="product-card__description">{product.description}</p>
        )}
        
        <div className="product-card__impacts">
          <div className="impact-item">
            <span className="impact-label">CO₂ Impact:</span>
            <span className="impact-value">
              {formatGreenhouseGas(impacts.greenhouse_gas_kg)}
            </span>
          </div>
          
          <div className="impact-item">
            <span className="impact-label">Water:</span>
            <span className="impact-value">
              {formatWater(impacts.water_liters)}
            </span>
          </div>
          
          <div className="impact-item">
            <span className="impact-label">Energy:</span>
            <span className="impact-value">
              {formatEnergy(impacts.energy_kwh)}
            </span>
          </div>
          
          <div className="impact-item">
            <span className="impact-label">Material Cost:</span>
            <span className="impact-value">
              {formatCurrency(impacts.cost_usd)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
