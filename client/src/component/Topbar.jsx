import "../assets/styles/topbar.css";

const Topbar = () => {
  return (
    <header className="topbar">
      <h1 className="topbar-title">Dashboard</h1>
      <div className="topbar-profile">
        <img
          src="https://via.placeholder.com/35"
          alt="User"
          className="profile-img"
        />
        <span className="profile-name">John Doe</span>
      </div>
    </header>
  );
};

export default Topbar;
