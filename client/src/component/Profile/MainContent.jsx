import { useState } from "react";
import "../../assets/styles/profile.css";

const MainContent = () => {
  const [isEditing, setIsEditing] = useState(false);

  const [user, setUser] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    role: "Intermediate",
    location: "New York, USA",
    joined: "January 2024",
    avatar: "https://i.pravatar.cc/150?img=3",
  });

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleSave = () => {
    setIsEditing(false);
    alert("Profile updated successfully!");
  };

  return (
    <div className="profile-container">
      {/* Header */}
      <div className="profile-header">
        <img src={user.avatar} alt="User Avatar" className="profile-avatar" />
        <div>
          <h2>{user.name}</h2>
          <p>{user.role}</p>
        </div>
      </div>

      {/* Editable Info Section */}
      <div className="profile-info-card">
        <h3>Account Details</h3>
        <form className="profile-form">
          <label>
            Name:
            <input
              type="text"
              name="name"
              value={user.name}
              disabled={!isEditing}
              onChange={handleChange}
            />
          </label>
          <label>
            Email:
            <input
              type="email"
              name="email"
              value={user.email}
              disabled={!isEditing}
              onChange={handleChange}
            />
          </label>
          <label>
            Role:
            <input
              type="text"
              name="role"
              value={user.role}
              disabled={!isEditing}
              onChange={handleChange}
            />
          </label>
          <label>
            Location:
            <input
              type="text"
              name="location"
              value={user.location}
              disabled={!isEditing}
              onChange={handleChange}
            />
          </label>
          <label>
            Member Since:
            <input
              type="text"
              name="joined"
              value={user.joined}
              disabled
              readOnly
            />
          </label>
        </form>
      </div>

      {/* Buttons */}
      <div className="profile-actions">
        {isEditing ? (
          <button className="btn edit-btn" onClick={handleSave}>
            Save Changes
          </button>
        ) : (
          <button className="btn edit-btn" onClick={handleEditToggle}>
            Edit Profile
          </button>
        )}
        <button className="btn logout-btn">Logout</button>
      </div>
    </div>
  );
};

export default MainContent;
