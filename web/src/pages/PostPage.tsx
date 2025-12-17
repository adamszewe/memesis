import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchPostById } from '../services/api';
import { Post } from '../types/post';
import './PostPage.css';

const PostPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      }
    };

    loadPost();
  }, [id]);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="post-page">
        <div className="post-page-loading">Loading...</div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="post-page">
        <div className="post-page-error">
          <h2>{error || 'Post not found'}</h2>
          <button onClick={() => navigate('/')} className="back-button">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="post-page">
      <div className="post-page-header">
        <button onClick={() => navigate('/')} className="back-button">
          ← Back to Posts
        </button>
      </div>

      <article className="post-page-content">
        <header className="post-page-title-section">
          <h1 className="post-page-title">{post.Title}</h1>
          
          {post.Tags && post.Tags.length > 0 && (
            <div className="post-page-tags">
              {post.Tags.map((tag, index) => (
                <span key={index} className="post-page-tag">
                  #{tag.Name}
                </span>
              ))}
            </div>
          )}

          <div className="post-page-meta">
            <span className="post-page-date">{formatDate(post.CreatedAt)}</span>
          </div>
        </header>

        <div className="post-page-image-container">
          {post.ImageUrl ? (
            <img
              src={post.ImageUrl}
              alt={post.Title}
              className="post-page-image"
            />
          ) : (
            <div className="post-page-image-placeholder">No Image</div>
          )}
        </div>

        {post.Description && (
          <div className="post-page-description">
            <p>{post.Description}</p>
          </div>
        )}
      </article>
    </div>
  );
};

export default PostPage;
