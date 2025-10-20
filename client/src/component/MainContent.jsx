import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import "../assets/styles/mainContent.css";

import {
  FaCalendarCheck,
  FaDumbbell,
  FaRegHandPaper,
  FaRunning,
  FaWalking,
} from "react-icons/fa";
import { GiLotus } from "react-icons/gi";

const MainContent = () => {
  // === Monthly workout data (example dataset) ===
  const monthlyData = [
    { month: "Jan", workouts: 18 },
    { month: "Feb", workouts: 22 },
    { month: "Mar", workouts: 27 },
    { month: "Apr", workouts: 30 },
    { month: "May", workouts: 35 },
    { month: "Jun", workouts: 33 },
    { month: "Jul", workouts: 38 },
    { month: "Aug", workouts: 42 },
    { month: "Sep", workouts: 36 },
    { month: "Oct", workouts: 40 },
    { month: "Nov", workouts: 28 },
    { month: "Dec", workouts: 31 },
  ];

  return (
    <main className="main-content">
      <h2 className="welcome-text">
        Welcome back, John <FaRegHandPaper className="wave-icon" />
      </h2>

      {/* === DASHBOARD CARDS === */}
      <div className="dashboard-cards">
        <div className="card">
          <div className="card-icon workout">
            <FaDumbbell />
          </div>
          <div className="card-text">
            <h3>Total Workouts this Month</h3>
            <p>42</p>
          </div>
        </div>

        <div className="card">
          <div className="card-icon steps">
            <FaWalking />
          </div>
          <div className="card-text">
            <h3>Total Steps this Month</h3>
            <p>67,230</p>
          </div>
        </div>

        <div className="card">
          <div className="card-icon active">
            <FaCalendarCheck />
          </div>
          <div className="card-text">
            <h3>Active Days this Month</h3>
            <p>27</p>
          </div>
        </div>
      </div>

      {/* === WORKOUT TREND CHART === */}
      <div className="chart-section">
        <h3>Workouts per Month (Year Overview)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyData}>
            <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                borderRadius: "8px",
                border: "1px solid #ddd",
              }}
            />
            <Line
              type="monotone"
              dataKey="workouts"
              stroke="#65b89d"
              strokeWidth={3}
              dot={{ r: 5, fill: "#65b89d" }}
              activeDot={{ r: 7, stroke: "#0d3b2e", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* === RECENT ACTIVITY === */}
      <div className="recent-activity">
        <h3>Recent Workouts</h3>
        <ul>
          <li>
            <div className="activity-item">
              <span className="activity-icon run">
                <FaRunning />
              </span>
              <p>Morning Run — 5km — 6,200 steps</p>
            </div>
          </li>

          <li>
            <div className="activity-item">
              <span className="activity-icon strength">
                <FaDumbbell />
              </span>
              <p>Upper Body Strength — 45 mins</p>
            </div>
          </li>

          <li>
            <div className="activity-item">
              <span className="activity-icon yoga">
                <GiLotus />
              </span>
              <p>Yoga Session — 30 mins</p>
            </div>
          </li>
        </ul>
      </div>
    </main>
  );
};

export default MainContent;
