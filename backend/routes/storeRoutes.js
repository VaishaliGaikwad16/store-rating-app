const express = require("express");
const { authenticate, authorize } = require("../middleware/auth");
const { listStores, rateStore, ownerDashboard } = require("../controllers/storeController");

const router = express.Router();

router.get("/", authenticate, authorize("USER"), listStores);
router.post("/:id/rating", authenticate, authorize("USER"), rateStore);
router.get("/owner/dashboard", authenticate, authorize("OWNER"), ownerDashboard);

module.exports = router;
