/**
 * Geolonia Maps API TypeScript型定義
 */

declare global {
  interface Window {
    geolonia: {
      Map: new (options: GeoloniaMapOptions) => GeoloniaMap;
      Marker: new (options?: GeoloniaMarkerOptions) => GeoloniaMarker;
      Popup: new (options?: GeoloniaPopupOptions) => GeoloniaPopup;
      LngLatBounds: new () => GeoloniaLngLatBounds;
    };
  }
}

interface GeoloniaMapOptions {
  container: HTMLElement | string;
  style: string;
  center: [number, number]; // [lng, lat]
  zoom: number;
  attributionControl?: boolean;
}

interface GeoloniaMap {
  on: (event: string, callback: (e?: any) => void) => void;
  off: (event: string, callback: (e?: any) => void) => void;
  flyTo: (options: {
    center: [number, number];
    zoom?: number;
    duration?: number;
  }) => void;
  fitBounds: (bounds: GeoloniaLngLatBounds, options?: {
    padding?: { top: number; bottom: number; left: number; right: number };
    maxZoom?: number;
  }) => void;
  getBearing: () => number;
  rotateTo: (bearing: number) => void;
  resize: () => void;
  remove: () => void;
}

interface GeoloniaMarkerOptions {
  color?: string;
  scale?: number;
}

interface GeoloniaMarker {
  setLngLat: (lngLat: [number, number]) => GeoloniaMarker;
  addTo: (map: GeoloniaMap) => GeoloniaMarker;
  remove: () => void;
  getElement: () => HTMLElement;
  setPopup: (popup: GeoloniaPopup) => GeoloniaMarker;
}

interface GeoloniaPopupOptions {
  offset?: number;
  closeButton?: boolean;
  closeOnClick?: boolean;
}

interface GeoloniaPopup {
  setHTML: (html: string) => GeoloniaPopup;
  addTo: (map: GeoloniaMap) => GeoloniaPopup;
  remove: () => void;
}

interface GeoloniaLngLatBounds {
  extend: (lngLat: [number, number]) => GeoloniaLngLatBounds;
}

export {};
