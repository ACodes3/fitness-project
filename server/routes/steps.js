// server/routes/steps.js
import express from "express";
import pool from "../db/db.js";

const router = express.Router();

// Get latest step logs
router.get("/:userId", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM steps_logs WHERE user_id = $1 ORDER BY step_date DESC LIMIT 30`,
      [req.params.userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add / update a step entry
router.post("/", async (req, res) => {
  try {
    const { user_id, step_date, steps_count } = req.body;
    const distance_km = steps_count * 0.0008;
    const calories_burned = steps_count * 0.04;

    const result = await pool.query(
      `INSERT INTO steps_logs (user_id, step_date, steps_count, distance_km, calories_burned)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id, step_date)
       DO UPDATE SET steps_count = EXCLUDED.steps_count,
                     distance_km = EXCLUDED.distance_km,
                     calories_burned = EXCLUDED.calories_burned
       RETURNING *`,
      [user_id, step_date, steps_count, distance_km, calories_burned]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
