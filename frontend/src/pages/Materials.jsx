/**
 * Materials page — browse all materials grouped by category.
 */
import { Link } from 'react-router-dom';
import { useAllMaterials } from '../hooks/useMaterials.js';
import { LoadingSpinner } from '../components/LoadingSpinner.jsx';
import './Materials.css';

export function Materials() {
  const { materials, categories, loading, error } = useAllMaterials();

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="materials__error">
        <h2>Error Loading Materials</h2>
        <p>{error}</p>
      </div>
    );
  }

  // Build a map: category slug -> materials in that category
  const materialsByCategory = {};
  for (const mat of materials) {
    const catSlug = mat.category?.slug || '_uncategorized';
    if (!materialsByCategory[catSlug]) materialsByCategory[catSlug] = [];
    materialsByCategory[catSlug].push(mat);
  }

  // Categories that actually have materials first, then empties
  const populatedCategories = categories.filter(c => materialsByCategory[c.slug]?.length);
  const emptyCategories = categories.filter(c => !materialsByCategory[c.slug]?.length);
  const uncategorized = materialsByCategory['_uncategorized'] || [];

  return (
    <div className="materials">
      <div className="materials__header">
        <h1>Material Library</h1>
        <p>
          Explore the raw materials that make up everyday products — how they're sourced,
          processed, and what impact they carry.
        </p>
      </div>

      {populatedCategories.map(cat => (
        <section key={cat.slug} className="materials__category">
          <div className="category-header">
            <h2>{cat.name}</h2>
            {cat.description && <p className="category-desc">{cat.description}</p>}
            {cat.typical_products && (
              <p className="category-products">
                <strong>Typical products:</strong> {cat.typical_products}
              </p>
            )}
          </div>

          <div className="materials__grid">
            {materialsByCategory[cat.slug].map(mat => (
              <Link
                key={mat.slug}
                to={`/materials/${mat.slug}`}
                className="material-card"
              >
                <h3 className="material-card__name">{mat.name}</h3>
                {mat.description && (
                  <p className="material-card__desc">{mat.description}</p>
                )}
                <span className="material-card__cta">View details →</span>
              </Link>
            ))}
          </div>
        </section>
      ))}

      {emptyCategories.length > 0 && (
        <section className="materials__empty-categories">
          <h2>Other Categories</h2>
          <p className="category-desc">
            These categories don't have materials yet — they'll be populated as we add more data.
          </p>
          <div className="materials__tag-list">
            {emptyCategories.map(cat => (
              <span key={cat.slug} className="category-tag">
                {cat.name}
                {cat.typical_products && (
                  <span className="category-tag__products"> — {cat.typical_products}</span>
                )}
              </span>
            ))}
          </div>
        </section>
      )}

      {uncategorized.length > 0 && (
        <section className="materials__category">
          <h2>Uncategorized</h2>
          <div className="materials__grid">
            {uncategorized.map(mat => (
              <Link
                key={mat.slug}
                to={`/materials/${mat.slug}`}
                className="material-card"
              >
                <h3 className="material-card__name">{mat.name}</h3>
                {mat.description && (
                  <p className="material-card__desc">{mat.description}</p>
                )}
                <span className="material-card__cta">View details →</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
