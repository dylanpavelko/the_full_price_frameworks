"""
URL routing configuration for The Full Price project.
Routes API endpoints to their respective views.
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/products/', include('products.urls')),
    path('api/posts/', include('posts.urls')),
]
