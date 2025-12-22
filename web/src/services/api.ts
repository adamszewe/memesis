import { Post } from '../types/post';
import { validatePost, validatePostsResponse } from '../utils/validation';

const API_BASE_URL = '/api';
const REQUEST_TIMEOUT = 10000; // 10 seconds

interface FetchPostsResponse {
  posts: Post[];
  page: number;
  page_size: number;
  total: number;
}

function fetchWithTimeout(url: string, timeout: number): Promise<Response> {
  return new Promise((resolve, reject) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
      reject(new Error('Request timeout'));
    }, timeout);

    fetch(url, { signal: controller.signal })
      .then(resolve)
      .catch(reject)
      .finally(() => clearTimeout(timeoutId));
  });
}

export const fetchPosts = async (page: number = 1): Promise<FetchPostsResponse> => {
  try {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/posts?page=${page}`,
      REQUEST_TIMEOUT
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const validated = validatePostsResponse(data);

    if (!validated) {
      throw new Error('Invalid response data from server');
    }

    return validated;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Error fetching posts:', error);
    }
    throw error;
  }
};

export const fetchPostById = async (id: string): Promise<Post> => {
  try {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/posts/${id}`,
      REQUEST_TIMEOUT
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const validated = validatePost(data);

    if (!validated) {
      throw new Error('Invalid post data from server');
    }

    return validated;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Error fetching post:', error);
    }
    throw error;
  }
};
