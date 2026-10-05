const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const {
  isValidEmail,
  isValidPassword,
  validateName,
  validateAddress
} = require("../utils/validation");

function createToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role, name: user.name, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "2h" }
  );
}

async function register(req, res) {
  try {
    const { name, email, password, address } = req.body;

    if (!validateName(name)) {
      return res.status(400).json({ message: "Name must be 20-60 characters" });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Enter a valid email" });
    }
    if (!isValidPassword(password)) {
      return res.status(400).json({
        message: "Password must be 8-16 characters with an uppercase letter and special character"
      });
    }
    if (address && !validateAddress(address)) {
      return res.status(400).json({ message: "Address cannot exceed 400 characters" });
    }

    const [existing] = await db.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hash = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      "INSERT INTO users (name,email,password,address,role) VALUES (?,?,?,?,?)",
      [name.trim(), email.toLowerCase(), hash, address?.trim() || null, "USER"]
    );

    res.status(201).json({ message: "Registration successful", userId: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [
      email?.toLowerCase()
    ]);

    if (!rows.length || !(await bcrypt.compare(password || "", rows[0].password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = rows[0];
    const token = createToken(user);

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!isValidPassword(newPassword)) {
      return res.status(400).json({
        message: "New password must be 8-16 characters with an uppercase letter and special character"
      });
    }

    const [rows] = await db.query("SELECT password FROM users WHERE id = ?", [req.user.id]);
    if (!rows.length || !(await bcrypt.compare(currentPassword || "", rows[0].password))) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    const hash = await bcrypt.hash(newPassword, 10);
    await db.query("UPDATE users SET password=? WHERE id=?", [hash, req.user.id]);

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = { register, login, changePassword };