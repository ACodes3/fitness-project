import { useEffect, useState } from "react";
import {
  FaCalendarCheck,
  FaDumbbell,
  FaRegHandPaper,
  FaRunning,
  FaWalking,
} from "react-icons/fa";
import { GiLotus } from "react-icons/gi";
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

const MainContent = () => {
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!user || !token) {
      console.warn("No user or token found in localStorage");
      return;
    }

    const fetchDashboardData = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/dashboard/${user.id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to load dashboard data");

        const data = await res.json();
        console.log("📈 Dashboard data:", data);
        setDashboard(data);
      } catch (err) {
        console.error("Error loading dashboard:", err);
      } finally {
        setLoading(false); // ✅ stop loading
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <p className="loading-text">Loading dashboard...</p>;
  if (!dashboard) return <p className="error-text">Failed to load dashboard data.</p>;

  return (
    <main className="main-content">
      <h2 className="welcome-text">
        Welcome back, {user?.name || "User"} <FaRegHandPaper className="wave-icon" />
      </h2>

      {/* === DASHBOARD CARDS === */}
      <div className="dashboard-cards">
        <div className="card">
          <div className="card-icon workout"><FaDumbbell /></div>
          <div className="card-text">
            <h3>Total Workouts this Month</h3>
            <p>{dashboard.totalWorkouts}</p>
          </div>
        </div>

        <div className="card">
          <div className="card-icon steps"><FaWalking /></div>
          <div className="card-text">
            <h3>Total Steps this Month</h3>
            <p>{dashboard.totalSteps?.toLocaleString() || 0}</p>
          </div>
        </div>

        <div className="card">
          <div className="card-icon active"><FaCalendarCheck /></div>
          <div className="card-text">
            <h3>Active Days this Month</h3>
            <p>{dashboard.activeDays}</p>
          </div>
        </div>
      </div>

      {/* === WORKOUT TREND CHART === */}
      <div className="chart-section">
        <h3>Workouts per Month (Year Overview)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dashboard.monthlyData}>
            <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
            <XAxis dataKey="month" />
            <YAxis allowDecimals={false} />
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
              <span className="activity-icon run"><FaRunning /></span>
              <p>Morning Run — 5km — 6,200 steps</p>
            </div>
          </li>

          <li>
            <div className="activity-item">
              <span className="activity-icon strength"><FaDumbbell /></span>
              <p>Upper Body Strength — 45 mins</p>
            </div>
          </li>

          <li>
            <div className="activity-item">
              <span className="activity-icon yoga"><GiLotus /></span>
              <p>Yoga Session — 30 mins</p>
            </div>
          </li>
        </ul>
      </div>
    </main>
  );
};

export default MainContent;
