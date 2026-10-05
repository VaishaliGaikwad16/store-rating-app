const db = require("../config/db");
const bcrypt = require("bcrypt");
const {
  isValidEmail,
  isValidPassword,
  validateName,
  validateAddress
} = require("../utils/validation");

async function dashboard(req, res) {
  try {
    const [[users]] = await db.query("SELECT COUNT(*) AS count FROM users");
    const [[stores]] = await db.query("SELECT COUNT(*) AS count FROM stores");
    const [[ratings]] = await db.query("SELECT COUNT(*) AS count FROM ratings");
    res.json({
      totalUsers: users.count,
      totalStores: stores.count,
      totalRatings: ratings.count
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not load statistics" });
  }
}

async function users(req, res) {
  try {
    const search = `%${req.query.search || ""}%`;
    const [rows] = await db.query(
      `SELECT id,name,email,address,role,created_at
       FROM users
       WHERE name LIKE ? OR email LIKE ? OR address LIKE ?
       ORDER BY name`,
      [search, search, search]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Could not load users" });
  }
}

async function stores(req, res) {
  try {
    const search = `%${req.query.search || ""}%`;
    const [rows] = await db.query(
      `SELECT s.id,s.name,s.email,s.address,
              u.name AS owner_name,u.email AS owner_email,
              ROUND(COALESCE(AVG(r.rating),0),2) AS average_rating,
              COUNT(r.id) AS total_ratings
       FROM stores s
       JOIN users u ON u.id=s.owner_id
       LEFT JOIN ratings r ON r.store_id=s.id
       WHERE s.name LIKE ? OR s.email LIKE ? OR s.address LIKE ?
       GROUP BY s.id
       ORDER BY s.name`,
      [search, search, search]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Could not load stores" });
  }
}

async function createUser(req, res) {
  try {
    const { name, email, password, address, role } = req.body;

    if (!["ADMIN", "USER", "OWNER"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }
    if (!validateName(name)) return res.status(400).json({ message: "Name must be 20-60 characters" });
    if (!isValidEmail(email)) return res.status(400).json({ message: "Invalid email" });
    if (!isValidPassword(password)) return res.status(400).json({ message: "Invalid password format" });
    if (address && !validateAddress(address)) return res.status(400).json({ message: "Address too long" });

    const [existing] = await db.query("SELECT id FROM users WHERE email=?", [email.toLowerCase()]);
    if (existing.length) return res.status(409).json({ message: "Email already exists" });

    const hash = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      "INSERT INTO users(name,email,password,address,role) VALUES(?,?,?,?,?)",
      [name.trim(), email.toLowerCase(), hash, address?.trim() || null, role]
    );

    res.status(201).json({ message: "User created", id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not create user" });
  }
}

async function createStore(req, res) {
  try {
    const { name, email, address, ownerId } = req.body;

    if (!validateName(name)) return res.status(400).json({ message: "Store name must be 20-60 characters" });
    if (!isValidEmail(email)) return res.status(400).json({ message: "Invalid email" });
    if (!address || !validateAddress(address)) return res.status(400).json({ message: "Address is required and max 400 characters" });

    const [owner] = await db.query("SELECT id FROM users WHERE id=? AND role='OWNER'", [ownerId]);
    if (!owner.length) return res.status(400).json({ message: "A valid OWNER user is required" });

    const [result] = await db.query(
      "INSERT INTO stores(name,email,address,owner_id) VALUES(?,?,?,?)",
      [name.trim(), email.toLowerCase(), address.trim(), ownerId]
    );

    res.status(201).json({ message: "Store created", id: result.insertId });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") return res.status(409).json({ message: "Store email already exists" });
    console.error(err);
    res.status(500).json({ message: "Could not create store" });
  }
}

async function ownerRatings(req, res) {
  try {
    const [rows] = await db.query(
      `SELECT s.name AS store_name,u.name AS user_name,u.email,r.rating,r.updated_at
       FROM ratings r
       JOIN stores s ON s.id=r.store_id
       JOIN users u ON u.id=r.user_id
       WHERE s.owner_id=?
       ORDER BY r.updated_at DESC`,
      [req.params.ownerId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Could not load owner ratings" });
  }
}

module.exports = { dashboard, users, stores, createUser, createStore, ownerRatings };