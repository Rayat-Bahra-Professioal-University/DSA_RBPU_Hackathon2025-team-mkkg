import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiFileText, FiClock, FiCheckCircle, FiEye } from "react-icons/fi";
import "./Dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    registered: 0,
    pending: 0,
    closed: 0,
  });

  const [issues, setIssues] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const issuesPerPage = 10;

  useEffect(() => {
    // Mock data - replace with actual API calls
    const mockIssues = Array.from({ length: 25 }, (_, i) => ({
      id: i + 1,
      registrationNumber: `367374${873467873898 + i}`,
      date: "12-Aug-2025",
      category: ["potholes", "rubbish bins", "streetlights", "public spaces"][
        i % 4
      ],
      status: ["pending", "closed", "in-progress"][i % 3],
    }));

    setIssues(mockIssues);
    setStats({
      registered: mockIssues.length,
      pending: mockIssues.filter((i) => i.status === "pending").length,
      closed: mockIssues.filter((i) => i.status === "closed").length,
    });
  }, []);

  const indexOfLastIssue = currentPage * issuesPerPage;
  const indexOfFirstIssue = indexOfLastIssue - issuesPerPage;
  const currentIssues = issues.slice(indexOfFirstIssue, indexOfLastIssue);
  const totalPages = Math.ceil(issues.length / issuesPerPage);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Overview of all civic issues</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#0B487B" }}>
            <FiFileText color="#ffffff" size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.registered}</h3>
            <p>Total Issues Registered</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#f0b209ff" }}>
            {/* <div className="stat-icon" style={{ background: "#433922ff" }}> */}
            <FiClock color="#ffffff" size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.pending}</h3>
            <p>Total Issues Pending</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#3a6322ff" }}>
            {/* <div className="stat-icon" style={{ background: "#5a5621ff" }}> */}
            <FiCheckCircle color="#ffffff" size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.closed}</h3>
            <p>Total Issues Closed</p>
          </div>
        </div>
      </div>

      <div className="issues-section">
        <h2>List of Complaints</h2>
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
              {currentIssues.map((issue, index) => (
                <tr key={issue.id}>
                  <td>{indexOfFirstIssue + index + 1}</td>
                  <td>{issue.registrationNumber}</td>
                  <td>{issue.date}</td>
                  <td>
                    <span className="category-badge">{issue.category}</span>
                  </td>
                  <td>
                    <span className={`status-badge status-${issue.status}`}>
                      {issue.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="view-details-btn"
                      onClick={() => navigate(`/issue/${issue.id}`)}
                      title="View Details"
                    >
                      <FiEye />
                      View
                    </button>
                  </td>
                </tr>
              ))}
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
      </div>
    </div>
  );
}
