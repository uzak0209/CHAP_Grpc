"use client";

import React, { useRef } from "react";
// Leaflet needs its CSS to render tiles/controls correctly. Import in the client
// component so the styles apply only in the browser.
// @ts-ignore
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, Tooltip, useMap } from 'react-leaflet';
import type { LatLngExpression } from 'leaflet';
import L from 'leaflet';
import { useEffect } from 'react';

function MapResize() {
  const map = useMap();
  useEffect(() => {
    const id = setTimeout(() => {
      try {
        map.invalidateSize();
      } catch (e) {
        // ignore
      }
    }, 100);
    return () => clearTimeout(id);
  }, [map]);
  return null;
}

export default function MapClient() {
  const position: LatLngExpression = [35.681236, 139.767125];
  const containerRef = useRef<HTMLDivElement | null>(null);
  
  return (
    // cover the entire viewport (placed behind UI overlays)
    <div ref={containerRef} style={{ position: 'fixed', inset: 0, zIndex: 0, background: 'white' }}>
      {/* disable default zoomControl (top-right) and add a ZoomControl positioned bottomright */}
      <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={false}>
        <MapResize />
        <ZoomControl position="bottomright" />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
          eventHandlers={{
            tileerror: (ev: any) => {
              console.error('Leaflet tileerror', ev);
            },
          }}
        />
        {/* Tailwind-styled DivIcon (good for shadcn/Tailwind styling) */}
        {/* Use an external SVG asset as the marker icon (no inline HTML). */}
        {(() => {
          const fileIcon = L.icon({
            iconUrl: '/icons/marker.svg',
            iconSize: [36, 48],
            iconAnchor: [18, 48],
            popupAnchor: [0, -40],
            className: 'leaflet-marker-shadcn',
          })

          return (
            <Marker position={position} icon={fileIcon} riseOnHover>
              <Popup>東京駅</Popup>
            </Marker>
          )
        })()}
      </MapContainer>
    </div>
  );
}

