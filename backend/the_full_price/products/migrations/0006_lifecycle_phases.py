# Generated migration for lifecycle phase separation

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0005_rename_greenhouse_gas_to_co2e'),
    ]

    operations = [
        # Material phase-specific fields
        migrations.RemoveField(model_name='material', name='co2e_kg_per_kg'),
        migrations.RemoveField(model_name='material', name='water_liters_per_kg'),
        migrations.RemoveField(model_name='material', name='energy_kwh_per_kg'),
        migrations.RemoveField(model_name='material', name='land_m2_per_kg'),
        migrations.RemoveField(model_name='material', name='cost_per_kg'),
        
        # Production phase
        migrations.AddField(
            model_name='material',
            name='production_co2e_kg_per_kg',
            field=models.FloatField(default=0, help_text='CO2e emissions from extracting raw materials and manufacturing per kg'),
        ),
        migrations.AddField(
            model_name='material',
            name='production_water_liters_per_kg',
            field=models.FloatField(default=0, help_text='Water used in production per kg'),
        ),
        migrations.AddField(
            model_name='material',
            name='production_energy_kwh_per_kg',
            field=models.FloatField(default=0, help_text='Energy used in production per kg'),
        ),
        migrations.AddField(
            model_name='material',
            name='production_land_m2_per_kg',
            field=models.FloatField(default=0, help_text='Land use in production per kg'),
        ),
        migrations.AddField(
            model_name='material',
            name='production_cost_per_kg',
            field=models.FloatField(default=0, help_text='Material cost per kg'),
        ),
        
        # Transport phase
        migrations.AddField(
            model_name='material',
            name='transport_co2e_kg_per_kg',
            field=models.FloatField(default=0, help_text='CO2e emissions from transporting material (shipping, trucking, etc.) per kg'),
        ),
        migrations.AddField(
            model_name='material',
            name='transport_water_liters_per_kg',
            field=models.FloatField(default=0),
        ),
        migrations.AddField(
            model_name='material',
            name='transport_energy_kwh_per_kg',
            field=models.FloatField(default=0),
        ),
        migrations.AddField(
            model_name='material',
            name='transport_land_m2_per_kg',
            field=models.FloatField(default=0),
        ),
        migrations.AddField(
            model_name='material',
            name='transport_cost_per_kg',
            field=models.FloatField(default=0),
        ),
        
        # End of life phase
        migrations.AddField(
            model_name='material',
            name='end_of_life_co2e_kg_per_kg',
            field=models.FloatField(default=0, help_text='CO2e emissions from disposal, recycling, or incineration per kg'),
        ),
        migrations.AddField(
            model_name='material',
            name='end_of_life_water_liters_per_kg',
            field=models.FloatField(default=0),
        ),
        migrations.AddField(
            model_name='material',
            name='end_of_life_energy_kwh_per_kg',
            field=models.FloatField(default=0),
        ),
        migrations.AddField(
            model_name='material',
            name='end_of_life_land_m2_per_kg',
            field=models.FloatField(default=0),
        ),
        migrations.AddField(
            model_name='material',
            name='end_of_life_cost_per_kg',
            field=models.FloatField(default=0),
        ),
        
        # Product use phase fields
        migrations.AddField(
            model_name='product',
            name='use_co2e_kg_per_use',
            field=models.FloatField(default=0, help_text='CO2e emissions per use (e.g., from washing, drying, heating)'),
        ),
        migrations.AddField(
            model_name='product',
            name='use_water_liters_per_use',
            field=models.FloatField(default=0, help_text='Water used per use (e.g., from washing)'),
        ),
        migrations.AddField(
            model_name='product',
            name='use_energy_kwh_per_use',
            field=models.FloatField(default=0, help_text='Energy used per use (e.g., from washing/drying)'),
        ),
        migrations.AddField(
            model_name='product',
            name='use_land_m2_per_use',
            field=models.FloatField(default=0),
        ),
        migrations.AddField(
            model_name='product',
            name='use_cost_per_use',
            field=models.FloatField(default=0, help_text='Cost per use (e.g., detergent, water, electricity)'),
        ),
    ]
