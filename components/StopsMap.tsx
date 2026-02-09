"use client";

import { useRef, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

type Stop = {
  id: string;
  driverId: string;
  occurredAt?: string;
  lat: number;
  lng: number;
  label: string;
  note?: string;
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
        style={{ height: "100%", width: "100%", filter: "grayscale(100%)" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        {stops.map((s) => (
          <Marker key={s.id} position={[s.lat, s.lng]}>
            <Popup>
              <div style={{ fontSize: 14 }}>
                <div>
                  <b>{s.label}</b>
                </div>
                {s.occurredAt && (
                  <div>{new Date(s.occurredAt).toLocaleString("sk-SK")}</div>
                )}
                {s.note ? <div style={{ marginTop: 6 }}>{s.note}</div> : null}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
