/**
 * PostDetail page - shows detailed view of a single post
 * 
 * Displays the full content of a blog post or product comparison,
 * with associated products and metadata.
 */
import { useParams, useNavigate } from 'react-router-dom';
import { usePost } from '../hooks/usePosts.js';
import { LoadingSpinner } from '../components/LoadingSpinner.jsx';
import { ProductCard } from '../components/ProductCard.jsx';
import { ComparisonView } from '../components/ComparisonView.jsx';
import './PostDetail.css';

export function PostDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { post, loading, error } = usePost(slug);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="post-detail__error">
        <h2>Post Not Found</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/posts')} className="post-detail__back-button">
          ← Back to Posts
        </button>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="post-detail__error">
        <h2>Post Not Found</h2>
        <p>The post you're looking for doesn't exist.</p>
        <button onClick={() => navigate('/posts')} className="post-detail__back-button">
          ← Back to Posts
        </button>
      </div>
    );
  }

  return (
    <div className="post-detail">
      <div className="post-detail__container">
        {/* Header */}
        <div className="post-detail__header">
          <button 
            onClick={() => navigate('/posts')} 
            className="post-detail__back-button"
          >
            ← Back to Posts
          </button>
          
          <h1 className="post-detail__title">{post.title}</h1>
          
          <div className="post-detail__meta">
            <span className="post-detail__type">
              {post.post_type === 'comparison' ? '⚖️ Comparison' : '📝 Article'}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="post-detail__content">
          {post.content ? (
            <div 
              className="post-detail__markdown"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          ) : (
            <p className="post-detail__empty">No content available for this post.</p>
          )}
        </div>

        {/* Comparison Products (if applicable) */}
        {post.post_type === 'comparison' && post.comparison && post.comparison.products && post.comparison.products.length === 2 && (
          <>
            <ComparisonView product1={post.comparison.products[0]} product2={post.comparison.products[1]} />
          </>
        )}

        {post.post_type === 'comparison' && post.comparison && post.comparison.products && post.comparison.products.length > 0 && (
          <div className="post-detail__products">
            <h2 className="post-detail__products-title">Products</h2>
            <div className="post-detail__products-grid">
              {post.comparison.products.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product}
                  onClick={() => navigate(`/products/${product.slug}`)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
