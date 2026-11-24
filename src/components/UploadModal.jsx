import React, { useState } from "react";
import { X, Upload, Film } from "lucide-react";

function UploadModal({ isOpen, onClose, onVideoUploaded }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      setError("Please select a valid video file (MP4, WebM, MOV, etc.)");
      return;
    }

    setError("");
    setVideoFile(file);
  };

  const resetAndClose = () => {
    setTitle("");
    setDescription("");
    setVideoFile(null);
    setError("");
    setUploading(false);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!videoFile) {
      setError("Please choose a video file first");
      return;
    }

    if (!title.trim()) {
      setError("Please enter a video title");
      return;
    }

    try {
      setUploading(true);
      if (onVideoUploaded) {
        await onVideoUploaded({
          title: title.trim(),
          description: description.trim(),
          videoFile,
        });
      }
      resetAndClose();
    } catch (err) {
      setError(err?.message || "Video upload failed");
      setUploading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.65)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "16px",
      }}
      onClick={resetAndClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "540px",
          backgroundColor: "#ffffff",
          borderRadius: "14px",
          padding: "24px",
          boxShadow: "0 12px 32px rgba(0, 0, 0, 0.25)",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingBottom: "14px",
            borderBottom: "1px solid #e5e5e5",
            marginBottom: "18px",
          }}
        >
          <h2 style={{ fontSize: "19px", fontWeight: 600 }}>Upload Video</h2>
          <button
            type="button"
            onClick={resetAndClose}
            aria-label="Close upload modal"
            style={{
              background: "transparent",
              border: "none",
              padding: "4px",
              borderRadius: "50%",
            }}
          >
            <X size={22} />
          </button>
        </div>

        {error && (
          <p
            style={{
              color: "#d93025",
              backgroundColor: "#fce8e6",
              padding: "8px 12px",
              borderRadius: "8px",
              fontSize: "13px",
              marginBottom: "14px",
            }}
          >
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          {/* Video File Picker */}
          <label
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              border: "2px dashed #cccccc",
              borderRadius: "12px",
              padding: "24px 16px",
              marginBottom: "16px",
              cursor: "pointer",
              backgroundColor: "#f9f9f9",
              textAlign: "center",
            }}
          >
            {videoFile ? <Film size={32} /> : <Upload size={32} />}
            <span style={{ fontSize: "14px", fontWeight: 500 }}>
              {videoFile ? videoFile.name : "Select video file to upload"}
            </span>
            <span style={{ fontSize: "12px", color: "#606060" }}>
              {videoFile
                ? `${(videoFile.size / (1024 * 1024)).toFixed(2)} MB`
                : "MP4, WebM, MOV supported"}
            </span>
            <input
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
          </label>

          {/* Title */}
          <div style={{ marginBottom: "14px" }}>
            <label
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: 500,
                marginBottom: "6px",
              }}
            >
              Title *
            </label>
            <input
              type="text"
              placeholder="Add a title that describes your video"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "8px",
                border: "1px solid #cccccc",
                fontSize: "14px",
              }}
            />
          </div>

          {/* Description */}
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: 500,
                marginBottom: "6px",
              }}
            >
              Description
            </label>
            <textarea
              rows={4}
              placeholder="Tell viewers about your video"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "8px",
                border: "1px solid #cccccc",
                fontSize: "14px",
                resize: "vertical",
              }}
            />
          </div>

          {/* Actions */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
            }}
          >
            <button
              type="button"
              onClick={resetAndClose}
              disabled={uploading}
              style={{
                padding: "9px 18px",
                borderRadius: "20px",
                border: "1px solid #cccccc",
                backgroundColor: "#ffffff",
                fontWeight: 500,
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              style={{
                padding: "9px 20px",
                borderRadius: "20px",
                border: "none",
                backgroundColor: "#0f0f0f",
                color: "#ffffff",
                fontWeight: 500,
              }}
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UploadModal;