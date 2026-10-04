import { useCallback, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Fix for Leaflet's default marker icons when using Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const KATHMANDU = [27.7172, 85.324];

// Turns coordinates into a readable address (free OpenStreetMap service)
async function reverseGeocode(lat, lng) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
    );
    const data = await response.json();
    return data.display_name || "";
  } catch {
    return "";
  }
}

function ClickHandler({ onPick }) {
  useMapEvents({
    click(event) {
      onPick(event.latlng.lat, event.latlng.lng);
    },
  });
  return null;
}

function Recenter({ value }) {
  const map = useMap();

  useEffect(() => {
    if (value) {
      map.setView([value.lat, value.lng], Math.max(map.getZoom(), 15));
    }
  }, [value?.lat, value?.lng]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}

export default function LocationPicker({ value, onChange }) {
  const pick = useCallback(
    async (lat, lng) => {
      // Show the pin immediately, then fill in the address
      onChange({ lat, lng, address: "" });
      const address = await reverseGeocode(lat, lng);
      onChange({ lat, lng, address });
    },
    [onChange],
  );

  const useMyLocation = () =>
    navigator.geolocation.getCurrentPosition(
      (position) => pick(position.coords.latitude, position.coords.longitude),
      () =>
        alert("Could not get your location. Please click on the map instead."),
      { enableHighAccuracy: true },
    );

  return (
    <div>
      <button
        type="button"
        onClick={useMyLocation}
        className="mb-2 rounded-md border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50"
      >
        📍 Use my current location
      </button>

      <div className="h-80 overflow-hidden rounded-lg border">
        <MapContainer
          center={value ? [value.lat, value.lng] : KATHMANDU}
          zoom={14}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <ClickHandler onPick={pick} />
          <Recenter value={value} />

          {value && (
            <Marker
              position={[value.lat, value.lng]}
              draggable
              eventHandlers={{
                dragend(event) {
                  const { lat, lng } = event.target.getLatLng();
                  pick(lat, lng);
                },
              }}
            />
          )}
        </MapContainer>
      </div>

      <p className="mt-1 text-xs text-slate-500">
        {value?.address ||
          "Click the map or drag the pin to mark the exact location"}
      </p>
    </div>
  );
}
