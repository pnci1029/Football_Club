import React, { useEffect, useRef, useState } from 'react';

// 카카오맵 타입 선언 - 필요한 부분만 any로 처리
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

interface TeamStadiumMapProps {
  stadiums: Stadium[];
  onStadiumClick?: (stadium: Stadium) => void;
  height?: string;
  className?: string;
}

const TeamStadiumMap: React.FC<TeamStadiumMapProps> = ({
  stadiums,
  onStadiumClick,
  height = '400px',
  className = ''
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const markersRef = useRef<any[]>([]);

  // 카카오맵 스크립트 로드
  useEffect(() => {
    console.log('🗺️ TeamStadiumMap 초기화 시작');
    console.log('🔑 API Key:', process.env.REACT_APP_KAKAO_MAP_KEY);
    
    let isMounted = true;
    
    const loadKakaoMap = () => {
      console.log('🔍 현재 window.kakao 상태:', window.kakao);
      console.log('🔍 현재 스크립트 존재 여부:', !!document.querySelector('script[src*="dapi.kakao.com"]'));
      
      // 이미 카카오맵이 완전히 로드되어 있는지 확인
      if (window.kakao && window.kakao.maps && window.kakao.maps.Map) {
        console.log('✅ 카카오맵이 이미 로드됨');
        if (isMounted) {
          initializeMap();
        }
        return;
      }
      
      // 스크립트는 있지만 객체가 없는 경우
      const existingScript = document.querySelector('script[src*="dapi.kakao.com"]');
      if (existingScript) {
        console.log('📜 카카오맵 스크립트 이미 존재하지만 객체가 없음');
        
        // 최대 30번까지만 재시도 (3초)
        let retryCount = 0;
        const maxRetries = 30;
        
        const checkKakaoLoaded = () => {
          retryCount++;
          console.log(`⏳ 카카오 객체 확인 중... (${retryCount}/${maxRetries})`);
          
          if (window.kakao && window.kakao.maps) {
            console.log('✅ 카카오 객체 발견! 맵 초기화 시작');
            window.kakao.maps.load(() => {
              console.log('🗺️ 카카오맵 API 로드 완료');
              if (isMounted) {
                initializeMap();
              }
            });
          } else if (retryCount < maxRetries && isMounted) {
            setTimeout(checkKakaoLoaded, 100);
          } else {
            console.error('❌ 카카오 객체 로드 타임아웃 또는 컴포넌트 언마운트');
            if (isMounted) {
              setError('카카오맵 로드에 실패했습니다. 페이지를 새로고침해주세요.');
              setIsLoading(false);
            }
          }
        };
        
        checkKakaoLoaded();
        return;
      }
      
      // 스크립트가 없는 경우 새로 추가
      console.log('📥 카카오맵 스크립트 새로 추가');
      const script = document.createElement('script');
      script.async = true;
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.REACT_APP_KAKAO_MAP_KEY}&autoload=false`;
      
      script.onload = () => {
        console.log('✅ 카카오맵 스크립트 로드 완료');
        console.log('🔍 로드 후 window.kakao:', window.kakao);
        
        if (window.kakao && window.kakao.maps) {
          window.kakao.maps.load(() => {
            console.log('🗺️ 카카오맵 API 로드 완료');
            if (isMounted) {
              initializeMap();
            }
          });
        } else {
          console.error('❌ 스크립트는 로드되었지만 kakao 객체가 없음');
          if (isMounted) {
            setError('카카오맵 객체를 찾을 수 없습니다.');
            setIsLoading(false);
          }
        }
      };
      
      script.onerror = (e) => {
        console.error('❌ 카카오맵 스크립트 로드 실패:', e);
        if (isMounted) {
          setError('카카오맵 스크립트를 불러오는데 실패했습니다.');
          setIsLoading(false);
        }
      };
      
      document.head.appendChild(script);
    };
    
    loadKakaoMap();
    
    // 맵 초기화 함수
    function initializeMap() {
      console.log('🗺️ 맵 초기화 시작');
      if (mapContainer.current) {
        try {
          // 대한민국 중심 좌표 (서울)
          const center = new window.kakao.maps.LatLng(37.5665, 126.9780);
          
          const options = {
            center,
            level: 7 // 적당한 줌 레벨
          };
          
          console.log('🎯 Map 인스턴스 생성 중...');
          const mapInstance = new window.kakao.maps.Map(mapContainer.current, options);
          console.log('✅ Map 인스턴스 생성 완료');
          
          setMap(mapInstance);
          setIsLoading(false);
        } catch (error) {
          console.error('❌ 맵 초기화 실패:', error);
          const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
          setError(`지도 초기화 실패: ${errorMessage}`);
          setIsLoading(false);
        }
      } else {
        console.error('❌ mapContainer.current가 null');
        setError('지도 컨테이너를 찾을 수 없습니다.');
        setIsLoading(false);
      }
    }
    
    return () => {
      console.log('🧹 컴포넌트 정리 중');
      isMounted = false;
    };
  }, []);

  // 마커 생성 및 업데이트
  useEffect(() => {
    if (!map || !stadiums.length) return;

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
  }, [map, stadiums, onStadiumClick]);

  if (isLoading) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100 rounded-lg`} style={{ height }}>
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">지도를 불러오는 중...</span>
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
      <div ref={mapContainer} style={{ width: '100%', height }} />
    </div>
  );
};

export default TeamStadiumMap;