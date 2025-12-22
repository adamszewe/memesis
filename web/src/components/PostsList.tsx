import { useState, useEffect } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import PostCard from './PostCard';
import PageContainer from './PageContainer';
import { fetchPosts } from '../services/api';
import { Post } from '../types/post';
import './PostsList.css';

const PostsList = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial posts on mount (only if we don't have posts already)
  useEffect(() => {
    // Check if we have cached posts from a previous session
    const cachedPosts = sessionStorage.getItem('postsListData');
    if (cachedPosts && posts.length === 0) {
      try {
        const data = JSON.parse(cachedPosts);
        setPosts(data.posts);
        setPage(data.page);
        setHasMore(data.hasMore);
        setLoading(false);
        console.log('[PostsList] Restored from cache:', data.posts.length, 'posts, page', data.page);
        return;
      } catch (err) {
        console.error('[PostsList] Failed to restore from cache:', err);
      }
    }

    // Only load if we don't have posts
    if (posts.length === 0) {
      loadInitialPosts();
    }
  }, []);

  const loadInitialPosts = async () => {
    try {
      setLoading(true);
      const data = await fetchPosts(1);

      // Check if data and posts array exist
      if (!data || !data.posts || !Array.isArray(data.posts)) {
        throw new Error('Invalid data received from API');
      }

      setPosts(data.posts);
      setPage(1);
      const hasMoreData = data.posts.length === data.page_size;
      setHasMore(hasMoreData);
      setError(null);

      // Cache the state
      sessionStorage.setItem('postsListData', JSON.stringify({
        posts: data.posts,
        page: 1,
        hasMore: hasMoreData
      }));
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

      // Check if data and posts array exist
      if (!data || !data.posts || !Array.isArray(data.posts)) {
        console.warn('Invalid data received from API:', data);
        setHasMore(false);
        return;
      }

      const newPosts = [...posts, ...data.posts];
      setPosts(newPosts);
      setPage(nextPage);
      const hasMoreData = data.posts.length === data.page_size;
      setHasMore(hasMoreData);

      // Cache the state
      sessionStorage.setItem('postsListData', JSON.stringify({
        posts: newPosts,
        page: nextPage,
        hasMore: hasMoreData
      }));
    } catch (err) {
      console.error('Error loading more posts:', err);
      setHasMore(false);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="posts-loading">
          <div className="spinner"></div>
          <p>Loading posts...</p>
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <div className="posts-error">
          <p>{error}</p>
          <button onClick={loadInitialPosts} className="retry-button">
            Retry
          </button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
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
            <PostCard key={post.Id} post={post} />
          ))}
        </div>
      </InfiniteScroll>
    </PageContainer>
  );
};

export default PostsList;
