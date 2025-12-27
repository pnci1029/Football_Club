import React from 'react';
import { Teams } from '../../api';

interface Stadium {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  teamId: number;
  teamName: string;
  teamCode?: string | null;
  facilities?: string[] | null;
  hourlyRate?: number | null;
  contactNumber?: string | null;
  imageUrls?: string[] | null;
  // 팀 연락처 정보
  teamContactPhone?: string | null;
  teamKakaoId?: string | null;
}

interface StadiumDetailModalProps {
  stadium: Stadium | null;
  isOpen: boolean;
  onClose: () => void;
}

const StadiumDetailModal: React.FC<StadiumDetailModalProps> = ({
  stadium,
  isOpen,
  onClose
}) => {
  if (!isOpen || !stadium) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{stadium.name}</h2>
            <p className="text-blue-600 font-medium">{stadium.teamName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 이미지 */}
        {stadium.imageUrls && stadium.imageUrls.length > 0 && (
          <div className="px-6 pt-4">
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
              <img 
                src={stadium.imageUrls[0]} 
                alt={stadium.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder-stadium.jpg';
                }}
              />
            </div>
          </div>
        )}

        {/* 기본 정보 */}
        <div className="p-6 space-y-4">
          {/* 주소 */}
          <div>
            <h3 className="font-medium text-gray-900 mb-2 flex items-center text-sm">
              <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              주소
            </h3>
            <p className="text-gray-600 text-sm">{stadium.address}</p>
          </div>

          {/* 연락처 */}
          {stadium.contactNumber && (
            <div>
              <h3 className="font-medium text-gray-900 mb-2 flex items-center text-sm">
                <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                연락처
              </h3>
              <p className="text-gray-600 text-sm">{stadium.contactNumber}</p>
            </div>
          )}

          {/* 핵심 정보 */}
          <div className="grid grid-cols-2 gap-4">
            {stadium.hourlyRate && (
              <div className="bg-primary-50 rounded-lg p-3">
                <div className="text-sm text-primary-600 font-medium mb-1">시간당 요금</div>
                <div className="text-lg font-bold text-primary-900">{stadium.hourlyRate.toLocaleString()}원</div>
              </div>
            )}
            
            {stadium.facilities && stadium.facilities.length > 0 && (
              <div className="bg-accent-50 rounded-lg p-3">
                <div className="text-sm text-accent-600 font-medium mb-1">주요 시설</div>
                <div className="text-sm text-accent-900">{stadium.facilities.slice(0, 2).join(', ')}{stadium.facilities.length > 2 ? ` 외 ${stadium.facilities.length - 2}개` : ''}</div>
              </div>
            )}
          </div>

          {/* 팀 연락처 */}
          {(stadium.teamContactPhone || stadium.teamKakaoId) && (
            <div>
              <h3 className="font-medium text-gray-900 mb-2 text-sm">팀 연락처</h3>
              <div className="flex flex-wrap gap-2">
                {stadium.teamContactPhone && (
                  <a
                    href={`tel:${stadium.teamContactPhone}`}
                    className="flex items-center px-3 py-2 bg-accent-50 text-accent-700 rounded-lg hover:bg-accent-100 transition-colors text-sm"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    전화
                  </a>
                )}
                {stadium.teamKakaoId && (
                  <a
                    href={`https://open.kakao.com/me/${stadium.teamKakaoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center px-3 py-2 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors text-sm"
                  >
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z"/>
                    </svg>
                    카카오톡
                  </a>
                )}
              </div>
            </div>
          )}

          {/* 액션 버튼들 */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
            {stadium.teamCode ? (
              <button
                onClick={async () => {
                  if (!stadium.teamCode) {
                    alert('팀 코드가 없습니다.');
                    return;
                  }
                  
                  try {
                    // 팀 정보 API 호출로 유효성 확인
                    await Teams.public.getByCode(stadium.teamCode);
                    // 팀 페이지로 이동
                    window.location.href = `http://${stadium.teamCode.toLowerCase()}.localhost:3000`;
                    onClose();
                  } catch (error) {
                    alert('해당 팀의 페이지를 찾을 수 없습니다.');
                  }
                }}
                className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-center shadow-sm"
              >
                {stadium.teamName} 팀 페이지 보기
              </button>
            ) : (
              <button
                className="flex-1 bg-secondary-400 text-white px-4 py-2 rounded-lg cursor-not-allowed text-center shadow-sm"
                disabled
              >
                팀 페이지 준비중
              </button>
            )}
            <button
              onClick={() => {
                // 구장 정보 페이지로 이동 (localhost:3000/stadiums에서 해당 구장 정보)
                window.location.href = `/stadiums?stadium=${stadium.id}`;
                onClose();
              }}
              className="flex-1 border border-secondary-300 text-secondary-700 bg-white px-4 py-2 rounded-lg hover:bg-secondary-50 transition-colors text-center shadow-sm"
            >
              구장 상세보기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StadiumDetailModal;