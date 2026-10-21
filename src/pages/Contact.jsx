import { useState } from "react";

function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (form.name && form.email && form.message) {
      setSubmitted(true);
    }
  }

  function handleReset() {
    setForm({ name: "", email: "", message: "" });
    setSubmitted(false);
  }

  return (
    <div className="page">
      <div className="page-header">
        <p className="page-eyebrow">Get in touch</p>
        <h2 className="page-title">Contact</h2>
        <p className="page-subtitle">
          Open to internships, collaborations, and project work.
        </p>
      </div>

      <div className="contact-layout">
        {/* Info */}
        <div className="contact-info">
          <div className="contact-info-block">
            <p className="contact-info-label">Email</p>
            <p className="contact-info-value">devshah2305@gmail.com</p>
          </div>
          <div className="contact-info-block">
            <p className="contact-info-label">Location</p>
            <p className="contact-info-value">Ahmedabad, Gujarat</p>
          </div>
          <div className="contact-info-block">
            <p className="contact-info-label">GitHub</p>
            
             <a href="https://github.com/Devshah2305"
              target="_blank"
              rel="noopener noreferrer"
              className="contact-info-link"
            >
              github.com/Devshah2305
            </a>
          </div>
          <div className="contact-info-block">
            <p className="contact-info-label">LinkedIn</p>
            
              <a href="https://www.linkedin.com/in/devshah2305"
              target="_blank"
              rel="noopener noreferrer"
              className="contact-info-link"
            >
              linkedin.com/in/devshah2305
            </a>
          </div>
        </div>

        {/* Form */}
        <div className="contact-form-wrap">
          {!submitted ? (
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="name">Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  className="form-input"
                  placeholder="Your name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="form-input"
                  placeholder="your@email.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  className="form-input form-textarea"
                  placeholder="What's on your mind?"
                  value={form.message}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Live preview — real-time useState display */}
              {form.name && (
                <div className="form-preview">
                  <p className="form-preview-label">Preview</p>
                  <p className="form-preview-text">
                    Hi, I'm <strong>{form.name}</strong>
                    {form.email && <> ({form.email})</>}.
                    {form.message && <> {form.message}</>}
                  </p>
                </div>
              )}

              <button type="submit" className="form-submit">
                Send Message
              </button>
            </form>
          ) : (
            <div className="form-success">
              <div className="success-icon">✓</div>
              <h3 className="success-title">Message sent!</h3>
              <p className="success-text">
                Thanks <strong>{form.name}</strong>, I'll get back to you at{" "}
                <strong>{form.email}</strong> soon.
              </p>
              <button className="form-submit form-submit--outline" onClick={handleReset}>
                Send another
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Contact;