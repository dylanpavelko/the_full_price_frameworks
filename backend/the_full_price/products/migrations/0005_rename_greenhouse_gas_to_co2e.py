# Generated migration to rename greenhouse_gas_kg_per_kg to co2e_kg_per_kg

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0004_remove_product_average_lifespan_years_and_more'),
    ]

    operations = [
        migrations.RenameField(
            model_name='material',
            old_name='greenhouse_gas_kg_per_kg',
            new_name='co2e_kg_per_kg',
        ),
        migrations.AlterField(
            model_name='material',
            name='co2e_kg_per_kg',
            field=models.FloatField(
                default=0,
                help_text='CO2-equivalent emissions (kg CO2e per kg material). Accounts for all GHGs converted to CO2 equivalents using standard climate accounting methodology.'
            ),
        ),
    ]
