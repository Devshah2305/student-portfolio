// middleware/validate.js

// Validates POST/PUT task body — title must be present and non-empty
const validateTask = (req, res, next) => {
  const { title } = req.body;

  if (!title || typeof title !== "string" || title.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: { title: "Title is required and must be a non-empty string." },
    });
  }

  if (title.trim().length > 100) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: { title: "Title must be 100 characters or fewer." },
    });
  }

  next();
};

// Validates register/login body
const validateAuthInput = (req, res, next) => {
  const { username, password } = req.body;

  const errors = {};

  if (!username || typeof username !== "string" || username.trim().length < 3) {
    errors.username = "Username must be at least 3 characters.";
  }

  if (!password || typeof password !== "string" || password.length < 6) {
    errors.password = "Password must be at least 6 characters.";
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  next();
};

module.exports = { validateTask, validateAuthInput };