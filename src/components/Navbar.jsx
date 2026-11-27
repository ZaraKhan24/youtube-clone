import React, { useState, useEffect, useRef } from "react";
import {
  Menu,
  Search,
  Mic,
  Plus,
  Bell,
  Upload,
  User,
  LogOut,
  LogIn,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

function Navbar({
  onMenuClick,
  onOpenUploadModal,
  allVideos = [],
  onSelectSuggestion,
  onSearchQueryChange,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const navigate = useNavigate();
  const navRef = useRef(null);
  const searchBoxRef = useRef(null);

  const savedUser = JSON.parse(localStorage.getItem("user") || "null");
  const isLoggedIn = Boolean(localStorage.getItem("token") && savedUser);
  const avatarLetter = savedUser?.name
    ? savedUser.name.charAt(0).toUpperCase()
    : "Z";

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
        setIsSearchFocused(false);
      }
      if (navRef.current && !navRef.current.contains(e.target)) {
        setShowCreateMenu(false);
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const trimmed = searchQuery.trim();
    onSearchQueryChange?.(searchQuery);

    if (!trimmed) {
      setSuggestions(allVideos.slice(0, 6));
      setLoadingSuggestions(false);
      return;
    }

    setLoadingSuggestions(true);
    const timer = setTimeout(async () => {
      try {
        const encoded = encodeURIComponent(trimmed);
        const res = await fetch(`${API_URL}/api/videos?search=${encoded}`);
        const data = await res.json().catch(() => []);

        const sourceList =
          Array.isArray(data) && data.length > 0 ? data : allVideos;
        const lower = trimmed.toLowerCase();

        const filtered = sourceList.filter((video) =>
          (video.title || "").toLowerCase().includes(lower)
        );

        setSuggestions(filtered);
      } catch {
        const lower = trimmed.toLowerCase();
        setSuggestions(
          allVideos.filter((video) =>
            (video.title || "").toLowerCase().includes(lower)
          )
        );
      } finally {
        setLoadingSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, allVideos, onSearchQueryChange]);

  const handleSuggestionClick = (video) => {
    setSearchQuery(video.title || "");
    setIsSearchFocused(false);
    onSelectSuggestion?.(video);
  };

  const handleUpload = () => {
    setShowCreateMenu(false);
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    if (onOpenUploadModal) {
      onOpenUploadModal();
    } else {
      navigate("/upload");
    }
  };

  const handleLoginPage = () => {
    setShowProfileMenu(false);
    navigate("/login");
  };

  const handleProfile = () => {
    setShowProfileMenu(false);
    navigate("/profile");
  };

  const handleLogout = () => {
    setShowProfileMenu(false);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setIsSearchFocused(true);
  };

  const menuItemStyle = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    width: "100%",
    padding: "10px 14px",
    border: "none",
    backgroundColor: "transparent",
    color: "#0f0f0f",
    fontSize: "14px",
    fontWeight: 500,
    textAlign: "left",
    borderRadius: "8px",
    transition: "background-color 0.15s ease",
  };

  return (
    <header className="navbar" ref={navRef}>
      {/* Left Section */}
      <div className="navbar-left">
        <button
          type="button"
          className="icon-button menu-button"
          onClick={onMenuClick}
          aria-label="Toggle sidebar"
        >
          <Menu size={25} />
        </button>

        <div
          className="youtube-logo"
          style={{ cursor: "pointer" }}
          onClick={() => {
            setSearchQuery("");
            setIsSearchFocused(false);
            navigate("/");
          }}
        >
          <div className="youtube-logo-icon">
            <span></span>
          </div>

          <span className="youtube-logo-text">YouTube</span>

          <sup>PK</sup>
        </div>
      </div>

      {/* Center Section - Search */}
      <div className="navbar-center">
        <div
          ref={searchBoxRef}
          style={{
            position: "relative",
            flex: 1,
            maxWidth: "560px",
          }}
        >
          <form
            className="search-container"
            onSubmit={handleSearchSubmit}
            style={{ width: "100%", maxWidth: "100%", overflow: "hidden" }}
          >
            <input
              type="text"
              placeholder="Search"
              className="search-input"
              value={searchQuery}
              onFocus={() => {
                setShowCreateMenu(false);
                setShowProfileMenu(false);
                setIsSearchFocused(true);
              }}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchFocused(true);
              }}
            />

            {searchQuery && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => {
                  setSearchQuery("");
                  setSuggestions(allVideos.slice(0, 6));
                  setIsSearchFocused(true);
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  padding: "0 10px",
                  height: "100%",
                  color: "#606060",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                <X size={17} />
              </button>
            )}

            <button
              type="submit"
              className="search-button"
              aria-label="Search"
            >
              <Search size={22} />
            </button>
          </form>

          {/* Compact YouTube-Style Dropdown */}
          {isSearchFocused && (loadingSuggestions || suggestions.length > 0) && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 6px)",
                left: "2px",
                right: "54px",
                backgroundColor: "#ffffff",
                border: "1px solid #e5e5e5",
                borderRadius: "12px",
                boxShadow: "0 6px 20px rgba(0, 0, 0, 0.12)",
                zIndex: 1200,
                padding: "6px 0",
                maxHeight: "300px",
                overflowY: "auto",
              }}
            >
              {loadingSuggestions ? (
                <div
                  style={{
                    padding: "9px 14px",
                    fontSize: "13px",
                    color: "#606060",
                  }}
                >
                  Searching...
                </div>
              ) : (
                suggestions.map((video) => (
                  <button
                    key={video._id || video.id}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSuggestionClick(video);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "10px",
                      width: "100%",
                      padding: "7px 14px",
                      border: "none",
                      backgroundColor: "transparent",
                      textAlign: "left",
                      cursor: "pointer",
                      color: "#0f0f0f",
                      fontSize: "13.5px",
                      transition: "background-color 0.12s ease",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#f2f2f2")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        minWidth: 0,
                        flex: 1,
                      }}
                    >
                      <Search
                        size={14}
                        color="#606060"
                        style={{ flexShrink: 0 }}
                      />
                      <span
                        style={{
                          fontWeight: 500,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {video.title}
                      </span>
                    </span>

                    {video.thumbnail && (
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        style={{
                          width: "40px",
                          height: "24px",
                          objectFit: "cover",
                          borderRadius: "4px",
                          flexShrink: 0,
                        }}
                      />
                    )}
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          className="icon-button mic-button"
          aria-label="Voice search"
        >
          <Mic size={23} />
        </button>
      </div>

      {/* Right Section */}
      <div className="navbar-right">
        {/* Create Button + Dropdown right underneath */}
        <div style={{ position: "relative" }}>
          <button
            type="button"
            className="create-button"
            onClick={() => {
              setShowCreateMenu((prev) => !prev);
              setShowProfileMenu(false);
              setIsSearchFocused(false);
            }}
          >
            <Plus size={22} />
            <span>Create</span>
          </button>

          {showCreateMenu && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                left: 0,
                minWidth: "185px",
                backgroundColor: "#ffffff",
                border: "1px solid #e5e5e5",
                borderRadius: "12px",
                padding: "6px",
                boxShadow: "0 8px 24px rgba(0, 0, 0, 0.14)",
                zIndex: 900,
              }}
            >
              <button
                type="button"
                onClick={handleUpload}
                style={menuItemStyle}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#f2f2f2")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <Upload size={18} color="#0f0f0f" />
                <span>Upload video</span>
              </button>
            </div>
          )}
        </div>

        {/* Notifications */}
        <button
          type="button"
          className="icon-button notification-button"
          aria-label="Notifications"
        >
          <Bell size={23} />
        </button>

        {/* Profile Avatar + Vertical Dropdown right underneath */}
        <div style={{ position: "relative" }}>
          <button
            type="button"
            className="profile-avatar"
            onClick={() => {
              if (!isLoggedIn) {
                navigate("/login");
                return;
              }
              setShowProfileMenu((prev) => !prev);
              setShowCreateMenu(false);
              setIsSearchFocused(false);
            }}
            aria-label="Open profile or login menu"
            title={isLoggedIn ? savedUser.name : "Login / Create Account"}
          >
            {avatarLetter}
          </button>

          {isLoggedIn && showProfileMenu && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                right: 0,
                width: "230px",
                backgroundColor: "#ffffff",
                border: "1px solid #e5e5e5",
                borderRadius: "12px",
                padding: "6px",
                boxShadow: "0 8px 24px rgba(0, 0, 0, 0.14)",
                zIndex: 900,
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* User Summary Header */}
              <div
                style={{
                  padding: "10px 14px",
                  borderBottom: "1px solid #efefef",
                  marginBottom: "4px",
                }}
              >
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#0f0f0f",
                  }}
                >
                  {savedUser.name}
                </div>
                {savedUser.email && (
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#606060",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {savedUser.email}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleProfile}
                style={menuItemStyle}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#f2f2f2")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <User size={18} />
                <span>Your Profile</span>
              </button>

              <button
                type="button"
                onClick={handleLoginPage}
                style={menuItemStyle}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#f2f2f2")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <LogIn size={18} />
                <span>Switch Account</span>
              </button>

              <div
                style={{
                  height: "1px",
                  backgroundColor: "#efefef",
                  margin: "4px 6px",
                }}
              />

              <button
                type="button"
                onClick={handleLogout}
                style={{ ...menuItemStyle, color: "#c62828" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#fdecea")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <LogOut size={18} color="#c62828" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;