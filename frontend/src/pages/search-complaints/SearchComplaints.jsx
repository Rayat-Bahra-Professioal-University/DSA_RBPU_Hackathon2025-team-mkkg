import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { FiSearch, FiFilter, FiEye } from "react-icons/fi";
import "./SearchComplaints.css";
import { useApi } from "../../services/api";

export default function SearchComplaints() {
  const navigate = useNavigate();
  const api = useApi();
  const { isLoaded, isSignedIn } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    type: "",
    dateFrom: "",
    dateTo: "",
  });
  const [results, setResults] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load all complaints on mount
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      loadAllComplaints();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, isSignedIn]);

  const loadAllComplaints = async () => {
    // Don't fetch if not authenticated
    if (!isLoaded || !isSignedIn) {
      setIsLoading(true);
      return;
    }

    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const response = await api.getComplaints({ limit: 100 });
      setResults(response.data || []);
    } catch (err) {
      console.error("Error loading complaints:", err);
      setError(err.message || "Failed to load complaints");
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      // Build query parameters
      const params = {
        limit: 100, // Get up to 100 results
      };

      // Add search term (searches in description and registration number)
      if (searchTerm.trim()) {
        params.q = searchTerm.trim();
      }

      // Add filters
      if (filters.status) {
        params.status = filters.status;
      }

      if (filters.type) {
        params.type = filters.type;
      }

      // For date filtering, we'll need to implement this on backend
      // For now, we'll fetch all and filter client-side if needed

      console.log("Searching with params:", params);
      const response = await api.getComplaints(params);

      let complaints = response.data || [];

      // Client-side date filtering if dates are provided
      if (filters.dateFrom) {
        const fromDate = new Date(filters.dateFrom);
        complaints = complaints.filter(
          (c) => new Date(c.createdAt) >= fromDate
        );
      }

      if (filters.dateTo) {
        const toDate = new Date(filters.dateTo);
        toDate.setHours(23, 59, 59, 999); // End of day
        complaints = complaints.filter((c) => new Date(c.createdAt) <= toDate);
      }

      setResults(complaints);
    } catch (err) {
      console.error("Search error:", err);
      setError(err.message || "Failed to search complaints");
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      status: "",
      type: "",
      dateFrom: "",
      dateTo: "",
    });
    setSearchTerm("");
    setResults([]);
    setHasSearched(false);
    setError(null);
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

  // Get location string
  const getLocationString = (location) => {
    if (!location) return "Unknown";
    if (location.address) return location.address;
    return `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`;
  };

  return (
    <div className="search-complaints-container">
      <div className="search-header">
        <h1>Search Complaints</h1>
        <p>Find and track civic issue reports</p>
      </div>

      <div className="search-section">
        {error && (
          <div
            style={{
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              padding: "1rem",
              borderRadius: "8px",
              marginBottom: "1rem",
              color: "#ef4444",
            }}
          >
            <strong>Error:</strong> {error}
          </div>
        )}

        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-wrapper">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by Registration ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <button
            type="button"
            className="filter-toggle-btn"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FiFilter />
            Filters
          </button>
          <button type="submit" className="search-btn" disabled={isLoading}>
            {isLoading ? "Searching..." : "Search"}
          </button>
        </form>

        {showFilters && (
          <div className="filters-panel">
            <div className="filter-group">
              <label>Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="filter-select"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Issue Type</label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange("type", e.target.value)}
                className="filter-select"
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
              <label>Date From</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
                className="filter-input"
              />
            </div>

            <div className="filter-group">
              <label>Date To</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange("dateTo", e.target.value)}
                className="filter-input"
              />
            </div>

            <button type="button" onClick={resetFilters} className="reset-btn">
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {isLoading && (
        <div
          style={{
            textAlign: "center",
            padding: "2rem",
            background: "var(--card-bg)",
            borderRadius: "8px",
            marginTop: "1rem",
          }}
        >
          <div className="loading-spinner"></div>
          <p>Searching complaints...</p>
        </div>
      )}

      {results.length > 0 && !isLoading && (
        <div className="results-section">
          <h2>Search Results ({results.length})</h2>
          <div className="results-table-container">
            <table className="results-table">
              <thead>
                <tr>
                  <th>Registration ID</th>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Location</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {results.map((item) => (
                  <tr key={item._id}>
                    <td className="reg-number">{item.registrationNumber}</td>
                    <td>{formatDate(item.createdAt)}</td>
                    <td>
                      <span className="category-badge">
                        {item.type.replace("-", " ")}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge status-${item.status}`}>
                        {item.status}
                      </span>
                    </td>
                    <td>{getLocationString(item.location)}</td>
                    <td>
                      <button
                        className="view-details-btn"
                        onClick={() => navigate(`/issue/${item._id}`)}
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
        </div>
      )}

      {results.length === 0 && hasSearched && !isLoading && (
        <div
          className="no-results"
          style={{
            display: "block",
            textAlign: "center",
            padding: "2rem",
            background: "var(--card-bg)",
            borderRadius: "8px",
            marginTop: "1rem",
          }}
        >
          <p>No complaints found matching your search criteria</p>
          <button
            onClick={resetFilters}
            style={{
              marginTop: "1rem",
              padding: "0.5rem 1rem",
              background: "var(--accent-primary)",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Clear Search
          </button>
        </div>
      )}
    </div>
  );
}
