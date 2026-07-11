const loggerMiddleware = (req, res, next) => {
  const start = Date.now();
  console.log(`\n➡️  [${req.method}] ${req.originalUrl}`);
  if (req.body && Object.keys(req.body).length) {
    console.log("📦 Request Body:", JSON.stringify(req.body, null, 2));
  }

  // Intercept res.json to log the response
  const originalJson = res.json;
  res.json = function (body) {
    const duration = Date.now() - start;
    const statusColor = res.statusCode >= 400 ? "🔴" : "🟢";
    
    console.log(`⬅️  ${statusColor} [${res.statusCode}] Response in ${duration}ms:`);
    console.log(JSON.stringify(body, null, 2));
    
    return originalJson.call(this, body);
  };

  next();
};

module.exports = loggerMiddleware;
