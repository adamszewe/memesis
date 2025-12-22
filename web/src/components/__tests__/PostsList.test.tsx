import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';
import PostsList from '../PostsList';
import { LoadingBarProvider } from '../../contexts/LoadingBarContext';
import * as api from '../../services/api';

// Mock the API
vi.mock('../../services/api');

// Helper to render with required providers
function renderWithProviders(component: React.ReactElement) {
  return render(
    <BrowserRouter>
      <LoadingBarProvider>
        {component}
      </LoadingBarProvider>
    </BrowserRouter>
  );
}

const mockPosts = [
  {
    Id: 'post-1',
    Title: 'Test Post 1',
    ImageUrl: 'https://example.com/image1.jpg',
    Description: 'Test description 1',
    CreatedAt: '2024-01-01T00:00:00Z',
    Categories: [{ Id: 'cat-1', Name: 'memes', IconUrl: '' }]
  },
  {
    Id: 'post-2',
    Title: 'Test Post 2',
    ImageUrl: 'https://example.com/image2.jpg',
    Description: 'Test description 2',
    CreatedAt: '2024-01-02T00:00:00Z',
    Categories: [{ Id: 'cat-2', Name: 'funny', IconUrl: '' }]
  }
];

describe('PostsList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset sessionStorage mock
    vi.mocked(sessionStorage.getItem).mockReturnValue(null);
    vi.mocked(sessionStorage.setItem).mockImplementation(() => {});
  });

  it('should load and display posts on initial mount', async () => {
    vi.mocked(api.fetchPosts).mockResolvedValueOnce({
      posts: mockPosts,
      page: 1,
      page_size: 25,
      total: 2
    });

    renderWithProviders(<PostsList />);

    await waitFor(() => {
      expect(screen.getByText('Test Post 1')).toBeInTheDocument();
      expect(screen.getByText('Test Post 2')).toBeInTheDocument();
    });
  });

  it('should restore posts from sessionStorage cache instead of fetching', async () => {
    // Pre-populate sessionStorage with cached data
    const cachedData = {
      posts: mockPosts,
      page: 1,
      hasMore: true
    };

    // Mock sessionStorage to return the cached data
    vi.mocked(sessionStorage.getItem).mockReturnValue(JSON.stringify(cachedData));

    const fetchPostsSpy = vi.mocked(api.fetchPosts);

    renderWithProviders(<PostsList />);

    // Should display cached posts immediately
    await waitFor(() => {
      expect(screen.getByText('Test Post 1')).toBeInTheDocument();
    });

    // Should NOT have called the API
    expect(fetchPostsSpy).not.toHaveBeenCalled();
  });

  it('should cache posts to sessionStorage when loading', async () => {
    vi.mocked(api.fetchPosts).mockResolvedValueOnce({
      posts: mockPosts,
      page: 1,
      page_size: 25,
      total: 2
    });

    renderWithProviders(<PostsList />);

    await waitFor(() => {
      expect(screen.getByText('Test Post 1')).toBeInTheDocument();
    });

    // Verify sessionStorage.setItem was called with the posts data
    expect(sessionStorage.setItem).toHaveBeenCalledWith(
      'postsListData',
      expect.stringContaining('"posts"')
    );
  });

  it('should preserve component state when hidden with display:none', async () => {
    vi.mocked(api.fetchPosts).mockResolvedValueOnce({
      posts: mockPosts,
      page: 1,
      page_size: 25,
      total: 2
    });

    render(
        <BrowserRouter>
          <LoadingBarProvider>
            <div data-testid="wrapper">
              <PostsList/>
            </div>
          </LoadingBarProvider>
        </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Post 1')).toBeInTheDocument();
    });

    // Hide the component
    const wrapper = screen.getByTestId('wrapper');
    (wrapper as HTMLElement).style.display = 'none';

    // Show it again
    (wrapper as HTMLElement).style.display = 'block';

    // Posts should still be there (component didn't remount)
    expect(screen.getByText('Test Post 1')).toBeInTheDocument();
    expect(screen.getByText('Test Post 2')).toBeInTheDocument();

    // Should not have fetched again
    expect(vi.mocked(api.fetchPosts)).toHaveBeenCalledTimes(1);
  });
});
