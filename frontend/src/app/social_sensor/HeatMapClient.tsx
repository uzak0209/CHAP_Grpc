"use client";

import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";

type Point = { lat: number; lng: number };

function HeatLayer({ points }: { points: Point[] }) {
  const map = useMap();

  useEffect(() => {
    if (!points.length) return;

    const heatData = points.map((p) => [p.lat, p.lng, 0.8]);
    // @ts-ignore
    const heatLayer = window.L.heatLayer(heatData, {
      radius: 25,
      blur: 15,
      maxZoom: 17,
      minOpacity: 0.5,
    }).addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [points, map]);

  return null;
}

export default function MapClient() {
  const [points, setPoints] = useState<Point[]>([]);
  const [geminiResponse, setGeminiResponse] = useState<string>("");

  useEffect(() => {
    fetch("http://127.0.0.1:3111/lang/process")
      .then((res) => res.json())
      .then((data) => {
        setPoints(data.coordinate ?? []);
        setGeminiResponse(data.gemini_response ?? "");
      })
      .catch(console.error);
  }, []);

  return (
    <div style={{ position: "relative", height: "100vh", width: "100%" }}>
      <MapContainer
        center={[35.16, 136.93]}
        zoom={14}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <HeatLayer points={points} />
      </MapContainer>

      {/* Map 上に重ねて表示 */}
      <div
        style={{
          position: "absolute",
          bottom: 20, // 下に置きたい場合
          left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(255,255,255,0.9)",
          padding: "8px 12px",
          borderRadius: 6,
          zIndex: 1000,
          boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
        }}
      >
        {geminiResponse
          ? `Gemini Response: ${geminiResponse}`
          : "Gemini Response: 取得中..."}
      </div>
    </div>
  );
}

