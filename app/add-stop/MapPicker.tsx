"use client";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";

type Props = {
  lat: number | null;
  lng: number | null;
  onChange: (lat: number, lng: number) => void;
};

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

export default function MapPicker({ lat, lng, onChange }: Props) {
  return (
    <div className="w-full h-72 rounded-xl overflow-hidden border border-gray-700">
      <MapContainer
        center={[49.2, 19.5]}
        zoom={12}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler onChange={onChange} />
        {lat !== null && lng !== null && <Marker position={[lat, lng]} />}
      </MapContainer>
    </div>
  );
}
