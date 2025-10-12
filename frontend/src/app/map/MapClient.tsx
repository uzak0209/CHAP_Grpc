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
  useMapEvents,
  CircleMarker,
} from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import L, { LatLng, latLng } from "leaflet";
import { useEffect } from "react";
import { Some } from "oxide.ts";
import { useRouter } from "next/navigation";
import { captureCurrentLocation, useLocationStore } from "@/store/useLocation";
import type { V1Event } from "@/api/event.schemas.ts/v1Event";
import { useGetPosts } from "@/hooks/use-post";
import { useGetEvents } from "@/hooks/use-event";
import { useGetThreads } from "@/hooks/use-thread";
import type { postServiceGetPosts } from "@/api/post";
import type { V1Thread } from "@/api/thread.schemas.ts";
import type { V1Post } from "@/api/post.schemas.ts";
import { useUIState } from "@/store/useUIState";
import { Heart } from "lucide-react";
import { useSpotServiceGetSpots } from "@/api/spot";
import { useGetSpots } from "@/hooks/use-spot";

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

function PanOnLocation() {
  const map = useMap();
  const currentLocation = useLocationStore((s) => s.currentLocation);

  useEffect(() => {
    if (currentLocation && currentLocation.isSome && currentLocation.isSome()) {
      const coord = currentLocation.unwrap();
      try {
        // use a short timeout to allow map to initialize
        const id = setTimeout(() => map.setView([coord.lat, coord.lng], map.getZoom()), 50);
        return () => clearTimeout(id);
      } catch (e) {
        // ignore
      }
    }
  }, [currentLocation, map]);

  return null;
}

function MapCenterSync() {
  const map = useMap();
  const setMapCenter = useLocationStore((s) => s.setMapCenter);
  const setViewCenter = useLocationStore((s) => s.setViewCenter);

  useEffect(() => {
    try {
      const c = map.getCenter();
      setMapCenter(Some({ lat: c.lat, lng: c.lng }));
      setViewCenter(Some({ lat: c.lat, lng: c.lng }));
    } catch (e) {
      // ignore
    }
  }, [map, setMapCenter, setViewCenter]);

  useMapEvents({
    moveend: () => {
      try {
        const c = map.getCenter();
        setMapCenter(Some({ lat: c.lat, lng: c.lng }));
        setViewCenter(Some({ lat: c.lat, lng: c.lng }));
      } catch (e) {
        // ignore
      }
    },
  });

  return null;
}

import { None } from "oxide.ts";
function PanToMapCenter() {
  const map = useMap();
  const mapCenter = useLocationStore((s) => s.mapCenter);
  const setMapCenter = useLocationStore((s) => s.setMapCenter);

  useEffect(() => {
    if (mapCenter.isSome()) {
      try {
        const c = mapCenter.unwrap();
        // パンしてからmapCenterをリセット
        map.setView([c.lat, c.lng], map.getZoom());
        setTimeout(() => setMapCenter(None), 0);
      } catch (e) {
        // ignore
      }
    }
  }, [mapCenter, map, setMapCenter]);

  return null;
}

export default function MapClient() {
  const router = useRouter();
  const currentLocation = useLocationStore((s) => s.currentLocation);
  const uiState=useUIState();
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    captureCurrentLocation();
  }, []);

  const center: LatLngExpression =
    currentLocation && currentLocation.isSome && currentLocation.isSome()
      ? (() => {
          const c = currentLocation.unwrap();
          return [c.lat, c.lng];
        })()
      : [35.681236, 139.767125];

  const locationParams = currentLocation.isSome()
    ? { lat: currentLocation.unwrap().lat, lng: currentLocation.unwrap().lng }
    : undefined;

  // call hooks at top-level; they internally use `enabled` so they don't run until params exist
  const postsQuery = useGetPosts(locationParams ?? {});
  const eventsQuery = useGetEvents(locationParams ?? {});
  const threadsQuery = useGetThreads(locationParams ?? {});
  const spotsQuery = useGetSpots();
  console.log(uiState.selectedCategory);
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
  <PanOnLocation />
  <PanToMapCenter />
  <MapCenterSync />

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
          const redIcon = L.icon({
            iconUrl: "/icons/marker-red.svg",
            iconSize: [28, 48],
            iconAnchor: [14, 48],
            popupAnchor: [0, -40],
            className: "leaflet-marker-shadcn",
          });
          const blueIcon= L.icon({
            iconUrl: "/icons/marker-blue.svg",
            iconSize: [28, 48],
            iconAnchor: [14, 48],
            popupAnchor: [0, -40],
            className: "leaflet-marker-shadcn",
          });
          const yellowIcon= L.icon({
            iconUrl: "/icons/marker-yellow.svg",
            iconSize: [28, 48],
            iconAnchor: [14, 48],
            popupAnchor: [0, -40],
            className: "leaflet-marker-shadcn",
          });
          const pin= L.icon({
            iconUrl: "/icons/pin-red.svg",
            iconSize: [28, 48],
            iconAnchor: [14, 48],
            popupAnchor: [0, -40],
            className: "leaflet-marker-shadcn",
          });
          const coord = Array.isArray(center)
            ? { lat: center[0], lng: center[1] }
            : { lat: (center as LatLng).lat, lng: (center as LatLng).lng };

          return (
            <>
              {/* current location: green circle marker */}
              <CircleMarker
                center={center}
                radius={8}
                pathOptions={{ color: "#10b981", fillColor: "#10b981", fillOpacity: 0.9 }}
              >
                <Popup>
                  <div className="min-w-[140px] text-sm">
                    <div className="font-medium mb-1">現在地</div>
                  </div>
                </Popup>
              </CircleMarker>

              {/* server-provided events / registered points shown as red pin markers */}
              {eventsQuery.data?.events?.filter(ev=>uiState.selectedCategory.toString()==ev.contentType).map((ev: V1Event) =>
                ev.lat !== undefined && ev.lng !== undefined ? (
                  <Marker key={ev.id} position={[ev.lat, ev.lng]} icon={redIcon}>
                    <Popup>
                      <div className="min-w-[160px]">
                        <div className="text-base text-gray-800 mb-1">{ev.content}</div>
                        <div className="text-sm text-gray-600 mb-2">by {ev.userName}</div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Heart className="w-4 h-4" />
                          <span>{ev.likeCount ?? 0}</span>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ) : null
              )}
              {threadsQuery.data?.threads?.filter(th=>uiState.selectedCategory.toString()==th.contentType).map((th:V1Thread) =>
                th.lat !== undefined && th.lng !== undefined ? (
                  <Marker
                    key={th.id}
                    position={[th.lat, th.lng]}
                    icon={yellowIcon}
                  >
                    <Popup>
                      <div
                        className="min-w-[160px] cursor-pointer"
                        role="button"
                        onClick={() => router.push(`/thread/${th.id}`)}
                      >
                        <div className="text-base text-gray-800 mb-1">{th.content}</div>
                        <div className="text-sm text-gray-600 mb-2">by {th.userName}</div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Heart className="w-4 h-4" />
                          <span>{th.likeCount ?? 0}</span>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ) : null
              )}
              {postsQuery.data?.posts?.filter(po=>uiState.selectedCategory.toString()==po.contentType).map((po: V1Post) =>
                po.lat !== undefined && po.lng !== undefined ? (
                  <Marker key={po.id} position={[po.lat, po.lng]} icon={blueIcon}>
                    <Popup>
                      <div className="min-w-[160px]">
                        <div className="text-base text-gray-800 mb-1">{po.content}</div>
                        <div className="text-sm text-gray-600 mb-2">by {po.userName}</div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Heart className="w-4 h-4" />
                          <span>{po.likeCount ?? 0}</span>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ) : null
              )}  
              {spotsQuery.data?.spots?.map((sp) =>
                sp.lat !== undefined && sp.lng !== undefined ? (
                  <Marker key={sp.id} position={[sp.lat, sp.lng]} icon={pin}>
                    <Popup>
                      <div className="min-w-[160px]">
                        <div className="text-base text-gray-800 mb-1">{sp.title}</div>
                        <div className="text-sm text-gray-600 mb-2">{sp.description}</div>
                      </div>
                    </Popup>
                  </Marker>
                ) : null
              )}
            </>
          );
        })()}
      </MapContainer>
    </div>
  );
}
