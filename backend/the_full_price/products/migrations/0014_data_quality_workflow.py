from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0013_material_categories_and_content'),
    ]

    operations = [
        migrations.AddField(
            model_name='material',
            name='data_status',
            field=models.CharField(
                choices=[('draft', 'Draft'), ('needs_review', 'Needs Review'), ('approved', 'Approved'), ('published', 'Published')],
                db_index=True,
                default='draft',
                help_text='Workflow status for sourcing and review.',
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name='material',
            name='verified_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='material',
            name='verification_notes',
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name='product',
            name='data_status',
            field=models.CharField(
                choices=[('draft', 'Draft'), ('needs_review', 'Needs Review'), ('approved', 'Approved'), ('published', 'Published')],
                db_index=True,
                default='draft',
                help_text='Workflow status for sourcing and review.',
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name='product',
            name='verified_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='product',
            name='verification_notes',
            field=models.TextField(blank=True),
        ),
    ]