// 404 handler
exports.notFound = (req, res, next) => {
  const error = new Error(`Not Found: ${req.originalUrl}`);
  error.status = 404;
  next(error);
};

// Global error handler
exports.errorHandler = (err, req, res, next) => {
  const statusCode = err.status || err.statusCode || 500;
  const isAjax = req.headers['x-requested-with'] === 'XMLHttpRequest';

  // Mongoose validation error
  let message = err.message || 'Internal Server Error';
  if (err.name === 'ValidationError') {
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
  }
  if (err.name === 'CastError') {
    message = `Invalid ${err.path}: ${err.value}`;
  }

  if (process.env.NODE_ENV === 'development') {
    console.error(`[${statusCode}] ${message}`);
  }

  if (isAjax) {
    return res.status(statusCode).json({ success: false, message });
  }

  return res.status(statusCode).render('error', {
    message,
    layout: 'layouts/main',
  });
};
