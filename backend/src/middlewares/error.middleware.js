exports.errorHandler = (err, req, res, next) => {
  console.log(`\n❌ [ERROR CATCHED] ${req.method} ${req.originalUrl}`);
  console.error("🔥 Error Message:", err.message);
  console.error(err.stack);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};