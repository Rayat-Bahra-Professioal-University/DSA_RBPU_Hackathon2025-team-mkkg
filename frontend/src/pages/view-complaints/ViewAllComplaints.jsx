import { useMemo, useEffect } from "react";
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

// Create custom icons
const redIcon = L.icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const blueIcon = L.icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

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
  const center = useMemo(() => [31.481809, 75.95916], []);

  // Extended mock data with 5-6 complaints
  const mockData = useMemo(
    () => [
      {
        id: 1,
        regId: "367374873467873898",
        title: "Potholes",
        coords: [31.481809, 75.95916],
        status: "pending",
        description: "Large pothole causing traffic issues",
        reportedBy: "John Doe",
        date: "12-Aug-2025",
      },
      {
        id: 2,
        regId: "367374873467873899",
        title: "Rubbish Bins",
        coords: [31.4822, 75.9589],
        status: "closed",
        description: "Multiple rubbish bins need attention",
        reportedBy: "Jane Smith",
        date: "12-Aug-2025",
      },
      {
        id: 3,
        regId: "367374873467873900",
        title: "Streetlights",
        coords: [31.4815, 75.9596],
        status: "in-progress",
        description: "Streetlights not working properly",
        reportedBy: "Mike Johnson",
        date: "12-Aug-2025",
      },
      {
        id: 4,
        regId: "367374873467873901",
        title: "Public Spaces",
        coords: [31.4825, 75.9595],
        status: "pending",
        description: "Public space needs maintenance",
        reportedBy: "Sarah Williams",
        date: "12-Aug-2025",
      },
      {
        id: 5,
        regId: "367374873467873902",
        title: "Potholes",
        coords: [31.482, 75.9585],
        status: "closed",
        description: "Road potholes repaired",
        reportedBy: "Robert Brown",
        date: "12-Aug-2025",
      },
      {
        id: 6,
        regId: "367374873467873903",
        title: "Rubbish Bins",
        coords: [31.4817, 75.9593],
        status: "in-progress",
        description: "Rubbish bin collection in progress",
        reportedBy: "Emily Davis",
        date: "12-Aug-2025",
      },
    ],
    []
  );

  // Prepare heatmap data: [lat, lng, intensity]
  const heatmapPoints = useMemo(() => {
    return mockData.map((item) => [
      item.coords[0],
      item.coords[1],
      item.status === "pending" || item.status === "in-progress" ? 0.9 : 0.3, // Higher intensity for pending/in-progress complaints
    ]);
  }, [mockData]);

  // Calculate high-density area circles
  const problemAreas = useMemo(() => {
    // Find clusters of pending and in-progress complaints
    const activeComplaints = mockData.filter(
      (item) => item.status === "pending" || item.status === "in-progress"
    );

    if (activeComplaints.length < 3) return [];

    // Calculate center point of active complaints
    const avgLat =
      activeComplaints.reduce((sum, item) => sum + item.coords[0], 0) /
      activeComplaints.length;
    const avgLng =
      activeComplaints.reduce((sum, item) => sum + item.coords[1], 0) /
      activeComplaints.length;

    return [
      {
        center: [avgLat, avgLng],
        radius: 300, // 300 meters
        count: activeComplaints.length,
      },
    ];
  }, [mockData]);

  return (
    <div className="view-complaints-page">
      <h1>View All Complaints</h1>
      <p>
        Heatmap shows complaint density. Red circles indicate high-problem
        areas. Click markers for details.
      </p>

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

          {/* Problem Area Circles */}
          {problemAreas.map((area, index) => (
            <Circle
              key={index}
              center={area.center}
              radius={area.radius}
              pathOptions={{
                color: "#ef4444",
                fillColor: "#ef4444",
                fillOpacity: 0.15,
                weight: 2,
                dashArray: "5, 10",
              }}
            >
              <Popup>
                <div className="area-popup">
                  <strong>⚠️ High Problem Area</strong>
                  <div className="popup-detail">
                    <span className="label">Active Issues:</span> {area.count}
                  </div>
                  <div className="popup-detail">
                    <span className="label">Radius:</span> {area.radius}m
                  </div>
                  <div className="popup-detail">
                    <span className="label">Status:</span>
                    <span className="status active">Requires Attention</span>
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
              icon={m.status === "closed" ? blueIcon : redIcon}
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
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
