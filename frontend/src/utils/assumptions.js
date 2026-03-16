const METRICS = ['greenhouse_gas_kg', 'water_liters', 'energy_kwh', 'land_m2', 'cost_usd'];
const PHASES = ['production', 'transport', 'end_of_life', 'use'];

const getVal = (val) => (
  typeof val === 'object' && val !== null && 'value' in val ? val.value : (val || 0)
);

const cloneProduct = (product) => JSON.parse(JSON.stringify(product));

export function getExposedAssumptions(product) {
  return product?.assumptions?.exposed_assumptions || [];
}

export function getDefaultAssumptionSelections(product) {
  const exposed = getExposedAssumptions(product);
  return exposed.reduce((acc, assumption) => {
    const defaultOptionId = assumption.default_option_id || assumption.options?.[0]?.id;
    if (defaultOptionId) {
      acc[assumption.key] = defaultOptionId;
    }
    return acc;
  }, {});
}

function getSelectedOptions(product, selections = {}) {
  const exposed = getExposedAssumptions(product);
  return exposed
    .map((assumption) => {
      const selectedId = selections[assumption.key] || assumption.default_option_id;
      const selectedOption = assumption.options?.find((opt) => opt.id === selectedId);
      return selectedOption ? { assumption, option: selectedOption } : null;
    })
    .filter(Boolean);
}

function getPhaseMetricMultipliers(product, selections = {}) {
  const multipliers = {};

  PHASES.forEach((phase) => {
    multipliers[phase] = {};
    METRICS.forEach((metric) => {
      multipliers[phase][metric] = 1;
    });
  });

  const selected = getSelectedOptions(product, selections);

  selected.forEach(({ option }) => {
    const phaseMultipliers = option.phase_multipliers || {};

    Object.entries(phaseMultipliers).forEach(([phaseKey, metricMap]) => {
      if (!multipliers[phaseKey]) {
        return;
      }

      Object.entries(metricMap || {}).forEach(([metricKey, factor]) => {
        if (multipliers[phaseKey][metricKey] !== undefined && typeof factor === 'number') {
          multipliers[phaseKey][metricKey] *= factor;
        }
      });
    });
  });

  return multipliers;
}

function applyMultiplierToPhaseMetric(phaseMetric, factor) {
  if (!phaseMetric || typeof phaseMetric !== 'object') {
    return;
  }

  const currentValue = getVal(phaseMetric);
  phaseMetric.value = currentValue * factor;

  if (Array.isArray(phaseMetric.sources)) {
    phaseMetric.sources = phaseMetric.sources.map((source) => {
      const updatedSource = { ...source };
      if (typeof updatedSource.value === 'number') {
        updatedSource.value *= factor;
      }

      if (Array.isArray(updatedSource.sub_sources)) {
        updatedSource.sub_sources = updatedSource.sub_sources.map((sub) => {
          const updatedSub = { ...sub };
          if (typeof updatedSub.value === 'number') {
            updatedSub.value *= factor;
          }
          return updatedSub;
        });
      }

      return updatedSource;
    });
  }
}

function rebuildImpactsFromPhases(product) {
  const usesPerYear = product.uses_per_year || 1;
  const lifespanUses = product.average_lifespan_uses || 1;
  const itemsPerYear = usesPerYear / lifespanUses;

  const rebuilt = {};

  METRICS.forEach((metric) => {
    const production = getVal(product.impacts_by_phase?.production?.[metric]);
    const transport = getVal(product.impacts_by_phase?.transport?.[metric]);
    const endOfLife = getVal(product.impacts_by_phase?.end_of_life?.[metric]);
    const annualUse = getVal(product.impacts_by_phase?.use?.[metric]);

    const upfrontPerItem = production + transport + endOfLife;
    const annualizedUpfront = upfrontPerItem * itemsPerYear;
    const totalVal = annualizedUpfront + annualUse;

    const productionSources = product.impacts_by_phase?.production?.[metric]?.sources || [];
    const transportSources = product.impacts_by_phase?.transport?.[metric]?.sources || [];
    const eolSources = product.impacts_by_phase?.end_of_life?.[metric]?.sources || [];
    const useSources = product.impacts_by_phase?.use?.[metric]?.sources || [];

    const totalSources = [];

    if (annualizedUpfront > 0) {
      totalSources.push({
        item: 'Manufacturing & EOL (Annualized)',
        value: annualizedUpfront,
        calculation: `(${upfrontPerItem.toFixed(3)} upfront per item) * ${itemsPerYear.toFixed(3)} items/yr`,
        source: 'Derived from component phases',
        sub_sources: [...productionSources, ...transportSources, ...eolSources],
      });
    }

    if (annualUse > 0) {
      totalSources.push({
        item: 'Use Phase (Annual)',
        value: annualUse,
        calculation: 'Annual direct use',
        source: useSources[0]?.source || 'Derived from use phase assumptions',
        sub_sources: [...useSources],
      });
    }

    rebuilt[metric] = {
      value: totalVal,
      sources: totalSources,
    };
  });

  return rebuilt;
}

export function applyAssumptionsToProduct(product, selections = {}) {
  if (!product) {
    return product;
  }

  const exposed = getExposedAssumptions(product);
  if (exposed.length === 0) {
    return product;
  }

  const derived = cloneProduct(product);
  const multipliers = getPhaseMetricMultipliers(derived, selections);

  PHASES.forEach((phase) => {
    METRICS.forEach((metric) => {
      const factor = multipliers[phase]?.[metric] ?? 1;
      if (factor !== 1) {
        applyMultiplierToPhaseMetric(derived.impacts_by_phase?.[phase]?.[metric], factor);
      }
    });
  });

  derived.impacts = rebuildImpactsFromPhases(derived);
  derived.applied_assumption_selections = selections;

  return derived;
}
