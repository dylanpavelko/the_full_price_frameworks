"""
Django admin configuration for posts app.

Registers Post and ComparisonPost models
so they can be managed through the admin interface.
"""
from django.contrib import admin
from .models import Post, ComparisonPost


class ComparisonPostInline(admin.TabularInline):
    """
    Inline admin for ComparisonPost.
    
    Allows editing comparison products directly on the Post page.
    """
    model = ComparisonPost
    extra = 1
    fields = ['product', 'order']


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    """
    Admin interface for Post model.
    
    Allows users to create blog posts and product comparisons.
    """
    list_display = ['title', 'post_type', 'published', 'created_at']
    list_filter = ['post_type', 'published', 'created_at']
    search_fields = ['title', 'slug']
    prepopulated_fields = {'slug': ('title',)}
    inlines = [ComparisonPostInline]
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'slug', 'post_type')
        }),
        ('Content', {
            'fields': ('content',),
            'classes': ('wide',)
        }),
        ('Publishing', {
            'fields': ('published',)
        }),
    )


@admin.register(ComparisonPost)
class ComparisonPostAdmin(admin.ModelAdmin):
    """
    Admin interface for ComparisonPost model.
    
    Allows direct management of product comparisons in posts.
    """
    list_display = ['post', 'product', 'order']
    list_filter = ['post']
    search_fields = ['post__title', 'product__name']
    fieldsets = (
        ('Comparison Information', {
            'fields': ('post', 'product', 'order')
        }),
    )
