import React, { useState, useEffect, useCallback } from "react";

// Import components
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import CategoryBar from "./components/CategoryBar";
import VideoCard from "./components/VideoCard";
import UploadModal from "./components/UploadModal";
import VideoPlayerModal from "./components/VideoPlayerModal";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function HomePage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [videos, setVideos] = useState([]);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);

  const handleMenuClick = () => {
    setIsSidebarOpen((prevState) => !prevState);
  };

  const handleSidebarClose = () => {
    setIsSidebarOpen(false);
  };

  // Fetch live videos from MongoDB backend
  const fetchVideos = useCallback(async () => {
    try {
      setLoadingVideos(true);
      setFetchError("");
      const res = await fetch(`${API_URL}/api/videos`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to load videos");
      }
      setVideos(Array.isArray(data) ? data : []);
    } catch (err) {
      setFetchError(err.message || "Could not connect to backend");
    } finally {
      setLoadingVideos(false);
    }
  }, []);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  // Upload video to backend (Cloudinary + MongoDB)
  const handleVideoUpload = async ({ title, description, videoFile }) => {
    const formData = new FormData();
    formData.append("video", videoFile);
    formData.append("title", title);
    formData.append("description", description);

    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const res = await fetch(`${API_URL}/api/videos`, {
      method: "POST",
      headers,
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Upload failed");
    }

    // Add newly uploaded video at the top of the homepage feed
    if (data.video) {
      setVideos((prev) => [data.video, ...prev]);
    } else {
      await fetchVideos();
    }
  };

  // Delete video from backend (MongoDB + Cloudinary) and update UI
  const handleDeleteVideo = async (videoId) => {
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const res = await fetch(`${API_URL}/api/videos/${videoId}`, {
      method: "DELETE",
      headers,
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Failed to delete video");
    }

    setVideos((prev) => prev.filter((item) => (item._id || item.id) !== videoId));
    if (selectedVideo && (selectedVideo._id || selectedVideo.id) === videoId) {
      setSelectedVideo(null);
    }
  };

  return (
    <div className="homepage">
      {/* Top Navigation Bar */}
      <Navbar
        onMenuClick={handleMenuClick}
        onOpenUploadModal={() => setIsUploadOpen(true)}
      />

      <div className="homepage-body">
        {/* Sidebar */}
        <Sidebar isOpen={isSidebarOpen} onClose={handleSidebarClose} />

        {/* Main Homepage Content */}
        <main className="main-content">
          {/* Video Categories */}
          <CategoryBar />

          {/* Live Video Cards from MongoDB */}
          <section className="videos-grid">
            {loadingVideos ? (
              <p style={{ padding: "20px" }}>Loading videos...</p>
            ) : fetchError ? (
              <p style={{ padding: "20px", color: "#d93025" }}>{fetchError}</p>
            ) : videos.length === 0 ? (
              <p style={{ padding: "20px" }}>
                No videos yet. Click <strong>Create → Upload video</strong> to upload the first video!
              </p>
            ) : (
              videos.map((video, index) => (
                <VideoCard
                  key={video._id || video.id || index}
                  video={video}
                  onSelectVideo={(vid) => setSelectedVideo(vid)}
                  onDeleteVideo={handleDeleteVideo}
                  onHideVideo={(vidId) =>
                    setVideos((prev) =>
                      prev.filter((item) => (item._id || item.id) !== vidId)
                    )
                  }
                />
              ))
            )}
          </section>
        </main>
      </div>

      {/* Upload Video Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onVideoUploaded={handleVideoUpload}
      />

      {/* Video Playback Modal */}
      <VideoPlayerModal
        video={selectedVideo}
        onClose={() => setSelectedVideo(null)}
      />
    </div>
  );
}

export default HomePage;