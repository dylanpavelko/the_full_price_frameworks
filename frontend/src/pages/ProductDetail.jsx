/**
 * ProductDetail page - shows detailed information about a single product
 * 
 * Displays complete impact breakdown, component analysis, and
 * provides context about the product's materials and manufacturing.
 */
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useProduct } from '../hooks/useProducts.js';
import { useAllPosts } from '../hooks/usePosts.js';
import { ImpactChart } from '../components/ImpactChart.jsx';
import { LoadingSpinner } from '../components/LoadingSpinner.jsx';
import { getComponentBreakdown } from '../utils/comparison.js';
import { formatCurrency } from '../utils/formatting.js';
import './ProductDetail.css';

export function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { product, loading, error } = useProduct(slug);
  const { posts } = useAllPosts();

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

  
  const relatedComparisons = posts.filter(post => 
    product && post.comparison?.product_ids?.includes(product.id)
  );
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
          <div className="product-comparisons">
            <h2 style={{ marginTop: 0 }}>Product Comparisons</h2>
            {relatedComparisons.length > 0 ? (
              <div className="related-comparisons-list">
                {relatedComparisons.map(post => (
                  <Link key={post.id} to={`/posts/${post.slug}`} className="related-comparison-link">
                    <h4>{post.title}</h4>
                    <p className="comparison-excerpt">
                      {post.excerpt || (post.content ? post.content.substring(0, 150) + '...' : 'View Comparison')}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="no-comparisons">
                No comparisons are currently available for this product. 
                <Link to="/products"> View all products</Link>.
              </p>
            )}
          </div>
        </section>

        <aside className="product-detail__sidebar">
          <div className="sidebar-box">
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
                  {formatCurrency(typeof product.impacts.cost_usd === 'object' ? product.impacts.cost_usd.value : product.impacts.cost_usd)}
                </span>
              </div>
            )}
          </div>
          
          <div className="sidebar-box">
            <ImpactChart product={product} />
          </div>

          {components.length > 0 && (
            <div className="sidebar-box">
              <h3>Material Composition</h3>
              <div className="sidebar-components-list">
                {components.map((component) => (
                  <div key={component.id} className="sidebar-component-item">
                    <div className="sc-header">
                      <span className="sc-name">{component.material_name}</span>
                      <span className="sc-weight">{component.weight_grams}g</span>
                    </div>
                    <div className="sc-impacts">
                      <span>CO₂: {component.impacts.greenhouse_gas_kg.toFixed(2)} kg</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
