/**
 * Custom React hook for fetching and managing products.
 * 
 * This hook encapsulates the logic for loading product data from the
 * static JSON export, handling loading states, and caching results.
 */
import { useState, useEffect } from 'react';
import { loadProducts, loadProductBySlug } from '../data/index.js';

/**
 * Hook to fetch all products
 * @returns {Object} Object with products array, loading state, and error
 */
export function useAllProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await loadProducts();
        setProducts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return { products, loading, error };
}

/**
 * Hook to fetch a single product by slug
 * @param {string} slug - The product slug
 * @returns {Object} Object with product, loading state, and error
 */
export function useProduct(slug) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await loadProductBySlug(slug);
        if (!data) {
          throw new Error('Product not found');
        }
        setProduct(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  return { product, loading, error };
}
