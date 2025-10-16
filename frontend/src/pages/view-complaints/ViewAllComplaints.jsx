import { useMemo, useEffect, useState } from "react";
import { useUser, useAuth } from "@clerk/clerk-react";
import "./ViewAllComplaints.css";
import "leaflet/dist/leaflet.css";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet.heat";
import { useApi } from "../../services/api";
import {
  FiFileText,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiTrendingUp,
} from "react-icons/fi";

// Create custom icons for different statuses
const createIcon = (color) => {
  const iconUrls = {
    red: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
    green:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
    blue: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
    orange:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png",
    grey: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png",
    yellow:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png",
  };

  return L.icon({
    iconUrl: iconUrls[color] || iconUrls.red,
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
};

// Map status to icon colors
const getIconByStatus = (status) => {
  const iconMap = {
    pending: createIcon("red"), // Red for pending
    "in-progress": createIcon("orange"), // Orange for in-progress
    closed: createIcon("green"), // Green for closed
    rejected: createIcon("grey"), // Grey for rejected
  };
  return iconMap[status] || createIcon("red");
};

// Heatmap component
function HeatmapLayer({ points }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !points || points.length === 0) return;

    // Create heatmap layer with intensity values
    const heatLayer = L.heatLayer(points, {
      radius: 25,
      blur: 15,
      maxZoom: 17,
      max: 1.0,
      gradient: {
        0.0: "blue",
        0.5: "yellow",
        0.7: "orange",
        1.0: "red",
      },
    }).addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, points]);

  return null;
}

export default function ViewAllComplaints() {
  const api = useApi();
  const { user } = useUser();
  const { isLoaded, isSignedIn } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const center = useMemo(() => [31.481809, 75.95916], []);

  // Check if user is admin
  const isAdmin =
    user?.publicMetadata?.role === "admin" ||
    user?.privateMetadata?.role === "admin";

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchComplaints();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, isSignedIn]);

  const fetchComplaints = async () => {
    // Don't fetch if not authenticated
    if (!isLoaded || !isSignedIn) {
      setIsLoading(true);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.getComplaints({ limit: 100 });
      setComplaints(response.data || []);
    } catch (err) {
      console.error("Error fetching complaints:", err);
      setError(err.message || "Failed to load complaints");
      // Use empty array on error so map still renders
      setComplaints([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Transform data for map display
  const mockData = useMemo(() => {
    return complaints
      .filter((c) => c.location && c.location.lat && c.location.lng)
      .map((complaint) => ({
        id: complaint._id,
        regId: complaint.registrationNumber,
        title: complaint.type,
        coords: [complaint.location.lat, complaint.location.lng],
        status: complaint.status,
        description: complaint.description.substring(0, 100) + "...",
        reportedBy: "User", // Can be enhanced with user data
        date: new Date(complaint.createdAt).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
      }));
  }, [complaints]);

  // Prepare heatmap data: [lat, lng, intensity]
  const heatmapPoints = useMemo(() => {
    return mockData.map((item) => [
      item.coords[0],
      item.coords[1],
      item.status === "pending" || item.status === "in-progress" ? 0.9 : 0.3, // Higher intensity for pending/in-progress complaints
    ]);
  }, [mockData]);

  // Calculate high-density area circles (Heat Zones)
  const problemAreas = useMemo(() => {
    if (mockData.length === 0) return [];

    // Group complaints by proximity (within ~500 meters)
    const clusters = [];
    const processed = new Set();
    const CLUSTER_DISTANCE = 0.01; // Approximately 1km in degrees (increased for better clustering)

    mockData.forEach((complaint, index) => {
      if (processed.has(index)) return;

      const cluster = {
        complaints: [complaint],
        indices: [index],
      };

      // Find nearby complaints
      mockData.forEach((other, otherIndex) => {
        if (index === otherIndex || processed.has(otherIndex)) return;

        const latDiff = Math.abs(complaint.coords[0] - other.coords[0]);
        const lngDiff = Math.abs(complaint.coords[1] - other.coords[1]);
        const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);

        if (distance < CLUSTER_DISTANCE) {
          cluster.complaints.push(other);
          cluster.indices.push(otherIndex);
          processed.add(otherIndex);
        }
      });

      processed.add(index);

      // Only include clusters with more than 8 issues (Heat Zones)
      if (cluster.complaints.length > 8) {
        clusters.push(cluster);
      }
    });

    console.log(`Found ${clusters.length} heat zones with 8+ issues`);

    // Calculate center and stats for each heat zone
    return clusters.map((cluster) => {
      const avgLat =
        cluster.complaints.reduce((sum, item) => sum + item.coords[0], 0) /
        cluster.complaints.length;
      const avgLng =
        cluster.complaints.reduce((sum, item) => sum + item.coords[1], 0) /
        cluster.complaints.length;

      const pendingCount = cluster.complaints.filter(
        (c) => c.status === "pending"
      ).length;
      const inProgressCount = cluster.complaints.filter(
        (c) => c.status === "in-progress"
      ).length;

      console.log(
        `Heat Zone at [${avgLat}, ${avgLng}] with ${cluster.complaints.length} issues`
      );

      return {
        center: [avgLat, avgLng],
        radius: 500, // 500 meters
        count: cluster.complaints.length,
        pendingCount,
        inProgressCount,
        isHeatZone: true, // Mark as heat zone
      };
    });
  }, [mockData]);

  // Calculate stats from complaints
  const stats = useMemo(() => {
    return {
      total: complaints.length,
      pending: complaints.filter((c) => c.status === "pending").length,
      inProgress: complaints.filter((c) => c.status === "in-progress").length,
      closed: complaints.filter((c) => c.status === "closed").length,
      rejected: complaints.filter((c) => c.status === "rejected").length,
    };
  }, [complaints]);

  return (
    <div className="view-complaints-page">
      <h1>Issues Sitemap</h1>
      <p>
        Heatmap shows complaint density. Red circles indicate Heat Zones (areas
        with more than 8 issues). Click markers for details.
      </p>

      {/* Heat Zone Legend */}
      {problemAreas.length > 0 && (
        <div className="heat-zone-alert">
          <div className="alert-icon">🔥</div>
          <div className="alert-content">
            <strong>
              {problemAreas.length} Heat Zone
              {problemAreas.length > 1 ? "s" : ""} Detected!
            </strong>
            <p>
              Critical areas with more than 8 issues require immediate
              attention.
            </p>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#0b487b" }}>
            <FiFileText color="#ffffff" size={24} />
          </div>
          <div className="stat-content">
            <h3>{isLoading ? "..." : stats.total}</h3>
            <p>Total Issues</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#f0b209ff" }}>
            <FiClock color="#ffffff" size={24} />
          </div>
          <div className="stat-content">
            <h3>{isLoading ? "..." : stats.pending}</h3>
            <p>Pending</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#3b82f6" }}>
            <FiTrendingUp color="#ffffff" size={24} />
          </div>
          <div className="stat-content">
            <h3>{isLoading ? "..." : stats.inProgress}</h3>
            <p>In Progress</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#3a6322ff" }}>
            <FiCheckCircle color="#ffffff" size={24} />
          </div>
          <div className="stat-content">
            <h3>{isLoading ? "..." : stats.closed}</h3>
            <p>Closed</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#ef4444" }}>
            <FiXCircle color="#ffffff" size={24} />
          </div>
          <div className="stat-content">
            <h3>{isLoading ? "..." : stats.rejected}</h3>
            <p>Rejected</p>
          </div>
        </div>
      </div>

      {isLoading && (
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <div className="loading-spinner"></div>
          <p>Loading complaints...</p>
        </div>
      )}

      {error && (
        <div
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

      {!isLoading && complaints.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "2rem",
            background: "#1a1a2e",
            borderRadius: "8px",
            marginBottom: "1rem",
          }}
        >
          <p>No complaints found. The map will show default location.</p>
        </div>
      )}

      <div className="map-wrapper">
        <MapContainer
          center={center}
          zoom={15}
          className="map"
          scrollWheelZoom={false}
          placeholder={<div>Loading map...</div>}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Heatmap Layer */}
          <HeatmapLayer points={heatmapPoints} />

          {/* Heat Zone Circles (areas with more than 8 issues) */}
          {problemAreas.map((area, index) => (
            <Circle
              key={index}
              center={area.center}
              radius={area.radius}
              pathOptions={{
                color: "#ef4444",
                fillColor: "#ff0000",
                fillOpacity: 0.25,
                weight: 3,
                dashArray: "10, 5",
              }}
            >
              <Popup>
                <div className="area-popup">
                  <strong>🔥 HEAT ZONE - Critical Area</strong>
                  <div className="popup-detail">
                    <span className="label">Total Issues:</span> {area.count}
                  </div>
                  <div className="popup-detail">
                    <span className="label">Pending:</span> {area.pendingCount}
                  </div>
                  <div className="popup-detail">
                    <span className="label">In Progress:</span>{" "}
                    {area.inProgressCount}
                  </div>
                  <div className="popup-detail">
                    <span className="label">Coverage Radius:</span>{" "}
                    {area.radius}m
                  </div>
                  <div className="popup-detail">
                    <span className="label">Status:</span>
                    <span className="status heat-zone">
                      ⚠️ Urgent Attention Required
                    </span>
                  </div>
                </div>
              </Popup>
            </Circle>
          ))}

          {/* Markers with popups */}
          {mockData.map((m) => (
            <Marker
              key={m.id}
              position={m.coords}
              icon={getIconByStatus(m.status)}
            >
              <Popup>
                <div className="complaint-popup">
                  <strong>{m.title}</strong>
                  <div className="popup-detail">
                    <span className="label">Registration Number:</span>
                    {m.regId}
                  </div>
                  <div className="popup-detail">
                    <span className="label">Status:</span>
                    <span className={`status ${m.status}`}>{m.status}</span>
                  </div>
                  <div className="popup-detail">
                    <span className="label">Description:</span> {m.description}
                  </div>
                  <div className="popup-detail">
                    <span className="label">Reported by:</span> {m.reportedBy}
                  </div>
                  <div className="popup-detail">
                    <span className="label">Date:</span> {m.date}
                  </div>
                  <div className="popup-detail">
                    <span className="label">Coords:</span>{" "}
                    {m.coords[0].toFixed(6)}, {m.coords[1].toFixed(6)}
                  </div>
                  {isAdmin && (
                    <div className="popup-actions">
                      <button
                        className="popup-view-btn"
                        onClick={() =>
                          (window.location.href = `/issue/${m.id}`)
                        }
                      >
                        View
                      </button>
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
