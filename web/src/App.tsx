import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Sidebar from './components/Sidebar'
import PostsList from './components/PostsList'
import PostPage from './pages/PostPage'
import LoadingBar from './components/LoadingBar'
import { LoadingBarProvider, useLoadingBar } from './contexts/LoadingBarContext'
import './App.css'

function AppContent() {
  const location = useLocation();
  const isPostDetailPage = location.pathname.startsWith('/post/');
  const { isLoading } = useLoadingBar();

  // Prevent body scroll when overlay is active to maintain scroll position
  useEffect(() => {
    if (isPostDetailPage) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isPostDetailPage]);

  return (
    <div className="app">
      <LoadingBar isLoading={isLoading} />

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
        {/* Always render and keep PostsList visible */}
        <PostsList />

        {/* Overlay PostPage on top when viewing a post */}
        {isPostDetailPage && (
          <div className="post-page-overlay">
            <Routes>
              <Route path="/post/:id" element={<PostPage />} />
            </Routes>
          </div>
        )}
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
      <LoadingBarProvider>
        <AppContent />
      </LoadingBarProvider>
    </Router>
  )
}

export default App
