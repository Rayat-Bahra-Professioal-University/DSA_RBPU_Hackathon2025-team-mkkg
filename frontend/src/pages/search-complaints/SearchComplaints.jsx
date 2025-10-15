import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiFilter, FiEye } from "react-icons/fi";
import "./SearchComplaints.css";

export default function SearchComplaints() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    category: "",
    dateFrom: "",
    dateTo: "",
  });
  const [results, setResults] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const mockComplaints = Array.from({ length: 15 }, (_, i) => ({
    id: i + 1,
    registrationNumber: `367374${873467873898 + i}`,
    date: "12-Aug-2025",
    category: ["potholes", "rubbish bins", "streetlights", "public spaces"][
      i % 4
    ],
    status: ["pending", "closed", "in-progress"][i % 3],
    description: "Sample issue description",
    location: "Sample Location",
  }));

  const handleSearch = (e) => {
    e.preventDefault();

    let filtered = mockComplaints;

    // Filter by search term (registration number)
    if (searchTerm) {
      filtered = filtered.filter((item) =>
        item.registrationNumber.includes(searchTerm)
      );
    }

    // Filter by status
    if (filters.status) {
      filtered = filtered.filter((item) => item.status === filters.status);
    }

    // Filter by category
    if (filters.category) {
      filtered = filtered.filter((item) => item.category === filters.category);
    }

    setResults(filtered);
    setHasSearched(true);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      status: "",
      category: "",
      dateFrom: "",
      dateTo: "",
    });
    setSearchTerm("");
    setResults([]);
    setHasSearched(false);
  };

  return (
    <div className="search-complaints-container">
      <div className="search-header">
        <h1>Search Complaints</h1>
        <p>Find and track civic issue reports</p>
      </div>

      <div className="search-section">
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
          <button type="submit" className="search-btn">
            Search
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
              <label>Category</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange("category", e.target.value)}
                className="filter-select"
              >
                <option value="">All Categories</option>
                <option value="potholes">Potholes</option>
                <option value="rubbish bins">Rubbish Bins</option>
                <option value="streetlights">Streetlights</option>
                <option value="public spaces">Public Spaces</option>
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

      {results.length > 0 && (
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
                  <tr key={item.id}>
                    <td className="reg-number">{item.registrationNumber}</td>
                    <td>{item.date}</td>
                    <td>
                      <span className="category-badge">{item.category}</span>
                    </td>
                    <td>
                      <span className={`status-badge status-${item.status}`}>
                        {item.status}
                      </span>
                    </td>
                    <td>{item.location}</td>
                    <td>
                      <button
                        className="view-details-btn"
                        onClick={() => navigate(`/issue/${item.id}`)}
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

      {results.length === 0 && hasSearched && (
        <div className="no-results" style={{ display: "block" }}>
          <p>No complaints found matching your search criteria</p>
        </div>
      )}
    </div>
  );
}
