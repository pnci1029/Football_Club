// fe/src/types/kakao.maps.d.ts
// Ambient declarations for the Kakao Maps SDK.

interface KakaoMapInstance {
  setCenter(latlng: KakaoLatLng): void;
  setLevel(level: number): void;
  relayout(): void;
  setBounds(bounds: KakaoLatLngBounds): void;
}

interface KakaoLatLng {
  getLat(): number;
  getLng(): number;
}

interface KakaoMarker {
  setMap(map: KakaoMapInstance | null): void;
  setPosition(latlng: KakaoLatLng): void;
}

interface KakaoInfoWindow {
  open(map: KakaoMapInstance, marker: KakaoMarker): void;
  close(): void;
}

interface KakaoLatLngBounds {
  extend(latlng: KakaoLatLng): void;
}

interface KakaoMaps {
  load: (callback: () => void) => void;
  Map: new (container: HTMLElement, options: { center: KakaoLatLng; level: number }) => KakaoMapInstance;
  LatLng: new (lat: number, lng: number) => KakaoLatLng;
  Marker: new (options: { position: KakaoLatLng; map?: KakaoMapInstance }) => KakaoMarker;
  InfoWindow: new (options: { content: string; removable?: boolean }) => KakaoInfoWindow;
  LatLngBounds: new () => KakaoLatLngBounds;
  event: {
    addListener: (target: KakaoMapInstance | KakaoMarker, type: string, handler: () => void) => void;
  };
}

interface KakaoServices {
  Geocoder: new () => {
    addressSearch(address: string, callback: (result: unknown[], status: string) => void): void;
  };
  Status: {
    OK: string;
  };
}

interface KakaoSDK {
  maps: KakaoMaps;
  services: KakaoServices;
}

// Augment the global Window interface
interface Window {
  kakao: KakaoSDK;
}