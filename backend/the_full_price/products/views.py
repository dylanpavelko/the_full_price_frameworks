"""
Views for the products app.
These views are minimal since we're primarily generating static JSON data.
They're here for reference and for development purposes.
"""
import json
from django.http import JsonResponse
from .models import Product


def product_list(request):
    """
    API endpoint that returns all products with their impacts.
    In production, this data is pre-generated as static JSON.
    """
    products = Product.objects.all()
    data = {
        'products': [product.to_dict() for product in products]
    }
    return JsonResponse(data)


def product_detail(request, slug):
    """
    API endpoint that returns a single product's details.
    In production, this data is pre-generated as static JSON.
    """
    try:
        product = Product.objects.get(slug=slug)
        return JsonResponse(product.to_dict())
    except Product.DoesNotExist:
        return JsonResponse({'error': 'Product not found'}, status=404)
