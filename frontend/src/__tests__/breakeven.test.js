import { describe, it, expect } from 'vitest';
import { getBreakEvenParams, calculateBreakEvenIntersection } from '../utils/comparison';

describe('Break Even Calculations', () => {
    
    // Mock Product Helper
    const createProduct = (props) => ({
      uses_per_year: 365,
      average_lifespan_uses: 1, // Default consumable
      purchase_price_usd: 0,
      impacts: {},
      impacts_by_phase: {},
      ...props
    });
  
    it('calculates consumable cost slope correctly', () => {
      // Paper Napkin: /usr/bin/bash.02 each, 365 per year
      const paperNapkin = createProduct({
        purchase_price_usd: 0.02,
        uses_per_year: 365,
        average_lifespan_uses: 1
      });
  
      const params = getBreakEvenParams(paperNapkin, 'cost_usd');
      expect(params.initial).toBe(0);
      expect(params.slope).toBeCloseTo(0.02 * 365); // 7.3
    });
  
    it('calculates durable cost slope correctly', () => {
      // Cloth Napkin: .00 upfront, /usr/bin/bash.01 wash cost per year
      const clothNapkin = createProduct({
        purchase_price_usd: 2.00,
        average_lifespan_uses: 5000,
        impacts_by_phase: {
          use: { cost_usd: { value: 0.01 } }
        }
      });
  
      const params = getBreakEvenParams(clothNapkin, 'cost_usd');
      expect(params.initial).toBe(2.00);
      expect(params.slope).toBe(0.01);
    });
  
    it('finds break-even point for cost', () => {
      // Cheap Disposable (0/yr) vs Expensive Durable (0 upfront + /usr/bin/bash/yr)
      // 10t = 50 => t = 5
      const p1 = { initial: 0, slope: 10 };
      const p2 = { initial: 50, slope: 0 };
      
      const t = calculateBreakEvenIntersection(p1, p2);
      expect(t).toBeCloseTo(5);
    });
  
    it('returns null if durable is strictly more expensive (diverging)', () => {
        // Disposable (0/yr) vs Durable (0 upfront + 0/yr)
        // Durable starts higher AND grows faster. Never cheaper.
        // 10t = 50 + 20t => -10t = 50 => t = -5 (past)
        const p1 = { initial: 0, slope: 10 };
        const p2 = { initial: 50, slope: 20 };
        
        const t = calculateBreakEvenIntersection(p1, p2);
        // Utility returns null for negative/nonsensical time
        expect(t).toBeNull();
      });
  });
