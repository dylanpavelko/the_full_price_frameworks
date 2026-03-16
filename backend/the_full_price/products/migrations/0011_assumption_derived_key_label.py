"""
Migration: make Assumption.label an optional override and Assumption.key auto-derived.

- label: blank=True (becomes a "Label Override" field; empty = derive from phase+metric)
- key: blank=True, editable=False (always auto-derived from effective_label via slugify)
- Data migration: recomputes key for all existing Assumption rows.
"""
from django.db import migrations, models
from django.utils.text import slugify


METRIC_SHORT_LABELS = {
    'greenhouse_gas_kg': 'Greenhouse Gas',
    'water_liters': 'Water',
    'energy_kwh': 'Energy',
    'land_m2': 'Land Use',
    'cost_usd': 'Cost',
}

PHASE_CHOICES = {
    'production': 'Production',
    'transport': 'Transport',
    'end_of_life': 'End Of Life',
    'use': 'Use',
}


def compute_effective_label(label, phase, metric):
    if label:
        return label
    phase_display = PHASE_CHOICES.get(phase, phase).title()
    metric_display = METRIC_SHORT_LABELS.get(metric, metric)
    return f"{phase_display} {metric_display} Factor"


def recompute_keys(apps, schema_editor):
    Assumption = apps.get_model('products', 'Assumption')
    for assumption in Assumption.objects.all():
        effective = compute_effective_label(assumption.label, assumption.phase, assumption.metric)
        assumption.key = slugify(effective).replace('-', '_')
        assumption.save(update_fields=['key'])


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0010_assumption_models'),
    ]

    operations = [
        migrations.AlterField(
            model_name='assumption',
            name='label',
            field=models.CharField(
                max_length=255,
                blank=True,
                verbose_name='Label Override',
                help_text=(
                    'Leave blank to auto-derive from Phase + Metric '
                    '(e.g. "Production Greenhouse Gas Factor"). '
                    'Set this to give the control a custom name visible to users.'
                ),
            ),
        ),
        migrations.AlterField(
            model_name='assumption',
            name='key',
            field=models.CharField(
                max_length=100,
                blank=True,
                editable=False,
                help_text='Auto-derived from the effective label. Not editable directly.',
            ),
        ),
        migrations.RunPython(recompute_keys, migrations.RunPython.noop),
    ]
