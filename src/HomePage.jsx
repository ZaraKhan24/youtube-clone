
import React, { useState } from "react";

// Import components
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import CategoryBar from "./components/CategoryBar";
import VideoCard from "./components/VideoCard";

// Import dummy video data
import videos from "./data/videos";

function HomePage() {

  // Sidebar open/close state
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Toggle sidebar
  const handleMenuClick = () => {
    setIsSidebarOpen((prevState) => !prevState);
  };

  return (
    <div className="homepage">

      {/* Top Navigation Bar */}
      <Navbar onMenuClick={handleMenuClick} />

      <div className="homepage-body">

        {/* Sidebar */}
        <Sidebar isOpen={isSidebarOpen} />

        {/* Main Homepage Content */}
        <main className="main-content">

          {/* Video Categories */}
          <CategoryBar />

          {/* Video Cards */}
          <section className="videos-grid">

            {videos.map((video, index) => (
              <VideoCard
                key={video.id || index}
                video={video}
              />
            ))}

          </section>

        </main>

      </div>

    </div>
  );
}

export default HomePage;
