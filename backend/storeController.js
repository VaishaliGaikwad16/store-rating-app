const db = require("../config/db");

async function listStores(req, res) {
  try {
    const search = `%${req.query.search || ""}%`;
    const sort = ["name", "address", "average_rating"].includes(req.query.sort)
      ? req.query.sort
      : "name";
    const direction = req.query.order === "desc" ? "DESC" : "ASC";

    const [rows] = await db.query(
      `SELECT s.id, s.name, s.email, s.address,
        ROUND(COALESCE(AVG(r.rating),0),2) AS average_rating,
        MAX(CASE WHEN r.user_id = ? THEN r.rating END) AS my_rating
       FROM stores s
       LEFT JOIN ratings r ON r.store_id=s.id
       WHERE s.name LIKE ? OR s.address LIKE ?
       GROUP BY s.id
       ORDER BY ${sort} ${direction}`,
      [req.user.id, search, search]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not load stores" });
  }
}

async function rateStore(req, res) {
  try {
    const storeId = Number(req.params.id);
    const rating = Number(req.body.rating);

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be an integer from 1 to 5" });
    }

    const [store] = await db.query("SELECT id FROM stores WHERE id=?", [storeId]);
    if (!store.length) return res.status(404).json({ message: "Store not found" });

    await db.query(
      `INSERT INTO ratings (user_id,store_id,rating)
       VALUES (?,?,?)
       ON DUPLICATE KEY UPDATE rating=VALUES(rating), updated_at=CURRENT_TIMESTAMP`,
      [req.user.id, storeId, rating]
    );

    res.json({ message: "Rating saved successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not save rating" });
  }
}

async function ownerDashboard(req, res) {
  try {
    const [stores] = await db.query(
      "SELECT id,name,email,address FROM stores WHERE owner_id=?",
      [req.user.id]
    );

    const result = [];
    for (const store of stores) {
      const [ratings] = await db.query(
        `SELECT u.name AS user_name, u.email, r.rating, r.updated_at
         FROM ratings r JOIN users u ON u.id=r.user_id
         WHERE r.store_id=? ORDER BY r.updated_at DESC`,
        [store.id]
      );
      const [avg] = await db.query(
        "SELECT ROUND(COALESCE(AVG(rating),0),2) AS average_rating, COUNT(*) AS total_ratings FROM ratings WHERE store_id=?",
        [store.id]
      );
      result.push({ ...store, summary: avg[0], ratings });
    }

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not load owner dashboard" });
  }
}

module.exports = { listStores, rateStore, ownerDashboard };