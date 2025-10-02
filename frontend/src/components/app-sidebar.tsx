import {
  Calendar,
  Home,
  Inbox,
  Search,
  Settings,
  ChevronLeft,
  Menu,
  Map,
  MessageSquare
} from "lucide-react";
import React from "react";
import { useRouter } from "next/navigation";
import { Some } from "oxide.ts";
import { useLocationStore } from "@/store/useLocation";

import { Category } from "@/types/types";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useUIState } from "@/store/useUIState";
import { useGetSpots } from "@/hooks/use-spot";

// Menu items.
const items = [
  {
    title: "地図",
    url: "/map",
    icon: Map,
  },
  {
    title: "イベント",
    url: "/event",
    icon: Calendar,
  },
  {
    title: "スレッド",
    url: "/thread",
    icon: MessageSquare,
  },
  {
    title: "設定",
    url: "/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const {
    isSidebarOpen,
    toggleSidebar,
    selectedCategory,
    setSelectedCategory,
    setSelectedContent,
  } = useUIState();
  const handleCategorySelect = (category: Category) => {
    console.log("AppSidebar - selecting category:", category);
    setSelectedCategory(category);
  };
  const spotsQuery = useGetSpots();
  const router = useRouter();


  return (
    <Sidebar className="bg-white/95 backdrop-blur-sm border-r shadow-md">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center justify-between px-4 py-3">
          <h2 className="text-lg font-semibold text-blue-600">CHAP</h2>
          {isSidebarOpen && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="h-8 w-8 p-0 hover:bg-blue-100 rounded-full transition-colors"
              title="サイドバーを閉じる"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>メニュー</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* カテゴリフィルタセクション */}
        <SidebarGroup>
          <SidebarGroupLabel>投稿カテゴリ</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="space-y-2 px-2">
              <label className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors">
                <input
                  type="radio"
                  name="category"
                  checked={selectedCategory === Category.ENTERTAINMENT}
                  onChange={() => handleCategorySelect(Category.ENTERTAINMENT)}
                  className="border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
                />
                <div className="flex items-center space-x-2 flex-1">
                  <span className="text-sm">💬</span>
                  <span className="text-sm font-medium text-gray-900">
                    雑談
                  </span>
                </div>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors">
                <input
                  type="radio"
                  name="category"
                  checked={selectedCategory === Category.COMMUNICATION}
                  onChange={() => handleCategorySelect(Category.COMMUNICATION)}
                  className="border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
                />
                <div className="flex items-center space-x-2 flex-1">
                  <span className="text-sm">🏘️</span>
                  <span className="text-sm font-medium text-gray-900">
                    地域住民コミュニケーション
                  </span>
                </div>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors">
                <input
                  type="radio"
                  name="category"
                  checked={selectedCategory === Category.DISASTER}
                  onChange={() => handleCategorySelect(Category.DISASTER)}
                  className="border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
                />
                <div className="flex items-center space-x-2 flex-1">
                  <span className="text-sm">🚨</span>
                  <span className="text-sm font-medium text-gray-900">
                    災害用
                  </span>
                </div>
              </label>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>地点リスト</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="space-y-2 px-2 max-h-60 overflow-y-auto">
              {spotsQuery.data?.spots?.map((spot) => (
                <div
                  key={spot.id}
                  className="p-2 bg-gray-100 rounded-md cursor-pointer hover:bg-gray-200 transition-colors"
                  onClick={() => {
                    // close sidebar if open
                    if (isSidebarOpen) toggleSidebar();

                    // set global map center to this spot (if coords exist)
                    if (spot.lat !== undefined && spot.lng !== undefined) {
                      try {
                        useLocationStore.setState({ mapCenter: Some({ lat: spot.lat, lng: spot.lng }) });
                      } catch (e) {
                        // ignore failures to avoid breaking UI
                      }
                    }

                    // navigate to map page
                    try { router.push('/map'); } catch (e) { /* ignore */ }
                  }}
                >
                  <div className="text-sm font-medium text-gray-900">
                    {spot.title}
                  </div>
                </div>
              ))}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
