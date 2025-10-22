// server/routes/dashboard.js
import express from "express";
import pool from "../db/db.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/:userId", verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;

    const [workouts, steps] = await Promise.all([
      pool.query(
        `SELECT COUNT(*) AS total_workouts
         FROM workouts
         WHERE user_id = $1
         AND date >= date_trunc('month', CURRENT_DATE)`,
        [userId]
      ),
      pool.query(
        `SELECT SUM(steps) AS total_steps, COUNT(DISTINCT date) AS active_days
         FROM steps_logs
         WHERE user_id = $1
         AND date >= date_trunc('month', CURRENT_DATE)`,
        [userId]
      ),
    ]);

    // 🧮 Aggregate workouts per month (this year)
    const monthlyWorkouts = await pool.query(
      `SELECT TO_CHAR(date, 'Mon') AS month,
              COUNT(*) AS workouts
       FROM workouts
       WHERE user_id = $1
         AND date >= date_trunc('year', CURRENT_DATE)
       GROUP BY TO_CHAR(date, 'Mon'), EXTRACT(MONTH FROM date)
       ORDER BY EXTRACT(MONTH FROM date) ASC`,
      [userId]
    );

    // 🧠 Ensure all 12 months exist even if user has no workouts
    const allMonths = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];

    const monthlyData = allMonths.map((month) => {
      const found = monthlyWorkouts.rows.find((m) => m.month === month);
      return {
        month,
        workouts: found ? parseInt(found.workouts) : 0,
      };
    });

    res.json({
      totalWorkouts: workouts.rows[0]?.total_workouts || 0,
      totalSteps: steps.rows[0]?.total_steps || 0,
      activeDays: steps.rows[0]?.active_days || 0,
      monthlyData, // ✅ now always exists, calculated dynamically
    });
  } catch (err) {
    console.error("Error loading dashboard:", err);
    res.status(500).json({ error: "Failed to load dashboard data" });
  }
});

export default router;
