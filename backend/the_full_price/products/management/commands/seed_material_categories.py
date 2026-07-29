"""
Management command to seed the 10-bucket material taxonomy.

Usage:
    python manage.py seed_material_categories
"""
from django.core.management.base import BaseCommand
from django.utils.text import slugify

from products.models import MaterialCategory


CATEGORIES = [
    {
        'name': 'Commodity Plastics',
        'description': 'High-volume thermoplastics used in everyday consumer products.',
        'typical_products': 'bottles, packaging, food containers',
    },
    {
        'name': 'Engineering Plastics',
        'description': 'Higher-performance polymers for demanding mechanical or thermal applications.',
        'typical_products': 'appliance housings, mechanical parts, electronics components',
    },
    {
        'name': 'Elastomers / Rubbers',
        'description': 'Flexible polymers that return to their original shape after deformation.',
        'typical_products': 'seals, gaskets, grips, flexible lids',
    },
    {
        'name': 'Polymer Foams',
        'description': 'Expanded plastics with cellular structure, valued for cushioning and insulation.',
        'typical_products': 'cushions, packaging, sponges, insulation',
    },
    {
        'name': 'Regenerated Bio-polymers',
        'description': 'Processed plant polymers — cellulose or starch chemically reformed into new materials.',
        'typical_products': 'cleaning products, textiles, wipes',
    },
    {
        'name': 'Natural Fibers',
        'description': 'Plant or animal fibers used in their relatively natural form.',
        'typical_products': 'cloths, brushes, textiles',
    },
    {
        'name': 'Metals',
        'description': 'Metallic elements and alloys — usually easy to identify and measure.',
        'typical_products': 'cookware, tools, fasteners, electrical wiring',
    },
    {
        'name': 'Glass / Ceramics / Minerals',
        'description': 'Inorganic non-metal solids including glass, porcelain, and stone.',
        'typical_products': 'dishes, abrasives, tiles, cooktops',
    },
    {
        'name': 'Paper / Wood Materials',
        'description': 'Cellulose-based materials that have not been regenerated into polymer form.',
        'typical_products': 'packaging, furniture, paper products',
    },
    {
        'name': 'Adhesives / Coatings / Additives',
        'description': 'Usually small mass but important — affects recyclability and toxicity.',
        'typical_products': 'epoxy, polyurethane adhesive, paint, resin binders, flame retardants',
    },
]


class Command(BaseCommand):
    help = 'Seed the 10-bucket material taxonomy categories.'

    def handle(self, *args, **options):
        created = 0
        updated = 0

        for idx, cat_data in enumerate(CATEGORIES, start=1):
            slug = slugify(cat_data['name'])
            obj, was_created = MaterialCategory.objects.update_or_create(
                slug=slug,
                defaults={
                    'name': cat_data['name'],
                    'description': cat_data['description'],
                    'typical_products': cat_data['typical_products'],
                    'sort_order': idx,
                },
            )
            if was_created:
                created += 1
            else:
                updated += 1

        self.stdout.write(
            self.style.SUCCESS(
                f'Done — {created} created, {updated} updated '
                f'({MaterialCategory.objects.count()} total categories).'
            )
        )
