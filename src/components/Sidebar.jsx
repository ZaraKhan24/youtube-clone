//Sidebar.jsx
import React, { useState, useEffect } from "react";
import {
  House,
  PlaySquare,
  History,
  ListVideo,
  Clock,
  ThumbsUp,
  Download,
  UserSquare,
  Clapperboard,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Flame,
  ShoppingBag,
  Music,
  Film,
  Radio,
  Gamepad2,
  CircleUserRound,
  X,
} from "lucide-react";

const subscriptions = [
  {
    name: "Beta Squad",
    image:
      "https://yt3.googleusercontent.com/ytc/AIdro_keJoAmv1MrHOIplkYaZok_WuOdiHDTBv8Gv4xlmnOrLzk=s900-c-k-c0x00ffffff-no-rj",
    unread: true,
  },
  {
    name: "Shahveer Jafry",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQS4xOf6c7fb4vNzl3BaCKdrHNowETpvnfpx8dDeC54fQ&s=10",
    unread: true,
  },
  {
    name: "T-Series",
    image:
      "https://wallpapers.com/images/hd/tseries-circle-vztvwmb8davobphn.jpg",
    unread: false,
  },
  {
    name: "Gaming Hub",
    image:
      "https://play-lh.googleusercontent.com/mp-K_gs-VCVvlF0bCnnvaUpCj7pIBynvqM8RKRLnuNidttVKEAV60f8Vcahzf7D_j-hhMTdkVWfPp995djcw",
    unread: false,
  },
  {
    name: "Cs-Go gaming",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRwIMDjJVXrJQ8pmLWvagEicjIf6TxRkRhDm929uBKSGAAzws2ODeQPgudh&s=10",
    unread: true,
  },
];

const collapsedLinks = [
  { name: "Home", icon: House },
  { name: "Shorts", icon: Clapperboard },
  { name: "Subscriptions", icon: PlaySquare },
  { name: "You", icon: CircleUserRound },
];

const mainLinks = [
  { name: "Home", icon: House },
  { name: "Shorts", icon: Clapperboard },
];

const personalLinks = [
  { name: "Your channel", icon: UserSquare },
  { name: "History", icon: History },
  { name: "Playlists", icon: ListVideo },
  { name: "Watch later", icon: Clock },
  { name: "Liked videos", icon: ThumbsUp },
  { name: "Your videos", icon: PlaySquare },
  { name: "Downloads", icon: Download },
];

const exploreLinks = [
  { name: "Trending", icon: Flame },
  { name: "Shopping", icon: ShoppingBag },
  { name: "Music", icon: Music },
  { name: "Movies & TV", icon: Film },
  { name: "Live", icon: Radio },
  { name: "Gaming", icon: Gamepad2 },
];

function Sidebar({ isOpen, onClose }) {
  const [activeItem, setActiveItem] = useState("Home");
  const [showMoreYou, setShowMoreYou] = useState(false);

  // Detect mobile screen
  const [isMobile, setIsMobile] = useState(
    window.innerWidth <= 768
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const visiblePersonalLinks = showMoreYou
    ? personalLinks
    : personalLinks.slice(0, 7);

  const handleItemClick = (name) => {
    setActiveItem(name);

    if (isMobile && onClose) {
      onClose();
    }
  };

  // Mobile Sidebar
  if (isMobile) {
    return (
      <>
        {isOpen && (
          <div
            className="sidebar-overlay"
            onClick={onClose}
          />
        )}

        <aside
          className={`sidebar expanded mobile-sidebar ${
            isOpen ? "mobile-open" : "mobile-closed"
          }`}
        >
          <div className="mobile-sidebar-header">
            <span>YouTube</span>

            <button
              type="button"
              className="mobile-close-btn"
              onClick={onClose}
              aria-label="Close sidebar"
            >
              <X size={22} />
            </button>
          </div>

          {/* Main Navigation */}
          <div className="sidebar-section">
            {mainLinks.map((item) => {
              const Icon = item.icon;
              const isActive = activeItem === item.name;

              return (
                <button
                  type="button"
                  key={item.name}
                  onClick={() => handleItemClick(item.name)}
                  className={`sidebar-item ${
                    isActive ? "active" : ""
                  }`}
                >
                  <Icon size={22} />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </div>

          {/* Subscriptions */}
          <div className="sidebar-section">
            <div className="sidebar-heading">
              <span>Subscriptions</span>
              <ChevronRight size={18} />
            </div>

            {subscriptions.map((channel) => (
              <button
                type="button"
                className="subscription-item"
                key={channel.name}
                onClick={() => handleItemClick(channel.name)}
              >
                <img
                  src={channel.image}
                  alt={channel.name}
                  className="subscription-avatar"
                />

                <span className="subscription-name">
                  {channel.name}
                </span>

                {channel.unread && (
                  <span className="unread-dot"></span>
                )}
              </button>
            ))}
          </div>

          {/* You Section */}
          <div className="sidebar-section">
            <div className="sidebar-heading">
              <span>You</span>
              <ChevronRight size={18} />
            </div>

            {visiblePersonalLinks.map((item) => {
              const Icon = item.icon;
              const isActive = activeItem === item.name;

              return (
                <button
                  type="button"
                  key={item.name}
                  onClick={() => handleItemClick(item.name)}
                  className={`sidebar-item ${
                    isActive ? "active" : ""
                  }`}
                >
                  <Icon size={22} />
                  <span>{item.name}</span>
                </button>
              );
            })}

            <button
              type="button"
              className="sidebar-item"
              onClick={() =>
                setShowMoreYou((prev) => !prev)
              }
            >
              {showMoreYou ? (
                <ChevronUp size={22} />
              ) : (
                <ChevronDown size={22} />
              )}

              <span>
                {showMoreYou ? "Show less" : "Show more"}
              </span>
            </button>
          </div>

          {/* Explore Section */}
          <div className="sidebar-section">
            <div className="sidebar-heading">
              <span>Explore</span>
            </div>

            {exploreLinks.map((item) => {
              const Icon = item.icon;
              const isActive = activeItem === item.name;

              return (
                <button
                  type="button"
                  key={item.name}
                  onClick={() => handleItemClick(item.name)}
                  className={`sidebar-item ${
                    isActive ? "active" : ""
                  }`}
                >
                  <Icon size={22} />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </div>
        </aside>
      </>
    );
  }

  // Desktop Collapsed Sidebar
  if (!isOpen) {
    return (
      <aside className="sidebar collapsed">
        <div className="sidebar-collapsed-list">
          {collapsedLinks.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.name;

            return (
              <button
                type="button"
                key={item.name}
                onClick={() => setActiveItem(item.name)}
                className={`collapsed-item ${
                  isActive ? "active" : ""
                }`}
              >
                <Icon size={22} strokeWidth={isActive ? 2.2 : 1.8} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </div>
      </aside>
    );
  }

  // Desktop Expanded Sidebar
  return (
    <aside className="sidebar expanded">

      {/* Main Navigation */}
      <div className="sidebar-section">
        {mainLinks.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.name;

          return (
            <button
              type="button"
              key={item.name}
              onClick={() => setActiveItem(item.name)}
              className={`sidebar-item ${
                isActive ? "active" : ""
              }`}
            >
              <Icon size={22} strokeWidth={isActive ? 2.2 : 1.8} />
              <span>{item.name}</span>
            </button>
          );
        })}
      </div>

      {/* Subscriptions */}
      <div className="sidebar-section">
        <div className="sidebar-heading">
          <span>Subscriptions</span>
          <ChevronRight size={18} />
        </div>

        {subscriptions.map((channel) => (
          <button
            type="button"
            className="subscription-item"
            key={channel.name}
            onClick={() => setActiveItem(channel.name)}
          >
            <img
              src={channel.image}
              alt={channel.name}
              className="subscription-avatar"
            />

            <span className="subscription-name">
              {channel.name}
            </span>

            {channel.unread && (
              <span className="unread-dot"></span>
            )}
          </button>
        ))}
      </div>

      {/* You Section */}
      <div className="sidebar-section">
        <div className="sidebar-heading">
          <span>You</span>
          <ChevronRight size={18} />
        </div>

        {visiblePersonalLinks.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.name;

          return (
            <button
              type="button"
              key={item.name}
              onClick={() => setActiveItem(item.name)}
              className={`sidebar-item ${
                isActive ? "active" : ""
              }`}
            >
              <Icon size={22} strokeWidth={isActive ? 2.2 : 1.8} />
              <span>{item.name}</span>
            </button>
          );
        })}

        <button
          type="button"
          className="sidebar-item"
          onClick={() =>
            setShowMoreYou((prev) => !prev)
          }
        >
          {showMoreYou ? (
            <ChevronUp size={22} />
          ) : (
            <ChevronDown size={22} />
          )}

          <span>
            {showMoreYou ? "Show less" : "Show more"}
          </span>
        </button>
      </div>

      {/* Explore Section */}
      <div className="sidebar-section">
        <div className="sidebar-heading">
          <span>Explore</span>
        </div>

        {exploreLinks.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.name;

          return (
            <button
              type="button"
              key={item.name}
              onClick={() => setActiveItem(item.name)}
              className={`sidebar-item ${
                isActive ? "active" : ""
              }`}
            >
              <Icon size={22} strokeWidth={isActive ? 2.2 : 1.8} />
              <span>{item.name}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}

export default Sidebar;
