import express from "express";
import pool from "../db/db.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/:userId", verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("📊 Dashboard requested for user:", userId);

    const [workouts, steps] = await Promise.all([
      pool.query(
        `SELECT COUNT(*)::int AS total_workouts
         FROM workouts
         WHERE user_id = $1
         AND date >= date_trunc('month', CURRENT_DATE)`,
        [userId]
      ),
      pool.query(
        `SELECT 
      SUM(steps_count)::int AS total_steps,
      COUNT(DISTINCT step_date)::int AS active_days
   FROM steps_logs
   WHERE user_id = $1
     AND step_date >= date_trunc('month', CURRENT_DATE)`,
        [userId]
      ),
    ]);

    console.log("🧩 Workouts result:", workouts.rows);
    console.log("🦶 Steps result:", steps.rows);

    // Monthly breakdown
    const monthlyWorkouts = await pool.query(
      `SELECT TO_CHAR(date, 'Mon') AS month,
              COUNT(*)::int AS workouts
       FROM workouts
       WHERE user_id = $1
         AND date >= date_trunc('year', CURRENT_DATE)
       GROUP BY TO_CHAR(date, 'Mon'), EXTRACT(MONTH FROM date)
       ORDER BY EXTRACT(MONTH FROM date) ASC`,
      [userId]
    );

    const allMonths = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const monthlyData = allMonths.map((month) => {
      const found = monthlyWorkouts.rows.find((m) => m.month === month);
      return {
        month,
        workouts: found ? found.workouts : 0,
      };
    });

    res.json({
      totalWorkouts: workouts.rows[0]?.total_workouts || 0,
      totalSteps: steps.rows[0]?.total_steps || 0,
      activeDays: steps.rows[0]?.active_days || 0,
      monthlyData,
    });
  } catch (err) {
    console.error("❌ Error loading dashboard:", err);
    res.status(500).json({ error: "Failed to load dashboard data" });
  }
});

export default router;
