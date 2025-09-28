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

  // Render the provider and sidebar directly. Avoid wrapping with a full-screen
  // fixed overlay which can interfere with interaction (pointer-events / focus).
  return (
    <SidebarProvider open={isOpen} onOpenChange={(open) => useUIState.setState({ isSidebarOpen: open })}>
      <AppSidebar />
    </SidebarProvider>
  );
}
