import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import {
  FiUserPlus,
  FiTrash2,
  FiRefreshCw,
  FiSearch,
  FiShield,
  FiX,
} from "react-icons/fi";
import { useApi } from "../../services/api";
import "./ManageAdmins.css";

export default function ManageAdmins() {
  const navigate = useNavigate();
  const api = useApi();
  const { user } = useUser();

  const [admins, setAdmins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      fetchAdmins();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, user]);

  const fetchAdmins = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.getAdmins();
      setAdmins(response.admins || []);
    } catch (err) {
      console.error("Error fetching admins:", err);
      setError(err.message || "Failed to load admins");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    if (!newAdminEmail.trim()) {
      alert("Please enter an email address");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.createAdmin(newAdminEmail);
      alert("Admin created successfully!");
      setShowAddModal(false);
      setNewAdminEmail("");
      fetchAdmins();
    } catch (err) {
      console.error("Error creating admin:", err);
      alert(`Failed to create admin: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveAdmin = async (adminId, adminEmail) => {
    if (
      !window.confirm(
        `Are you sure you want to remove admin privileges from ${adminEmail}?`
      )
    ) {
      return;
    }

    try {
      await api.removeAdmin(adminId);
      alert("Admin removed successfully!");
      fetchAdmins();
    } catch (err) {
      console.error("Error removing admin:", err);
      alert(`Failed to remove admin: ${err.message}`);
    }
  };

  const filteredAdmins = admins.filter(
    (admin) =>
      admin.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admin.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isAdmin && user) {
    return (
      <div className="manage-admins-container">
        <div className="error-container">
          <h2>Access Denied</h2>
          <p>You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="manage-admins-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading admins...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="manage-admins-container">
      <div className="admin-header">
        <div>
          <h1>Manage Admins</h1>
          <p>View and manage administrator accounts</p>
        </div>
        <div className="header-actions">
          <button className="refresh-btn" onClick={fetchAdmins}>
            <FiRefreshCw />
            Refresh
          </button>
          <button className="add-btn" onClick={() => setShowAddModal(true)}>
            <FiUserPlus />
            Add Admin
          </button>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="search-section">
        <div className="search-box">
          <FiSearch />
          <input
            type="text"
            placeholder="Search admins by email or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="admins-grid">
        {filteredAdmins.length === 0 ? (
          <div className="no-admins">
            <FiShield size={48} />
            <p>No admins found</p>
          </div>
        ) : (
          filteredAdmins.map((admin) => (
            <div key={admin.id} className="admin-card">
              <div className="admin-info">
                <div className="admin-avatar">
                  {admin.imageUrl ? (
                    <img src={admin.imageUrl} alt={admin.name} />
                  ) : (
                    <FiShield />
                  )}
                </div>
                <div className="admin-details">
                  <h3>{admin.name || "Unnamed Admin"}</h3>
                  <p>{admin.email}</p>
                  {admin.createdAt && (
                    <span className="admin-meta">
                      Added: {new Date(admin.createdAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              <div className="admin-actions">
                {admin.id !== user?.id && (
                  <button
                    className="remove-btn"
                    onClick={() => handleRemoveAdmin(admin.id, admin.email)}
                    title="Remove Admin"
                  >
                    <FiTrash2 />
                    Remove
                  </button>
                )}
                {admin.id === user?.id && (
                  <span className="current-user-badge">You</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Admin Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Admin</h2>
              <button
                className="modal-close-btn"
                onClick={() => setShowAddModal(false)}
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={handleAddAdmin} className="modal-body">
              <p className="modal-description">
                Enter the email address of the user you want to make an admin.
                They must already have an account.
              </p>

              <div className="form-group">
                <label htmlFor="admin-email">Email Address</label>
                <input
                  id="admin-email"
                  type="email"
                  className="form-input"
                  placeholder="admin@example.com"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  required
                />
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Adding..." : "Add Admin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
