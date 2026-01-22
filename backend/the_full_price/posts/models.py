"""
Post models for The Full Price project.

These models support two types of posts:
1. Blog posts - static content that educates users
2. Product comparisons - dynamic content that compares impacts between products
"""
from django.db import models


class Post(models.Model):
    """
    Represents a blog post or article on The Full Price website.
    """
    POST_TYPE_CHOICES = [
        ('blog', 'Blog Post'),
        ('comparison', 'Product Comparison'),
    ]

    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    post_type = models.CharField(max_length=50, choices=POST_TYPE_CHOICES, default='blog')
    
    # Content
    content = models.TextField(help_text="Markdown or HTML content of the post")
    excerpt = models.CharField(max_length=500, blank=True)
    
    # Metadata
    author = models.CharField(max_length=255, default="The Full Price Team")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    published = models.BooleanField(default=True)
    featured = models.BooleanField(default=False, help_text="Show this post prominently")

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title

    def to_dict(self):
        """
        Convert post to a dictionary suitable for JSON serialization.
        
        Returns:
            dict: Post data
        """
        data = {
            'id': self.id,
            'title': self.title,
            'slug': self.slug,
            'post_type': self.post_type,
            'content': self.content,
            'excerpt': self.excerpt,
            'author': self.author,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'featured': self.featured,
        }
        
        # Add comparison products if this is a comparison post
        if self.post_type == 'comparison':
            # Get all products in this comparison, ordered by their position
            comparison_products = self.comparison_products.all().order_by('order')
            data['comparison'] = {
                'product_ids': [comp.product.id for comp in comparison_products],
                'products': [comp.product.to_dict() for comp in comparison_products]
            }
        else:
            data['products'] = []
        
        return data


class ComparisonPost(models.Model):
    """
    Join table for product comparisons in posts.
    A single post can compare multiple products.
    """
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comparison_products')
    product = models.ForeignKey('products.Product', on_delete=models.CASCADE)
    order = models.IntegerField(default=0, help_text="Order to display products in the comparison")

    class Meta:
        ordering = ['post', 'order']
        unique_together = ('post', 'product')

    def __str__(self):
        return f"{self.post.title} - {self.product.name}"
