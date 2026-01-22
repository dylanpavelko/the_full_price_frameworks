/**
 * Products page - displays all available products
 * 
 * Shows a grid of product cards that users can click to view details.
 * Loads data from static JSON export.
 */
import { useAllProducts } from '../hooks/useProducts.js';
import { ProductCard } from '../components/ProductCard.jsx';
import { LoadingSpinner } from '../components/LoadingSpinner.jsx';
import './Products.css';

export function Products() {
  const { products, loading, error } = useAllProducts();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="products__error">
        <h2>Error Loading Products</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="products__empty">
        <h2>No Products Available</h2>
        <p>Check back soon for product comparisons and impact analyses.</p>
      </div>
    );
  }

  return (
    <div className="products">
      <div className="products__header">
        <h1>Product Impact Library</h1>
        <p>
          Browse and compare the environmental and financial impact of different products. 
          Click on any product to see detailed breakdowns.
        </p>
      </div>

      <div className="products__grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
