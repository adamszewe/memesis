import { Post } from '../types/post';

const API_BASE_URL = '/api';

interface FetchPostsResponse {
  posts: Post[];
  page: number;
  page_size: number;
  total: number;
}

export const fetchPosts = async (page: number = 1): Promise<FetchPostsResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/posts?page=${page}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: FetchPostsResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
};
