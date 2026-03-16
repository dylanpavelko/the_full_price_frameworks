from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils.text import slugify

from products.models import (
    Assumption,
    AssumptionEffect,
    AssumptionOption,
    Material,
    Product,
)


METRICS = [
    ('greenhouse_gas_kg', 'Greenhouse Gas'),
    ('water_liters', 'Water'),
    ('energy_kwh', 'Energy'),
    ('land_m2', 'Land Use'),
    ('cost_usd', 'Cost'),
]

PRODUCT_PHASES = [
    ('production', 'Production'),
    ('transport', 'Transport'),
    ('end_of_life', 'End of Life'),
    ('use', 'Use'),
]

MATERIAL_PHASES = [
    ('production', 'Production'),
    ('transport', 'Transport'),
    ('end_of_life', 'End of Life'),
]


class Command(BaseCommand):
    help = "Seed assumption records for all existing products and materials. Idempotent."

    def add_arguments(self, parser):
        parser.add_argument(
            '--reset',
            action='store_true',
            help='Delete existing assumptions/options/effects before seeding fresh data.',
        )

    def handle(self, *args, **options):
        reset = options.get('reset', False)

        with transaction.atomic():
            if reset:
                AssumptionEffect.objects.all().delete()
                AssumptionOption.objects.all().delete()
                Assumption.objects.all().delete()

            summary = {
                'assumptions_created': 0,
                'assumptions_updated': 0,
                'options_created': 0,
                'options_updated': 0,
                'effects_created': 0,
            }

            # Seed global assumptions (not tied to any product or material)
            self._seed_global_assumptions(summary)

            for product in Product.objects.all().order_by('id'):
                self._seed_product_defaults(product, summary)

            for material in Material.objects.all().order_by('id'):
                self._seed_material_defaults(material, summary)

            self.stdout.write(self.style.SUCCESS('Assumptions seeding complete.'))
            for key, value in summary.items():
                self.stdout.write(f"- {key}: {value}")

    # ------------------------------------------------------------------
    # Core upsert helper
    # ------------------------------------------------------------------

    def _upsert_assumption(
        self,
        *,
        product=None,
        material=None,
        label,
        description,
        input_type='select',
        exposed=False,
        default_option_key='base',
        sort_order=0,
        options=None,
        summary,
    ):
        """
        Create or update an Assumption together with its Options and Effects.

        Each option dict should look like:
            {
                'option_key': 'every_use',
                'label': 'Wash after every use',
                'is_default': True,
                'effects': [
                    {'phase': 'use', 'metric': 'water_liters', 'multiplier': 1.0},
                    {'phase': 'use', 'metric': 'energy_kwh',   'multiplier': 1.0},
                    ...
                ],
            }
        """
        derived_key = slugify(label).replace('-', '_')

        assumption, created = Assumption.objects.get_or_create(
            product=product,
            material=material,
            key=derived_key,
            defaults={
                'label': label,
                'description': description,
                'input_type': input_type,
                'exposed': exposed,
                'default_option_key': default_option_key,
                'sort_order': sort_order,
            },
        )

        if created:
            summary['assumptions_created'] += 1
        else:
            changed = False
            updates = {
                'label': label,
                'description': description,
                'input_type': input_type,
                'exposed': exposed,
                'default_option_key': default_option_key,
                'sort_order': sort_order,
            }
            for field, value in updates.items():
                if getattr(assumption, field) != value:
                    setattr(assumption, field, value)
                    changed = True
            if changed:
                assumption.save()
                summary['assumptions_updated'] += 1

        for option_index, option_data in enumerate(options or []):
            option, option_created = AssumptionOption.objects.get_or_create(
                assumption=assumption,
                option_key=option_data['option_key'],
                defaults={
                    'label': option_data['label'],
                    'is_default': option_data.get('is_default', False),
                    'sort_order': option_index,
                },
            )

            if option_created:
                summary['options_created'] += 1
            else:
                option_changed = False
                if option.label != option_data['label']:
                    option.label = option_data['label']
                    option_changed = True
                if option.is_default != option_data.get('is_default', False):
                    option.is_default = option_data.get('is_default', False)
                    option_changed = True
                if option.sort_order != option_index:
                    option.sort_order = option_index
                    option_changed = True
                if option_changed:
                    option.save()
                    summary['options_updated'] += 1

            # Upsert effects for this option
            for effect_data in option_data.get('effects', []):
                _effect, effect_created = AssumptionEffect.objects.get_or_create(
                    option=option,
                    phase=effect_data['phase'],
                    metric=effect_data['metric'],
                    defaults={'multiplier': effect_data['multiplier']},
                )
                if effect_created:
                    summary['effects_created'] += 1
                elif _effect.multiplier != effect_data['multiplier']:
                    _effect.multiplier = effect_data['multiplier']
                    _effect.save(update_fields=['multiplier'])

    # ------------------------------------------------------------------
    # Global assumptions (shared across all products)
    # ------------------------------------------------------------------

    def _seed_global_assumptions(self, summary):
        """
        Grocery trip distance applies universally — define it once as a
        global assumption (product=None, material=None).
        """
        self._upsert_assumption(
            product=None,
            material=None,
            label='Grocery trip distance',
            description='Assumed round-trip distance used to estimate transport-related emissions.',
            exposed=True,
            default_option_key='moderate',
            sort_order=1000,
            options=[
                {
                    'option_key': 'nearby',
                    'label': 'Nearby (2 mi round-trip)',
                    'is_default': False,
                    'effects': [
                        {'phase': 'transport', 'metric': 'greenhouse_gas_kg', 'multiplier': 0.8},
                    ],
                },
                {
                    'option_key': 'moderate',
                    'label': 'Moderate (6 mi round-trip)',
                    'is_default': True,
                    'effects': [
                        {'phase': 'transport', 'metric': 'greenhouse_gas_kg', 'multiplier': 1.0},
                    ],
                },
                {
                    'option_key': 'far',
                    'label': 'Far (12 mi round-trip)',
                    'is_default': False,
                    'effects': [
                        {'phase': 'transport', 'metric': 'greenhouse_gas_kg', 'multiplier': 1.25},
                    ],
                },
            ],
            summary=summary,
        )

    # ------------------------------------------------------------------
    # Per-product assumptions
    # ------------------------------------------------------------------

    def _seed_product_defaults(self, product, summary):
        # Internal baseline factor: one assumption per phase, affecting all 5 metrics.
        for phase_sort, (phase_key, phase_label) in enumerate(PRODUCT_PHASES):
            effects_low = [{'phase': phase_key, 'metric': mk, 'multiplier': 0.8} for mk, _ in METRICS]
            effects_base = [{'phase': phase_key, 'metric': mk, 'multiplier': 1.0} for mk, _ in METRICS]
            effects_high = [{'phase': phase_key, 'metric': mk, 'multiplier': 1.2} for mk, _ in METRICS]

            self._upsert_assumption(
                product=product,
                label=f'{phase_label} factor',
                description=f'Scaling factor for all {phase_label.lower()} impacts.',
                exposed=False,
                default_option_key='base',
                sort_order=phase_sort,
                options=[
                    {'option_key': 'low', 'label': 'Low case (0.8×)', 'is_default': False, 'effects': effects_low},
                    {'option_key': 'base', 'label': 'Base case (1.0×)', 'is_default': True, 'effects': effects_base},
                    {'option_key': 'high', 'label': 'High case (1.2×)', 'is_default': False, 'effects': effects_high},
                ],
                summary=summary,
            )

        # Exposed: wash frequency — ONE assumption affecting all use-phase metrics
        # that have non-zero values on this product.
        use_metric_fields = {
            'greenhouse_gas_kg': product.use_co2e_kg_per_use,
            'water_liters': product.use_water_liters_per_use,
            'energy_kwh': product.use_energy_kwh_per_use,
            'cost_usd': product.use_cost_per_use,
        }

        active_metrics = [mk for mk, val in use_metric_fields.items() if val]

        if active_metrics:
            def _wash_effects(mult):
                return [{'phase': 'use', 'metric': mk, 'multiplier': mult} for mk in active_metrics]

            self._upsert_assumption(
                product=product,
                label='Wash frequency',
                description='How often the item is washed during use.',
                exposed=True,
                default_option_key='every_use',
                sort_order=1010,
                options=[
                    {'option_key': 'every_use', 'label': 'Wash after every use', 'is_default': True, 'effects': _wash_effects(1.0)},
                    {'option_key': 'every_2_uses', 'label': 'Wash after 2 uses', 'is_default': False, 'effects': _wash_effects(0.5)},
                    {'option_key': 'every_4_uses', 'label': 'Wash after 4 uses', 'is_default': False, 'effects': _wash_effects(0.25)},
                ],
                summary=summary,
            )

    # ------------------------------------------------------------------
    # Per-material assumptions
    # ------------------------------------------------------------------

    def _seed_material_defaults(self, material, summary):
        for phase_sort, (phase_key, phase_label) in enumerate(MATERIAL_PHASES):
            effects_low = [{'phase': phase_key, 'metric': mk, 'multiplier': 0.8} for mk, _ in METRICS]
            effects_base = [{'phase': phase_key, 'metric': mk, 'multiplier': 1.0} for mk, _ in METRICS]
            effects_high = [{'phase': phase_key, 'metric': mk, 'multiplier': 1.2} for mk, _ in METRICS]

            self._upsert_assumption(
                material=material,
                label=f'{phase_label} factor',
                description=f'Scaling factor for material {phase_label.lower()} impacts.',
                exposed=False,
                default_option_key='base',
                sort_order=phase_sort,
                options=[
                    {'option_key': 'low', 'label': 'Low case (0.8×)', 'is_default': False, 'effects': effects_low},
                    {'option_key': 'base', 'label': 'Base case (1.0×)', 'is_default': True, 'effects': effects_base},
                    {'option_key': 'high', 'label': 'High case (1.2×)', 'is_default': False, 'effects': effects_high},
                ],
                summary=summary,
            )
