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
    Each material has impact factors for different dimensions.
    """
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    
    # Impact per kilogram of material
    # All impacts are per kg of material to make calculations scalable
    greenhouse_gas_kg_per_kg = models.FloatField(default=0)  # kg CO2e per kg material
    water_liters_per_kg = models.FloatField(default=0)  # liters per kg material
    energy_kwh_per_kg = models.FloatField(default=0)  # kWh per kg material
    land_m2_per_kg = models.FloatField(default=0)  # m² per kg material
    cost_per_kg = models.FloatField(default=0)  # USD per kg material
    
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
    """
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True)
    slug = models.SlugField(unique=True)
    
    # Financial impact data
    purchase_price_usd = models.FloatField(default=0, help_text="Price at purchase")
    uses_per_year = models.FloatField(default=1, help_text="Average uses per year (e.g., 1 for yearly, 365 for daily use)")
    average_lifespan_uses = models.FloatField(default=1, help_text="Average number of uses the product lasts before needing replacement (e.g., 1 for single-use, 500 for durable)")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name

    def get_total_impact(self):
        """
        Calculate the total environmental impact of this product by summing
        the impacts of all its components (materials with weights).
        
        Returns:
            dict: Contains totals for greenhouse_gas_kg, water_liters, energy_kwh, land_m2
        """
        impact = {
            'greenhouse_gas_kg': 0,
            'water_liters': 0,
            'energy_kwh': 0,
            'land_m2': 0,
            'cost_usd': 0,
        }
        
        # Sum up impacts from each component
        for component in self.components.all():
            impact['greenhouse_gas_kg'] += component.get_greenhouse_gas_impact()
            impact['water_liters'] += component.get_water_impact()
            impact['energy_kwh'] += component.get_energy_impact()
            impact['land_m2'] += component.get_land_impact()
            impact['cost_usd'] += component.get_cost_impact()
        
        # Add the purchase price itself to the cost
        impact['cost_usd'] += self.purchase_price_usd
        
        return impact

    def to_dict(self):
        """
        Convert product to a dictionary suitable for JSON serialization.
        This is used when exporting data to the React frontend.
        
        Returns:
            dict: Product data including impacts
        """
        impact = self.get_total_impact()
        
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'slug': self.slug,
            'purchase_price_usd': self.purchase_price_usd,
            'uses_per_year': self.uses_per_year,
            'average_lifespan_uses': self.average_lifespan_uses,
            'impacts': impact,
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
        """Calculate this component's greenhouse gas impact in kg CO2e."""
        return self.get_weight_kg() * self.material.greenhouse_gas_kg_per_kg

    def get_water_impact(self):
        """Calculate this component's water impact in liters."""
        return self.get_weight_kg() * self.material.water_liters_per_kg

    def get_energy_impact(self):
        """Calculate this component's energy impact in kWh."""
        return self.get_weight_kg() * self.material.energy_kwh_per_kg

    def get_land_impact(self):
        """Calculate this component's land impact in m²."""
        return self.get_weight_kg() * self.material.land_m2_per_kg

    def get_cost_impact(self):
        """Calculate this component's material cost impact in USD."""
        return self.get_weight_kg() * self.material.cost_per_kg

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
