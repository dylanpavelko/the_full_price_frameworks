/**
 * Custom React hooks for fetching and managing materials data.
 */
import { useState, useEffect } from 'react';
import { loadMaterials, loadMaterialBySlug } from '../data/index.js';

/**
 * Hook to fetch all materials and categories.
 * @returns {{ materials, categories, loading, error }}
 */
export function useAllMaterials() {
  const [materials, setMaterials] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await loadMaterials();
        setMaterials(data.materials);
        setCategories(data.categories);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return { materials, categories, loading, error };
}

/**
 * Hook to fetch a single material by slug, plus its sibling materials.
 * @param {string} slug
 * @returns {{ material, siblingMaterials, categories, loading, error }}
 */
export function useMaterial(slug) {
  const [material, setMaterial] = useState(null);
  const [siblingMaterials, setSiblingMaterials] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await loadMaterials();
        const mat = data.materials.find(m => m.slug === slug) || null;
        if (!mat) {
          throw new Error('Material not found');
        }
        setMaterial(mat);
        setCategories(data.categories);

        // Sibling = same category, excluding self
        if (mat.category) {
          setSiblingMaterials(
            data.materials.filter(
              m => m.category?.slug === mat.category.slug && m.slug !== slug
            )
          );
        } else {
          setSiblingMaterials([]);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  return { material, siblingMaterials, categories, loading, error };
}
