// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { ComparisonView } from '../components/ComparisonView';

describe('ComparisonView Component', () => {
    afterEach(() => {
        cleanup();
    });

    const product1 = {
        name: 'Single-Use Item',
        uses_per_year: 365,
        average_lifespan_uses: 1,
        purchase_price_usd: 0.50,
        impacts: {
            greenhouse_gas_kg: 100,
            water_liters: 500,
            energy_kwh: 50,
            land_m2: 5,
            cost_usd: 182.5
        },
        impacts_by_phase: {
            production: { greenhouse_gas_kg: 50 },
            transport: { greenhouse_gas_kg: 10 },
            use: { greenhouse_gas_kg: 0 },
            end_of_life: { greenhouse_gas_kg: 40 }
        }
    };

    const product2 = {
        name: 'Reusable Item',
        uses_per_year: 365,
        average_lifespan_uses: 1000,
        purchase_price_usd: 20.00,
        impacts: {
            greenhouse_gas_kg: 20,
            water_liters: 100,
            energy_kwh: 10,
            land_m2: 1,
            cost_usd: 5
        },
        impacts_by_phase: {
            production: { greenhouse_gas_kg: 15 },
            transport: { greenhouse_gas_kg: 2 },
            use: { greenhouse_gas_kg: 3 }, // washing etc
            end_of_life: { greenhouse_gas_kg: 0 }
        }
    };

    it('renders the main comparison header', () => {
        render(<ComparisonView product1={product1} product2={product2} />);
        expect(screen.getByText(/Product Comparison/i)).toBeTruthy();
        // Check for product names
        expect(screen.getAllByText('Single-Use Item').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Reusable Item').length).toBeGreaterThan(0);
    });

    it('renders the Environmental Impact Details section', () => {
        render(<ComparisonView product1={product1} product2={product2} />);
        expect(screen.getByText('Environmental Impact Details')).toBeTruthy();
    });

    it('renders the specific impact table headers (critical for mobile view context)', () => {
        const { container } = render(<ComparisonView product1={product1} product2={product2} />);
        
        // These labels serve as the section headers for each table
        // We verified in the CSS change that these use .comparison__phase-table-label
        // checking they exist confirms the data flow for the tables
        
        const expectedHeaders = [
            'CO₂e Emissions',
            'Water Usage',
            'Energy',
            'Land Use',
            'Cost'
        ];

        expectedHeaders.forEach(headerText => {
            // There might be multiple instances (summary table + detail table)
            // We want to ensure the detail table ones exist.
            // The detail tables have class 'comparison__phase-table'
            
            // Find all elements with this text
            const elements = screen.getAllByText(headerText);
            
            // Verify at least one is inside a phase table header row
            const isInPhaseHeader = elements.some(el => 
                el.className.includes('comparison__phase-table-label')
            );
            
            expect(isInPhaseHeader).toBe(true, `Expected header "${headerText}" to be found in a phase table label`);
        });
    });

    it('renders phase breakdown rows correctly', () => {
        render(<ComparisonView product1={product1} product2={product2} />);
        
        // Check for specific phase labels in the breakdown
        expect(screen.getAllByText('Production').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Transport').length).toBeGreaterThan(0);
        expect(screen.getAllByText('End of Life').length).toBeGreaterThan(0);
        
        // Check for total calculation row
        expect(screen.getAllByText('Total').length).toBeGreaterThan(0);
    });
});
