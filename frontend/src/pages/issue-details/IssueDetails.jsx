import { useParams, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiMapPin,
  FiCalendar,
  FiClock,
  FiAlertCircle,
  FiPhone,
  FiImage,
} from "react-icons/fi";
import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";
import "./IssueDetails.css";

export default function IssueDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Get Google Maps API key from environment
  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  // Mock data - replace with actual API call
  const issue = {
    id: id || "1",
    registrationNumber: `#367374${873467873898 + parseInt(id || 1)}`,
    title: "Pothole on Main Street",
    type: "potholes",
    description:
      "Large pothole near the traffic signal causing inconvenience to commuters. The pothole is approximately 2 feet wide and 6 inches deep. Multiple vehicles have been damaged due to this.",
    status: "in-progress",
    priority: "urgent",
    location: {
      lat: 28.6139,
      lng: 77.209,
      address: "Main Street, Near City Center, New Delhi - 110001",
    },
    dateCreated: "2025-10-10T10:30:00",
    dateUpdated: "2025-10-12T14:20:00",
    phone: "9876543210",
    images: [
      "https://images.unsplash.com/photo-1621447504864-d8686e12698c?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1621447504864-d8686e12698c?w=400&h=300&fit=crop",
    ],
    timeline: [
      {
        date: "2025-10-10T10:30:00",
        status: "registered",
        message: "Issue registered successfully",
      },
      {
        date: "2025-10-11T09:15:00",
        status: "in-progress",
        message: "Issue assigned to maintenance team",
      },
      {
        date: "2025-10-12T14:20:00",
        status: "in-progress",
        message: "Team inspected the location",
      },
    ],
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "pending":
        return "status-pending";
      case "in-progress":
        return "status-in-progress";
      case "closed":
        return "status-closed";
      default:
        return "";
    }
  };

  const getCategoryLabel = (category) => {
    const labels = {
      potholes: "Potholes",
      "rubbish-bins": "Rubbish Bins",
      streetlights: "Streetlights",
      "public-spaces": "Public Spaces",
      other: "Other",
    };
    return labels[category] || category;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="issue-details-container">
      <div className="details-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <FiArrowLeft />
          <span>Back</span>
        </button>
        <div className="header-info">
          <h1>Issue Details</h1>
          <p className="registration-number">{issue.registrationNumber}</p>
        </div>
      </div>

      <div className="details-content">
        {/* Main Info Card */}
        <div className="info-card main-info">
          <div className="card-header">
            <div className="title-section">
              <h2>{issue.title}</h2>
              <div className="badges">
                <span
                  className={`status-badge ${getStatusClass(issue.status)}`}
                >
                  {issue.status.replace("-", " ")}
                </span>
                <span className="category-badge">
                  {getCategoryLabel(issue.type)}
                </span>
                {issue.priority === "urgent" && (
                  <span className="priority-badge">
                    <FiAlertCircle />
                    Urgent
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="card-body">
            <div className="info-section">
              <h3>Description</h3>
              <p className="description-text">{issue.description}</p>
            </div>

            <div className="info-grid">
              <div className="info-item">
                <div className="info-label">
                  <FiCalendar />
                  <span>Reported On</span>
                </div>
                <p className="info-value">{formatDate(issue.dateCreated)}</p>
                <p className="info-time">{formatTime(issue.dateCreated)}</p>
              </div>

              <div className="info-item">
                <div className="info-label">
                  <FiClock />
                  <span>Last Updated</span>
                </div>
                <p className="info-value">{formatDate(issue.dateUpdated)}</p>
                <p className="info-time">{formatTime(issue.dateUpdated)}</p>
              </div>

              {issue.phone && (
                <div className="info-item">
                  <div className="info-label">
                    <FiPhone />
                    <span>Contact Number</span>
                  </div>
                  <p className="info-value">{issue.phone}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Location Card */}
        <div className="info-card location-card">
          <div className="card-header">
            <h3>
              <FiMapPin />
              Location
            </h3>
          </div>
          <div className="card-body">
            <p className="location-address">{issue.location.address}</p>
            <p className="location-coords">
              Coordinates: {issue.location.lat.toFixed(6)},{" "}
              {issue.location.lng.toFixed(6)}
            </p>
            <div className="google-map-container">
              {GOOGLE_MAPS_API_KEY ? (
                <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
                  <Map
                    defaultCenter={{
                      lat: issue.location.lat,
                      lng: issue.location.lng,
                    }}
                    defaultZoom={15}
                    mapId="issue-location-map"
                    gestureHandling="cooperative"
                    disableDefaultUI={false}
                  >
                    <Marker
                      position={{
                        lat: issue.location.lat,
                        lng: issue.location.lng,
                      }}
                      title={issue.title}
                    />
                  </Map>
                </APIProvider>
              ) : (
                <div className="map-placeholder">
                  <FiMapPin size={48} />
                  <p>Google Maps API Key Missing</p>
                  <small>
                    Please add VITE_GOOGLE_MAPS_API_KEY to your .env.local file
                  </small>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Images Card */}
        {issue.images && issue.images.length > 0 && (
          <div className="info-card images-card">
            <div className="card-header">
              <h3>
                <FiImage />
                Attachments ({issue.images.length})
              </h3>
            </div>
            <div className="card-body">
              <div className="images-grid">
                {issue.images.map((image, index) => (
                  <div key={index} className="image-item">
                    <img src={image} alt={`Issue ${index + 1}`} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Timeline Card */}
        <div className="info-card timeline-card">
          <div className="card-header">
            <h3>
              <FiClock />
              Timeline
            </h3>
          </div>
          <div className="card-body">
            <div className="timeline">
              {issue.timeline.map((event, index) => (
                <div key={index} className="timeline-item">
                  <div className="timeline-marker">
                    <div
                      className={`marker-dot ${getStatusClass(event.status)}`}
                    ></div>
                    {index < issue.timeline.length - 1 && (
                      <div className="marker-line"></div>
                    )}
                  </div>
                  <div className="timeline-content">
                    <p className="timeline-message">{event.message}</p>
                    <p className="timeline-date">
                      {formatDate(event.date)} at {formatTime(event.date)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
