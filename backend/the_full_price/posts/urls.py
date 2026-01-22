"""
URL routing for posts API endpoints.
"""
from django.urls import path
from . import views

urlpatterns = [
    path('', views.post_list, name='post-list'),
    path('<slug:slug>/', views.post_detail, name='post-detail'),
]
