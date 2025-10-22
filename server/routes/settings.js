import express from "express";
import pool from "../db/db.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// Get user settings
router.get("/:userId", verifyToken, async (req, res) => {
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
router.put("/:userId", verifyToken, async (req, res) => {
  try {
    const { theme, language, notifications } = req.body;
    await pool.query(
      `UPDATE settings SET theme=$1, language=$2, notifications=$3 WHERE user_id=$4`,
      [theme, language, notifications, req.params.userId]
    );
    res.json({ message: "Settings updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
