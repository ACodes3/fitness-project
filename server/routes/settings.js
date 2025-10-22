// server/routes/settings.js
import express from "express";
import pool from "../db/db.js";

const router = express.Router();

// Get settings
router.get("/:userId", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM settings WHERE user_id = $1`,
      [req.params.userId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update settings
router.put("/:userId", async (req, res) => {
  try {
    const { theme, language, notifications } = req.body;
    await pool.query(
      `UPDATE settings SET theme=$1, language=$2, notifications=$3 WHERE user_id=$4`,
      [theme, language, notifications, req.params.userId]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
