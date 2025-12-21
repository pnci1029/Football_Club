import React, { useEffect, useState, useRef, useCallback } from 'react';

declare const window: Window & {
  kakao?: any;
};

interface Stadium {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  teamId: number;
  teamName: string;
}

interface KakaoMapFixProps {
  stadiums: Stadium[];
  onStadiumClick?: (stadium: Stadium) => void;
  onMapError?: () => void;
  height?: string;
  className?: string;
}

const KakaoMapFix: React.FC<KakaoMapFixProps> = ({
  stadiums,
  onStadiumClick,
  onMapError,
  height = '400px',
  className = ''
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const markersRef = useRef<any[]>([]);
  const isInitializingRef = useRef(false);
  const isScriptLoadedRef = useRef(false);

  // 맵 초기화 함수
  const initializeMap = useCallback(() => {
    if (isInitializingRef.current || map || !mapRef.current) {
      console.log('🚫 초기화 조건 불충족:', {
        isInitializing: isInitializingRef.current,
        hasMap: !!map,
        hasContainer: !!mapRef.current
      });
      return;
    }

    isInitializingRef.current = true;
    console.log('🎯 맵 초기화 시작');
    
    if (!window.kakao?.maps?.Map) {
      console.error('❌ 카카오맵 API 미준비');
      setError('카카오맵 API가 준비되지 않았습니다.');
      setIsLoading(false);
      isInitializingRef.current = false;
      onMapError?.();
      return;
    }

    try {
      const center = new window.kakao.maps.LatLng(37.5665, 126.9780);
      const options = {
        center,
        level: 7
      };

      console.log('🗺️ Map 인스턴스 생성 중...');
      const mapInstance = new window.kakao.maps.Map(mapRef.current, options);
      console.log('✅ Map 생성 완료');

      setMap(mapInstance);
      setIsLoading(false);
      setError(null);

    } catch (error) {
      console.error('❌ 맵 생성 실패:', error);
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      setError(`지도 생성 실패: ${errorMessage}`);
      setIsLoading(false);
      onMapError?.();
    } finally {
      isInitializingRef.current = false;
    }
  }, [map, onMapError]);

  // 카카오맵 스크립트 로드
  useEffect(() => {
    if (isScriptLoadedRef.current) {
      return;
    }

    console.log('🚀 카카오맵 스크립트 로드 시작');
    
    const loadScript = async () => {
      // 이미 로드되어 있는지 확인
      if (window.kakao?.maps?.Map) {
        console.log('✅ 카카오맵이 이미 로드됨');
        isScriptLoadedRef.current = true;
        return;
      }

      if (window.kakao?.maps) {
        console.log('🔄 카카오맵 기본 로드됨, load() 호출');
        return new Promise<void>((resolve) => {
          window.kakao.maps.load(() => {
            console.log('✅ kakao.maps.load() 완료');
            isScriptLoadedRef.current = true;
            resolve();
          });
        });
      }

      // 기존 스크립트 확인
      const existingScript = document.querySelector('script[src*="dapi.kakao.com"]');
      if (existingScript) {
        console.log('📍 기존 스크립트 발견, 로드 대기');
        return new Promise<void>((resolve) => {
          const checkInterval = setInterval(() => {
            if (window.kakao?.maps?.Map) {
              clearInterval(checkInterval);
              console.log('✅ 기존 스크립트 로드 완료');
              isScriptLoadedRef.current = true;
              resolve();
            }
          }, 100);
        });
      }

      // 새 스크립트 로드
      return new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.async = true;
        script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.REACT_APP_KAKAO_MAP_KEY}&autoload=false`;
        
        script.onload = () => {
          console.log('✅ 카카오맵 스크립트 로드 완료');
          if (window.kakao?.maps) {
            window.kakao.maps.load(() => {
              console.log('🗺️ 카카오맵 API 로드 완료');
              isScriptLoadedRef.current = true;
              resolve();
            });
          } else {
            reject(new Error('window.kakao 객체가 없음'));
          }
        };

        script.onerror = () => {
          reject(new Error('카카오맵 스크립트 로드 실패'));
        };

        document.head.appendChild(script);
      });
    };

    loadScript().catch((error) => {
      console.error('❌ 카카오맵 로드 실패:', error);
      setError(error.message);
      setIsLoading(false);
      onMapError?.();
    });
  }, [onMapError]);

  // DOM 마운트 감지 및 초기화
  useEffect(() => {
    const checkAndInitialize = () => {
      console.log('🔍 초기화 조건 체크:', {
        scriptLoaded: isScriptLoadedRef.current,
        hasContainer: !!mapRef.current,
        hasMap: !!map,
        kakaoReady: !!window.kakao?.maps?.Map
      });

      if (isScriptLoadedRef.current && mapRef.current && !map && window.kakao?.maps?.Map) {
        console.log('🎯 모든 조건 충족, 맵 초기화 시작');
        initializeMap();
      }
    };

    // 즉시 체크
    checkAndInitialize();

    // DOM이 아직 준비되지 않은 경우를 위한 지연 체크
    const timeoutId = setTimeout(checkAndInitialize, 100);

    return () => clearTimeout(timeoutId);
  }, [initializeMap, map]);

  // 추가 안전장치: DOM ref 변경 감지
  useEffect(() => {
    if (mapRef.current && isScriptLoadedRef.current && !map && window.kakao?.maps?.Map) {
      console.log('🔄 DOM ref 변경 감지, 맵 초기화');
      initializeMap();
    }
  });

  // 마커 생성 및 업데이트
  useEffect(() => {
    if (!map || !stadiums.length || !window.kakao?.maps) return;

    console.log(`🏟️ ${stadiums.length}개 마커 생성 중...`);

    // 기존 마커 제거
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // 새로운 마커들 생성
    const newMarkers: any[] = [];
    const bounds = new window.kakao.maps.LatLngBounds();

    stadiums.forEach((stadium) => {
      const position = new window.kakao.maps.LatLng(stadium.latitude, stadium.longitude);

      // 마커 생성
      const marker = new window.kakao.maps.Marker({
        position,
        map
      });

      // 인포윈도우 내용
      const infoContent = `
        <div style="padding: 10px; min-width: 200px;">
          <div style="font-weight: bold; color: #2563eb; margin-bottom: 5px;">
            ${stadium.teamName}
          </div>
          <div style="font-size: 14px; margin-bottom: 3px;">
            📍 ${stadium.name}
          </div>
          <div style="font-size: 12px; color: #666;">
            ${stadium.address}
          </div>
        </div>
      `;

      const infowindow = new window.kakao.maps.InfoWindow({
        content: infoContent
      });

      // 마커 클릭 이벤트
      window.kakao.maps.event.addListener(marker, 'click', () => {
        // 다른 인포윈도우 모두 닫기
        markersRef.current.forEach((markerData) => {
          if (markerData.infowindow) {
            markerData.infowindow.close();
          }
        });

        // 현재 인포윈도우 열기
        infowindow.open(map, marker);

        // 외부 콜백 호출
        if (onStadiumClick) {
          onStadiumClick(stadium);
        }
      });

      // 마커 호버 효과
      window.kakao.maps.event.addListener(marker, 'mouseover', () => {
        infowindow.open(map, marker);
      });

      window.kakao.maps.event.addListener(marker, 'mouseout', () => {
        infowindow.close();
      });

      newMarkers.push({ marker, infowindow });
      bounds.extend(position);
    });

    markersRef.current = newMarkers;

    // 모든 마커가 보이도록 지도 범위 조정
    if (stadiums.length > 0) {
      map.setBounds(bounds);
    }

    console.log('✅ 마커 생성 완료');
  }, [map, stadiums, onStadiumClick]);

  if (isLoading) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100 rounded-lg`} style={{ height }}>
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">카카오맵을 불러오는 중...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className} flex items-center justify-center bg-red-50 rounded-lg border border-red-200`} style={{ height }}>
        <div className="text-center">
          <div className="text-red-600 mb-2">🗺️</div>
          <div className="text-red-700 font-medium">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className} rounded-lg overflow-hidden shadow-lg`}>
      <div 
        ref={(node) => {
          if (node && !mapRef.current) {
            console.log('📍 DOM 컨테이너 ref 설정됨');
            mapRef.current = node;
            
            // DOM이 설정되면 즉시 초기화 시도
            if (isScriptLoadedRef.current && !map && window.kakao?.maps?.Map) {
              console.log('🚀 DOM 설정 직후 초기화 시도');
              setTimeout(() => initializeMap(), 0);
            }
          }
        }}
        style={{ width: '100%', height }} 
      />
    </div>
  );
};

export default KakaoMapFix;