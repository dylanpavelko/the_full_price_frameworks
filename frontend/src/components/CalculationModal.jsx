import React from 'react';
import './CalculationModal.css';

export function CalculationModal({ isOpen, onClose, data, title, unit, productsPerYear }) {
  if (!isOpen || !data) return null;

  const sources = data.sources || [];

  const renderSource = (s) => {
    if (!s) return null;
    if (typeof s === 'string') return s;
    const { url, name, note } = s;
    return (
      <span className="rich-source">
        {url ? (
          <a href={url} target="_blank" rel="noopener noreferrer" className="metric-link">
            {name || url} <span className="info-icon">ℹ</span>
          </a>
        ) : (
          <span className="source-name">{name}</span>
        )}
        {note && <span className="source-note"> {note}</span>}
      </span>
    );
  };

  return (
    <div className="calc-modal-overlay" onClick={onClose}>
      <div className="calc-modal-content" onClick={e => e.stopPropagation()}>
        <div className="calc-modal-header">
          <h3>{title}</h3>
          <button className="calc-modal-close" onClick={onClose}>&times;</button>
        </div>
        
        <div className="calc-modal-body">
          <div className="calc-modal-summary">
            <div className="calc-metric-value">
              {typeof data.value === 'number' ? data.value.toFixed(3) : data.value}
            </div>
            <div className="calc-metric-unit">{unit}</div>
            {/* Show explicit annualization math if this is an annualized value and sub_sources exist */}
            {Array.isArray(sources) && sources.length > 0 && sources[0].sub_sources && sources[0].sub_sources.length > 0 && (
              <div className="calc-note-text" style={{ fontSize: '0.97em', color: '#2a7', marginTop: 4 }}>
                <strong>How this is calculated:</strong><br />
                {(() => {
                  // Sum per-item values from sub_sources
                  const perItemSum = sources[0].sub_sources.reduce((sum, sub) => sum + (typeof sub.value === 'number' ? sub.value : 0), 0);
                  // Try to get products needed per year from calculation string or fallback to uses_per_year/average_lifespan_uses
                  let extractedProductsPerYear = null;
                  const calcStr = sources[0].calculation || '';
                  const match = calcStr.match(/\*\s*([\d.]+)\s*(uses|products|items)[^\d]?/i);
                  if (match) {
                    extractedProductsPerYear = match[1];
                  } else if (productsPerYear) {
                    extractedProductsPerYear = productsPerYear;
                  } else if (data && data.productsPerYear) {
                    extractedProductsPerYear = data.productsPerYear;
                  }
                  return (
                    <>
                      <span>
                        ({perItemSum.toLocaleString(undefined, { maximumFractionDigits: 3 })} per item)
                        {extractedProductsPerYear ? ` × ${parseFloat(Number(extractedProductsPerYear).toFixed(3))} products needed per year` : ''}
                        {extractedProductsPerYear ? ` = ${(perItemSum * extractedProductsPerYear).toLocaleString(undefined, { maximumFractionDigits: 3 })}` : ''}
                      </span>
                    </>
                  );
                })()}
              </div>
            )}
          </div>

          <div className="calc-breakdown-list">
            <h4>Calculation Breakdown</h4>
            {sources.length === 0 ? (
               <p className="calc-no-data">No detailed breakdown available.</p>
            ) : (
              sources.map((source, idx) => (
                <div key={idx} className="calc-breakdown-item">
                  <div className="calc-item-header">
                    <span className="calc-item-name">{source.item}</span>
                    <span className="calc-item-value">{typeof source.value === 'number' ? source.value.toFixed(3) : source.value}</span>
                  </div>
                  <div className="calc-item-details">
                    <div className="calc-row">
                      <span className="calc-label">Calculation:</span>
                      <code className="calc-formula">{source.calculation}</code>
                    </div>
                    {/* Indicate if products needed per year is included */}
                    {source.calculation && /items per year|uses\/yr|products needed per year|annualized|amortized|\*.*uses_per_year|\/.*lifespan_uses/i.test(source.calculation) && (
                      <div className="calc-row">
                        <span className="calc-label" style={{ color: '#2a7' }}>Note:</span>
                        <span className="calc-note-text">This value accounts for the number of products needed per year.</span>
                      </div>
                    )}
                    {source.source && (
                      <div className="calc-row">
                        <span className="calc-label">Source:</span>
                        <span className="calc-source-text">{renderSource(source.source)}</span>
                      </div>
                    )}
                  </div>
                  
                  {source.sub_sources && source.sub_sources.length > 0 && (
                    <div className="calc-sub-sources">
                      <h5>Components (per item):</h5>
                      <div className="calc-note-text" style={{ fontSize: '0.95em', color: '#888', marginBottom: 4 }}>
                        Each component calculation below is for a single product. The total above is annualized by multiplying the per-item value by the number of products needed per year.
                      </div>
                      {source.sub_sources.map((sub, sIdx) => (
                        <div key={sIdx} className="calc-sub-item">
                          <span>{sub.item}: </span>
                          <span>{sub.calculation}</span>
                          {sub.source && <span className="sub-citation"> [{renderSource(sub.source)}]</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
