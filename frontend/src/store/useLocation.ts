import { create } from "zustand";
import { Some, None, Option,Result,Err,Ok } from "oxide.ts";
import type { Coordinate } from "@/types/types";
type LocationState = {
  currentLocation: Option<Coordinate>;
  mapCenter: Option<Coordinate>; // パン指示用
  viewCenter: Option<Coordinate>; // 常時地図の中心
  setCurrentLocation: (location: Option<Coordinate>) => void;
  setMapCenter: (location: Option<Coordinate>) => void;
  setViewCenter: (location: Option<Coordinate>) => void;
};

export const useLocationStore = create<LocationState>((set) => ({
  currentLocation: None,
  mapCenter: None,
  viewCenter: None,
  setCurrentLocation: (location) => set({ currentLocation: location }),
  setMapCenter: (location) => set({ mapCenter: location }),
  setViewCenter: (location) => set({ viewCenter: location }),
}));
export function getViewCenter(): Option<Coordinate> {
  return useLocationStore.getState().viewCenter;
}

export function useLocation() {
  console.log(getCurrentLocation())
  return useLocationStore((s) => ({
    currentLocation: s.currentLocation,
    setCurrentLocation: s.setCurrentLocation,
  }));
}

export function getCurrentLocation(): Option<Coordinate> {
    console.log(useLocationStore.getState().currentLocation)
  return useLocationStore.getState().currentLocation;
}

export function getMapCenter(): Option<Coordinate> {
  return useLocationStore.getState().mapCenter;
}

export function setMapCenter(location: Option<Coordinate>): void {
  useLocationStore.setState({ mapCenter: location });
}

export function setCurrentLocation(location: Option<Coordinate>): void {
  useLocationStore.setState({ currentLocation: location });
}

function applyCurrentLocation(location: Coordinate): void {
  useLocationStore.setState({
    currentLocation: Some(location),
    mapCenter: Some(location),
    viewCenter: Some(location),
  });
}

export async function captureCurrentLocation(): Promise<Result<void, string>> {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    setCurrentLocation(None);
    return Promise.resolve(Err('geolocation-not-supported'));
  }

  const getPosition = (options: PositionOptions) =>
    new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });

  try {
    const pos = await getPosition({
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 30000,
    });
    applyCurrentLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    return Ok(undefined);
  } catch (firstError: any) {
    try {
      const pos = await getPosition({
        enableHighAccuracy: false,
        timeout: 20000,
        maximumAge: 300000,
      });
      applyCurrentLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      return Ok(undefined);
    } catch (secondError: any) {
      setCurrentLocation(None);
      return Err(secondError?.message ?? firstError?.message ?? 'geolocation-error');
    }
  }
}
