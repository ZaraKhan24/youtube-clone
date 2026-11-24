import React, { useState, useEffect, useRef } from "react";
import {
  MoreVertical,
  BadgeCheck,
  Play,
  ListPlus,
  Clock,
  Bookmark,
  Download,
  Share2,
  Ban,
  MinusCircle,
  Flag,
  Trash2,
} from "lucide-react";

function formatDuration(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) return "";
  const totalSec = Math.floor(seconds);
  const hrs = Math.floor(totalSec / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;

  const pad = (n) => String(n).padStart(2, "0");
  if (hrs > 0) {
    return `${hrs}:${pad(mins)}:${pad(secs)}`;
  }
  return `${mins}:${pad(secs)}`;
}

function formatTimeAgo(dateInput) {
  if (!dateInput) return "just now";
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return String(dateInput);

  const diffSeconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (diffSeconds < 60) return "just now";

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d ago`;

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths}mo ago`;

  const diffYears = Math.floor(diffDays / 365);
  return `${diffYears}y ago`;
}

function VideoCard({ video, onSelectVideo, onDeleteVideo, onHideVideo }) {
  const [imgError, setImgError] = useState(false);
  const [autoDuration, setAutoDuration] = useState(video.duration || "");
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const menuContainerRef = useRef(null);

  const channelLabel = video.channelName || "Creator";
  const initialLetter = channelLabel.trim().charAt(0).toUpperCase() || "C";
  const playableSrc = video.videoUrl || video.url || "";
  const videoId = video._id || video.id;

  useEffect(() => {
    if (video.duration) {
      setAutoDuration(video.duration);
      return;
    }
    if (!playableSrc) return;

    const tempVideo = document.createElement("video");
    tempVideo.preload = "metadata";
    tempVideo.src = playableSrc;

    const handleLoadedMetadata = () => {
      if (tempVideo.duration && Number.isFinite(tempVideo.duration)) {
        setAutoDuration(formatDuration(tempVideo.duration));
      }
    };

    tempVideo.addEventListener("loadedmetadata", handleLoadedMetadata);
    return () => {
      tempVideo.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, [video.duration, playableSrc]);

  useEffect(() => {
    if (!menuOpen) return;
    const handleOutsideClick = (e) => {
      if (menuContainerRef.current && !menuContainerRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [menuOpen]);

  const handleVideoClick = () => {
    if (onSelectVideo) {
      onSelectVideo(video);
    }
  };

  const handleShare = async () => {
    setMenuOpen(false);
    const shareUrl = playableSrc || window.location.href;
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert("Video link copied!");
    } catch {
      alert("Could not copy link.");
    }
  };

  const handleDownload = () => {
    setMenuOpen(false);
    if (!playableSrc) return;
    const link = document.createElement("a");
    link.href = playableSrc;
    link.download = `${video.title || "video"}.mp4`;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.click();
  };

  const handleDeleteClick = async () => {
    if (!videoId || deleting) return;
    const confirmed = window.confirm(`Are you sure you want to delete "${video.title}"?`);
    if (!confirmed) return;

    try {
      setDeleting(true);
      setMenuOpen(false);
      if (onDeleteVideo) {
        await onDeleteVideo(videoId);
      }
    } catch (err) {
      alert(err?.message || "Failed to delete video");
    } finally {
      setDeleting(false);
    }
  };

  const displayTimeAgo =
    video.uploadedAt || (video.createdAt ? formatTimeAgo(video.createdAt) : "just now");

  const optionStyle = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    width: "100%",
    padding: "9px 14px",
    border: "none",
    backgroundColor: "transparent",
    color: "#0f0f0f",
    fontSize: "13.5px",
    fontWeight: 400,
    textAlign: "left",
    cursor: "pointer",
  };

  return (
    <div
      className="video-card"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        borderRadius: "12px",
      }}
    >
      {/* Thumbnail */}
      <div
        className="thumbnail-container"
        onClick={handleVideoClick}
        style={{
          cursor: "pointer",
          position: "relative",
          borderRadius: "12px",
          overflow: "hidden",
          aspectRatio: "16 / 9",
          backgroundColor: "#141414",
        }}
      >
        <img
          src={video.thumbnail || "/default-thumbnail.jpg"}
          alt={video.title}
          className="video-thumbnail"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />

        {/* Play Icon on Hover */}
        <div className="thumbnail-play-icon">
          <Play size={28} fill="white" />
        </div>

        {/* Live Badge */}
        {video.isLive && (
          <span
            className="live-badge"
            style={{
              position: "absolute",
              bottom: "8px",
              right: "8px",
              backgroundColor: "#cc0000",
              color: "#ffffff",
              fontSize: "12px",
              fontWeight: 600,
              padding: "2px 6px",
              borderRadius: "4px",
              letterSpacing: "0.4px",
            }}
          >
            LIVE
          </span>
        )}

        {/* Duration Badge */}
        {!video.isLive && autoDuration && (
          <span
            className="video-duration"
            style={{
              position: "absolute",
              bottom: "8px",
              right: "8px",
              backgroundColor: "rgba(15, 15, 15, 0.85)",
              color: "#ffffff",
              fontSize: "12px",
              fontWeight: 500,
              lineHeight: 1.2,
              padding: "3px 6px",
              borderRadius: "4px",
              fontVariantNumeric: "tabular-nums",
              pointerEvents: "none",
            }}
          >
            {autoDuration}
          </span>
        )}

        {/* Live Watching Count */}
        {video.isLive && video.watching && (
          <span className="watching-count">{video.watching} watching</span>
        )}
      </div>

      {/* Video Details */}
      <div
        className="video-details"
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "12px",
          paddingRight: "2px",
        }}
      >
        {/* Channel Avatar or Initial Circle */}
        {video.channelImage && !imgError ? (
          <img
            src={video.channelImage}
            alt={channelLabel}
            className="channel-avatar"
            onError={() => setImgError(true)}
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              objectFit: "cover",
              flexShrink: 0,
              marginTop: "2px",
            }}
          />
        ) : (
          <div
            aria-label={channelLabel}
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              backgroundColor: "#7b1fa2",
              color: "#ffffff",
              fontSize: "15px",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              marginTop: "2px",
              userSelect: "none",
            }}
          >
            {initialLetter}
          </div>
        )}

        {/* Video Information */}
        <div className="video-info" style={{ flex: 1, minWidth: 0 }}>
          <h3
            className="video-title"
            onClick={handleVideoClick}
            title={video.title}
            style={{
              cursor: "pointer",
              fontSize: "15px",
              fontWeight: 600,
              lineHeight: 1.35,
              color: "#0f0f0f",
              marginBottom: "4px",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {video.title}
          </h3>

          <div
            className="channel-name"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              fontSize: "13px",
              color: "#606060",
              fontWeight: 400,
              marginBottom: "2px",
            }}
          >
            <span>{channelLabel}</span>

            {video.verified && (
              <BadgeCheck size={14} fill="currentColor" color="#606060" />
            )}
          </div>

          <p
            className="video-meta"
            style={{
              fontSize: "13px",
              color: "#606060",
              lineHeight: 1.35,
            }}
          >
            {video.views ?? 0} views
            <span> • </span>
            {displayTimeAgo}
          </p>

          {/* Sponsored Label */}
          {video.isSponsored && (
            <p className="sponsored-label">
              <strong>Sponsored</strong>
              <span> • </span>
              {video.sponsor}
            </p>
          )}
        </div>

        {/* 3-Dot Menu + YouTube-style Dropdown */}
        <div ref={menuContainerRef} style={{ position: "relative", flexShrink: 0 }}>
          <button
            type="button"
            className="video-menu-button"
            aria-label="More options"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((prev) => !prev);
            }}
            style={{
              background: menuOpen ? "#f2f2f2" : "transparent",
              border: "none",
              borderRadius: "50%",
              padding: "6px",
              color: "#0f0f0f",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MoreVertical size={18} />
          </button>

          {menuOpen && (
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                position: "absolute",
                top: "calc(100% + 4px)",
                right: 0,
                width: "235px",
                backgroundColor: "#ffffff",
                borderRadius: "12px",
                padding: "8px 0",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.16)",
                border: "1px solid #ececec",
                zIndex: 950,
              }}
            >
              <button
                type="button"
                style={optionStyle}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f2f2f2")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                onClick={() => setMenuOpen(false)}
              >
                <ListPlus size={18} />
                <span>Add to queue</span>
              </button>

              <button
                type="button"
                style={optionStyle}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f2f2f2")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                onClick={() => setMenuOpen(false)}
              >
                <Clock size={18} />
                <span>Save to Watch later</span>
              </button>

              <button
                type="button"
                style={optionStyle}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f2f2f2")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                onClick={() => setMenuOpen(false)}
              >
                <Bookmark size={18} />
                <span>Save to playlist</span>
              </button>

              <button
                type="button"
                style={optionStyle}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f2f2f2")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                onClick={handleDownload}
              >
                <Download size={18} />
                <span>Download</span>
              </button>

              <button
                type="button"
                style={optionStyle}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f2f2f2")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                onClick={handleShare}
              >
                <Share2 size={18} />
                <span>Share</span>
              </button>

              <div style={{ height: "1px", backgroundColor: "#efefef", margin: "6px 0" }} />

              <button
                type="button"
                style={optionStyle}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f2f2f2")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                onClick={() => {
                  setMenuOpen(false);
                  if (onHideVideo && videoId) onHideVideo(videoId);
                }}
              >
                <Ban size={18} />
                <span>Not interested</span>
              </button>

              <button
                type="button"
                style={optionStyle}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f2f2f2")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                onClick={() => {
                  setMenuOpen(false);
                  if (onHideVideo && videoId) onHideVideo(videoId);
                }}
              >
                <MinusCircle size={18} />
                <span>Don&apos;t recommend channel</span>
              </button>

              <button
                type="button"
                style={optionStyle}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f2f2f2")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                onClick={() => {
                  setMenuOpen(false);
                  alert("Report submitted.");
                }}
              >
                <Flag size={18} />
                <span>Report</span>
              </button>

              <div style={{ height: "1px", backgroundColor: "#efefef", margin: "6px 0" }} />

              <button
                type="button"
                disabled={deleting}
                style={{
                  ...optionStyle,
                  color: "#c62828",
                  fontWeight: 500,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fdecea")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                onClick={handleDeleteClick}
              >
                <Trash2 size={18} color="#c62828" />
                <span>{deleting ? "Deleting..." : "Delete"}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Sponsored Buttons */}
      {video.isSponsored && (
        <div className="sponsored-actions">
          <button
            type="button"
            className="watch-button"
            onClick={handleVideoClick}
          >
            <Play size={16} />
            Watch
          </button>

          <button type="button" className="visit-button">
            Visit site
          </button>
        </div>
      )}
    </div>
  );
}

export default VideoCard;