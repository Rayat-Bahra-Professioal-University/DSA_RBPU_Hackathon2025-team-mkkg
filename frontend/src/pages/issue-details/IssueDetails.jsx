import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser, useAuth } from "@clerk/clerk-react";
import {
  FiArrowLeft,
  FiMapPin,
  FiCalendar,
  FiClock,
  FiAlertCircle,
  FiPhone,
  FiImage,
  FiCheckCircle,
  FiEdit,
  FiTrash2,
  FiUserCheck,
  FiUpload,
  FiX,
  FiCamera,
} from "react-icons/fi";
import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";
import "./IssueDetails.css";
import { useApi } from "../../services/api";

export default function IssueDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const api = useApi();
  const { user } = useUser();
  const { isLoaded, isSignedIn } = useAuth();

  const [issue, setIssue] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Admin controls state
  const [adminNote, setAdminNote] = useState("");
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [resolutionPhotos, setResolutionPhotos] = useState([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [admins, setAdmins] = useState([]);

  // Camera state
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Check if user is admin
  const isAdmin =
    user?.publicMetadata?.role === "admin" ||
    user?.privateMetadata?.role === "admin";

  // Get Google Maps API key from environment
  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchIssueDetails();
      if (isAdmin) {
        fetchAdmins();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isAdmin, isLoaded, isSignedIn]);

  const fetchAdmins = async () => {
    try {
      const response = await api.getAdmins();
      setAdmins(response.admins || []);
    } catch (err) {
      console.error("Error fetching admins:", err);
    }
  };

  const fetchIssueDetails = async () => {
    // Don't fetch if not authenticated
    if (!isLoaded || !isSignedIn) {
      setIsLoading(true);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const complaint = await api.getComplaint(id);
      setIssue(complaint);
    } catch (err) {
      console.error("Error fetching complaint details:", err);
      setError(err.message || "Failed to load complaint details");
    } finally {
      setIsLoading(false);
    }
  };

  // Format date helper
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Admin control functions
  const handleStatusChange = async (newStatus) => {
    if (newStatus === "closed") {
      setShowCloseModal(true);
      return;
    }

    try {
      await api.updateComplaintStatus(id, newStatus, adminNote || null);
      await fetchIssueDetails();
      setAdminNote("");
    } catch (err) {
      console.error("Error updating status:", err);
      alert(`Failed to update status: ${err.message}`);
    }
  };

  const handleAssignChange = async (assignedTo) => {
    try {
      await api.assignComplaint(id, assignedTo || null);
      await fetchIssueDetails();
    } catch (err) {
      console.error("Error assigning complaint:", err);
      alert(`Failed to assign complaint: ${err.message}`);
    }
  };

  const handleDeleteComplaint = async () => {
    if (!confirm("Are you sure you want to delete this complaint?")) {
      return;
    }

    try {
      await api.deleteComplaintAdmin(id);
      navigate("/admin");
    } catch (err) {
      console.error("Error deleting complaint:", err);
      alert(`Failed to delete complaint: ${err.message}`);
    }
  };

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingPhotos(true);
    try {
      const uploadedUrls = await api.uploadFiles(files);
      setResolutionPhotos((prev) => [...prev, ...uploadedUrls]);
    } catch (err) {
      console.error("Error uploading photos:", err);
      alert(`Failed to upload photos: ${err.message}`);
    } finally {
      setUploadingPhotos(false);
    }
  };

  const startCamera = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert(
          "Camera access is not supported in your browser. Please use Chrome, Firefox, or Safari."
        );
        return;
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      setStream(mediaStream);
      setShowCamera(true);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play().catch((err) => {
            console.error("Error playing video:", err);
          });
        }
      }, 100);
    } catch (error) {
      console.error("Error accessing camera:", error);
      let errorMessage = "Unable to access camera.";

      if (
        error.name === "NotAllowedError" ||
        error.name === "PermissionDeniedError"
      ) {
        errorMessage =
          "Camera permission denied. Please allow camera access in your browser settings.";
      } else if (error.name === "NotFoundError") {
        errorMessage = "No camera found on your device.";
      } else if (error.name === "NotReadableError") {
        errorMessage = "Camera is already in use by another application.";
      }

      alert(errorMessage);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      if (!blob) return;

      const file = new File([blob], `resolution-${Date.now()}.jpg`, {
        type: "image/jpeg",
      });

      setUploadingPhotos(true);
      try {
        const uploadedUrls = await api.uploadFiles([file]);
        setResolutionPhotos((prev) => [...prev, ...uploadedUrls]);
        stopCamera();
      } catch (err) {
        console.error("Error uploading photo:", err);
        alert(`Failed to upload photo: ${err.message}`);
      } finally {
        setUploadingPhotos(false);
      }
    }, "image/jpeg");
  };

  const handleCloseComplaint = async () => {
    try {
      await api.updateComplaintStatus(
        id,
        "closed",
        adminNote || null,
        resolutionPhotos.length > 0 ? resolutionPhotos : null
      );
      setShowCloseModal(false);
      setAdminNote("");
      setResolutionPhotos([]);
      await fetchIssueDetails();
    } catch (err) {
      console.error("Error closing complaint:", err);
      alert(`Failed to close complaint: ${err.message}`);
    }
  };

  const getAdminName = (adminId) => {
    const admin = admins.find((a) => a.id === adminId);
    return admin ? admin.name || admin.email : "Unassigned";
  };

  if (isLoading) {
    return (
      <div className="issue-details-container">
        <div
          style={{
            textAlign: "center",
            padding: "3rem",
            background: "var(--card-bg)",
            borderRadius: "8px",
          }}
        >
          <div className="loading-spinner"></div>
          <p>Loading complaint details...</p>
        </div>
      </div>
    );
  }

  if (error || !issue) {
    return (
      <div className="issue-details-container">
        <div
          style={{
            textAlign: "center",
            padding: "2rem",
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            borderRadius: "8px",
            color: "#ef4444",
          }}
        >
          <h2>Error Loading Complaint</h2>
          <p>{error || "Complaint not found"}</p>
          <button
            onClick={() => navigate("/dashboard")}
            style={{
              marginTop: "1rem",
              padding: "0.5rem 1.5rem",
              background: "var(--accent-primary)",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

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
                <p className="info-value">{formatDate(issue.createdAt)}</p>
                <p className="info-time">{formatTime(issue.createdAt)}</p>
              </div>

              <div className="info-item">
                <div className="info-label">
                  <FiClock />
                  <span>Last Updated</span>
                </div>
                <p className="info-value">{formatDate(issue.updatedAt)}</p>
                <p className="info-time">{formatTime(issue.updatedAt)}</p>
              </div>

              {issue.phone && (
                <div className="info-item">
                  <div className="info-label">
                    <FiPhone />
                    <span>Contact</span>
                  </div>
                  <p className="info-value">{issue.phone}</p>
                </div>
              )}

              {issue.urgent && (
                <div className="info-item urgent-item">
                  <div className="info-label">
                    <FiAlertCircle />
                    <span>Priority</span>
                  </div>
                  <p className="info-value urgent-text">URGENT</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Images Card */}
        {issue.files && issue.files.length > 0 && (
          <div className="info-card images-card">
            <div className="card-header">
              <h3>
                <FiImage />
                Attached Images (Original Complaint)
              </h3>
            </div>
            <div className="card-body">
              <div className="images-grid">
                {issue.files.map((file, index) => (
                  <div key={index} className="image-item">
                    <img src={file.url} alt={`Evidence ${index + 1}`} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Resolution Photos Card */}
        {issue.status === "closed" &&
          issue.resolutionPhotos &&
          issue.resolutionPhotos.length > 0 && (
            <div className="info-card images-card">
              <div className="card-header">
                <h3>
                  <FiCheckCircle />
                  Resolution Photos
                </h3>
                <span
                  className="status-badge"
                  style={{
                    background: "rgba(34, 197, 94, 0.1)",
                    color: "#22c55e",
                    padding: "0.25rem 0.75rem",
                    borderRadius: "20px",
                    fontSize: "0.875rem",
                  }}
                >
                  Issue Resolved
                </span>
              </div>
              <div className="card-body">
                <p
                  style={{
                    color: "var(--text-secondary)",
                    marginBottom: "1rem",
                  }}
                >
                  Photos showing the resolved state of the issue:
                </p>
                <div className="images-grid">
                  {issue.resolutionPhotos.map((file, index) => (
                    <div key={index} className="image-item">
                      <img src={file.url} alt={`Resolution ${index + 1}`} />
                    </div>
                  ))}
                </div>
                {issue.resolvedAt && (
                  <p
                    style={{
                      color: "var(--text-secondary)",
                      marginTop: "1rem",
                      fontSize: "0.875rem",
                    }}
                  >
                    Resolved on {formatDate(issue.resolvedAt)} at{" "}
                    {formatTime(issue.resolvedAt)}
                  </p>
                )}
              </div>
            </div>
          )}

        {/* Location Card */}
        <div className="info-card location-card">
          <div className="card-header">
            <h3>
              <FiMapPin />
              Location
            </h3>
          </div>
          <div className="card-body">
            {/* <p className="location-address">
              {issue.location.address || "Address not available"}
            </p> */}
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
                      title={getCategoryLabel(issue.type)}
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

        {/* Admin Controls - Only visible to admins */}
        {isAdmin && (
          <div className="info-card admin-controls-card">
            <div className="card-header">
              <h3>
                <FiEdit />
                Admin Controls
              </h3>
            </div>
            <div className="card-body">
              <div className="admin-controls-grid">
                {/* Status Control */}
                <div className="control-group">
                  <label>Change Status</label>
                  <select
                    className="admin-select"
                    value={issue.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="closed">Closed</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                {/* Assign Control */}
                <div className="control-group">
                  <label>Assigned To</label>
                  <select
                    className="admin-select"
                    value={issue.assignedTo || ""}
                    onChange={(e) => handleAssignChange(e.target.value)}
                  >
                    <option value="">Unassigned</option>
                    {admins.map((admin) => (
                      <option key={admin.id} value={admin.id}>
                        {admin.name || admin.email}
                      </option>
                    ))}
                  </select>
                  {issue.assignedTo && (
                    <p className="assigned-info">
                      Currently assigned to: {getAdminName(issue.assignedTo)}
                    </p>
                  )}
                </div>

                {/* Admin Note */}
                <div className="control-group full-width">
                  <label>Admin Note (Optional)</label>
                  <textarea
                    className="admin-textarea"
                    placeholder="Add a note for this status change..."
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    rows={3}
                  />
                </div>

                {/* Delete Button */}
                <div className="control-group">
                  <button
                    className="admin-delete-btn"
                    onClick={handleDeleteComplaint}
                  >
                    <FiTrash2 />
                    Delete Complaint
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Close Complaint Modal */}
      {showCloseModal && (
        <div className="modal-overlay" onClick={() => setShowCloseModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Close Complaint</h2>
              <button
                className="modal-close-btn"
                onClick={() => setShowCloseModal(false)}
              >
                <FiX />
              </button>
            </div>
            <div className="modal-body">
              <p className="modal-description">
                Please upload resolution photos and add a note before closing
                this complaint.
              </p>

              <div className="form-group">
                <label>
                  Admin Note <span style={{ color: "#888" }}>(Optional)</span>
                </label>
                <textarea
                  className="admin-textarea"
                  placeholder="Describe the resolution..."
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  rows={4}
                  style={{ width: "100%" }}
                />
              </div>

              <div className="form-group">
                <label>
                  Resolution Photos{" "}
                  <span style={{ color: "#f97316" }}>*Required</span>
                </label>
                <p className="form-hint">
                  Upload photos showing the resolved issue
                </p>

                <div className="photo-upload-area">
                  <input
                    type="file"
                    id="resolution-photos-issue"
                    className="file-input"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    disabled={uploadingPhotos}
                  />
                  <label
                    htmlFor="resolution-photos-issue"
                    className="upload-label"
                  >
                    <FiUpload />
                    {uploadingPhotos
                      ? "Uploading..."
                      : "Click to upload photos"}
                  </label>
                  <button
                    type="button"
                    className="camera-btn"
                    onClick={startCamera}
                    disabled={uploadingPhotos}
                  >
                    <FiCamera />
                    Take Photo
                  </button>
                </div>

                {resolutionPhotos.length > 0 && (
                  <div className="uploaded-photos">
                    {resolutionPhotos.map((photo, index) => (
                      <div key={index} className="photo-preview">
                        <img src={photo.url} alt={`Resolution ${index + 1}`} />
                        <button
                          className="remove-photo-btn"
                          onClick={() =>
                            setResolutionPhotos((prev) =>
                              prev.filter((_, i) => i !== index)
                            )
                          }
                        >
                          <FiX />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowCloseModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleCloseComplaint}
                disabled={resolutionPhotos.length === 0 || uploadingPhotos}
              >
                <FiCheckCircle />
                Close Complaint
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Camera Modal */}
      {showCamera && (
        <div className="camera-modal-overlay" onClick={stopCamera}>
          <div className="camera-modal" onClick={(e) => e.stopPropagation()}>
            <div className="camera-header">
              <h3>Take Resolution Photo</h3>
              <button className="close-camera-btn" onClick={stopCamera}>
                <FiX />
              </button>
            </div>
            <div className="camera-container">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="camera-video"
              />
              <canvas ref={canvasRef} style={{ display: "none" }} />
            </div>
            <div className="camera-controls">
              <button
                type="button"
                className="capture-btn"
                onClick={capturePhoto}
                disabled={uploadingPhotos}
              >
                <FiCamera />{" "}
                {uploadingPhotos ? "Uploading..." : "Capture Photo"}
              </button>
              <button
                type="button"
                className="cancel-camera-btn"
                onClick={stopCamera}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
