import Sidebar from './components/Sidebar'
import PostsList from './components/PostsList'
import './App.css'

function App() {
  return (
    <div className="app">
      <Sidebar />
      <div className="app-content">
        <header className="app-header">
          <h1>Memesis</h1>
          <p>Infinite scroll of memes and posts</p>
        </header>
        <main>
          <PostsList />
        </main>
      </div>
    </div>
  )
}

export default App
