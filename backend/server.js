require("dotenv").config();

const express = require("express");
const cors = require("cors");
const db = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const storeRoutes = require("./routes/storeRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Store Rating API is running" });
});

app.get("/api/test-db", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT 1 AS result");
    res.json({ message: "Database connected successfully", data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database connection failed" });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/admin", adminRoutes);

app.use((req, res) => res.status(404).json({ message: "Route not found" }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));