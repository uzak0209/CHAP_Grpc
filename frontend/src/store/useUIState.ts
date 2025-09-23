import { Category, ContentType } from "@/types/types";
import { create } from "zustand";

type UIState = {
  isSidebarOpen: boolean;
  selectedCategory: Category;
  selectedContent: ContentType;
  toggleSidebar: () => void;
  setSelectedCategory: (category: Category) => void;
  setSelectedContent: (content: ContentType) => void;
};
export const useUIState = create<UIState>((set) => ({
  isSidebarOpen: false,
  selectedCategory: Category.ENTERTAINMENT,
  selectedContent: ContentType.POST,
  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSelectedCategory: (category) =>
    set(() => ({ selectedCategory: category })),
  setSelectedContent: (content) => set(() => ({ selectedContent: content })),
}));
