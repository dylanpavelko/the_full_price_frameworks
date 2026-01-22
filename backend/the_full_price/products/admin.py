"""
Django admin configuration for products app.

Registers Product, Material, and ProductComponent models
so they can be managed through the admin interface.
"""
from django.contrib import admin
from .models import Material, Product, ProductComponent


@admin.register(Material)
class MaterialAdmin(admin.ModelAdmin):
    """
    Admin interface for Material model with lifecycle phase breakdown.
    
    Allows users to create and edit materials with their impact factors
    separated by lifecycle phase: production, transport, and end-of-life.
    Uses CO2-equivalent (CO2e) for greenhouse gas emissions to account for
    all greenhouse gases (methane, nitrous oxide, etc.) in their warming potential.
    """
    list_display = ['name', 'production_co2e_kg_per_kg', 'transport_co2e_kg_per_kg', 'end_of_life_co2e_kg_per_kg']
    search_fields = ['name']
    list_filter = ['created_at']
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'description')
        }),
        ('Production Phase - Impact per Kilogram', {
            'description': 'Environmental and cost impacts from extracting raw materials and manufacturing.',
            'fields': (
                'production_co2e_kg_per_kg',
                'production_water_liters_per_kg',
                'production_energy_kwh_per_kg',
                'production_land_m2_per_kg',
                'production_cost_per_kg'
            )
        }),
        ('Transport Phase - Impact per Kilogram', {
            'description': 'Environmental and cost impacts from shipping and transporting the material.',
            'fields': (
                'transport_co2e_kg_per_kg',
                'transport_water_liters_per_kg',
                'transport_energy_kwh_per_kg',
                'transport_land_m2_per_kg',
                'transport_cost_per_kg'
            )
        }),
        ('End of Life Phase - Impact per Kilogram', {
            'description': 'Environmental and cost impacts from disposal, recycling, or incineration.',
            'fields': (
                'end_of_life_co2e_kg_per_kg',
                'end_of_life_water_liters_per_kg',
                'end_of_life_energy_kwh_per_kg',
                'end_of_life_land_m2_per_kg',
                'end_of_life_cost_per_kg'
            )
        }),
    )


class ProductComponentInline(admin.TabularInline):
    """
    Inline admin for ProductComponent.
    
    Allows editing product components directly on the Product page
    instead of managing them separately.
    """
    model = ProductComponent
    extra = 1
    fields = ['material', 'weight_grams']


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    """
    Admin interface for Product model.
    
    Allows users to create products and manage their material components.
    """
    list_display = ['name', 'slug', 'purchase_price_usd', 'uses_per_year', 'average_lifespan_uses']
    list_filter = ['created_at']
    search_fields = ['name', 'slug']
    prepopulated_fields = {'slug': ('name',)}
    inlines = [ProductComponentInline]
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'slug', 'description')
        }),
        ('Pricing', {
            'fields': ('purchase_price_usd',)
        }),
        ('Usage & Lifecycle', {
            'fields': ('uses_per_year', 'average_lifespan_uses'),
            'description': 'Uses per year: average times used per year. Lifespan uses: total number of uses before needing replacement.'
        }),
        ('Use Phase Impacts - Per Use', {
            'description': 'Environmental and cost impacts that occur during each use (e.g., washing, drying). Leave as 0 if there are no use-phase impacts.',
            'fields': (
                'use_co2e_kg_per_use',
                'use_water_liters_per_use',
                'use_energy_kwh_per_use',
                'use_land_m2_per_use',
                'use_cost_per_use'
            ),
            'classes': ('collapse',)  # Collapsed by default since not all products have use-phase impacts
        }),
    )


@admin.register(ProductComponent)
class ProductComponentAdmin(admin.ModelAdmin):
    """
    Admin interface for ProductComponent model.
    
    Allows direct management of product-material relationships.
    """
    list_display = ['product', 'material', 'weight_grams']
    list_filter = ['product', 'material']
    search_fields = ['product__name', 'material__name']
    fieldsets = (
        ('Component Information', {
            'fields': ('product', 'material', 'weight_grams')
        }),
    )
