const express = require("express");
const { authenticate, authorize } = require("../middleware/auth");
const {
  dashboard, users, stores, createUser, createStore, ownerRatings
} = require("../controllers/adminController");

const router = express.Router();

router.use(authenticate, authorize("ADMIN"));
router.get("/dashboard", dashboard);
router.get("/users", users);
router.get("/stores", stores);
router.post("/users", createUser);
router.post("/stores", createStore);
router.get("/owner/:ownerId/ratings", ownerRatings);

module.exports = router;
