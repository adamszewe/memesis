import './Sidebar.css';

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-title">Categories</h2>
      </div>
      <nav className="sidebar-nav">
        <ul className="sidebar-menu">
          <li className="sidebar-menu-item active">
            <a href="#all" className="sidebar-link">
              All Posts
            </a>
          </li>
          <li className="sidebar-menu-item">
            <a href="#popular" className="sidebar-link">
              Popular
            </a>
          </li>
          <li className="sidebar-menu-item">
            <a href="#recent" className="sidebar-link">
              Recent
            </a>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
