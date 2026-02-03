/**
 * Utility functions for comparing product impacts.
 * 
 * These functions help calculate differences between products and
 * determine which is more environmentally friendly.
 */

/**
 * Calculate lifecycle impact for a product based on annual usage
 * 
 * The calculation:
 * 1. items_per_year = uses_per_year / average_lifespan_uses
 * 2. annual_impact = per_item_impact * items_per_year
 * 
 * This way we can fairly compare:
 * - Single-use items (e.g., paper napkin: 365 uses/year, 1 use per item = 365 items/year)
 * - Durable items (e.g., cloth napkin: 250 uses/year, 500 uses per item = 0.5 items/year)
 * 
 * @param {Object} product - Product to calculate for
 * @param {string} impactType - Type of impact
 * @returns {number} Annual impact value
 */
function getAnnualImpact(product, impactType) {
  const baseImpact = product.impacts[impactType] || 0;
  
  // Handle rich object structure (Backend v2)
  if (typeof baseImpact === 'object' && baseImpact !== null && 'value' in baseImpact) {
    // The new backend structure returns annualized values directly
    return baseImpact.value;
  }
  
  // Legacy logic (Backwards compatibility if needed, or if input is per-item)
  const usesPerYear = product.uses_per_year || 1;
  const lifespanUses = product.average_lifespan_uses || 1;
  
  // How many items you need to buy per year
  const itemsPerYear = usesPerYear / lifespanUses;
  
  // Annual impact = impact to make/dispose one item * how many items per year
  return baseImpact * itemsPerYear;
}

/**
 * Get items needed per year
 * Calculated as: uses_per_year / average_lifespan_uses
 * @param {Object} product - Product to calculate for
 * @returns {number} Number of items needed per year
 */
export function getItemsPerYear(product) {
  const usesPerYear = product.uses_per_year || 1;
  const lifespanUses = product.average_lifespan_uses || 1;
  return usesPerYear / lifespanUses;
}

/**
 * Get years of use until replacement
 * Calculated as: lifespan_uses / uses_per_year
 * @param {Object} product - Product to calculate for
 * @returns {number} Years before needing to replace
 */
export function getYearsUntilReplacement(product) {
  const usesPerYear = product.uses_per_year || 1;
  const lifespanUses = product.average_lifespan_uses || 1;
  return lifespanUses / usesPerYear;
}

/**
 * Get uses per year for a product
 * @param {Object} product - Product to calculate for
 * @returns {number} Number of times per year the product is used
 */
export function getUsesPerYear(product) {
  return product.uses_per_year || 1;
}

/**
 * Compare two products and return the difference
 * Positive means product1 has more impact, negative means product2 has more
 * Accounts for lifecycle/usage patterns when comparing
 * @param {Object} product1 - First product
 * @param {Object} product2 - Second product
 * @param {string} impactType - Type of impact to compare (e.g., 'greenhouse_gas_kg')
 * @returns {Object} Comparison result with difference and winner
 */
export function compareProducts(product1, product2, impactType) {
  const impact1 = getAnnualImpact(product1, impactType);
  const impact2 = getAnnualImpact(product2, impactType);
  
  const difference = impact1 - impact2;
  const percentDifference = impact2 !== 0 ? (difference / impact2) * 100 : 0;
  
  return {
    difference,
    percentDifference,
    // For all impact metrics, lower is better (less CO2, less water, less cost, etc.)
    // So if difference > 0, product1 has more impact = product2 wins
    winner: difference > 0 ? product2.name : product1.name,
    product1Impact: impact1,
    product2Impact: impact2,
  };
}

// Helper to extract numeric value from potential rich object
const getVal = (v) => (typeof v === 'object' && v !== null && 'value' in v) ? v.value : (v || 0);

/**
 * Calculate overall environmental impact score for a product
 * Lower score is better (less environmental impact)
 * @param {Object} product - Product to score
 * @returns {number} Environmental score
 */
export function calculateEnvironmentalScore(product) {
  const impacts = product.impacts;
  
  // Normalize different impact types to a common scale
  // These factors help make different units comparable
  const normalizedImpacts = {
    ghg: getVal(impacts.greenhouse_gas_kg) / 100, // Scale CO2e
    water: getVal(impacts.water_liters) / 10000, // Scale water
    energy: getVal(impacts.energy_kwh) / 10, // Scale energy
    land: getVal(impacts.land_m2) / 100, // Scale land
  };
  
  // Average the normalized impacts
  const score = (
    normalizedImpacts.ghg +
    normalizedImpacts.water +
    normalizedImpacts.energy +
    normalizedImpacts.land
  ) / 4;
  
  return score;
}

/**
 * Get breakdown of product impacts by component
 * Useful for understanding which materials contribute most
 * @param {Object} product - Product to analyze
 * @returns {Array} Array of components sorted by total impact
 */
export function getComponentBreakdown(product) {
  if (!product.components || !Array.isArray(product.components)) {
    return [];
  }
  
  return product.components
    .map(component => ({
      ...component,
      totalImpact: calculateComponentTotalImpact(component.impacts),
    }))
    .sort((a, b) => b.totalImpact - a.totalImpact);
}

/**
 * Calculate annual impact for a product by lifecycle phase
 * 
 * Accounts for:
 * - Material phases (production, transport, end_of_life): amortized over lifespan
 * - Use phase: multiplied by uses per year
 * 
 * @param {Object} product - Product with impacts_by_phase data
 * @param {string} impactType - Type of impact (e.g., 'greenhouse_gas_kg')
 * @returns {Object} Impact breakdown by phase: {production, transport, end_of_life, use, total}
 */
export function getAnnualImpactByPhase(product, impactType) {
  if (!product.impacts_by_phase) {
    return null;
  }
  
  const phases = product.impacts_by_phase;
  const usesPerYear = product.uses_per_year || 1;
  const lifespanUses = product.average_lifespan_uses || 1;
  const itemsPerYear = usesPerYear / lifespanUses;

  const extract = (phaseName) => {
      const raw = phases[phaseName]?.[impactType];
      return { 
          val: getVal(raw),
          sources: (typeof raw === 'object' && raw?.sources) ? raw.sources : [] 
      };
  };
  
  const p = extract('production');
  const t = extract('transport');
  const e = extract('end_of_life');
  const u = extract('use');
  
  // Material phases are per-item, so multiply by items per year
  const productionVal = p.val * itemsPerYear;
  const transportVal = t.val * itemsPerYear;
  const endOfLifeVal = e.val * itemsPerYear;
  
  // Use phase is per-use, so multiply by uses per year
  // Wait! Backend get_impact_by_phase ALREADY multiplied 'use' by 'uses_per_year' in 'get_impact_by_phase'??
  // Let's check backend.
  // Backend: phases['use'][metric]['value'] = total (where total = per_use * self.uses_per_year)
  // So 'u.val' IS Annualized Use Impact.
  // BUT the PREVIOUS JS code said: `const use = (phases.use?.[impactType] || 0) * usesPerYear;`
  // This implies previous backend returned Per Use.
  // My NEW backend returns Annualized.
  // So I should NOT multiply by usesPerYear again for Use phase.
  
  const useVal = u.val; // My backend sends annualized use phase.
  
  return {
    production: { value: productionVal, sources: p.sources },
    transport: { value: transportVal, sources: t.sources },
    end_of_life: { value: endOfLifeVal, sources: e.sources },
    use: { value: useVal, sources: u.sources },
    total: productionVal + transportVal + endOfLifeVal + useVal
  };
}

/**
 * Calculate total impact score for a component
 * @param {Object} impacts - Component impacts object
 * @returns {number} Total impact score
 */
function calculateComponentTotalImpact(impacts) {
  return (
    getVal(impacts.greenhouse_gas_kg) / 100 +
    getVal(impacts.water_liters) / 10000 +
    getVal(impacts.energy_kwh) / 10 +
    getVal(impacts.land_m2) / 100
  );
}
