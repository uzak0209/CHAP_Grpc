"use client";
import dynamic from "next/dynamic";

// ✅ MapClient はクライアント専用なので dynamic import + ssr:false
const MapClient = dynamic(() => import("../social_sensor/HeatMapClient"), {
  ssr: false,
});

export default function SocialSensorPage() {
  // page.tsx 自体は Server Component でOK
  return (
    <main style={{ height: "100vh" }}>
      <MapClient />
    </main>
  );
}