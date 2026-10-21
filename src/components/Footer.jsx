function Footer({ github, linkedin }) {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <p className="footer-text">Dev Shah © {new Date().getFullYear()}</p>
        <div className="footer-links">
          <a href={github} target="_blank" rel="noopener noreferrer" className="footer-link">GitHub</a>
          <a href={linkedin} target="_blank" rel="noopener noreferrer" className="footer-link">LinkedIn</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;