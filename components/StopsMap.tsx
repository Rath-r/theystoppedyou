"use client";

import { useRef, useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import L from "leaflet";

type Stop = {
  id: string;
  driverId: string;
  occurredAt?: string;
  lat: number;
  lng: number;
  label: string;
  note?: string;
  driverDisplayName?: string;
  driverColor?: string;
};

// Fix na chýbajúce ikonky v Next buildoch
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function StopsMap({ stops }: { stops: Stop[] }) {
  const mapRef = useRef<L.Map | null>(null);

  // Vypočítaj centroid pinov
  const initialCenter: [number, number] = stops.length
    ? [
        stops.reduce((sum, s) => sum + s.lat, 0) / stops.length,
        stops.reduce((sum, s) => sum + s.lng, 0) / stops.length,
      ]
    : [48.1486, 17.1077]; // Bratislava default

  useEffect(() => {
    if (!mapRef.current || stops.length === 0) return;

    const bounds = L.latLngBounds(stops.map((s) => [s.lat, s.lng]));
    mapRef.current.fitBounds(bounds, { padding: [50, 50] });
  }, [stops]);

  return (
    <div style={{ height: 520, width: "100%" }}>
      <MapContainer
        ref={mapRef}
        center={initialCenter}
        zoom={9}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        {stops.map((s) => {
          const markerColor = s.driverColor || "#3b82f6";
          const driverName = s.driverDisplayName || "Driver";
          return (
            <CircleMarker
              key={s.id}
              center={[s.lat, s.lng]}
              radius={8}
              pathOptions={{
                color: "#ffffff",
                fillColor: markerColor,
                weight: 2,
                fillOpacity: 0.8,
              }}
            >
              <Popup>
                <div style={{ fontSize: 14 }}>
                  {driverName} - <strong>{s.label}</strong>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
