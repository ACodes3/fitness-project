// server/routes/profile.js
import express from "express";
import pool from "../db/db.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// Protected route — requires valid token
router.get("/:userId", verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.name, u.email, u.role, u.location, u.joined_at, u.avatar_url,
              f.weight_kg, f.height_cm, f.goal, f.bmi
       FROM users u
       LEFT JOIN fitness_profile f ON u.id = f.user_id
       WHERE u.id = $1`,
      [req.params.userId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update profile info
router.put("/:userId", async (req, res) => {
  try {
    const { name, email, role, location, weight_kg, height_cm, goal } =
      req.body;

    await pool.query(
      `UPDATE users SET name=$1, email=$2, role=$3, location=$4 WHERE id=$5`,
      [name, email, role, location, req.params.userId]
    );

    await pool.query(
      `UPDATE fitness_profile
       SET weight_kg=$1, height_cm=$2, goal=$3, updated_at=NOW()
       WHERE user_id=$4`,
      [weight_kg, height_cm, goal, req.params.userId]
    );

    res.json({ success: true, message: "Profile updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
