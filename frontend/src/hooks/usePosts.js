/**
 * Custom React hook for fetching and managing posts.
 * 
 * This hook encapsulates the logic for loading post data from the
 * static JSON export, handling loading states, and caching results.
 */
import { useState, useEffect } from 'react';
import { loadPosts, loadPostBySlug } from '../data/index.js';

/**
 * Hook to fetch all posts
 * @returns {Object} Object with posts array, loading state, and error
 */
export function useAllPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await loadPosts();
        setPosts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return { posts, loading, error };
}

/**
 * Hook to fetch a single post by slug
 * @param {string} slug - The post slug
 * @returns {Object} Object with post, loading state, and error
 */
export function usePost(slug) {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }

    const fetchPost = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await loadPostBySlug(slug);
        if (!data) {
          throw new Error('Post not found');
        }
        setPost(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  return { post, loading, error };
}
