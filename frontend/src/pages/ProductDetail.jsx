/**
 * ProductDetail page - shows detailed information about a single product
 * 
 * Displays complete impact breakdown, component analysis, and
 * provides context about the product's materials and manufacturing.
 */
import { useParams, useNavigate } from 'react-router-dom';
import { useProduct } from '../hooks/useProducts.js';
import { ImpactChart } from '../components/ImpactChart.jsx';
import { LoadingSpinner } from '../components/LoadingSpinner.jsx';
import { getComponentBreakdown } from '../utils/comparison.js';
import { formatCurrency } from '../utils/formatting.js';
import './ProductDetail.css';

export function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { product, loading, error } = useProduct(slug);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !product) {
    return (
      <div className="product-detail__error">
        <h2>Product Not Found</h2>
        <p>The product you're looking for doesn't exist.</p>
        <button onClick={() => navigate('/products')} className="link-button">
          Back to Products
        </button>
      </div>
    );
  }

  const components = getComponentBreakdown(product);

  return (
    <div className="product-detail">
      <button onClick={() => navigate('/products')} className="back-button">
        ← Back to Products
      </button>

      <div className="product-detail__header">
        <h1>{product.name}</h1>
        {product.description && <p>{product.description}</p>}
      </div>

      <div className="product-detail__main">
        <section className="product-detail__section">
          <ImpactChart product={product} />
        </section>

        <aside className="product-detail__sidebar">
          <div className="product-info">
            <h3>Product Information</h3>
            
            {product.purchase_price_usd !== undefined && (
              <div className="info-item">
                <span className="label">Typical Purchase Price:</span>
                <span className="value">
                  {formatCurrency(product.purchase_price_usd)}
                </span>
              </div>
            )}
            
            {product.average_lifespan_years !== undefined && (
              <div className="info-item">
                <span className="label">Average Lifespan:</span>
                <span className="value">
                  {product.average_lifespan_years} years
                </span>
              </div>
            )}
            
            {product.impacts.cost_usd !== undefined && (
              <div className="info-item">
                <span className="label">Material Cost:</span>
                <span className="value">
                  {formatCurrency(product.impacts.cost_usd)}
                </span>
              </div>
            )}
          </div>
        </aside>
      </div>

      {components.length > 0 && (
        <section className="product-detail__section">
          <h2>Material Composition</h2>
          <div className="components">
            {components.map((component) => (
              <div key={component.id} className="component-card">
                <h4>{component.material_name}</h4>
                <p className="component-weight">
                  {component.weight_grams}g
                </p>
                <div className="component-impacts">
                  <div className="impact">
                    <span>CO₂:</span>
                    <strong>
                      {component.impacts.greenhouse_gas_kg.toFixed(2)} kg
                    </strong>
                  </div>
                  <div className="impact">
                    <span>Water:</span>
                    <strong>{component.impacts.water_liters.toFixed(0)} L</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
