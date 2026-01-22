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
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format greenhouse gas emissions
 * @param {number} value - Value in kg CO2e
 * @returns {string} Formatted string with appropriate unit
 */
export function formatGreenhouseGas(value) {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(2)} metric tons CO₂e`;
  }
  return `${value.toFixed(2)} kg CO₂e`;
}

/**
 * Format water usage
 * @param {number} value - Value in liters
 * @returns {string} Formatted string with appropriate unit
 */
export function formatWater(value) {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(2)} m³`;
  }
  return `${value.toFixed(0)} liters`;
}

/**
 * Format energy usage
 * @param {number} value - Value in kWh
 * @returns {string} Formatted string with appropriate unit
 */
export function formatEnergy(value) {
  return `${value.toFixed(2)} kWh`;
}

/**
 * Format land usage
 * @param {number} value - Value in square meters
 * @returns {string} Formatted string with appropriate unit
 */
export function formatLand(value) {
  if (value >= 10000) {
    return `${(value / 10000).toFixed(2)} hectares`;
  }
  return `${value.toFixed(2)} m²`;
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
