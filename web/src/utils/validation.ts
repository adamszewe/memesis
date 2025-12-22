import { Post } from '../types/post';

export function isValidUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
  } catch {
    return false;
  }
}

export function sanitizeImageUrl(url: string): string | null {
  if (!url || typeof url !== 'string') {
    return null;
  }

  if (!isValidUrl(url)) {
    return null;
  }

  return url;
}

export function validatePost(data: unknown): Post | null {
  if (!data || typeof data !== 'object') {
    return null;
  }

  const post = data as Record<string, unknown>;

  if (
    typeof post.Id !== 'string' ||
    typeof post.Title !== 'string' ||
    typeof post.Description !== 'string' ||
    typeof post.ImageUrl !== 'string' ||
    typeof post.CreatedAt !== 'string' ||
    !Array.isArray(post.Categories)
  ) {
    return null;
  }

  const sanitizedImageUrl = sanitizeImageUrl(post.ImageUrl);
  if (!sanitizedImageUrl) {
    return null;
  }

  return {
    Id: post.Id,
    Title: post.Title,
    Description: post.Description,
    ImageUrl: sanitizedImageUrl,
    Categories: post.Categories.filter(
      (cat: unknown) =>
        typeof cat === 'object' &&
        cat !== null &&
        'Name' in cat &&
        typeof cat.Name === 'string'
    ),
    CreatedAt: post.CreatedAt,
    UpdatedAt: typeof post.UpdatedAt === 'string' ? post.UpdatedAt : undefined,
  };
}

export function validatePostsResponse(data: unknown): { posts: Post[]; page: number; page_size: number; total: number } | null {
  if (!data || typeof data !== 'object') {
    return null;
  }

  const response = data as Record<string, unknown>;

  if (
    typeof response.page !== 'number' ||
    typeof response.page_size !== 'number'
  ) {
    return null;
  }

  // Handle both null and array for posts
  const postsArray = Array.isArray(response.posts) ? response.posts : [];

  const validatedPosts = postsArray
    .map(validatePost)
    .filter((post): post is Post => post !== null);

  return {
    posts: validatedPosts,
    page: response.page,
    page_size: response.page_size,
    total: typeof response.total_shown === 'number' ? response.total_shown : validatedPosts.length,
  };
}
