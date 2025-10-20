import { FaAppleAlt, FaCog, FaDumbbell, FaHome } from "react-icons/fa"; // ✅ icons from react-icons
import "../assets/styles/sidebar.css";
import logo from "../assets/workout.png";

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <img src={logo} alt="MyApp Logo" className="sidebar-logo" />
        <h2 className="sidebar-title">MyFitness App</h2>
      </div>

      <ul className="sidebar-menu">
        <li>
          <FaHome className="menu-icon" />
          <span>Dashboard</span>
        </li>
        <li>
          <FaDumbbell className="menu-icon" />
          <span>Workouts</span>
        </li>
        <li>
          <FaAppleAlt className="menu-icon" />
          <span>Nutrition</span>
        </li>
        <li>
          <FaCog className="menu-icon" />
          <span>Settings</span>
        </li>
      </ul>
    </aside>
  );
};

export default Sidebar;
