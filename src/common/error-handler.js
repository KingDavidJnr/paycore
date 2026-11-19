function errorHandler(error, req, res, next) {
  const status = error.statusCode || 500;
  res.status(status).json({
    success: false,
    error: { code: error.code || 'INTERNAL_ERROR', message: error.message }
  });
}

module.exports = { errorHandler };
