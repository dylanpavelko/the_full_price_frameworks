"""
Migration: Multi-metric and global assumptions redesign.

1. Create AssumptionEffect model.
2. Populate effects from existing (Assumption.phase, Assumption.metric, Option.multiplier).
3. Remove phase/metric from Assumption, multiplier from AssumptionOption.
4. Allow both product and material to be null (global scope).
5. Make label required (no longer blank).
"""
from django.db import migrations, models
import django.db.models.deletion


def forwards_populate_effects(apps, schema_editor):
    """
    For every existing AssumptionOption, create an AssumptionEffect row using
    the parent Assumption's phase/metric and the option's multiplier.
    """
    AssumptionOption = apps.get_model('products', 'AssumptionOption')
    AssumptionEffect = apps.get_model('products', 'AssumptionEffect')

    effects_to_create = []
    for option in AssumptionOption.objects.select_related('assumption').all():
        effects_to_create.append(
            AssumptionEffect(
                option=option,
                phase=option.assumption.phase,
                metric=option.assumption.metric,
                multiplier=option.multiplier,
            )
        )
    AssumptionEffect.objects.bulk_create(effects_to_create)


def backwards_restore_fields(apps, schema_editor):
    """
    Reverse: copy phase/metric/multiplier back from the first effect per option.
    """
    AssumptionOption = apps.get_model('products', 'AssumptionOption')
    AssumptionEffect = apps.get_model('products', 'AssumptionEffect')
    Assumption = apps.get_model('products', 'Assumption')

    for effect in AssumptionEffect.objects.select_related('option__assumption').all():
        assumption = effect.option.assumption
        if not assumption.phase:
            assumption.phase = effect.phase
            assumption.metric = effect.metric
            assumption.save(update_fields=['phase', 'metric'])
        option = effect.option
        option.multiplier = effect.multiplier
        option.save(update_fields=['multiplier'])


def forwards_fill_blank_labels(apps, schema_editor):
    """
    Ensure every Assumption has a non-blank label before making the field required.
    Derive from phase + metric for any rows that currently have blank labels.
    """
    Assumption = apps.get_model('products', 'Assumption')

    METRIC_SHORT = {
        'greenhouse_gas_kg': 'Greenhouse Gas',
        'water_liters': 'Water',
        'energy_kwh': 'Energy',
        'land_m2': 'Land Use',
        'cost_usd': 'Cost',
    }
    PHASE_DISPLAY = {
        'production': 'Production',
        'transport': 'Transport',
        'end_of_life': 'End of Life',
        'use': 'Use',
    }

    for assumption in Assumption.objects.filter(label=''):
        phase_name = PHASE_DISPLAY.get(assumption.phase, assumption.phase)
        metric_name = METRIC_SHORT.get(assumption.metric, assumption.metric)
        assumption.label = f"{phase_name} {metric_name} Factor"
        assumption.save(update_fields=['label'])


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0011_assumption_derived_key_label'),
    ]

    operations = [
        # 1. Create AssumptionEffect table (while old fields still exist)
        migrations.CreateModel(
            name='AssumptionEffect',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('phase', models.CharField(
                    choices=[
                        ('production', 'Production'),
                        ('transport', 'Transport'),
                        ('end_of_life', 'End of Life'),
                        ('use', 'Use'),
                    ],
                    max_length=30,
                )),
                ('metric', models.CharField(
                    choices=[
                        ('greenhouse_gas_kg', 'Greenhouse Gas (kg CO₂e)'),
                        ('water_liters', 'Water (liters)'),
                        ('energy_kwh', 'Energy (kWh)'),
                        ('land_m2', 'Land (m²)'),
                        ('cost_usd', 'Cost (USD)'),
                    ],
                    max_length=40,
                )),
                ('multiplier', models.FloatField(default=1.0)),
                ('option', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='effects',
                    to='products.assumptionoption',
                )),
            ],
            options={
                'ordering': ['phase', 'metric'],
                'unique_together': {('option', 'phase', 'metric')},
            },
        ),

        # 2. Populate effects from existing phase/metric/multiplier
        migrations.RunPython(forwards_populate_effects, backwards_restore_fields),

        # 3. Fill blank labels before making label required
        migrations.RunPython(forwards_fill_blank_labels, migrations.RunPython.noop),

        # 4. Remove old fields
        migrations.RemoveField(model_name='assumption', name='phase'),
        migrations.RemoveField(model_name='assumption', name='metric'),
        migrations.RemoveField(model_name='assumptionoption', name='multiplier'),

        # 5. Make label required (remove blank=True)
        migrations.AlterField(
            model_name='assumption',
            name='label',
            field=models.CharField(
                help_text='Name of this assumption (e.g. "Wash frequency", "Grocery trip distance").',
                max_length=255,
            ),
        ),

        # 6. Allow global scope (loosen the constraint — clean() now handles validation)
        migrations.AlterField(
            model_name='assumption',
            name='key',
            field=models.CharField(
                blank=True,
                editable=False,
                help_text='Auto-derived from the label. Not editable directly.',
                max_length=100,
            ),
        ),
    ]
