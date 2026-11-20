
import React from "react";
import { MoreVertical, BadgeCheck, Play } from "lucide-react";

function VideoCard({ video }) {

  return (
    <div className="video-card">

      {/* Thumbnail */}
      <div className="thumbnail-container">

        <img
          src={video.thumbnail}
          alt={video.title}
          className="video-thumbnail"
        />

        {/* Live Badge */}
        {video.isLive && (
          <span className="live-badge">
            <span className="live-dot"></span>
            LIVE
          </span>
        )}

        {/* Video Duration */}
        {!video.isLive && video.duration && (
          <span className="video-duration">
            {video.duration}
          </span>
        )}

        {/* Live Watching Count */}
        {video.isLive && video.watching && (
          <span className="watching-count">
            {video.watching} watching
          </span>
        )}

      </div>

      {/* Video Details */}
      <div className="video-details">

        {/* Channel Avatar */}
        <img
          src={video.channelImage}
          alt={video.channelName}
          className="channel-avatar"
        />

        {/* Video Information */}
        <div className="video-info">

          <h3 className="video-title">
            {video.title}
          </h3>

          <div className="channel-name">

            <span>{video.channelName}</span>

            {video.verified && (
              <BadgeCheck
                size={15}
                fill="currentColor"
                color="#606060"
              />
            )}

          </div>

          <p className="video-meta">
            {video.views} views
            <span> • </span>
            {video.uploadedAt}
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

        {/* More Options */}
        <button
          className="video-menu-button"
          aria-label="More options"
        >
          <MoreVertical size={22} />
        </button>

      </div>

      {/* Sponsored Buttons */}
      {video.isSponsored && (
        <div className="sponsored-actions">

          <button className="watch-button">
            <Play size={16} />
            Watch
          </button>

          <button className="visit-button">
            Visit site
          </button>

        </div>
      )}

    </div>
  );
}

export default VideoCard;
