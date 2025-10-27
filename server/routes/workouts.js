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
    console.error("❌ Error fetching workouts:", err);
    res.status(500).json({ error: "Failed to fetch workouts" });
  }
});

// Get a specific workout with exercises
router.get("/details/:workoutId", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
          w.id,
          w.user_id,
          w.type,
          w.name,
          w.date,
          w.duration_min AS workout_duration_min,
          w.notes,
          we.exercise_name,
          we.sets,
          we.reps,
          we.weight_kg,
          we.duration_min AS exercise_duration_min
        FROM workouts w
        LEFT JOIN workout_exercises we ON w.id = we.workout_id
        WHERE w.id = $1;
        `,
      [req.params.workoutId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching workout details:", err);
    res.status(500).json({ error: "Failed to fetch workout details" });
  }
});

// Add new workout WITH exercises
router.post("/", async (req, res) => {
  const client = await pool.connect();
  try {
    const { user_id, type, name, date, duration_min, notes, exercises } =
      req.body;
    console.log("📥 Incoming workout data:", req.body);

    if (!user_id || !type || !name || !date) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    await client.query("BEGIN");

    // Insert workout
    const workoutResult = await client.query(
      `INSERT INTO workouts (user_id, type, name, date, duration_min, notes)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [user_id, type, name, date, duration_min || null, notes || null]
    );

    const workoutId = workoutResult.rows[0].id;

    // Insert exercises (if provided)
    if (exercises && exercises.length > 0) {
      const insertExerciseQuery = `
        INSERT INTO workout_exercises 
          (workout_id, exercise_name, sets, reps, weight_kg, duration_min)
        VALUES ($1, $2, $3, $4, $5, $6)
      `;

      for (const ex of exercises) {
        await client.query(insertExerciseQuery, [
          workoutId,
          ex.exercise_name || null,
          ex.sets || null,
          ex.reps || null,
          ex.weight_kg || null,
          ex.duration_min || null,
        ]);
      }
    }

    await client.query("COMMIT");

    // Return the created workout and exercises
    const newWorkout = await pool.query(
      `SELECT w.*, we.exercise_name, we.sets, we.reps, we.weight_kg, we.duration_min
       FROM workouts w
       LEFT JOIN workout_exercises we ON w.id = we.workout_id
       WHERE w.id = $1`,
      [workoutId]
    );

    res.status(201).json({
      message: "Workout created successfully",
      workout: newWorkout.rows,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Error adding workout:", err);
    res.status(500).json({ error: "Failed to create workout" });
  } finally {
    client.release();
  }
});

// 🛠️ Update workout by ID
router.put("/:id", async (req, res) => {
  const client = await pool.connect();
  try {
    const workoutId = req.params.id;
    const { name, type, date, duration_min, notes, exercises } = req.body;

    if (!name || !type || !date) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    console.log("🛠️ Updating workout:", workoutId, req.body);

    await client.query("BEGIN");

    // 1️⃣ Update workout details
    await client.query(
      `UPDATE workouts
       SET name = $1, type = $2, date = $3, duration_min = $4, notes = $5
       WHERE id = $6`,
      [name, type, date, duration_min || null, notes || null, workoutId]
    );

    // 2️⃣ Remove old exercises
    await client.query(`DELETE FROM workout_exercises WHERE workout_id = $1`, [
      workoutId,
    ]);

    // 3️⃣ Insert new exercises (if any)
    if (Array.isArray(exercises) && exercises.length > 0) {
      const insertQuery = `
        INSERT INTO workout_exercises 
          (workout_id, exercise_name, sets, reps, weight_kg, duration_min)
        VALUES ($1, $2, $3, $4, $5, $6)
      `;
      for (const ex of exercises) {
        await client.query(insertQuery, [
          workoutId,
          ex.exercise_name || null,
          ex.sets || null,
          ex.reps || null,
          ex.weight_kg || null,
          ex.duration_min || null,
        ]);
      }
    }

    await client.query("COMMIT");
    res.json({ message: "Workout updated successfully" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Error updating workout:", err);
    res.status(500).json({ error: err.message || "Failed to update workout" });
  } finally {
    client.release();
  }
});

export default router;
