import React from 'react';
import './CalculationModal.css';

export function CalculationModal({ isOpen, onClose, data, title, unit }) {
  if (!isOpen || !data) return null;

  const sources = data.sources || [];

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
                    {source.source && (
                      <div className="calc-row">
                        <span className="calc-label">Source:</span>
                        <span className="calc-source-text">{source.source}</span>
                      </div>
                    )}
                  </div>
                  
                  {source.sub_sources && source.sub_sources.length > 0 && (
                     <div className="calc-sub-sources">
                        <h5>Components:</h5>
                        {source.sub_sources.map((sub, sIdx) => (
                            <div key={sIdx} className="calc-sub-item">
                                <span>{sub.item}: </span>
                                <span>{sub.calculation}</span>
                                {sub.source && <span className="sub-citation"> [{sub.source}]</span>}
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
