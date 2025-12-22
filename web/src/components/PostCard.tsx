import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Post } from '../types/post';
import { useLoadingBar } from '../contexts/LoadingBarContext';
import './PostCard.css';

interface PostCardProps {
  post: Post;
}

const PostCard = ({ post }: PostCardProps) => {
  const navigate = useNavigate();
  const { startLoading } = useLoadingBar();

  const formatDate = (dateString: string): string => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  const handleNavigateToPost = async () => {
    startLoading();

    // Minimum delay of 50ms for better UX
    await new Promise(resolve => setTimeout(resolve, 50));

    navigate(`/post/${post.Id}`);
  };

  return (
    <div className="post-card">
      <div className="post-header">
        <h2 className="post-title clickable" onClick={handleNavigateToPost}>{post.Title}</h2>
        
        {post.Categories && post.Categories.length > 0 && (
          <div className="post-categories">
            {post.Categories.map((category, index) => (
              <span key={index} className="post-category">
                #{category.Name}
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
