function Spinner() {
  return (
    <div className="spinner-wrap">
      <div className="spinner" />
      <p className="spinner-text">Fetching repositories...</p>
    </div>
  );
}

export default Spinner;