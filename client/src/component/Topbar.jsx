import { useEffect, useRef, useState } from "react";
import { FaChevronDown, FaSignOutAlt, FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "../assets/styles/topbar.css";
import userIcon from "../assets/user-account.png";

const Topbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const toggleDropdown = () => setIsOpen((prev) => !prev);

  const handleLogout = () => {
    console.log("User logged out");
    // TODO: Add your logout logic here (clear tokens, redirect, etc.)
  };

  const handleProfile = () => {
    console.log("Profile clicked");
    navigate("/profile");
  };

  // 🔒 Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="topbar">
      <h1 className="topbar-title">Dashboard</h1>

      <div className="topbar-profile" ref={dropdownRef}>
        <div className="profile-info" onClick={toggleDropdown}>
          <img src={userIcon} alt="User" className="profile-img" />
          <span className="profile-name">
            Hello, John Doe
            <FaChevronDown
              className={`dropdown-icon ${isOpen ? "open" : ""}`}
            />
          </span>
        </div>

        {isOpen && (
          <div className="dropdown-menu">
            <button onClick={handleProfile}>
              <FaUserCircle className="dropdown-icon-left" />
              Profile
            </button>
            <button onClick={handleLogout}>
              <FaSignOutAlt className="dropdown-icon-left" />
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Topbar;
