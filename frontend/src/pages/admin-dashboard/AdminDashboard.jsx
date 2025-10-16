import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useUser, useAuth } from "@clerk/clerk-react";
import {
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiFileText,
  FiFilter,
  FiRefreshCw,
  FiTrendingUp,
  FiXCircle,
  FiEye,
  FiTrash2,
  FiUpload,
  FiX,
  FiCamera,
} from "react-icons/fi";
import "./AdminDashboard.css";
import { useApi } from "../../services/api";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const api = useApi();
  const { user } = useUser();
  const { isLoaded, isSignedIn } = useAuth();

  const [stats, setStats] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    type: "",
    urgent: "",
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  // Modal state for closing issue
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [resolutionPhotos, setResolutionPhotos] = useState([]);
  const [adminNote, setAdminNote] = useState("");
  const [uploadingPhotos, setUploadingPhotos] = useState(false);

  // Camera state
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Check if user is admin
  const isAdmin =
    user?.publicMetadata?.role === "admin" ||
    user?.privateMetadata?.role === "admin";

  useEffect(() => {
    // Wait for Clerk to load before checking admin status
    if (!isLoaded) {
      return;
    }

    if (!isAdmin && user) {
      // Redirect non-admins
      navigate("/dashboard");
      return;
    }

    if (isAdmin && isSignedIn) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, user, pagination.page, filters, isLoaded, isSignedIn]);

  const fetchData = async () => {
    // Don't fetch if not authenticated
    if (!isLoaded || !isSignedIn) {
      setIsLoading(true);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch stats and complaints in parallel
      const [statsResponse, complaintsResponse] = await Promise.all([
        api.getAdminStats(),
        api.getAdminComplaints({
          page: pagination.page,
          limit: pagination.limit,
          ...filters,
        }),
      ]);

      setStats(statsResponse.overview);
      setComplaints(complaintsResponse.data || []);
      setPagination((prev) => ({
        ...prev,
        total: complaintsResponse.pagination?.total || 0,
        pages: complaintsResponse.pagination?.pages || 0,
      }));
    } catch (err) {
      console.error("Error fetching admin data:", err);
      setError(err.message || "Failed to load admin dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (complaintId, newStatus, complaint) => {
    // If changing to "closed", open modal for photo upload
    if (newStatus === "closed") {
      setSelectedComplaint(complaint);
      setShowCloseModal(true);
      return;
    }

    // For other status changes, proceed directly
    try {
      await api.updateComplaintStatus(complaintId, newStatus);
      fetchData();
    } catch (err) {
      console.error("Error updating status:", err);
      alert(`Failed to update status: ${err.message}`);
    }
  };

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingPhotos(true);
    try {
      const uploadedPhotos = await api.uploadFiles(files);
      // Ensure uploadedPhotos is an array
      const photosArray = Array.isArray(uploadedPhotos) ? uploadedPhotos : [];
      setResolutionPhotos((prev) => [...prev, ...photosArray]);
    } catch (err) {
      console.error("Error uploading photos:", err);
      alert(`Failed to upload photos: ${err.message}`);
    } finally {
      setUploadingPhotos(false);
    }
  };

  const handleRemovePhoto = (index) => {
    setResolutionPhotos((prev) => prev.filter((_, i) => i !== index));
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
    const context = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      async (blob) => {
        if (blob) {
          const timestamp = Date.now();
          const file = new File([blob], `resolution-photo-${timestamp}.jpg`, {
            type: "image/jpeg",
          });

          setUploadingPhotos(true);
          try {
            const uploadedPhotos = await api.uploadFiles([file]);
            const photosArray = Array.isArray(uploadedPhotos)
              ? uploadedPhotos
              : [];
            setResolutionPhotos((prev) => [...prev, ...photosArray]);
            stopCamera();
          } catch (err) {
            console.error("Error uploading photo:", err);
            alert(`Failed to upload photo: ${err.message}`);
          } finally {
            setUploadingPhotos(false);
          }
        }
      },
      "image/jpeg",
      0.9
    );
  };

  const handleCloseIssue = async () => {
    if (resolutionPhotos.length === 0) {
      alert("Please upload at least one photo showing the resolved issue");
      return;
    }

    try {
      await api.updateComplaintStatus(
        selectedComplaint._id,
        "closed",
        adminNote,
        resolutionPhotos
      );

      // Reset modal state
      setShowCloseModal(false);
      setSelectedComplaint(null);
      setResolutionPhotos([]);
      setAdminNote("");

      // Refresh data
      fetchData();
    } catch (err) {
      console.error("Error closing issue:", err);
      alert(`Failed to close issue: ${err.message}`);
    }
  };

  const handleCancelClose = () => {
    setShowCloseModal(false);
    setSelectedComplaint(null);
    setResolutionPhotos([]);
    setAdminNote("");
  };

  const handleDeleteComplaint = async (complaintId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this complaint? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await api.deleteComplaintAdmin(complaintId, false);
      fetchData();
    } catch (err) {
      console.error("Error deleting complaint:", err);
      alert(`Failed to delete complaint: ${err.message}`);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to page 1 when filtering
  };

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

  // Show access denied if not admin
  if (!isAdmin && user) {
    return (
      <div className="admin-dashboard-container">
        <div className="error-container">
          <h2>Access Denied</h2>
          <p>You don't have permission to access the admin dashboard.</p>
          <button
            onClick={() => navigate("/dashboard")}
            style={{
              marginTop: "1rem",
              padding: "0.5rem 1.5rem",
              background: "var(--accent-primary)",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (isLoading && !stats) {
    return (
      <div className="admin-dashboard-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard-container">
        <div className="error-container">
          <h2>Error Loading Dashboard</h2>
          <p>{error}</p>
          <button
            onClick={fetchData}
            style={{
              marginTop: "1rem",
              padding: "0.5rem 1.5rem",
              background: "var(--accent-primary)",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Manage and monitor all civic complaints</p>
      </div>

      {/* Statistics Cards */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="stat-header">
            <div className="stat-icon total">
              <FiFileText />
            </div>
          </div>
          <div className="stat-content">
            <h3>{stats?.total || 0}</h3>
            <p>Total Complaints</p>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-header">
            <div className="stat-icon pending">
              <FiClock />
            </div>
          </div>
          <div className="stat-content">
            <h3>{stats?.pending || 0}</h3>
            <p>Pending</p>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-header">
            <div className="stat-icon in-progress">
              <FiTrendingUp />
            </div>
          </div>
          <div className="stat-content">
            <h3>{stats?.inProgress || 0}</h3>
            <p>In Progress</p>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-header">
            <div className="stat-icon closed">
              <FiCheckCircle />
            </div>
          </div>
          <div className="stat-content">
            <h3>{stats?.closed || 0}</h3>
            <p>Closed</p>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-header">
            <div className="stat-icon rejected">
              <FiXCircle />
            </div>
          </div>
          <div className="stat-content">
            <h3>{stats?.rejected || 0}</h3>
            <p>Rejected</p>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-header">
            <div className="stat-icon urgent">
              <FiAlertCircle />
            </div>
          </div>
          <div className="stat-content">
            <h3>{stats?.urgent || 0}</h3>
            <p>Urgent</p>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-header">
            <div className="stat-icon today">
              <FiFileText />
            </div>
          </div>
          <div className="stat-content">
            <h3>{stats?.today || 0}</h3>
            <p>Today</p>
          </div>
        </div>
      </div>

      {/* Complaints Management */}
      <div className="admin-complaints-section">
        <div className="section-header">
          <h2>All Complaints</h2>
          <div className="section-actions">
            <button
              className="filter-btn"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FiFilter />
              Filters
            </button>
            <button className="refresh-btn" onClick={fetchData}>
              <FiRefreshCw />
              Refresh
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="filters-panel">
            <div className="filter-group">
              <label>Status</label>
              <select
                className="filter-select"
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="closed">Closed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Type</label>
              <select
                className="filter-select"
                value={filters.type}
                onChange={(e) => handleFilterChange("type", e.target.value)}
              >
                <option value="">All Types</option>
                <option value="potholes">Potholes</option>
                <option value="rubbish-bins">Rubbish Bins</option>
                <option value="streetlights">Streetlights</option>
                <option value="public-spaces">Public Spaces</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Priority</label>
              <select
                className="filter-select"
                value={filters.urgent}
                onChange={(e) => handleFilterChange("urgent", e.target.value)}
              >
                <option value="">All</option>
                <option value="true">Urgent Only</option>
                <option value="false">Normal</option>
              </select>
            </div>
          </div>
        )}

        {/* Complaints Table */}
        <div className="table-container">
          <table className="issues-table">
            <thead>
              <tr>
                <th>Reg. Number</th>
                <th>Type</th>
                <th>Date</th>
                <th>Urgent</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((complaint) => (
                <tr key={complaint._id}>
                  <td className="reg-number">{complaint.registrationNumber}</td>
                  <td>{complaint.type.replace("-", " ")}</td>
                  <td>
                    {formatDate(complaint.createdAt)}
                    <br />
                    <small style={{ color: "var(--text-secondary)" }}>
                      {formatTime(complaint.createdAt)}
                    </small>
                  </td>
                  <td>
                    {complaint.urgent ? (
                      <span style={{ color: "#f97316" }}>
                        <FiAlertCircle /> Yes
                      </span>
                    ) : (
                      "No"
                    )}
                  </td>
                  <td>
                    <select
                      className="status-select"
                      value={complaint.status}
                      onChange={(e) =>
                        handleStatusChange(
                          complaint._id,
                          e.target.value,
                          complaint
                        )
                      }
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="closed">Closed</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="action-btn primary"
                        onClick={() => navigate(`/issue/${complaint._id}`)}
                        title="View Details"
                      >
                        <FiEye />
                        View
                      </button>
                      <button
                        className="action-btn danger"
                        onClick={() => handleDeleteComplaint(complaint._id)}
                        title="Delete"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="pagination">
            <button
              className="page-btn"
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
              }
              disabled={pagination.page === 1}
            >
              Previous
            </button>
            <span className="page-info">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              className="page-btn"
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
              }
              disabled={pagination.page === pagination.pages}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Close Issue Modal */}
      {showCloseModal && selectedComplaint && (
        <div className="modal-overlay" onClick={handleCancelClose}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Close Issue</h2>
              <button className="modal-close-btn" onClick={handleCancelClose}>
                <FiX />
              </button>
            </div>

            <div className="modal-body">
              <p className="modal-description">
                <strong>Issue:</strong> {selectedComplaint.registrationNumber}
              </p>
              <p className="modal-description">
                <strong>Type:</strong>{" "}
                {selectedComplaint.type.replace("-", " ")}
              </p>

              <div className="form-group">
                <label htmlFor="admin-note">
                  Admin Note <span style={{ color: "#888" }}>(Optional)</span>
                </label>
                <textarea
                  id="admin-note"
                  className="form-textarea"
                  placeholder="Add any notes about the resolution..."
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label>
                  Resolution Photos{" "}
                  <span style={{ color: "#f97316" }}>*Required</span>
                </label>
                <p className="form-hint">
                  Upload photos showing the resolved issue (e.g., fixed pothole,
                  replaced streetlight)
                </p>

                <div className="photo-upload-area">
                  <input
                    type="file"
                    id="resolution-photos"
                    className="file-input"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    disabled={uploadingPhotos}
                  />
                  <label htmlFor="resolution-photos" className="upload-label">
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
                          onClick={() => handleRemovePhoto(index)}
                          type="button"
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
              <button className="btn btn-secondary" onClick={handleCancelClose}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleCloseIssue}
                disabled={resolutionPhotos.length === 0 || uploadingPhotos}
              >
                Close Issue
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
