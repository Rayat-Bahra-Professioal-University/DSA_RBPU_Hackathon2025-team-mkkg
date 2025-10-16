import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import {
  FiFilter,
  FiRefreshCw,
  FiEye,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";
import "./MyAssignedIssues.css";
import { useApi } from "../../services/api";

export default function MyAssignedIssues() {
  const navigate = useNavigate();
  const api = useApi();
  const { user } = useUser();

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

  // Check if user is admin
  const isAdmin =
    user?.publicMetadata?.role === "admin" ||
    user?.privateMetadata?.role === "admin";

  useEffect(() => {
    if (!isAdmin && user) {
      navigate("/dashboard");
      return;
    }

    if (isAdmin && user) {
      fetchMyAssignedIssues();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, user, pagination.page, filters]);

  const fetchMyAssignedIssues = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch complaints assigned to current admin
      const response = await api.getAdminComplaints({
        page: pagination.page,
        limit: pagination.limit,
        assignedTo: user.id, // Filter by current admin's ID
        ...filters,
      });

      // Additional client-side filter to ensure only assigned issues are shown
      const assignedComplaints = (response.data || []).filter(
        (complaint) => complaint.assignedTo === user.id
      );

      setComplaints(assignedComplaints);
      setPagination((prev) => ({
        ...prev,
        total: assignedComplaints.length,
        pages: Math.ceil(assignedComplaints.length / pagination.limit),
      }));
    } catch (err) {
      console.error("Error fetching assigned issues:", err);
      setError(err.message || "Failed to load assigned issues");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (complaintId, newStatus) => {
    try {
      await api.updateComplaintStatus(complaintId, newStatus);
      // Refresh the list
      await fetchMyAssignedIssues();
    } catch (err) {
      console.error("Error updating status:", err);
      alert(`Failed to update status: ${err.message}`);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStats = () => {
    const pending = complaints.filter((c) => c.status === "pending").length;
    const inProgress = complaints.filter(
      (c) => c.status === "in-progress"
    ).length;
    const closed = complaints.filter((c) => c.status === "closed").length;
    const urgent = complaints.filter((c) => c.urgent).length;

    return { pending, inProgress, closed, urgent };
  };

  if (!isAdmin && user) {
    return (
      <div className="my-assigned-container">
        <p>Access denied. Admin privileges required.</p>
      </div>
    );
  }

  if (isLoading && complaints.length === 0) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your assigned issues...</p>
      </div>
    );
  }

  const stats = getStats();

  return (
    <div className="my-assigned-container">
      <div className="admin-header">
        <div>
          <h1>My Assigned Issues</h1>
          <p>Issues currently assigned to you</p>
        </div>
        <button className="refresh-btn" onClick={fetchMyAssignedIssues}>
          <FiRefreshCw />
          Refresh
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {/* Quick Stats */}
      <div className="quick-stats">
        <div className="stat-card pending">
          <FiClock />
          <div className="stat-info">
            <span className="stat-value">{stats.pending}</span>
            <span className="stat-label">Pending</span>
          </div>
        </div>
        <div className="stat-card in-progress">
          <FiAlertCircle />
          <div className="stat-info">
            <span className="stat-value">{stats.inProgress}</span>
            <span className="stat-label">In Progress</span>
          </div>
        </div>
        <div className="stat-card closed">
          <FiCheckCircle />
          <div className="stat-info">
            <span className="stat-value">{stats.closed}</span>
            <span className="stat-label">Closed</span>
          </div>
        </div>
        <div className="stat-card urgent">
          <FiAlertCircle />
          <div className="stat-info">
            <span className="stat-value">{stats.urgent}</span>
            <span className="stat-label">Urgent</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="controls-section">
        <button
          className="filter-btn"
          onClick={() => setShowFilters(!showFilters)}
        >
          <FiFilter />
          {showFilters ? "Hide Filters" : "Show Filters"}
        </button>
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
              <option value="">All Statuses</option>
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
              <option value="false">Non-Urgent</option>
            </select>
          </div>
        </div>
      )}

      {/* Issues Table */}
      <div className="admin-table-container">
        {complaints.length === 0 ? (
          <div className="no-issues">
            <FiCheckCircle size={48} />
            <p>No issues assigned to you yet</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Registration #</th>
                <th>Type</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Reported On</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((complaint) => (
                <tr key={complaint._id}>
                  <td>
                    <span className="reg-number">
                      {complaint.registrationNumber}
                    </span>
                  </td>
                  <td>{complaint.type}</td>
                  <td>
                    <select
                      className="status-select"
                      value={complaint.status}
                      onChange={(e) =>
                        handleStatusChange(complaint._id, e.target.value)
                      }
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="closed">Closed</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </td>
                  <td>
                    {complaint.urgent ? (
                      <span className="priority-urgent">Urgent</span>
                    ) : (
                      <span className="priority-normal">Normal</span>
                    )}
                  </td>
                  <td>{formatDate(complaint.createdAt)}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="action-btn primary"
                        onClick={() => navigate(`/issue/${complaint._id}`)}
                      >
                        <FiEye />
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
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
  );
}
