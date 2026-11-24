import React, { useEffect } from "react";
import { X } from "lucide-react";

function VideoPlayerModal({ video, onClose }) {
  useEffect(() => {
    if (!video) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [video, onClose]);

  if (!video) return null;

  const playableSrc = video.videoUrl || video.url || "";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1100,
        padding: "16px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "860px",
          backgroundColor: "#0f0f0f",
          color: "#ffffff",
          borderRadius: "14px",
          overflow: "hidden",
          boxShadow: "0 16px 40px rgba(0, 0, 0, 0.5)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 18px",
            borderBottom: "1px solid #272727",
          }}
        >
          <h3
            style={{
              fontSize: "16px",
              fontWeight: 600,
              marginRight: "12px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {video.title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close video player"
            style={{
              background: "transparent",
              border: "none",
              color: "#ffffff",
              padding: "4px",
              borderRadius: "50%",
              flexShrink: 0,
            }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Video Element */}
        <div style={{ backgroundColor: "#000000" }}>
          {playableSrc ? (
            <video
              src={playableSrc}
              poster={video.thumbnail || undefined}
              controls
              autoPlay
              style={{
                width: "100%",
                maxHeight: "65vh",
                display: "block",
                backgroundColor: "#000000",
              }}
            />
          ) : (
            <div style={{ padding: "48px 20px", textAlign: "center", color: "#aaaaaa" }}>
              Video URL unavailable for this item.
            </div>
          )}
        </div>

        {/* Title & Description */}
        <div style={{ padding: "16px 20px" }}>
          <h4 style={{ fontSize: "17px", fontWeight: 600, marginBottom: "6px" }}>
            {video.title}
          </h4>
          {video.channelName && (
            <p style={{ fontSize: "13px", color: "#aaaaaa", marginBottom: "10px" }}>
              {video.channelName}
            </p>
          )}
          <p
            style={{
              fontSize: "14px",
              color: "#e5e5e5",
              lineHeight: 1.5,
              whiteSpace: "pre-line",
            }}
          >
            {video.description || "No description provided."}
          </p>
        </div>
      </div>
    </div>
  );
}

export default VideoPlayerModal;