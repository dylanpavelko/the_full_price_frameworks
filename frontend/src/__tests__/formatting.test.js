/**
 * Tests for formatting utility functions
 * 
 * Verifies that impact data is formatted correctly for display
 */
import { describe, it, expect } from 'vitest'
import {
  formatCurrency,
  formatGreenhouseGas,
  formatWater,
  formatEnergy,
  formatLand,
  formatDate,
  getImpactLabel,
} from '../utils/formatting.js'

describe('Formatting utilities', () => {
  describe('formatCurrency', () => {
    it('should format USD currency', () => {
      expect(formatCurrency(25.5)).toBe('$25.50')
      expect(formatCurrency(1000)).toBe('$1,000.00')
    })

    it('should handle zero', () => {
      expect(formatCurrency(0)).toBe('$0.00')
    })
  })

  describe('formatGreenhouseGas', () => {
    it('should display kg for small values', () => {
      const result = formatGreenhouseGas(50)
      expect(result).toContain('50.00')
      expect(result).toContain('kg CO₂e')
    })

    it('should display metric tons for large values', () => {
      const result = formatGreenhouseGas(5000)
      expect(result).toContain('metric tons CO₂e')
    })
  })

  describe('formatWater', () => {
    it('should display liters for small values', () => {
      const result = formatWater(500)
      expect(result).toContain('liters')
    })

    it('should display m³ for large values', () => {
      const result = formatWater(5000)
      expect(result).toContain('m³')
    })
  })

  describe('formatEnergy', () => {
    it('should display kWh', () => {
      const result = formatEnergy(25.5)
      expect(result).toContain('25.50')
      expect(result).toContain('kWh')
    })
  })

  describe('formatLand', () => {
    it('should display m² for small values', () => {
      const result = formatLand(500)
      expect(result).toContain('m²')
    })

    it('should display hectares for large values', () => {
      const result = formatLand(50000)
      expect(result).toContain('hectares')
    })
  })

  describe('getImpactLabel', () => {
    it('should return readable labels', () => {
      expect(getImpactLabel('greenhouse_gas_kg')).toBe('Greenhouse Gas')
      expect(getImpactLabel('water_liters')).toBe('Water Usage')
      expect(getImpactLabel('energy_kwh')).toBe('Energy')
      expect(getImpactLabel('land_m2')).toBe('Land Use')
      expect(getImpactLabel('cost_usd')).toBe('Material Cost')
    })
  })
})
