import { useNavigate } from 'react-router-dom';
import { Post } from '../types/post';
import './PostCard.css';

interface PostCardProps {
  post: Post;
}

const PostCard = ({ post }: PostCardProps) => {
  const navigate = useNavigate();

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleNavigateToPost = () => {
    navigate(`/post/${post.Id}`);
  };

  return (
    <div className="post-card">
      <div className="post-header">
        <h2 className="post-title clickable" onClick={handleNavigateToPost}>{post.Title}</h2>
        
        {post.Tags && post.Tags.length > 0 && (
          <div className="post-tags">
            {post.Tags.map((tag, index) => (
              <span key={index} className="post-tag">
                #{tag.Name}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="post-image-container clickable" onClick={handleNavigateToPost}>
        {post.ImageUrl ? (
          <img
            src={post.ImageUrl}
            alt={post.Title}
            className="post-image"
            loading="lazy"
          />
        ) : (
          <div className="post-image-placeholder">No Image</div>
        )}
      </div>

      <div className="post-content">
        {post.Description && (
          <p className="post-description">{post.Description}</p>
        )}

        <div className="post-meta">
          <span className="post-date">{formatDate(post.CreatedAt)}</span>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
