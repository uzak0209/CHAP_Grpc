"use client";
import React from "react";
import { Menu } from "lucide-react";
import { useUIState } from "@/store/useUIState";
import { usePathname } from "next/navigation";

export default function SidebarToggle() {
  // Subscribe to both toggle function and current open state.
  const toggleSidebar = useUIState((s) => s.toggleSidebar);
  const isSidebarOpen = useUIState((s) => s.isSidebarOpen);
  const pathname = usePathname();

  if (pathname && pathname.startsWith("/login")) return null;

  // Only show the floating toggle when the sidebar is closed.
  if (isSidebarOpen) return null;

  return (
    <button
      aria-label="Toggle sidebar"
      onClick={toggleSidebar}
      className="fixed top-4 left-4 z-[60] h-10 w-10 rounded-md bg-white/90 backdrop-blur-sm border shadow-md flex items-center justify-center hover:bg-white"
      title="サイドバー"
    >
      <Menu className="h-5 w-5 text-gray-700" />
    </button>
  );
}
