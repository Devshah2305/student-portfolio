function ErrorMessage({ message }) {
  return (
    <div className="error-box">
      <p className="error-icon">⚠</p>
      <p className="error-title">Something went wrong</p>
      <p className="error-text">{message}</p>
    </div>
  );
}

export default ErrorMessage;