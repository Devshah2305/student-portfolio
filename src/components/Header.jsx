function Header({ name, title, github, linkedin }) {
  return (
    <header className="header">
      <div className="header-inner">
        <div className="header-left">
          <p className="header-eyebrow">Portfolio</p>
          <h1 className="header-name">{name}</h1>
          <p className="header-title">{title}</p>
        </div>
        <nav className="header-nav">
          <a href={github} target="_blank" rel="noopener noreferrer" className="nav-link">
            GitHub
          </a>
          <a href={linkedin} target="_blank" rel="noopener noreferrer" className="nav-link">
            LinkedIn
          </a>
        </nav>
      </div>
    </header>
  );
}

export default Header;