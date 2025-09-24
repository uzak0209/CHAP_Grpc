import { create } from "zustand";
import { Some, None, Option,Result,Err,Ok } from "oxide.ts";
import type { Coordinate } from "@/types/types";
type LocationState = {
  currentLocation: Option<Coordinate>;
  setCurrentLocation: (location: Option<Coordinate>) => void;
};

export const useLocationStore = create<LocationState>((set) => ({
  currentLocation: None,
  setCurrentLocation: (location) => set({ currentLocation: location }),
}));

export function useLocation() {
  return useLocationStore((s) => ({
    currentLocation: s.currentLocation,
    setCurrentLocation: s.setCurrentLocation,
  }));
}


export function getCurrentLocation(): Option<Coordinate> {
  return useLocationStore.getState().currentLocation;
}

export function setCurrentLocation(location: Option<Coordinate>): void {
  useLocationStore.setState({ currentLocation: location });
}

export async function captureCurrentLocation(): Promise<Result<void, string>> {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    setCurrentLocation(None);
    return Promise.resolve(Err('geolocation-not-supported'));
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCurrentLocation(Some({ lat: pos.coords.latitude, lng: pos.coords.longitude }));
        resolve(Ok(undefined)); // ✅ resolve で Promise に返す
      },
      (err) => {
        setCurrentLocation(None);
        resolve(Err(err?.message ?? 'geolocation-error')); // ✅ resolve で返す
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  });
}