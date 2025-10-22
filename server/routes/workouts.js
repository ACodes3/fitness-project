// server/routes/workouts.js
import express from "express";
import pool from "../db/db.js";

const router = express.Router();

// Get all workouts for a user
router.get("/:userId", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM workouts WHERE user_id = $1 ORDER BY date DESC`,
      [req.params.userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get workout details with exercises
router.get("/details/:workoutId", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT w.*, we.exercise_name, we.sets, we.reps, we.weight_kg, we.duration_min
       FROM workouts w
       LEFT JOIN workout_exercises we ON w.id = we.workout_id
       WHERE w.id = $1`,
      [req.params.workoutId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add new workout (basic example)
router.post("/", async (req, res) => {
  try {
    const { user_id, type, name, date, duration_min, notes } = req.body;
    const result = await pool.query(
      `INSERT INTO workouts (user_id, type, name, date, duration_min, notes)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [user_id, type, name, date, duration_min, notes]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
