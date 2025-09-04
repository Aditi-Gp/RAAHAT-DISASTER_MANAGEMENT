const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error
  let error = {
    statusCode: 500,
    message: 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  };

  // Prisma errors
  if (err.code === 'P2002') {
    error = {
      statusCode: 409,
      message: 'Resource already exists',
      field: err.meta?.target?.[0] || 'unknown'
    };
  } else if (err.code === 'P2025') {
    error = {
      statusCode: 404,
      message: 'Resource not found'
    };
  } else if (err.code === 'P2003') {
    error = {
      statusCode: 400,
      message: 'Foreign key constraint failed'
    };
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    error = {
      statusCode: 400,
      message: 'Validation Error',
      errors: messages
    };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = {
      statusCode: 401,
      message: 'Invalid token'
    };
  }

  if (err.name === 'TokenExpiredError') {
    error = {
      statusCode: 401,
      message: 'Token expired'
    };
  }

  // Custom error
  if (err.statusCode) {
    error.statusCode = err.statusCode;
    error.message = err.message;
  }

  res.status(error.statusCode).json({
    error: error.message,
    ...(error.errors && { errors: error.errors }),
    ...(error.field && { field: error.field }),
    ...(error.stack && { stack: error.stack }),
    timestamp: new Date().toISOString(),
    path: req.originalUrl
  });
};

// Not found handler
const notFound = (req, res, next) => {
  const error = new Error(`Route ${req.originalUrl} not found`);
  error.statusCode = 404;
  next(error);
};

module.exports = { errorHandler, notFound };
