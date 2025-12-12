import React from 'react';
import { Link } from 'react-router-dom';

interface Stadium {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  teamId: number;
  teamName: string;
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stadium.imageUrls.slice(0, 4).map((imageUrl, index) => (
                <div key={index} className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <img 
                    src={imageUrl} 
                    alt={`${stadium.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder-stadium.jpg';
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 기본 정보 */}
        <div className="p-6 space-y-6">
          {/* 주소 */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
              <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              주소
            </h3>
            <p className="text-gray-700">{stadium.address}</p>
          </div>

          {/* 연락처 */}
          {stadium.contactNumber && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                연락처
              </h3>
              <p className="text-gray-700">{stadium.contactNumber}</p>
            </div>
          )}

          {/* 이용 요금 */}
          {stadium.hourlyRate && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                시간당 이용료
              </h3>
              <p className="text-gray-700">{stadium.hourlyRate.toLocaleString()}원</p>
            </div>
          )}

          {/* 시설 */}
          {stadium.facilities && stadium.facilities.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                시설
              </h3>
              <div className="flex flex-wrap gap-2">
                {stadium.facilities.map((facility, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                  >
                    {facility}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 팀 연락처 */}
          {(stadium.teamContactPhone || stadium.teamKakaoId) && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.477 8-10 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.477-8 10-8s10 3.582 10 8z" />
                </svg>
                팀 연락처
              </h3>
              <div className="flex flex-wrap gap-3">
                {stadium.teamContactPhone && (
                  <a
                    href={`tel:${stadium.teamContactPhone}`}
                    className="flex items-center px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {stadium.teamContactPhone}
                  </a>
                )}
                {stadium.teamKakaoId && (
                  <a
                    href={`https://open.kakao.com/me/${stadium.teamKakaoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors text-sm font-medium"
                  >
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z"/>
                    </svg>
                    카카오톡: {stadium.teamKakaoId}
                  </a>
                )}
              </div>
            </div>
          )}

          {/* 액션 버튼들 */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
            <Link
              to={`/${stadium.teamName.toLowerCase().replace(/\s+/g, '-')}`}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-center"
              onClick={onClose}
            >
              {stadium.teamName} 팀 페이지 보기
            </Link>
            <button
              onClick={() => {
                window.open(
                  `https://map.kakao.com/link/to/${stadium.name},${stadium.latitude},${stadium.longitude}`,
                  '_blank'
                );
              }}
              className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-center"
            >
              길찾기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StadiumDetailModal;