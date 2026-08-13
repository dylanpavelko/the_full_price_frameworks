"""
Django admin configuration for products app.

Registers Product, Material, ProductComponent, and assumption models
so they can be managed through the admin interface.
"""
from datetime import timedelta

from django.contrib import admin
from django.shortcuts import render
from django.urls import reverse
from django.utils import timezone

from .models import (
    Assumption,
    AssumptionEffect,
    AssumptionOption,
    Material,
    MaterialCategory,
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


@admin.register(MaterialCategory)
class MaterialCategoryAdmin(admin.ModelAdmin):
    """Admin for material taxonomy buckets."""
    list_display = ['name', 'slug', 'material_count', 'sort_order']
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ['name']
    ordering = ['sort_order', 'name']

    @admin.display(description='# Materials')
    def material_count(self, obj):
        return obj.materials.count()


@admin.register(Material)
class MaterialAdmin(admin.ModelAdmin):
    """
    Admin interface for Material model with lifecycle phase breakdown.
    """
    list_display = [
        'name',
        'slug',
        'category',
        'data_status_display',
        'completeness_display',
        'stale_days_display',
        'production_co2e_kg_per_kg',
        'transport_co2e_kg_per_kg',
        'end_of_life_co2e_kg_per_kg',
    ]
    search_fields = ['name', 'slug']
    list_filter = ['data_status', 'category', 'created_at', 'verified_at']
    prepopulated_fields = {'slug': ('name',)}
    inlines = [MaterialUserFacingAssumptionInline, MaterialInternalAssumptionInline]
    actions = ['mark_needs_review', 'mark_approved', 'mark_published']
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'slug', 'category', 'description')
        }),
        ('Data Quality Workflow', {
            'fields': ('data_status', 'verified_at', 'verification_notes'),
            'description': 'Track whether the material has been collected, reviewed, or published.',
        }),
        ('Material Content (for public detail page)', {
            'classes': ('collapse',),
            'fields': ('sourcing_info', 'fabrication_info', 'end_of_life_info', 'environmental_notes'),
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

    @admin.display(description='Status')
    def data_status_display(self, obj):
        return obj.get_data_status_display()

    @admin.display(description='Completeness %', ordering='data_status')
    def completeness_display(self, obj):
        return f"{obj.get_completeness_summary()['overall_percent']:.0f}%"

    @admin.display(description='Stale (days)')
    def stale_days_display(self, obj):
        if not obj.verified_at:
            return 'Never'
        delta = timezone.now() - obj.verified_at
        return delta.days

    @admin.action(description='Mark selected materials as needs review')
    def mark_needs_review(self, request, queryset):
        queryset.update(data_status='needs_review')

    @admin.action(description='Mark selected materials as approved')
    def mark_approved(self, request, queryset):
        queryset.update(data_status='approved', verified_at=timezone.now())

    @admin.action(description='Mark selected materials as published')
    def mark_published(self, request, queryset):
        queryset.update(data_status='published', verified_at=timezone.now())


class ProductComponentInline(admin.TabularInline):
    """
    Inline admin for ProductComponent.
    """
    model = ProductComponent
    extra = 1
    fields = ['material', 'material_status_display', 'weight_grams']
    readonly_fields = ['material_status_display']

    @admin.display(description='Material Status')
    def material_status_display(self, obj):
        if not obj or not obj.material_id:
            return '-'
        return obj.material.get_data_status_display()


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    """
    Admin interface for Product model.
    """
    list_display = [
        'name',
        'slug',
        'data_status_display',
        'completeness_display',
        'purchase_price_usd',
        'uses_per_year',
        'average_lifespan_uses',
    ]
    list_filter = ['data_status', 'created_at', 'verified_at']
    search_fields = ['name', 'slug']
    prepopulated_fields = {'slug': ('name',)}
    inlines = [ProductComponentInline, ProductUserFacingAssumptionInline, ProductInternalAssumptionInline]
    actions = ['mark_needs_review', 'mark_approved', 'mark_published']
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'slug', 'description')
        }),
        ('Data Quality Workflow', {
            'fields': ('data_status', 'verified_at', 'verification_notes'),
            'description': 'Track whether the product has enough sourced data for review and publishing.',
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

    @admin.display(description='Status')
    def data_status_display(self, obj):
        return obj.get_data_status_display()

    @admin.display(description='Completeness %')
    def completeness_display(self, obj):
        return f"{obj.get_completeness_summary()['overall_percent']:.0f}%"

    @admin.action(description='Mark selected products as needs review')
    def mark_needs_review(self, request, queryset):
        queryset.update(data_status='needs_review')

    @admin.action(description='Mark selected products as approved')
    def mark_approved(self, request, queryset):
        queryset.update(data_status='approved', verified_at=timezone.now())

    @admin.action(description='Mark selected products as published')
    def mark_published(self, request, queryset):
        queryset.update(data_status='published', verified_at=timezone.now())


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


def _build_quality_row(obj, change_url_name, kind):
    summary = obj.get_completeness_summary()
    blocking_items = list(summary['missing_items'])

    if not obj.verified_at:
        blocking_items.append('Not verified yet')

    if obj.data_status in {'draft', 'needs_review'}:
        blocking_items.append(f"Status is {obj.get_data_status_display()}")

    fully_sourced = not blocking_items and summary['overall_percent'] == 100

    return {
        'kind': kind,
        'object': obj,
        'status_label': obj.get_data_status_display(),
        'overall_percent': summary['overall_percent'],
        'verified_at': summary['verified_at'],
        'blocking_items': blocking_items,
        'fully_sourced': fully_sourced,
        'edit_url': reverse(change_url_name, args=[obj.pk]),
    }


def data_quality_dashboard(request):
    materials = Material.objects.select_related('category').order_by('name')
    products = Product.objects.order_by('name')

    material_rows = [_build_quality_row(material, 'admin:products_material_change', 'material') for material in materials]
    product_rows = [_build_quality_row(product, 'admin:products_product_change', 'product') for product in products]

    material_rows.sort(key=lambda row: (row['fully_sourced'], row['object'].name.lower()))
    product_rows.sort(key=lambda row: (row['fully_sourced'], row['object'].name.lower()))

    material_missing = sum(1 for row in material_rows if not row['fully_sourced'])
    product_missing = sum(1 for row in product_rows if not row['fully_sourced'])

    context = {
        **admin.site.each_context(request),
        'title': 'Data quality dashboard',
        'material_rows': material_rows,
        'product_rows': product_rows,
        'material_count': len(material_rows),
        'product_count': len(product_rows),
        'material_missing': material_missing,
        'product_missing': product_missing,
    }
    return render(request, 'admin/products/data_quality_dashboard.html', context)
