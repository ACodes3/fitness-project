import "../assets/styles/topbar.css";
import userIcon from "../assets/user-account.png";

const Topbar = () => {
  return (
    <header className="topbar">
      <h1 className="topbar-title">Dashboard</h1>
      <div className="topbar-profile">
        <img
          src={userIcon}
          alt="User"
          className="profile-img"
        />
        <span className="profile-name">Hello, John Doe!</span>
      </div>
    </header>
  );
};

export default Topbar;
