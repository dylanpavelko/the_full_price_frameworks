"""
Views for the posts app.
These views are minimal since we're primarily generating static JSON data.
They're here for reference and for development purposes.
"""
from django.http import JsonResponse
from .models import Post


def post_list(request):
    """
    API endpoint that returns all published posts.
    In production, this data is pre-generated as static JSON.
    """
    posts = Post.objects.filter(published=True)
    data = {
        'posts': [post.to_dict() for post in posts]
    }
    return JsonResponse(data)


def post_detail(request, slug):
    """
    API endpoint that returns a single post's details.
    In production, this data is pre-generated as static JSON.
    """
    try:
        post = Post.objects.get(slug=slug, published=True)
        return JsonResponse(post.to_dict())
    except Post.DoesNotExist:
        return JsonResponse({'error': 'Post not found'}, status=404)
