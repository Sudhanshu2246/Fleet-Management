// Core imports
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

// Load env variables
dotenv.config();

// Initialize app
const app = express();

// ─── Middlewares ───────────────────────────
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// ─── Routes ────────────────────────────────
const routes = require("./routes");
const { errorHandler } = require("./middlewares/error.middleware");
app.use("/api/v1", routes);

// ─── Health Check ─────────────────────────
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running 🚀",
  });
});

// ─── 404 Handler ──────────────────────────
app.use((req, res, next) => {
  const error = new Error("Route not found");
  error.statusCode = 404;
  next(error); // ⬅️ pass to error handler
});

// ─── Global Error Handler (LAST) ──────────
app.use(errorHandler);

module.exports = app;