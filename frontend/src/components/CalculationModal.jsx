import React, { useState } from 'react';
import './CalculationModal.css';

export function CalculationModal({ isOpen, onClose, data, title, unit, productsPerYear }) {
  const [showDetails, setShowDetails] = useState(false);

  if (!isOpen || !data) return null;

  const sources = data.sources || [];
  const totalValue = typeof data.value === 'number' ? data.value : 0;
  
  // 1. Determine Products Per Year (ppy)
  // distinct from 'uses per year' because durable goods last >1 year
  let ppy = typeof productsPerYear === 'number' ? productsPerYear : (data.productsPerYear || 0);
  
  // 2. Calculate Per-item impact
  // If ppy is 0, we can't divide, so default to 0
  const perItemValue = (ppy && ppy !== 0) ? (totalValue / ppy) : 0;
  
  // 3. Determine if this is a durable good (lasts > 1 year) or consumable
  const isDurable = ppy < 1 && ppy > 0;
  const yearsLasts = isDurable ? (1 / ppy) : 0;

  const formatVal = (val) => {
    return val !== undefined && val !== null 
      ? val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 }) 
      : '0';
  };

  const renderSource = (s) => {
    if (!s) return null;
    if (typeof s === 'string') return s;
    const { url, name, note } = s;
    return (
      <span className="rich-source">
        {url ? (
          <a href={url} target="_blank" rel="noopener noreferrer" className="metric-link">
            {name || url} <span className="info-icon">↗</span>
          </a>
        ) : (
          <span className="source-name">{name}</span>
        )}
        {note && <span className="source-note"> • {note}</span>}
      </span>
    );
  };

  // Dynamic label based on the unit type
  const getPerItemLabel = () => {
    if (!unit) return 'Impact per Item';
    // Normalize string to check
    const u = unit.toLowerCase();
    
    // Cost/Dollars
    if (u.includes('cost') || u.includes('$') || u.includes('usd') || u.includes('price')) {
      return 'Dollars per Item';
    }
    // Emissions/Carbon
    if (u.includes('co2') || u.includes('emissions') || u.includes('greenhouse')) {
      return 'Emissions per Item (kg CO₂e)';
    }
    // Water
    if (u.includes('water') || u.includes('liter') || u.includes('gallon')) {
      if (u === 'liters' || u === 'gallons') return `Water per Item (${unit})`;
      return `Water per Item`;
    }
    // Energy
    if (u.includes('energy') || u.includes('kwh') || u.includes('joule')) {
      return 'Energy per Item (kWh)';
    }
    // Land
    if (u.includes('land') || u.includes('m2') || u.includes('sq')) {
      return 'Land Use per Item (m²)';
    }
    // Default fallback
    return `Impact per Item (${unit})`;
  };

  return (
    <div className="calc-modal-overlay" onClick={onClose}>
      <div className="calc-modal-content" onClick={e => e.stopPropagation()}>
        <div className="calc-modal-header">
          <h3>{title}</h3>
          <button className="calc-modal-close" onClick={onClose}>&times;</button>
        </div>
        
        <div className="calc-modal-body">
          {/* SECTION 1: The Main Number */}
          <div className="calc-hero-section">
            <div className="calc-hero-label">Annual Impact</div>
            <div className="calc-hero-value">
              {formatVal(totalValue)} <span className="calc-hero-unit">{unit}</span>
            </div>
            <div className="calc-hero-sub">per year of use</div>
          </div>

          {/* SECTION 2: The "Simple Math" Story */}
          {ppy > 0 && (
            <div className="calc-logic-card">
              <h4>How it works</h4>
              
              {/* Visual Equation */}
              <div className="calc-equation-visual">
                <div className="calc-eq-part">
                  <span className="calc-eq-val">{formatVal(perItemValue)}</span>
                  <span className="calc-eq-label">{getPerItemLabel()}</span>
                </div>
                <div className="calc-eq-op">×</div>
                <div className="calc-eq-part">
                  <span className="calc-eq-val">
                    {isDurable ? formatVal(ppy) : Math.ceil(ppy)}
                  </span>
                  <span className="calc-eq-label">Items / Year</span>
                </div>
                <div className="calc-eq-op">=</div>
                <div className="calc-eq-part highlight">
                  <span className="calc-eq-val">{formatVal(totalValue)}</span>
                  <span className="calc-eq-label">Annual Total</span>
                </div>
              </div>

              {/* Friendly Explanation */}
              <div className="calc-story-text">
                {isDurable ? (
                  <p>
                    This is a durable item that lasts about <strong>{yearsLasts.toFixed(1)} years</strong>. 
                    We spread its impact over its lifetime, so heavily used long-lasting items often have lower annual impacts.
                    <br/><br/>
                    <em>(Math: 1 item / {yearsLasts.toFixed(1)} years = {ppy.toFixed(3)} items "used" per year)</em>
                  </p>
                ) : (
                  <p>
                    Based on typical usage, you would need about <strong>{Math.ceil(ppy)}</strong> of these every year. 
                    The total impact is the sum of every single one used.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* SECTION 3: The Deep Dive (Collapsible) */}
          <div className="calc-details-section">
            <button 
              className="calc-toggle-btn"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? 'Hide Detailed Breakdown' : 'Show Detailed Sources & Math'} 
              <span className={`arrow ${showDetails ? 'up' : 'down'}`}>▼</span>
            </button>

            {showDetails && (
              <div className="calc-breakdown-list">
                {sources.length === 0 ? (
                  <p className="calc-no-data">No deeper breakdown available.</p>
                ) : (
                  sources.map((source, idx) => (
                    <div key={idx} className="calc-breakdown-item">
                      <div className="calc-item-header">
                        <span className="calc-item-name">{source.item}</span>
                        <span className="calc-item-value">{formatVal(source.value)} {unit}</span>
                      </div>
                      
                      {source.source && (
                        <div className="calc-row">
                          <span className="calc-label">Data Source:</span>
                          <span className="calc-source-text">{renderSource(source.source)}</span>
                        </div>
                      )}
                      
                      {/* Only show raw calculation string if user really wants to check our homework */}
                      {source.calculation && (
                        <div className="calc-row">
                          <span className="calc-label">Formula:</span>
                          <code className="calc-formula">{source.calculation}</code>
                        </div>
                      )}

                      {/* Sub-components list */}
                      {source.sub_sources && source.sub_sources.length > 0 && (
                        <div className="calc-sub-sources">
                          <h5>Components:</h5>
                          {source.sub_sources.map((sub, sIdx) => (
                            <div key={sIdx} className="calc-sub-item">
                              {sub.item}: <strong>{formatVal(sub.value)}</strong>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
