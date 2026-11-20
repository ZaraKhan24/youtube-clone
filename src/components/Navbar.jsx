import React from "react";
import {
  Menu,
  Search,
  Mic,
  Plus,
  Bell,
} from "lucide-react";

function Navbar({ onMenuClick }) {
  return (
    <header className="navbar">

      {/* Left Section */}
      <div className="navbar-left">

        <button
          className="icon-button menu-button"
          onClick={onMenuClick}
          aria-label="Toggle sidebar"
        >
          <Menu size={25} />
        </button>

        <div className="youtube-logo">
          <div className="youtube-logo-icon">
            <span></span>
          </div>

          <span className="youtube-logo-text">
            YouTube
          </span>

          <sup>PK</sup>
        </div>

      </div>

      {/* Center Section - Search */}
      <div className="navbar-center">

        <div className="search-container">

          <input
            type="text"
            placeholder="Search"
            className="search-input"
          />

          <button
            className="search-button"
            aria-label="Search"
          >
            <Search size={24} />
          </button>

        </div>

        <button
          className="icon-button mic-button"
          aria-label="Voice search"
        >
          <Mic size={23} />
        </button>

      </div>

      {/* Right Section */}
      <div className="navbar-right">

        <button className="create-button">
          <Plus size={24} />
          <span>Create</span>
        </button>

        <button
          className="icon-button notification-button"
          aria-label="Notifications"
        >
          <Bell size={23} />
        </button>

        <div className="profile-avatar">
          Z
        </div>

      </div>

    </header>
  );
}

export default Navbar;