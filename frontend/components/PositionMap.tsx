'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix für Leaflet Icons in Next.js
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/marker-icon-2x.png',
  iconUrl: '/marker-icon.png',
  shadowUrl: '/marker-shadow.png',
});

interface PositionMapProps {
  latitude: number;
  longitude: number;
  onPositionChange: (lat: number, lng: number) => void;
  height?: string;
}

// Komponente für Klick-Events auf der Karte
function LocationMarker({ position, onPositionChange }: { 
  position: [number, number]; 
  onPositionChange: (lat: number, lng: number) => void; 
}) {
  const map = useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onPositionChange(lat, lng);
    },
  });

  return (
    <Marker 
      position={position}
      draggable={true}
      eventHandlers={{
        dragend: (e) => {
          const marker = e.target;
          const position = marker.getLatLng();
          onPositionChange(position.lat, position.lng);
        },
      }}
    />
  );
}

function RecenterMap({ position }: { position: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    map.setView(position, map.getZoom());
  }, [position, map]);

  return null;
}

export default function PositionMap({ 
  latitude, 
  longitude, 
  onPositionChange, 
  height = 'h-48' 
}: PositionMapProps) {
  const [position, setPosition] = useState<[number, number]>([latitude, longitude]);

  useEffect(() => {
    setPosition([latitude, longitude]);
  }, [latitude, longitude]);

  const handlePositionChange = (lat: number, lng: number) => {
    setPosition([lat, lng]);
    onPositionChange(lat, lng);
  };

  return (
    <div className={`${height} rounded-lg overflow-hidden border border-slate-300`}>
      <MapContainer 
        center={position} 
        zoom={13} 
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <RecenterMap position={position} />
        <LocationMarker 
          position={position} 
          onPositionChange={handlePositionChange} 
        />
      </MapContainer>
      <div className="bg-slate-50 px-3 py-2 text-xs text-slate-600 border-t border-slate-200">
        📍 Klicke auf Karte oder ziehe Marker um Position zu setzen
      </div>
    </div>
  );
}