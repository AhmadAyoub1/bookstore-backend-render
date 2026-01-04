const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./config/database");
const booksRoutes = require("./routes/books");
const cartRoutes = require("./routes/cart");
const ordersRoutes = require("./routes/orders");
const adminAuthRoutes = require("./routes/adminAuth");

const app = express();

// IMPORTANT: Render uses process.env.PORT
const PORT = process.env.PORT || 5000;

// CORS: allow requests from Vercel & localhost
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use("/api/books", booksRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/admin", adminAuthRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Something went wrong!" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
