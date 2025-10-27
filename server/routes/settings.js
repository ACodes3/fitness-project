import express from "express";
import pool from "../db/db.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// Get user settings
router.get("/:userId", verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await pool.query(
      `SELECT * FROM settings WHERE user_id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      // Return sensible defaults if no row exists yet
      return res.json({
        user_id: Number(userId),
        theme: "Light",
        language: "English",
        notifications: { emailAlerts: true, smsNotifications: false },
      });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update settings
router.put("/:userId", verifyToken, async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const { theme, language } = req.body;
    let { notifications } = req.body;

    // 🧩 Ensure notifications is parsed (avoid "invalid input syntax for type json")
    if (typeof notifications === "string") {
      notifications = JSON.parse(notifications);
    }

    // 🧩 Validate data
    if (!theme || !language) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const upsert = await pool.query(
      `INSERT INTO settings (user_id, theme, language, notifications)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id)
       DO UPDATE SET theme = EXCLUDED.theme,
                     language = EXCLUDED.language,
                     notifications = EXCLUDED.notifications
       RETURNING *`,
      [userId, theme, language, notifications]
    );

    res.json({ message: "Settings saved", settings: upsert.rows[0] });
  } catch (err) {
    console.error("❌ Error updating settings:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
