"use client";
import React from "react";
import { useUIState } from "@/store/useUIState";
import { AppSidebar } from "./app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";

export default function GlobalSidebar() {
  const isOpen = useUIState((s) => s.isSidebarOpen);

  const pathname = usePathname();
  // If we're on the login page (or any route starting with /login), don't render the sidebar
  if (pathname && pathname.startsWith("/login")) return null;

  // Render nothing on server; this is a client-only component.
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Pointer events enabled inside the sidebar itself via its own styles */}
      <div className="pointer-events-auto">
        {/* Wrap AppSidebar in SidebarProvider and sync its open state with useUIState */}
        <SidebarProvider open={isOpen} onOpenChange={(open) => useUIState.setState({ isSidebarOpen: open })}>
          <AppSidebar />
        </SidebarProvider>
      </div>
    </div>
  );
}
