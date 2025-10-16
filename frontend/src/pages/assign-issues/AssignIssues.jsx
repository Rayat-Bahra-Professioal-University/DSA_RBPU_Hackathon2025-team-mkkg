import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import {
  FiFilter,
  FiRefreshCw,
  FiUserCheck,
  FiEye,
  FiAlertCircle,
  FiCheck,
} from "react-icons/fi";
import { useApi } from "../../services/api";
import "./AssignIssues.css";

export default function AssignIssues() {
  const navigate = useNavigate();
  const api = useApi();
  const { user } = useUser();

  const [complaints, setComplaints] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedComplaints, setSelectedComplaints] = useState([]);

  const [filters, setFilters] = useState({
    status: "",
    type: "",
    urgent: "",
    assignedTo: "",
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

    if (isAdmin) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, user, pagination.page, filters]);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [complaintsResponse, adminsResponse] = await Promise.all([
        api.getAdminComplaints({
          page: pagination.page,
          limit: pagination.limit,
          ...filters,
        }),
        api.getAdmins(),
      ]);

      setComplaints(complaintsResponse.data || []);
      setAdmins(adminsResponse.admins || []);
      setPagination((prev) => ({
        ...prev,
        total: complaintsResponse.pagination?.total || 0,
        pages: complaintsResponse.pagination?.pages || 0,
      }));
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.message || "Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignIssue = async (complaintId, adminId) => {
    try {
      await api.assignComplaint(complaintId, adminId);
      alert("Issue assigned successfully!");
      fetchData();
    } catch (err) {
      console.error("Error assigning issue:", err);
      alert(`Failed to assign issue: ${err.message}`);
    }
  };

  const handleBulkAssign = async (adminId) => {
    if (selectedComplaints.length === 0) {
      alert("Please select at least one complaint");
      return;
    }

    if (!adminId) {
      alert("Please select an admin to assign to");
      return;
    }

    try {
      await Promise.all(
        selectedComplaints.map((id) => api.assignComplaint(id, adminId))
      );
      alert(`${selectedComplaints.length} issue(s) assigned successfully!`);
      setSelectedComplaints([]);
      fetchData();
    } catch (err) {
      console.error("Error bulk assigning:", err);
      alert(`Failed to assign issues: ${err.message}`);
    }
  };

  const toggleSelectComplaint = (id) => {
    setSelectedComplaints((prev) =>
      prev.includes(id) ? prev.filter((cId) => cId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedComplaints.length === complaints.length) {
      setSelectedComplaints([]);
    } else {
      setSelectedComplaints(complaints.map((c) => c._id));
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

  const getAdminName = (adminId) => {
    const admin = admins.find((a) => a.id === adminId);
    return admin?.name || admin?.email || "Unknown";
  };

  if (!isAdmin && user) {
    return (
      <div className="assign-issues-container">
        <div className="error-container">
          <h2>Access Denied</h2>
          <p>You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  if (isLoading && complaints.length === 0) {
    return (
      <div className="assign-issues-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading issues...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="assign-issues-container">
      <div className="admin-header">
        <div>
          <h1>Assign Issues</h1>
          <p>Assign complaints to administrators for tracking</p>
        </div>
        <button className="refresh-btn" onClick={fetchData}>
          <FiRefreshCw />
          Refresh
        </button>
      </div>

      {error && (
        <div className="error-banner">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Bulk Actions */}
      {selectedComplaints.length > 0 && (
        <div className="bulk-actions-bar">
          <div className="bulk-info">
            <FiCheck />
            <span>{selectedComplaints.length} issue(s) selected</span>
          </div>
          <div className="bulk-controls">
            <select
              className="bulk-select"
              onChange={(e) => handleBulkAssign(e.target.value)}
              defaultValue=""
            >
              <option value="" disabled>
                Assign to...
              </option>
              {admins.map((admin) => (
                <option key={admin.id} value={admin.id}>
                  {admin.name || admin.email}
                </option>
              ))}
            </select>
            <button
              className="clear-selection-btn"
              onClick={() => setSelectedComplaints([])}
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      <div className="controls-section">
        <button
          className="filter-btn"
          onClick={() => setShowFilters(!showFilters)}
        >
          <FiFilter />
          Filters
        </button>

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

            <div className="filter-group">
              <label>Assigned To</label>
              <select
                className="filter-select"
                value={filters.assignedTo}
                onChange={(e) =>
                  handleFilterChange("assignedTo", e.target.value)
                }
              >
                <option value="">All Assignments</option>
                <option value="unassigned">Unassigned</option>
                {admins.map((admin) => (
                  <option key={admin.id} value={admin.id}>
                    {admin.name || admin.email}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Issues Table */}
      <div className="issues-table-container">
        <table className="issues-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={
                    complaints.length > 0 &&
                    selectedComplaints.length === complaints.length
                  }
                  onChange={toggleSelectAll}
                />
              </th>
              <th>Reg. Number</th>
              <th>Type</th>
              <th>Date</th>
              <th>Urgent</th>
              <th>Status</th>
              <th>Assigned To</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {complaints.map((complaint) => (
              <tr key={complaint._id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedComplaints.includes(complaint._id)}
                    onChange={() => toggleSelectComplaint(complaint._id)}
                  />
                </td>
                <td className="reg-number">{complaint.registrationNumber}</td>
                <td>{complaint.type.replace("-", " ")}</td>
                <td>{formatDate(complaint.createdAt)}</td>
                <td>
                  {complaint.urgent ? (
                    <span className="urgent-badge">
                      <FiAlertCircle /> Yes
                    </span>
                  ) : (
                    "No"
                  )}
                </td>
                <td>
                  <span className={`status-badge ${complaint.status}`}>
                    {complaint.status}
                  </span>
                </td>
                <td>
                  <select
                    className="assign-select"
                    value={complaint.assignedTo || ""}
                    onChange={(e) =>
                      handleAssignIssue(complaint._id, e.target.value)
                    }
                  >
                    <option value="">Unassigned</option>
                    {admins.map((admin) => (
                      <option key={admin.id} value={admin.id}>
                        {admin.name || admin.email}
                      </option>
                    ))}
                  </select>
                  {complaint.assignedTo && (
                    <span className="assigned-to-display">
                      {getAdminName(complaint.assignedTo)}
                    </span>
                  )}
                </td>
                <td>
                  <button
                    className="view-btn"
                    onClick={() => navigate(`/issue/${complaint._id}`)}
                  >
                    <FiEye /> View
                  </button>
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
  );
}
