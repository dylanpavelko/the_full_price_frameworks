// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { BreakEvenChart } from '../components/BreakEvenChart';

describe('BreakEvenChart Component', () => {
    // Explicit cleanup to ensure no DOM pollution between tests
    afterEach(() => {
        cleanup();
    });

    const product1 = {
        id: 'p1',
        name: 'Disposable',
        average_lifespan_uses: 1, // Correct property name from check
        uses_per_year: 365,
        purchase_price_usd: 0.10, // Added price
        impacts: { cost_usd: { value: 0.10 } },
        impacts_by_phase: { use: { cost_usd: { value: 0 } } }
    };

    const product2 = {
        id: 'p2',
        name: 'Reusable',
        average_lifespan_uses: 5000,
        uses_per_year: 365,
        purchase_price_usd: 10.00, // Added price
        impacts: { cost_usd: { value: 10.00 } },
        impacts_by_phase: { use: { cost_usd: { value: 0.01 } } }
    };

    it('renders the chart with responsive font classes', () => {
        const { container } = render(
            <BreakEvenChart 
                product1={product1} 
                product2={product2} 
            />
        );

        // Check for the main SVG
        const svg = container.querySelector('svg');
        expect(svg).toBeTruthy();
        
        // Verify CSS classes are applied instead of hardcoded SVG attributes
        // The actual visual size is handled by BreakEvenChart.css
        
        const axisTitle = screen.getByText('Years Owned');
        expect(axisTitle.getAttribute('class')).toContain('chart-axis-title');

        const p1Label = screen.getByText('Disposable');
        expect(p1Label.getAttribute('class')).toContain('chart-product-label');
        
        const p2Label = screen.getByText('Reusable');
        expect(p2Label.getAttribute('class')).toContain('chart-product-label');
    });

    it('displays the break-even point with enhanced visibility', () => {
        const { container } = render(
            <BreakEvenChart 
                product1={product1} 
                product2={product2} 
            />
        );
        
        // Find the break-even text elements
        // This will find both the halo and the main text
        const heavyTextElements = container.querySelectorAll('.chart-breakeven-label');
        
        expect(heavyTextElements.length).toBeGreaterThan(0);
        
        // Check for halo class
        const halo = container.querySelector('.chart-breakeven-halo');
        expect(halo).toBeTruthy();
    });

    it('renders the toggle tabs', () => {
        render(
            <BreakEvenChart 
                product1={product1} 
                product2={product2} 
            />
        );
        
        // The component uses hardcoded metrics internally
        const costTab = screen.queryAllByText('Cost')[0];
        expect(costTab).toBeTruthy();
        expect(costTab.className).toContain('breakeven-chart__tab');
    });
});
