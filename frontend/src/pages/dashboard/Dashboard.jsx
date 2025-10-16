import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiFileText, FiClock, FiCheckCircle, FiEye } from "react-icons/fi";
import { useAuth } from "@clerk/clerk-react";
import { useApi } from "../../services/api";
import "./Dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const api = useApi();
  const { isLoaded, isSignedIn } = useAuth();
  const [stats, setStats] = useState({
    registered: 0,
    pending: 0,
    closed: 0,
  });

  const [issues, setIssues] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const issuesPerPage = 10;

  const fetchData = async () => {
    // Don't fetch if Clerk is not loaded or user is not signed in
    if (!isLoaded || !isSignedIn) {
      setIsLoading(true);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch user's own complaints (current page and all for stats)
      const [complaintsData, allComplaintsData] = await Promise.all([
        api.getMyComplaints({ page: currentPage, limit: issuesPerPage }),
        api.getMyComplaints({ limit: 1000 }), // Get all user complaints for stats
      ]);

      // Calculate stats from all user's complaints
      const allUserComplaints = allComplaintsData.data || [];
      const userStats = {
        registered: allUserComplaints.length,
        pending: allUserComplaints.filter((c) => c.status === "pending").length,
        closed: allUserComplaints.filter((c) => c.status === "closed").length,
      };

      setStats(userStats);
      setIssues(complaintsData.data || []);
      setTotalPages(complaintsData.pagination?.totalPages || 1);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.message || "Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, isLoaded, isSignedIn]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Overview of your civic issues</p>
      </div>

      {error && (
        <div
          className="error-banner"
          style={{
            background: "#fee",
            border: "1px solid #fcc",
            padding: "1rem",
            borderRadius: "4px",
            marginBottom: "1rem",
            color: "#c33",
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#0B487B" }}>
            <FiFileText color="#ffffff" size={24} />
          </div>
          <div className="stat-content">
            <h3>{isLoading ? "..." : stats.registered}</h3>
            <p>Total Issues Registered</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#f0b209ff" }}>
            <FiClock color="#ffffff" size={24} />
          </div>
          <div className="stat-content">
            <h3>{isLoading ? "..." : stats.pending}</h3>
            <p>Total Issues Pending</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#3a6322ff" }}>
            <FiCheckCircle color="#ffffff" size={24} />
          </div>
          <div className="stat-content">
            <h3>{isLoading ? "..." : stats.closed}</h3>
            <p>Total Issues Closed</p>
          </div>
        </div>
      </div>

      <div className="issues-section">
        <h2>List of Complaints</h2>

        {isLoading ? (
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <div className="loading-spinner"></div>
            <p>Loading complaints...</p>
          </div>
        ) : (
          <>
            <div className="table-container">
              <table className="issues-table">
                <thead>
                  <tr>
                    <th>Sr No.</th>
                    <th>Registration Number</th>
                    <th>Complaint Date</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {issues.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        style={{ textAlign: "center", padding: "2rem" }}
                      >
                        No complaints found
                      </td>
                    </tr>
                  ) : (
                    issues.map((issue, index) => (
                      <tr key={issue._id || issue.id}>
                        <td>{(currentPage - 1) * issuesPerPage + index + 1}</td>
                        <td>{issue.registrationNumber}</td>
                        <td>{formatDate(issue.createdAt || issue.date)}</td>
                        <td>
                          <span className="category-badge">
                            {issue.type || issue.category}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`status-badge status-${issue.status}`}
                          >
                            {issue.status}
                          </span>
                        </td>
                        <td>
                          <button
                            className="view-details-btn"
                            onClick={() =>
                              navigate(`/issue/${issue._id || issue.id}`)
                            }
                            title="View Details"
                          >
                            <FiEye />
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="pagination">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="pagination-btn"
              >
                First
              </button>
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="pagination-btn"
              >
                Prev
              </button>
              <span className="pagination-info">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="pagination-btn"
              >
                Next
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="pagination-btn"
              >
                Last
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
