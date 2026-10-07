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

// Reverse geocode coordinates using OpenStreetMap
async function reverseGeocode(lat, lng) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
      {
        headers: {
          Accept: "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error("Reverse geocoding failed");
    }

    const data = await response.json();

    return {
      address: data.display_name || "",
      geoAddress: data.address || {},
    };
  } catch (error) {
    console.error("Reverse geocoding error:", error);

    return {
      address: "",
      geoAddress: {},
    };
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
      map.setView(
        [value.lat, value.lng],
        Math.max(map.getZoom(), 15),
      );
    }
  }, [value?.lat, value?.lng]);

  return null;
}

export default function LocationPicker({
  value,
  onChange,
  onLocationDetected,
}) {
  const pick = useCallback(
    async (lat, lng) => {
      // Immediately show the selected coordinates
      onChange({
        lat,
        lng,
        address: "",
      });

      // Get readable address and administrative information
      const result = await reverseGeocode(lat, lng);
console.log(
  "Nominatim result:",
  JSON.stringify(result, null, 2),
);
      // Update location with address
      onChange({
        lat,
        lng,
        address: result.address,
        geoAddress: result.geoAddress,
      });

      // Send the reverse-geocoded information to ComplaintForm
      if (onLocationDetected) {
        onLocationDetected({
          lat,
          lng,
          address: result.address,
          geoAddress: result.geoAddress,
        });
      }
    },
    [onChange, onLocationDetected],
  );

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        pick(latitude, longitude);
      },
      (error) => {
        console.error("Geolocation error:", error);

        if (error.code === error.PERMISSION_DENIED) {
          alert(
            "Location permission was denied. Please allow location access in your browser settings.",
          );
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          alert("Your location could not be determined.");
        } else if (error.code === error.TIMEOUT) {
          alert("Getting your location timed out. Please try again.");
        } else {
          alert(
            "Could not get your location. Please click on the map instead.",
          );
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      },
    );
  };

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
          style={{
            height: "100%",
            width: "100%",
          }}
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
                  const { lat, lng } =
                    event.target.getLatLng();

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