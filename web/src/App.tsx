import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import PostsList from './components/PostsList'
import PostPage from './pages/PostPage'
import './App.css'

function App() {
  return (
    <Router>
      <div className="app">
        <Sidebar />
        <div className="app-content">
          <Routes>
            <Route path="/" element={
              <>
                <header className="app-header">
                  <h1>Memesis</h1>
                  <p>Infinite scroll of memes and posts</p>
                </header>
                <main>
                  <PostsList />
                </main>
              </>
            } />
            <Route path="/post/:id" element={<PostPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  )
}

export default App
