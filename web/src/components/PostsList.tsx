import { useState, useEffect } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import PostCard from './PostCard';
import { fetchPosts } from '../services/api';
import { Post } from '../types/post';
import './PostsList.css';

const PostsList = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInitialPosts();
  }, []);

  const loadInitialPosts = async () => {
    try {
      setLoading(true);
      const data = await fetchPosts(1);
      setPosts(data.posts);
      setPage(1);
      setHasMore(data.posts.length === data.page_size);
      setError(null);
    } catch (err) {
      setError('Failed to load posts. Please try again later.');
      console.error('Error loading posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMorePosts = async () => {
    try {
      const nextPage = page + 1;
      const data = await fetchPosts(nextPage);

      setPosts(prevPosts => [...prevPosts, ...data.posts]);
      setPage(nextPage);
      setHasMore(data.posts.length === data.page_size);
    } catch (err) {
      console.error('Error loading more posts:', err);
      setHasMore(false);
    }
  };

  if (loading) {
    return (
      <div className="posts-loading">
        <div className="spinner"></div>
        <p>Loading posts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="posts-error">
        <p>{error}</p>
        <button onClick={loadInitialPosts} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="posts-list-container">
      <InfiniteScroll
        dataLength={posts.length}
        next={loadMorePosts}
        hasMore={hasMore}
        loader={
          <div className="posts-loading-more">
            <div className="spinner-small"></div>
            <p>Loading more posts...</p>
          </div>
        }
        endMessage={
          <div className="posts-end-message">
            <p>You've reached the end!</p>
          </div>
        }
      >
        <div className="posts-grid">
          {posts.map((post) => (
            <PostCard key={post.ID} post={post} />
          ))}
        </div>
      </InfiniteScroll>
    </div>
  );
};

export default PostsList;
