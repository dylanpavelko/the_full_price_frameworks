"""
Product models for The Full Price project.

These models define the structure for storing products, materials, and their
environmental/financial impacts. The data is calculated based on material
weights and impact factors.
"""
from django.db import models


class Material(models.Model):
    """
    Represents a material that products can be made from (e.g., cotton, plastic).
    Each material has impact factors broken down by lifecycle phase:
    - Production: extracting raw materials and manufacturing
    - Transport: moving materials to factory/warehouse
    - End of Life: disposal, recycling, or incineration
    
    Note: Greenhouse gas impact uses CO2-equivalent (CO2e) methodology, which accounts
    for all greenhouse gases (CO2, methane, nitrous oxide, etc.) converted to their
    equivalent warming potential relative to CO2. This follows standard climate accounting
    practices (e.g., GHG Protocol, ISO 14040, Life Cycle Assessment ISO 14040/44).
    """
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    
    # PRODUCTION PHASE - per kilogram of material
    production_co2e_kg_per_kg = models.FloatField(
        default=0,
        help_text="CO2e emissions from extracting raw materials and manufacturing per kg"
    )
    production_water_liters_per_kg = models.FloatField(
        default=0,
        help_text="Water used in production per kg"
    )
    production_energy_kwh_per_kg = models.FloatField(
        default=0,
        help_text="Energy used in production per kg"
    )
    production_land_m2_per_kg = models.FloatField(
        default=0,
        help_text="Land use in production per kg"
    )
    production_cost_per_kg = models.FloatField(
        default=0,
        help_text="Material cost per kg"
    )
    production_source = models.TextField(blank=True, help_text="Source citation for production phase data")
    
    # TRANSPORT PHASE - per kilogram of material
    transport_co2e_kg_per_kg = models.FloatField(
        default=0,
        help_text="CO2e emissions from transporting material (shipping, trucking, etc.) per kg"
    )
    transport_water_liters_per_kg = models.FloatField(default=0)
    transport_energy_kwh_per_kg = models.FloatField(default=0)
    transport_land_m2_per_kg = models.FloatField(default=0)
    transport_cost_per_kg = models.FloatField(default=0)
    transport_source = models.TextField(blank=True, help_text="Source citation for transport phase data")
    
    # END OF LIFE PHASE - per kilogram of material
    end_of_life_co2e_kg_per_kg = models.FloatField(
        default=0,
        help_text="CO2e emissions from disposal, recycling, or incineration per kg"
    )
    end_of_life_water_liters_per_kg = models.FloatField(default=0)
    end_of_life_energy_kwh_per_kg = models.FloatField(default=0)
    end_of_life_land_m2_per_kg = models.FloatField(default=0)
    end_of_life_cost_per_kg = models.FloatField(default=0)
    end_of_life_source = models.TextField(blank=True, help_text="Source citation for end of life phase data")

    methodology = models.TextField(blank=True, help_text="General methodology notes")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        verbose_name_plural = "Materials"

    def __str__(self):
        return self.name


class Product(models.Model):
    """
    Represents a physical product that users want to understand the impact of.
    A product is made up of multiple materials with specific weights.
    
    Tracks both material impacts (production, transport, end of life) and use-phase impacts
    (washing, energy use, etc. that occur during the product's lifetime).
    """
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True)
    slug = models.SlugField(unique=True)
    
    # Lifecycle parameters
    purchase_price_usd = models.FloatField(default=0, help_text="Price at purchase")
    uses_per_year = models.FloatField(default=1, help_text="Average uses per year (e.g., 1 for yearly, 365 for daily use)")
    average_lifespan_uses = models.FloatField(default=1, help_text="Average number of uses the product lasts before needing replacement (e.g., 1 for single-use, 500 for durable)")
    
    use_phase_source = models.TextField(blank=True, help_text="Source citation for use phase data")

    # USE PHASE IMPACTS - impacts that occur during use (per use)
    # For example: washing a napkin uses water and energy
    use_co2e_kg_per_use = models.FloatField(
        default=0,
        help_text="CO2e emissions per use (e.g., from washing, drying, heating)"
    )
    use_water_liters_per_use = models.FloatField(
        default=0,
        help_text="Water used per use (e.g., from washing)"
    )
    use_energy_kwh_per_use = models.FloatField(
        default=0,
        help_text="Energy used per use (e.g., from washing/drying)"
    )
    use_land_m2_per_use = models.FloatField(default=0)
    use_cost_per_use = models.FloatField(
        default=0,
        help_text="Cost per use (e.g., detergent, water, electricity)"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name

    def get_total_impact(self):
        """
        Calculate total lifecycle impact annualized over the product's lifespan.
        
        Formula: (Production + Transport + End of Life) / Lifespan Years  +  Annual Use Impact
        
        Returns:
            dict: Total annualized impact for each metric and sources.
        """
        phases = self.get_impact_by_phase()
        impact = {}
        
        uses_per_year = self.uses_per_year or 1
        lifespan_uses = self.average_lifespan_uses or 1
        metrics = ['greenhouse_gas_kg', 'water_liters', 'energy_kwh', 'land_m2', 'cost_usd']
        
        for metric in metrics:
            # Upfront impact per item (sum of production, transport, end_of_life)
            production_val = phases['production'][metric]['value']
            transport_val = phases['transport'][metric]['value']
            eol_val = phases['end_of_life'][metric]['value']
            
            upfront = production_val + transport_val + eol_val
            
            annualized_upfront = (upfront / lifespan_uses) * uses_per_year
            annual_use = phases['use'][metric]['value']
            
            total_val = annualized_upfront + annual_use
            
            sources = []
            if annualized_upfront > 0:
                sources.append({
                    'item': "Manufacturing & EOL (Annualized)",
                    'value': annualized_upfront,
                    'calculation': f"({upfront:.3g} upfront / {lifespan_uses:.3g} uses) * {uses_per_year:.3g} uses/yr",
                    'source': "Derived from component phases",
                    'sub_sources': phases['production'][metric]['sources'] + phases['transport'][metric]['sources'] + phases['end_of_life'][metric]['sources']
                })
                
            if annual_use > 0:
                 sources.append({
                    'item': "Use Phase (Annual)",
                    'value': annual_use,
                    'calculation': "Annual direct use",
                    'source': self.use_phase_source,
                    'sub_sources': phases['use'][metric]['sources']
                })

            impact[metric] = {
                'value': total_val,
                'sources': sources
            }
            
        return impact

    def get_impact_by_phase(self):
        """
        Calculate product environmental impact broken down by lifecycle phase.
        Includes material phases (production, transport, end_of_life) and use phase.
        
        Returns:
            dict: {
                'production': { 'metric': {'value': val, 'sources': [...]}, ... },
                ...
            }
        """
        metrics_map = {
            'greenhouse_gas_kg': 'co2e_kg',
            'water_liters': 'water_liters',
            'energy_kwh': 'energy_kwh',
            'land_m2': 'land_m2',
            'cost_usd': 'cost',
        }
        
        phases = {}
        for phase_name in ['production', 'transport', 'end_of_life', 'use']:
            phases[phase_name] = {}
            for metric in metrics_map.keys():
                phases[phase_name][metric] = {'value': 0.0, 'sources': []}

        # Material Phases
        for component in self.components.all():
            w = component.get_weight_kg()
            for phase in ['production', 'transport', 'end_of_life']:
                source_field = f"{phase}_source"
                source_text = getattr(component.material, source_field, "")
                
                for metric, suffix in metrics_map.items():
                    attr_name = f"{phase}_{suffix}_per_kg"
                    factor = getattr(component.material, attr_name, 0)
                    impact = w * factor
                    
                    phases[phase][metric]['value'] += impact
                    if impact > 0:
                        phases[phase][metric]['sources'].append({
                            'item': component.material.name,
                            'value': impact,
                            'calculation': f"{w:.3g} kg * {factor:.3g}",
                            'source': source_text
                        })

        # Use Phase
        # Add use phase impacts (these are per use, so multiply by uses_per_year for annualized impact)
        use_source = self.use_phase_source
        
        product_metrics_map = {
            'greenhouse_gas_kg': 'co2e_kg',
            'water_liters': 'water_liters',
            'energy_kwh': 'energy_kwh',
            'land_m2': 'land_m2',
            'cost_usd': 'cost'
        }
        
        for metric, suffix in product_metrics_map.items():
            if metric == 'cost_usd':
                 attr = "use_cost_per_use"
            else:
                 attr = f"use_{suffix}_per_use"
                 
            per_use = getattr(self, attr, 0)
            total = per_use * self.uses_per_year
            
            phases['use'][metric]['value'] = total
            if total > 0:
                phases['use'][metric]['sources'].append({
                    'item': "Direct Use (Annual)",
                    'value': total,
                    'calculation': f"{per_use:.3g} / use * {self.uses_per_year} uses/yr",
                    'source': use_source
                })
        
        return phases

    def to_dict(self):
        """
        Convert product to a dictionary suitable for JSON serialization.
        This is used when exporting data to the React frontend.
        
        Returns:
            dict: Product data including total impacts and breakdown by lifecycle phase
        """
        impact = self.get_total_impact()
        impact_by_phase = self.get_impact_by_phase()
        
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'slug': self.slug,
            'purchase_price_usd': self.purchase_price_usd,
            'uses_per_year': self.uses_per_year,
            'average_lifespan_uses': self.average_lifespan_uses,
            'impacts': impact,
            'impacts_by_phase': impact_by_phase,
            'use_phase': {
                'co2e_kg_per_use': self.use_co2e_kg_per_use,
                'water_liters_per_use': self.use_water_liters_per_use,
                'energy_kwh_per_use': self.use_energy_kwh_per_use,
                'land_m2_per_use': self.use_land_m2_per_use,
                'cost_per_use': self.use_cost_per_use,
            },
            'components': [comp.to_dict() for comp in self.components.all()],
        }


class ProductComponent(models.Model):
    """
    Represents a component of a product - a specific material with a specific weight.
    For example, a coffee mug might have 400g ceramic and 50g of paint.
    """
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='components')
    material = models.ForeignKey(Material, on_delete=models.PROTECT)
    weight_grams = models.FloatField(help_text="Weight of this material in the product")

    class Meta:
        ordering = ['product', 'material']
        unique_together = ('product', 'material')

    def __str__(self):
        return f"{self.product.name} - {self.weight_grams}g {self.material.name}"

    def get_weight_kg(self):
        """Convert weight from grams to kilograms."""
        return self.weight_grams / 1000

    def get_greenhouse_gas_impact(self):
        """Calculate this component's total lifecycle greenhouse gas impact in kg CO2e.
        
        Sums impacts from production, transport, and end-of-life phases.
        This uses CO2-equivalent methodology which converts all greenhouse gases
        (methane, nitrous oxide, etc.) to their warming potential equivalents in CO2.
        """
        weight_kg = self.get_weight_kg()
        return weight_kg * (
            self.material.production_co2e_kg_per_kg +
            self.material.transport_co2e_kg_per_kg +
            self.material.end_of_life_co2e_kg_per_kg
        )

    def get_water_impact(self):
        """Calculate this component's total lifecycle water impact in liters.
        
        Sums impacts from production, transport, and end-of-life phases.
        """
        weight_kg = self.get_weight_kg()
        return weight_kg * (
            self.material.production_water_liters_per_kg +
            self.material.transport_water_liters_per_kg +
            self.material.end_of_life_water_liters_per_kg
        )

    def get_energy_impact(self):
        """Calculate this component's total lifecycle energy impact in kWh.
        
        Sums impacts from production, transport, and end-of-life phases.
        """
        weight_kg = self.get_weight_kg()
        return weight_kg * (
            self.material.production_energy_kwh_per_kg +
            self.material.transport_energy_kwh_per_kg +
            self.material.end_of_life_energy_kwh_per_kg
        )

    def get_land_impact(self):
        """Calculate this component's total lifecycle land impact in m².
        
        Sums impacts from production, transport, and end-of-life phases.
        """
        weight_kg = self.get_weight_kg()
        return weight_kg * (
            self.material.production_land_m2_per_kg +
            self.material.transport_land_m2_per_kg +
            self.material.end_of_life_land_m2_per_kg
        )

    def get_cost_impact(self):
        """Calculate this component's total lifecycle cost impact in USD.
        
        Sums impacts from production, transport, and end-of-life phases.
        """
        weight_kg = self.get_weight_kg()
        return weight_kg * (
            self.material.production_cost_per_kg +
            self.material.transport_cost_per_kg +
            self.material.end_of_life_cost_per_kg
        )

    def get_greenhouse_gas_impact_by_phase(self):
        """Get CO2e impact breakdown by lifecycle phase."""
        weight_kg = self.get_weight_kg()
        return {
            'production': weight_kg * self.material.production_co2e_kg_per_kg,
            'transport': weight_kg * self.material.transport_co2e_kg_per_kg,
            'end_of_life': weight_kg * self.material.end_of_life_co2e_kg_per_kg,
        }

    def get_water_impact_by_phase(self):
        """Get water impact breakdown by lifecycle phase."""
        weight_kg = self.get_weight_kg()
        return {
            'production': weight_kg * self.material.production_water_liters_per_kg,
            'transport': weight_kg * self.material.transport_water_liters_per_kg,
            'end_of_life': weight_kg * self.material.end_of_life_water_liters_per_kg,
        }

    def get_energy_impact_by_phase(self):
        """Get energy impact breakdown by lifecycle phase."""
        weight_kg = self.get_weight_kg()
        return {
            'production': weight_kg * self.material.production_energy_kwh_per_kg,
            'transport': weight_kg * self.material.transport_energy_kwh_per_kg,
            'end_of_life': weight_kg * self.material.end_of_life_energy_kwh_per_kg,
        }

    def get_land_impact_by_phase(self):
        """Get land impact breakdown by lifecycle phase."""
        weight_kg = self.get_weight_kg()
        return {
            'production': weight_kg * self.material.production_land_m2_per_kg,
            'transport': weight_kg * self.material.transport_land_m2_per_kg,
            'end_of_life': weight_kg * self.material.end_of_life_land_m2_per_kg,
        }

    def to_dict(self):
        """
        Convert component to a dictionary suitable for JSON serialization.
        
        Returns:
            dict: Component data with material and calculated impacts
        """
        return {
            'id': self.id,
            'material_name': self.material.name,
            'weight_grams': self.weight_grams,
            'impacts': {
                'greenhouse_gas_kg': self.get_greenhouse_gas_impact(),
                'water_liters': self.get_water_impact(),
                'energy_kwh': self.get_energy_impact(),
                'land_m2': self.get_land_impact(),
                'cost_usd': self.get_cost_impact(),
            }
        }
