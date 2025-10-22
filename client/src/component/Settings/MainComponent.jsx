import "../../assets/styles/settings.css"; // ✅ create this CSS file

const MainComponent = () => {
  return (
    <div className="settings-container">
      <h2 className="settings-title">Settings</h2>

      {/* Account Settings */}
      <section className="settings-section">
        <h3>Account Information</h3>
        <div className="form-grid">
          <label>
            Username
            <input type="text" placeholder="John Doe" />
          </label>
          <label>
            Email
            <input type="email" placeholder="john@example.com" />
          </label>
          <label>
            Password
            <input type="password" placeholder="••••••••" />
          </label>
          <label>
            Confirm Password
            <input type="password" placeholder="••••••••" />
          </label>
        </div>
      </section>

      {/* Preferences */}
      <section className="settings-section">
        <h3>Preferences</h3>
        <div className="form-grid">
          <label>
            Language
            <select>
              <option>English</option>
              <option>Spanish</option>
              <option>French</option>
            </select>
          </label>
          <label>
            Theme
            <select>
              <option>Light</option>
              <option>Dark</option>
              <option>System Default</option>
            </select>
          </label>
        </div>
      </section>

      {/* Notifications */}
      <section className="settings-section">
        <h3>Notifications</h3>
        <div className="toggle-group">
          <label className="toggle">
            <input type="checkbox" defaultChecked />
            <span className="slider"></span>
            Email Alerts
          </label>
          <label className="toggle">
            <input type="checkbox" />
            <span className="slider"></span>
            SMS Notifications
          </label>
        </div>
      </section>

      <div className="settings-actions">
        <button className="btn save-btn">Save Changes</button>
        <button className="btn cancel-btn">Cancel</button>
      </div>
    </div>
  );
};

export default MainComponent;
