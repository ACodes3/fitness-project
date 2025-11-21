import cors from "cors";
import dotenv from "dotenv";
import express from "express";

import dashboardRoutes from "./routes/dashboard.js";
import profileRoutes from "./routes/profile.js";
import settingsRoutes from "./routes/settings.js";
import stepsRoutes from "./routes/steps.js";
import usersRoutes from "./routes/users.js";
import workoutsRoutes from "./routes/workouts.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Redis connection already happens inside redis.js
console.log("✔ Redis module loaded");

// Routes
app.use("/api/users", usersRoutes);
app.use("/api/workouts", workoutsRoutes);
app.use("/api/steps", stepsRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.get("/", (req, res) => res.send("✅ Fitness API running!"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
