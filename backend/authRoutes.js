const express = require("express");
const { register, login, changePassword } = require("../controllers/authController");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.put("/password", authenticate, changePassword);

module.exports = router;