"""
URL routing configuration for The Full Price project.
Routes API endpoints to their respective views.
"""
from django.contrib import admin
from django.urls import path, include

from products.admin import data_quality_dashboard

urlpatterns = [
    path('admin/data-quality/', admin.site.admin_view(data_quality_dashboard), name='data_quality_dashboard'),
    path('admin/', admin.site.urls),
    path('api/products/', include('products.urls')),
    path('api/posts/', include('posts.urls')),
]
