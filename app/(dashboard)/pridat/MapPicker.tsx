"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { useEffect } from "react";

type Props = {
  lat: number | null;
  lng: number | null;
  onChange: (lat: number, lng: number) => void;
  flyTo?: { lat: number; lng: number } | null;
};

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    if (!center) return;
    map.flyTo(center, 13, { duration: 1 });
  }, [map, center]);

  return null;
}

function ClickHandler({
  onChange,
}: {
  onChange: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click: (e) => {
      onChange(e.latlng.lat, e.latlng.lng);
    },
  });

  return null;
}

export default function MapPicker({ lat, lng, onChange, flyTo }: Props) {
  return (
    <div className="w-full h-[420px] rounded-3xl overflow-hidden border border-slate-800 shadow-xl shadow-slate-950/40">
      <MapContainer
        center={[49.358, 19.613]}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full bg-slate-950"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CartoDB</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <ClickHandler onChange={onChange} />
        {flyTo && <ChangeView center={[flyTo.lat, flyTo.lng]} />}
        {lat !== null && lng !== null && <Marker position={[lat, lng]} />}
      </MapContainer>
    </div>
  );
}
