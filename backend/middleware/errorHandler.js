function errorHandler(err, req, res, next) {
  // Default to 500
  const status = err.status || 500;
  // Don't leak stack traces in production
  const response = {
    error: err.message || 'Internal Server Error'
  };

  // Handle common CORS error message
  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({ error: err.message });
  }

  // Validation errors may be passed with a 'errors' array
  if (err.errors && Array.isArray(err.errors)) {
    return res.status(400).json({ error: 'Validation failed', details: err.errors });
  }

  res.status(status).json(response);
}

module.exports = errorHandler;
