"""
Tests for the posts app.

Tests verify:
- Post model creation and validation
- Post to dictionary conversion works correctly
- Post API endpoints return correct data
- Draft/unpublished posts are properly filtered
"""
from django.test import TestCase
from posts.models import Post, ComparisonPost
from products.models import Material, Product, ProductComponent


class PostModelTests(TestCase):
    """Test the Post model."""

    def setUp(self):
        """Create test fixtures."""
        self.blog_post = Post.objects.create(
            title='Understanding Cotton Impact',
            slug='cotton-impact',
            post_type='blog',
            content='# Cotton Impact\nCotton requires...',
            excerpt='Learn about cotton production impact',
            published=True
        )

    def test_post_creation(self):
        """Test that a post can be created."""
        self.assertEqual(self.blog_post.title, 'Understanding Cotton Impact')
        self.assertEqual(self.blog_post.post_type, 'blog')
        self.assertTrue(self.blog_post.published)

    def test_post_str(self):
        """Test post string representation."""
        self.assertEqual(str(self.blog_post), 'Understanding Cotton Impact')

    def test_post_to_dict(self):
        """Test conversion to dictionary for JSON serialization."""
        data = self.blog_post.to_dict()
        
        self.assertEqual(data['title'], 'Understanding Cotton Impact')
        self.assertEqual(data['slug'], 'cotton-impact')
        self.assertEqual(data['post_type'], 'blog')
        self.assertIn('created_at', data)
        self.assertIn('updated_at', data)

    def test_unpublished_posts_not_in_list(self):
        """Test that unpublished posts are excluded from listings."""
        unpublished = Post.objects.create(
            title='Draft Post',
            slug='draft',
            published=False
        )
        
        published_posts = Post.objects.filter(published=True)
        self.assertEqual(published_posts.count(), 1)
        self.assertNotIn(unpublished, published_posts)


class ComparisonPostTests(TestCase):
    """Test the ComparisonPost model."""

    def setUp(self):
        """Create test fixtures."""
        # Create materials and products
        self.cotton = Material.objects.create(
            name='Cotton',
            greenhouse_gas_kg_per_kg=2.0,
            water_liters_per_kg=10000,
            energy_kwh_per_kg=1.0,
            land_m2_per_kg=1.0,
            cost_per_kg=5.0
        )
        
        self.paper = Material.objects.create(
            name='Paper',
            greenhouse_gas_kg_per_kg=1.5,
            water_liters_per_kg=300,
            energy_kwh_per_kg=0.3,
            land_m2_per_kg=0.01,
            cost_per_kg=2.0
        )
        
        self.paper_towel = Product.objects.create(
            name='Paper Towel',
            slug='paper-towel',
            purchase_price_usd=5.0
        )
        ProductComponent.objects.create(
            product=self.paper_towel,
            material=self.paper,
            weight_grams=50
        )
        
        self.cotton_napkin = Product.objects.create(
            name='Cotton Napkin',
            slug='cotton-napkin',
            purchase_price_usd=8.0
        )
        ProductComponent.objects.create(
            product=self.cotton_napkin,
            material=self.cotton,
            weight_grams=100
        )
        
        # Create comparison post
        self.comparison_post = Post.objects.create(
            title='Paper Towel vs Cotton Napkin',
            slug='paper-vs-cotton',
            post_type='comparison',
            content='Let\'s compare these two options...',
            published=True
        )
        
        ComparisonPost.objects.create(
            post=self.comparison_post,
            product=self.paper_towel,
            order=1
        )
        ComparisonPost.objects.create(
            post=self.comparison_post,
            product=self.cotton_napkin,
            order=2
        )

    def test_comparison_post_creation(self):
        """Test that comparison posts can be created."""
        self.assertEqual(self.comparison_post.post_type, 'comparison')
        self.assertEqual(self.comparison_post.comparison_products.count(), 2)

    def test_comparison_post_ordering(self):
        """Test that products in a comparison are ordered correctly."""
        products = self.comparison_post.comparison_products.all()
        self.assertEqual(products[0].product.name, 'Paper Towel')
        self.assertEqual(products[1].product.name, 'Cotton Napkin')

    def test_comparison_post_to_dict(self):
        """Test that comparison data is included in dict output."""
        data = self.comparison_post.to_dict()
        
        self.assertEqual(data['post_type'], 'comparison')
        self.assertIn('comparison', data)
        self.assertEqual(len(data['comparison']['product_ids']), 2)

    def test_duplicate_product_in_comparison_prevented(self):
        """Test that the same product can't be added twice to a comparison."""
        with self.assertRaises(Exception):
            ComparisonPost.objects.create(
                post=self.comparison_post,
                product=self.paper_towel,
                order=3
            )


class PostAPITests(TestCase):
    """Test the post API endpoints."""

    def setUp(self):
        """Create test fixtures."""
        self.published_post = Post.objects.create(
            title='Published Post',
            slug='published',
            content='This is published',
            published=True
        )
        
        self.draft_post = Post.objects.create(
            title='Draft Post',
            slug='draft',
            content='This is a draft',
            published=False
        )

    def test_post_list_only_published(self):
        """Test that the post list endpoint only returns published posts."""
        response = self.client.get('/api/posts/')
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertIn('posts', data)
        self.assertEqual(len(data['posts']), 1)
        self.assertEqual(data['posts'][0]['title'], 'Published Post')

    def test_post_detail_endpoint(self):
        """Test the post detail API endpoint."""
        response = self.client.get('/api/posts/published/')
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertEqual(data['title'], 'Published Post')

    def test_draft_post_not_accessible(self):
        """Test that draft posts are not accessible via API."""
        response = self.client.get('/api/posts/draft/')
        self.assertEqual(response.status_code, 404)

    def test_post_not_found(self):
        """Test post detail endpoint with non-existent slug."""
        response = self.client.get('/api/posts/nonexistent/')
        self.assertEqual(response.status_code, 404)
