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
    weight: 72,
    height: 175,
    goal: "Build Muscle",
    workoutsCompleted: 86,
    caloriesBurned: 25000,
  });

  const calculateBMI = (weight, height) => {
    const h = height / 100;
    return (weight / (h * h)).toFixed(1);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedUser = { ...user, [name]: value };

    if (name === "weight" || name === "height") {
      updatedUser.bmi = calculateBMI(updatedUser.weight, updatedUser.height);
    }

    setUser(updatedUser);
  };

  const handleEditToggle = () => setIsEditing(true);
  const handleCancel = () => setIsEditing(false);

  const handleSave = () => {
    setIsEditing(false);
    alert("Profile updated successfully!");
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setUser({ ...user, avatar: imageUrl });
    }
  };

  return (
    <div className="profile-container">
      {/* Header */}
      <div className="profile-header">
        <div className="avatar-wrapper">
          <img src={user.avatar} alt="User Avatar" className="profile-avatar" />
          {isEditing && (
            <label className="change-photo-btn">
              Change Photo
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                style={{ display: "none" }}
              />
            </label>
          )}
        </div>

        <div>
          <h2>{user.name}</h2>
          <p>{user.role}</p>
          <p className="joined-date">Member since {user.joined}</p>
        </div>
      </div>

      {/* Account Details */}
      <div className="profile-info-card">
        <h3>Account Details</h3>
        <form className="profile-form two-column-grid">
          <label>
            Full Name
            <input
              type="text"
              name="name"
              value={user.name}
              disabled={!isEditing}
              onChange={handleChange}
            />
          </label>
          <label>
            Email Address
            <input
              type="email"
              name="email"
              value={user.email}
              disabled={!isEditing}
              onChange={handleChange}
            />
          </label>
          <label>
            Fitness Level
            <input
              type="text"
              name="role"
              value={user.role}
              disabled={!isEditing}
              onChange={handleChange}
            />
          </label>
          <label>
            Location
            <input
              type="text"
              name="location"
              value={user.location}
              disabled={!isEditing}
              onChange={handleChange}
            />
          </label>
        </form>
      </div>

      {/* Fitness Info */}
      <div className="profile-info-card">
        <h3>Fitness Information</h3>
        <form className="profile-form two-column-grid">
          <label>
            Weight (kg)
            <input
              type="number"
              name="weight"
              value={user.weight}
              disabled={!isEditing}
              onChange={handleChange}
            />
          </label>
          <label>
            Height (cm)
            <input
              type="number"
              name="height"
              value={user.height}
              disabled={!isEditing}
              onChange={handleChange}
            />
          </label>
          <label>
            BMI
            <input type="text" name="bmi" value={calculateBMI(user.weight, user.height)} disabled readOnly />
          </label>
          <label>
            Goal
            <input
              type="text"
              name="goal"
              value={user.goal}
              disabled={!isEditing}
              onChange={handleChange}
            />
          </label>
        </form>
      </div>

      {/* Buttons */}
      <div className="profile-actions">
        {isEditing ? (
          <>
            <button className="btn save-btn" onClick={handleSave}>
              Save Changes
            </button>
            <button className="btn cancel-btn" onClick={handleCancel}>
              Cancel
            </button>
          </>
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
