/**
 * Posts page - displays all blog posts and articles
 * 
 * Shows a list of published posts that users can click to read.
 * Includes both standard blog posts and product comparisons.
 */
import { Link } from 'react-router-dom';
import { useAllPosts } from '../hooks/usePosts.js';
import { LoadingSpinner } from '../components/LoadingSpinner.jsx';
import { formatDate } from '../utils/formatting.js';
import './Posts.css';

export function Posts() {
  const { posts, loading, error } = useAllPosts();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="posts__error">
        <h2>Error Loading Posts</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="posts__empty">
        <h2>No Posts Available</h2>
        <p>Check back soon for articles and product comparisons.</p>
      </div>
    );
  }

  return (
    <div className="posts">
      <div className="posts__header">
        <h1>The Full Price Blog</h1>
        <p>
          Explore in-depth articles and product comparisons that help you 
          understand the full impact of your purchases.
        </p>
      </div>

      <div className="posts__list">
        {posts.map((post) => (
          <article key={post.id} className="post-item">
            <Link to={`/posts/${post.slug}`} className="post-item__link">
              <div className="post-item__header">
                <h2 className="post-item__title">{post.title}</h2>
                <div className="post-item__meta">
                  <span className="post-item__type">
                    {post.post_type === 'comparison' ? '⚖️ Comparison' : '📝 Article'}
                  </span>
                  <span className="post-item__date">
                    {formatDate(post.created_at)}
                  </span>
                  {post.author && (
                    <span className="post-item__author">by {post.author}</span>
                  )}
                </div>
              </div>

              {post.excerpt && (
                <p className="post-item__excerpt">{post.excerpt}</p>
              )}

              <div className="post-item__content-preview">
                {post.content.substring(0, 200)}...
              </div>
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
