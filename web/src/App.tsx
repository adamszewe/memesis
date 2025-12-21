import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import Sidebar from './components/Sidebar'
import PostsList from './components/PostsList'
import PostPage from './pages/PostPage'
import './App.css'

function AppContent() {
  const location = useLocation();
  const isPostDetailPage = location.pathname.startsWith('/post/');
  const savedScrollPosition = useRef<number>(0);

  // Disable browser's automatic scroll restoration
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  // Continuously save scroll position as user scrolls (only on home page)
  useEffect(() => {
    if (!isPostDetailPage) {
      const handleScroll = () => {
        const currentScroll = window.scrollY;

        // Ignore scroll to 0 if we have a saved position > 0
        // This prevents React Router's navigation scroll from overwriting our saved position
        if (currentScroll === 0 && savedScrollPosition.current > 0) {
          return;
        }

        savedScrollPosition.current = currentScroll;
      };

      window.addEventListener('scroll', handleScroll);
      return () => {
        window.removeEventListener('scroll', handleScroll);
      };
    }
  }, [isPostDetailPage]);

  // Handle scroll position when navigating between pages
  useEffect(() => {
    if (isPostDetailPage) {
      // Scroll to top for post detail page
      window.scrollTo(0, 0);
    } else if (savedScrollPosition.current > 0) {
      // Restore scroll position when showing posts list
      // Use requestAnimationFrame to ensure it runs after React Router's scroll reset
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          window.scrollTo(0, savedScrollPosition.current);
        });
      });
    }
  }, [isPostDetailPage]);

  return (
    <div className="app">
      {/* Fixed header at top left */}
      <header className="app-header-fixed">
        <h1>Memesis</h1>
        <p>Infinite scroll of memes and posts</p>
      </header>

      {/* Sidebar below header on the left */}
      <div className="app-sidebar-container">
        <Sidebar />
      </div>

      {/* Main scrollable content area */}
      <div className="app-content">
        {/* Always render PostsList, but hide it when viewing a post */}
        <div style={{ display: isPostDetailPage ? 'none' : 'block' }}>
          <main>
            <PostsList />
          </main>
        </div>

        {/* Render PostPage when on a post detail route */}
        <Routes>
          <Route path="/post/:id" element={<PostPage />} />
        </Routes>
      </div>

      {/* Right sidebar */}
      <div className="app-right-sidebar">
        <div className="right-sidebar">
          {/* Right sidebar content placeholder */}
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App
