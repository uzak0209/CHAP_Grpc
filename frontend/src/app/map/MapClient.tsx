"use client";

import React, { useRef } from "react";
// Leaflet needs its CSS to render tiles/controls correctly. Import in the client
// component so the styles apply only in the browser.
// @ts-ignore
import "leaflet/dist/leaflet.css";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  ZoomControl,
  useMap,
} from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import L, { LatLng, latLng } from "leaflet";
import { useEffect } from "react";
import { captureCurrentLocation, useLocationStore } from "@/store/useLocation";

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

function MoveToLocation() {
  const map = useMap();
  const currentLocation = useLocationStore((s) => s.currentLocation);

  useEffect(() => {
    if (currentLocation && currentLocation.isSome && currentLocation.isSome()) {
      const coord = currentLocation.unwrap();
      try {
        map.setView([coord.lat, coord.lng], map.getZoom());
      } catch (e) {
        // ignore
      }
    }
  }, [currentLocation, map]);

  return null;
}

export default function MapClient() {
  
  const currentLocation = useLocationStore((s) => s.currentLocation);

  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    captureCurrentLocation();
  }, []);

  const center: LatLngExpression = currentLocation && currentLocation.isSome && currentLocation.isSome()
    ? (() => { const c = currentLocation.unwrap(); return [c.lat, c.lng]; })()
    : [35.681236, 139.767125];

  return (
    <div
      ref={containerRef}
      style={{ position: "fixed", inset: 0, zIndex: 0, background: "white" }}
    >
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
      >
  <MapResize />
  
  <MoveToLocation />
  
        <ZoomControl position="topright" />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
          eventHandlers={{
            tileerror: (ev: any) => {
              console.error("Leaflet tileerror", ev);
            },
          }}
        />
        {(() => {
          const fileIcon = L.icon({
            iconUrl: "/icons/marker.svg",
            iconSize: [36, 48],
            iconAnchor: [18, 48],
            popupAnchor: [0, -40],
            className: "leaflet-marker-shadcn",
          });

          return (
            <Marker position={center} icon={fileIcon} riseOnHover>
              <Popup>現在地</Popup>
            </Marker>
          );
        })()}
      </MapContainer>
    </div>
  );
}
