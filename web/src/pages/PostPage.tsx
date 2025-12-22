import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchPostById } from '../services/api';
import { Post } from '../types/post';
import { useLoadingBar } from '../contexts/LoadingBarContext';
import PostCard from '../components/PostCard';
import PageContainer from '../components/PageContainer';
import './PostPage.css';

const PostPage = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { stopLoading } = useLoadingBar();

  useEffect(() => {
    const loadPost = async () => {
      if (!id) {
        setError('Post ID is missing');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await fetchPostById(id);
        setPost(data);
        setError(null);
      } catch (err) {
        setError('Failed to load post');
        console.error('Error loading post:', err);
      } finally {
        setLoading(false);
        stopLoading();
      }
    };

    loadPost();
  }, [id, stopLoading]);


  if (loading) {
    return (
      <PageContainer>
        <div className="post-page-loading">Loading...</div>
      </PageContainer>
    );
  }

  if (error || !post) {
    return (
      <PageContainer>
        <div className="post-page-error">
          <h2>{error || 'Post not found'}</h2>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PostCard post={post} />
    </PageContainer>
  );
};

export default PostPage;
