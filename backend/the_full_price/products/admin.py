"""
Django admin configuration for products app.

Registers Product, Material, ProductComponent, and assumption models
so they can be managed through the admin interface.
"""
from django.contrib import admin

from .models import (
    Assumption,
    AssumptionEffect,
    AssumptionOption,
    Material,
    Product,
    ProductComponent,
)


class AssumptionOptionInline(admin.TabularInline):
    model = AssumptionOption
    extra = 1
    fields = ['option_key', 'label', 'is_default', 'sort_order']
    show_change_link = True


class BaseAssumptionInline(admin.TabularInline):
    model = Assumption
    extra = 0
    fields = ['label', 'derived_key_display', 'input_type', 'default_option_key', 'sort_order']
    readonly_fields = ['derived_key_display']
    show_change_link = True
    ordering = ['sort_order', 'id']
    exposed_value = None

    @admin.display(description='Derived Key')
    def derived_key_display(self, obj):
        return obj.key or '(saved after choosing phase + metric)'

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        if self.exposed_value is None:
            return queryset
        return queryset.filter(exposed=self.exposed_value)

    def get_formset(self, request, obj=None, **kwargs):
        base_formset = super().get_formset(request, obj, **kwargs)
        exposed_value = self.exposed_value

        class FilteredInlineFormSet(base_formset):
            def save_new(self, form, commit=True):
                instance = super().save_new(form, commit=False)
                if exposed_value is not None:
                    instance.exposed = exposed_value
                if commit:
                    instance.save()
                return instance

            def save_existing(self, form, instance, commit=True):
                instance = super().save_existing(form, instance, commit=False)
                if exposed_value is not None:
                    instance.exposed = exposed_value
                if commit:
                    instance.save()
                return instance

        return FilteredInlineFormSet


class ProductUserFacingAssumptionInline(BaseAssumptionInline):
    fk_name = 'product'
    exposed_value = True
    verbose_name_plural = 'User-facing assumptions (shown in UI)'


class ProductInternalAssumptionInline(BaseAssumptionInline):
    fk_name = 'product'
    exposed_value = False
    verbose_name_plural = 'Internal assumptions (advanced factors)'
    classes = ('collapse',)


class MaterialUserFacingAssumptionInline(BaseAssumptionInline):
    fk_name = 'material'
    exposed_value = True
    verbose_name_plural = 'User-facing assumptions (shown in UI)'


class MaterialInternalAssumptionInline(BaseAssumptionInline):
    fk_name = 'material'
    exposed_value = False
    verbose_name_plural = 'Internal assumptions (advanced factors)'
    classes = ('collapse',)


@admin.register(Material)
class MaterialAdmin(admin.ModelAdmin):
    """
    Admin interface for Material model with lifecycle phase breakdown.
    """
    list_display = ['name', 'production_co2e_kg_per_kg', 'transport_co2e_kg_per_kg', 'end_of_life_co2e_kg_per_kg']
    search_fields = ['name']
    list_filter = ['created_at']
    inlines = [MaterialUserFacingAssumptionInline, MaterialInternalAssumptionInline]
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
                'production_cost_per_kg',
                'production_source_url',
                'production_source_name',
                'production_source_note'
            )
        }),
        ('Transport Phase - Impact per Kilogram', {
            'description': 'Environmental and cost impacts from shipping and transporting the material.',
            'fields': (
                'transport_co2e_kg_per_kg',
                'transport_water_liters_per_kg',
                'transport_energy_kwh_per_kg',
                'transport_land_m2_per_kg',
                'transport_cost_per_kg',
                'transport_source_url',
                'transport_source_name',
                'transport_source_note'
            )
        }),
        ('End of Life Phase - Impact per Kilogram', {
            'description': 'Environmental and cost impacts from disposal, recycling, or incineration.',
            'fields': (
                'end_of_life_co2e_kg_per_kg',
                'end_of_life_water_liters_per_kg',
                'end_of_life_energy_kwh_per_kg',
                'end_of_life_land_m2_per_kg',
                'end_of_life_cost_per_kg',
                'end_of_life_source_url',
                'end_of_life_source_name',
                'end_of_life_source_note'
            )
        }),
        ('Methodology & Notes', {
            'fields': ('methodology',)
        }),
    )


class ProductComponentInline(admin.TabularInline):
    """
    Inline admin for ProductComponent.
    """
    model = ProductComponent
    extra = 1
    fields = ['material', 'weight_grams']


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    """
    Admin interface for Product model.
    """
    list_display = ['name', 'slug', 'purchase_price_usd', 'uses_per_year', 'average_lifespan_uses']
    list_filter = ['created_at']
    search_fields = ['name', 'slug']
    prepopulated_fields = {'slug': ('name',)}
    inlines = [ProductComponentInline, ProductUserFacingAssumptionInline, ProductInternalAssumptionInline]
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
                'use_cost_per_use',
                'use_phase_source_url',
                'use_phase_source_name',
                'use_phase_source_note'
            ),
        }),
    )


@admin.register(Assumption)
class AssumptionAdmin(admin.ModelAdmin):
    list_display = ['label', 'derived_key_display', 'scope_display', 'input_type', 'exposed', 'sort_order']
    list_filter = ['exposed', 'input_type']
    search_fields = ['label', 'key', 'product__name', 'material__name']
    readonly_fields = ['derived_key_display', 'scope_display']
    inlines = [AssumptionOptionInline]
    fieldsets = (
        ('Scope', {
            'fields': ('product', 'material'),
            'description': 'ℹ️ Attach to a product, a material, or leave BOTH blank for a global assumption '
                           'that applies to every product.',
        }),
        ('Assumption Definition', {
            'fields': ('label', 'derived_key_display', 'description', 'input_type', 'exposed', 'default_option_key', 'sort_order'),
            'description': 'The derived key is computed automatically from the label.',
        }),
    )

    @admin.display(description='Label')
    def effective_label_display(self, obj):
        return obj.label

    @admin.display(description='Derived Key')
    def derived_key_display(self, obj):
        return obj.key or '(saved after setting label)'

    @admin.display(description='Scope')
    def scope_display(self, obj):
        return obj.scope


class AssumptionEffectInline(admin.TabularInline):
    model = AssumptionEffect
    extra = 1
    fields = ['phase', 'metric', 'multiplier']


@admin.register(AssumptionOption)
class AssumptionOptionAdmin(admin.ModelAdmin):
    list_display = ['label', 'option_key', 'assumption', 'is_default', 'sort_order']
    list_filter = ['is_default']
    search_fields = ['label', 'option_key', 'assumption__label', 'assumption__key']
    inlines = [AssumptionEffectInline]


@admin.register(ProductComponent)
class ProductComponentAdmin(admin.ModelAdmin):
    """
    Admin interface for ProductComponent model.
    """
    list_display = ['product', 'material', 'weight_grams']
    list_filter = ['product', 'material']
    search_fields = ['product__name', 'material__name']
    fieldsets = (
        ('Component Information', {
            'fields': ('product', 'material', 'weight_grams')
        }),
    )
