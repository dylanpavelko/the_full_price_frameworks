// Helper to handle both simple numbers and rich impact objects
export const getVal = (v) => (v && typeof v === 'object' && 'value' in v) ? v.value : (v || 0);

const formatNum = (num) => {
  return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

// Imperial formatters
export function formatGreenhouseGasImperial(value) {
  const val = getVal(value);
  // 1 kg CO2e ≈ 2.20462 lbs CO2e
  const lbs = val * 2.20462;
  if (lbs >= 2000) {
    return `${formatNum(lbs / 2000)} US tons CO₂e`;
  }
  return `${formatNum(lbs)} lbs CO₂e`;
}

export function formatWaterImperial(value) {
  const val = getVal(value);
  // 1 liter ≈ 0.264172 gallons
  const gallons = val * 0.264172;
  if (gallons >= 1000) {
    return `${formatNum(gallons / 1000)} kgal`;
  }
  return `${formatNum(gallons)} gallons`;
}

export function formatEnergyImperial(value) {
  const val = getVal(value);
  // 1 kWh ≈ 3412.14 BTU
  const btu = val * 3412.14;
  if (btu >= 1000000) {
    return `${formatNum(btu / 1000000)} MMBTU`;
  }
  return `${formatNum(btu)} BTU`;
}

export function formatLandImperial(value) {
  const val = getVal(value);
  // 1 m² ≈ 10.7639 ft², 1 acre = 4046.86 m²
  if (val >= 4046.86) {
    return `${formatNum(val / 4046.86)} acres`;
  }
  return `${formatNum(val * 10.7639)} ft²`;
}
/**
 * Utility functions for formatting impact data for display.
 * 
 * These functions handle converting raw numeric impact values into
 * human-readable formats with appropriate units and precision.
 */

/**
 * Format a number as currency (USD)
 * @param {number} value - The value to format
 * @returns {string} Formatted currency string
 */
export function formatCurrency(value) {
  const val = getVal(value);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);
}

/**
 * Format greenhouse gas emissions
 * @param {number} value - Value in kg CO2e
 * @returns {string} Formatted string with appropriate unit
 */
export function formatGreenhouseGas(value) {
  const val = getVal(value);
  if (val >= 1000) {
    return `${formatNum(val / 1000)} metric tons CO₂e`;
  }
  return `${formatNum(val)} kg CO₂e`;
}

/**
 * Format water usage
 * @param {number} value - Value in liters
 * @returns {string} Formatted string with appropriate unit
 */
export function formatWater(value) {
  const val = getVal(value);
  if (val == null || isNaN(val)) return '0 liters';
  if (val >= 1000000) {
    return formatNum(val / 1000000) + ' ML';
  } else if (val >= 1000) {
    return formatNum(val / 1000) + ' m³';
  } else {
    return formatNum(val) + ' liters';
  }
}

/**
 * Format energy usage
 * @param {number} value - Value in kWh
 * @returns {string} Formatted string with appropriate unit
 */
export function formatEnergy(value) {
  const val = getVal(value);
  return `${formatNum(val)} kWh`;
}

/**
 * Format land usage
 * @param {number} value - Value in square meters
 * @returns {string} Formatted string with appropriate unit
 */
export function formatLand(value) {
  const val = getVal(value);
  if (val >= 10000) {
    return `${formatNum(val / 10000)} hectares`;
  }
  return `${formatNum(val)} m²`;
}

/**
 * Format a date to readable format
 * @param {string} dateString - ISO format date string
 * @returns {string} Formatted date
 */
export function formatDate(dateString) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

/**
 * Get a descriptive label for impact data
 * @param {string} impactType - Type of impact (greenhouse_gas, water, energy, land, cost)
 * @returns {string} Human-readable label
 */
export function getImpactLabel(impactType) {
  const labels = {
    greenhouse_gas_kg: 'Greenhouse Gas',
    water_liters: 'Water Usage',
    energy_kwh: 'Energy',
    land_m2: 'Land Use',
    cost_usd: 'Material Cost',
  };
  return labels[impactType] || impactType;
}
