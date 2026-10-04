import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const COLORS = {
  CRITICAL: "#7f1d1d",
  HIGH: "#d93025",
  MEDIUM: "#f9ab00",
  LOW: "#188038",
};

export default function ComplaintsMap({ complaints = [] }) {
  const items = complaints.filter((c) => c.coordinates?.lat != null);

  if (items.length === 0) {
    return (
      <p className="rounded-lg border bg-white p-6 text-sm text-gray-500">
        No complaints with a map location yet.
      </p>
    );
  }

  const center = [items[0].coordinates.lat, items[0].coordinates.lng];

  return (
    <div className="h-[500px] overflow-hidden rounded-xl border">
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {items.map((c) => (
          <CircleMarker
            key={c._id}
            center={[c.coordinates.lat, c.coordinates.lng]}
            radius={11}
            pathOptions={{
              color: "#ffffff",
              weight: 2,
              fillColor: COLORS[c.priority] || "#666666",
              fillOpacity: 0.9,
            }}
          >
            <Popup>
              <div className="text-sm">
                <b>{c.complaintNumber}</b> ({c.priority})
                <br />
                {c.aiSummary || c.title}
                <br />
                Status: {c.status}
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
