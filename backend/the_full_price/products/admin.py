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
    Admin interface for Material model.
    
    Allows users to create and edit materials with their impact factors.
    Uses CO2-equivalent (CO2e) for greenhouse gas emissions to account for
    all greenhouse gases (methane, nitrous oxide, etc.) in their warming potential.
    """
    list_display = ['name', 'co2e_kg_per_kg', 'water_liters_per_kg', 'cost_per_kg']
    search_fields = ['name']
    list_filter = ['created_at']
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'description')
        }),
        ('Impact Factors per Kilogram', {
            'description': 'All impacts are measured per kg of material. CO2e represents CO2-equivalent emissions accounting for all greenhouse gases.',
            'fields': (
                'co2e_kg_per_kg',
                'water_liters_per_kg',
                'energy_kwh_per_kg',
                'land_m2_per_kg',
                'cost_per_kg'
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
