/**
 * MaterialDetail page — shows everything about a single material:
 * sourcing, fabrication, end-of-life, impact factors, related materials,
 * and which products use it.
 */
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useMaterial } from '../hooks/useMaterials.js';
import { LoadingSpinner } from '../components/LoadingSpinner.jsx';
import './MaterialDetail.css';

export function MaterialDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { material, siblingMaterials, loading, error } = useMaterial(slug);

  if (loading) return <LoadingSpinner />;

  if (error || !material) {
    return (
      <div className="material-detail__error">
        <h2>Material Not Found</h2>
        <p>The material you're looking for doesn't exist.</p>
        <button onClick={() => navigate('/materials')} className="link-button">
          Back to Materials
        </button>
      </div>
    );
  }

  const factors = material.impact_factors || {};

  return (
    <div className="material-detail">
      <button onClick={() => navigate('/materials')} className="back-button">
        ← Back to Materials
      </button>

      {/* Header */}
      <div className="material-detail__header">
        <h1>{material.name}</h1>
        {material.category && (
          <Link to="/materials" className="material-detail__category-badge">
            {material.category.name}
          </Link>
        )}
        {material.description && <p className="material-detail__desc">{material.description}</p>}
      </div>

      {/* Content sections */}
      <div className="material-detail__content">
        {material.sourcing_info && (
          <section className="md-section">
            <h2>Sourcing &amp; Extraction</h2>
            <p>{material.sourcing_info}</p>
          </section>
        )}

        {material.fabrication_info && (
          <section className="md-section">
            <h2>Fabrication &amp; Processing</h2>
            <p>{material.fabrication_info}</p>
          </section>
        )}

        {material.end_of_life_info && (
          <section className="md-section">
            <h2>End of Life</h2>
            <p>{material.end_of_life_info}</p>
          </section>
        )}

        {material.environmental_notes && (
          <section className="md-section">
            <h2>Environmental Notes</h2>
            <p>{material.environmental_notes}</p>
          </section>
        )}

        {/* Impact Factors Table */}
        <section className="md-section">
          <h2>Impact Factors <span className="md-unit-note">(per kg of material)</span></h2>
          <div className="md-table-wrap">
            <table className="md-impact-table">
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>Production</th>
                  <th>Transport</th>
                  <th>End of Life</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                <ImpactRow label="CO₂e (kg)" metric="co2e_kg_per_kg" factors={factors} />
                <ImpactRow label="Water (L)" metric="water_liters_per_kg" factors={factors} />
                <ImpactRow label="Energy (kWh)" metric="energy_kwh_per_kg" factors={factors} />
                <ImpactRow label="Land (m²)" metric="land_m2_per_kg" factors={factors} />
                <ImpactRow label="Cost (USD)" metric="cost_per_kg" factors={factors} />
              </tbody>
            </table>
          </div>
        </section>

        {/* Products using this material */}
        {material.products_using?.length > 0 && (
          <section className="md-section">
            <h2>Products Using This Material</h2>
            <div className="md-product-links">
              {material.products_using.map(p => (
                <Link key={p.id} to={`/products/${p.slug}`} className="md-product-chip">
                  {p.name}
                  <span className="md-product-chip__weight">{p.weight_grams}g</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Related materials in same category */}
        {siblingMaterials.length > 0 && (
          <section className="md-section">
            <h2>Related Materials</h2>
            <p className="md-section__sub">
              Other materials in <strong>{material.category?.name}</strong>
            </p>
            <div className="md-related-grid">
              {siblingMaterials.map(m => (
                <Link key={m.slug} to={`/materials/${m.slug}`} className="material-card">
                  <h3 className="material-card__name">{m.name}</h3>
                  {m.description && <p className="material-card__desc">{m.description}</p>}
                  <span className="material-card__cta">View details →</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {material.methodology && (
          <section className="md-section md-section--muted">
            <h2>Methodology</h2>
            <p>{material.methodology}</p>
          </section>
        )}
      </div>
    </div>
  );
}

/**
 * Table row for one impact metric across phases.
 */
function ImpactRow({ label, metric, factors }) {
  const prod = factors.production?.[metric] ?? 0;
  const trans = factors.transport?.[metric] ?? 0;
  const eol = factors.end_of_life?.[metric] ?? 0;
  const total = prod + trans + eol;

  const fmt = (v) => {
    if (v === 0) return '—';
    if (Math.abs(v) >= 1000) return v.toLocaleString(undefined, { maximumFractionDigits: 1 });
    if (Math.abs(v) >= 1) return v.toLocaleString(undefined, { maximumFractionDigits: 2 });
    return v.toLocaleString(undefined, { maximumSignificantDigits: 3 });
  };

  return (
    <tr>
      <td className="md-metric-label">{label}</td>
      <td>{fmt(prod)}</td>
      <td>{fmt(trans)}</td>
      <td>{fmt(eol)}</td>
      <td className="md-total">{fmt(total)}</td>
    </tr>
  );
}
