import PostsList from './components/PostsList'
import './App.css'

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Memesis</h1>
        <p>Infinite scroll of memes and posts</p>
      </header>
      <main>
        <PostsList />
      </main>
    </div>
  )
}

export default App
