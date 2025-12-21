export interface KakaoLatLng {
  getLat(): number;
  getLng(): number;
}

export interface KakaoMap {
  setCenter(latlng: KakaoLatLng): void;
  setLevel(level: number): void;
  setBounds(bounds: KakaoLatLngBounds): void;
  relayout(): void;
}

export interface KakaoMarker {
  setMap(map: KakaoMap | null): void;
  setPosition(latlng: KakaoLatLng): void;
}

export interface KakaoInfoWindow {
  open(map: KakaoMap, marker: KakaoMarker): void;
  close(): void;
}

export interface KakaoLatLngBounds {
  extend(latlng: KakaoLatLng): void;
}

export interface KakaoMapsAPI {
  Map: new (container: HTMLElement, options: { center: KakaoLatLng; level: number }) => KakaoMap;
  LatLng: new (lat: number, lng: number) => KakaoLatLng;
  Marker: new (options: { position: KakaoLatLng; map?: KakaoMap }) => KakaoMarker;
  InfoWindow: new (options: { content: string; removable?: boolean }) => KakaoInfoWindow;
  LatLngBounds: new () => KakaoLatLngBounds;
  event: {
    addListener: (target: KakaoMap | KakaoMarker, type: string, handler: () => void) => void;
  };
  load?: (callback: () => void) => void;
}

export interface KakaoServices {
  Geocoder: new () => {
    addressSearch(address: string, callback: (result: unknown[], status: string) => void): void;
  };
  Status: {
    OK: string;
  };
}

export interface KakaoSDK {
  maps: KakaoMapsAPI;
  services?: KakaoServices;
}

