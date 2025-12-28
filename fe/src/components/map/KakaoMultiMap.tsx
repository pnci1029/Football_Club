import React, { useEffect, useRef } from 'react';

interface Stadium {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  teamId: number;
  teamName: string;
  teamSubdomain?: string | null;
}

interface KakaoMultiMapProps {
  stadiums: Stadium[];
  onStadiumClick?: (stadium: Stadium) => void;
  onMapError?: () => void;
  height?: string;
  className?: string;
}

const KakaoMultiMap: React.FC<KakaoMultiMapProps> = ({
  stadiums,
  onStadiumClick,
  onMapError,
  height = '400px',
  className = ''
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log('🗺️ KakaoMultiMap useEffect 시작:', {
      hasContainer: !!mapContainer.current,
      stadiumCount: stadiums.length,
      hasKakao: !!window.kakao
    });

    if (!window.kakao || !mapContainer.current || stadiums.length === 0) {
      console.log('❌ 초기 조건 실패:', {
        hasKakao: !!window.kakao,
        hasContainer: !!mapContainer.current,
        stadiumCount: stadiums.length
      });
      return;
    }

    // 카카오맵 API가 로드되었는지 확인
    if (window.kakao.maps && window.kakao.maps.Map) {
      initializeMap();
    } else {
      // API가 아직 로드되지 않았다면 로드될 때까지 기다림
      window.kakao.maps?.load(initializeMap);
    }

    function initializeMap() {
      if (!mapContainer.current) {
        console.log('❌ initializeMap: mapContainer가 없음');
        return;
      }
      
      console.log('✅ 지도 초기화 시작');

      // 서울 중심 좌표로 기본 설정
      const center = new window.kakao.maps.LatLng(37.5665, 126.9780);
      const mapOption = {
        center,
        level: 7 // 지도의 확대 레벨
      };

      try {
        // 지도 생성
        const map = new window.kakao.maps.Map(mapContainer.current, mapOption);

        // KakaoMap 방식과 동일하게 지도 크기 재조정 (중요!)
        setTimeout(() => {
          map.relayout();
          map.setCenter(center);
        }, 100);

        // 새로운 마커들 생성
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

          // 마커 클릭 이벤트 - 모달 오픈
          window.kakao.maps.event.addListener(marker, 'click', function() {
            // 모든 경우에 모달을 먼저 보여줌
            if (onStadiumClick) {
              onStadiumClick(stadium);
            }
          });

          // 마커 호버 효과 (안정화)
          let hoverTimeout: NodeJS.Timeout;
          let isHovering = false;

          window.kakao.maps.event.addListener(marker, 'mouseover', () => {
            isHovering = true;
            clearTimeout(hoverTimeout);
            
            // 약간의 딜레이 후 인포윈도우 오픈 (깜빡임 방지)
            hoverTimeout = setTimeout(() => {
              if (isHovering) {
                infowindow.open(map, marker);
              }
            }, 150);
          });

          window.kakao.maps.event.addListener(marker, 'mouseout', () => {
            isHovering = false;
            clearTimeout(hoverTimeout);
            
            // 딜레이 후 닫기 (마우스가 인포윈도우로 이동할 시간 확보)
            hoverTimeout = setTimeout(() => {
              if (!isHovering) {
                infowindow.close();
              }
            }, 300);
          });

          bounds.extend(position);
        });

        // 모든 마커가 보이도록 지도 범위 조정
        if (stadiums.length > 0) {
          setTimeout(() => {
            map.setBounds(bounds);
          }, 100);
        }

        console.log('✅ 지도 초기화 완료');
      } catch (err) {
        console.error('❌ 지도 초기화 실패:', err);
        onMapError?.();
      }
    }
  }, [stadiums, onStadiumClick, onMapError]);

  return (
    <div 
      ref={mapContainer} 
      style={{ width: '100%', height, minHeight: '300px' }} 
      className={`rounded-lg overflow-hidden shadow-lg ${className}`}
    />
  );
};

export default React.memo(KakaoMultiMap);