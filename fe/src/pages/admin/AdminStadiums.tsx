import React, { useState } from 'react';
import { Button, Card } from '../../components/common';

interface Stadium {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  hourlyRate: number;
  contactNumber?: string;
  facilities: string[];
  availableHours: string;
  imageUrls: string[];
}

const AdminStadiums: React.FC = () => {
  const [stadiums] = useState<Stadium[]>([
    {
      id: 1,
      name: '서울 월드컵 스타디움',
      address: '서울특별시 마포구 성산동',
      latitude: 37.5682,
      longitude: 126.8971,
      hourlyRate: 150000,
      contactNumber: '02-2128-2002',
      facilities: ['주차장', '샤워실', '조명', 'CCTV'],
      availableHours: '06:00-22:00',
      imageUrls: []
    },
    {
      id: 2,
      name: '부산 아시아드 주경기장',
      address: '부산광역시 연제구 거제동',
      latitude: 35.1904,
      longitude: 129.0608,
      hourlyRate: 120000,
      contactNumber: '051-500-2114',
      facilities: ['주차장', '샤워실', '조명'],
      availableHours: '07:00-21:00',
      imageUrls: []
    },
    {
      id: 3,
      name: '인천 문학경기장',
      address: '인천광역시 남구 문학동',
      latitude: 37.4369,
      longitude: 126.6934,
      hourlyRate: 100000,
      contactNumber: '032-880-4800',
      facilities: ['주차장', '조명'],
      availableHours: '08:00-20:00',
      imageUrls: []
    }
  ]);

  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredStadiums = stadiums.filter(stadium =>
    stadium.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stadium.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount) + '원';
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">구장 관리</h1>
          <p className="text-gray-600 mt-2">등록된 구장들을 관리합니다</p>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700">
          <span className="mr-2">➕</span>
          구장 추가
        </Button>
      </div>

      {/* 검색 */}
      <Card>
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="구장명 또는 주소로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>
      </Card>

      {/* 구장 목록 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredStadiums.map((stadium) => (
          <Card key={stadium.id} className="hover:shadow-lg transition-shadow duration-200">
            <div className="mb-4">
              <div className="w-full h-32 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg mb-4 flex items-center justify-center">
                {stadium.imageUrls.length > 0 ? (
                  <img 
                    src={stadium.imageUrls[0]}
                    alt={`${stadium.name}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <span className="text-white text-4xl">🏟️</span>
                )}
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 mb-2">{stadium.name}</h3>
              <p className="text-gray-600 text-sm mb-3">{stadium.address}</p>
            </div>

            {/* 구장 정보 */}
            <div className="space-y-3 mb-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">시간당 요금:</span>
                <span className="font-medium text-gray-900">{formatCurrency(stadium.hourlyRate)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">이용 시간:</span>
                <span className="font-medium text-gray-900">{stadium.availableHours}</span>
              </div>
              {stadium.contactNumber && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">연락처:</span>
                  <span className="font-medium text-gray-900">{stadium.contactNumber}</span>
                </div>
              )}
            </div>

            {/* 시설 */}
            <div className="mb-4">
              <span className="text-sm text-gray-600 block mb-2">시설:</span>
              <div className="flex flex-wrap gap-1">
                {stadium.facilities.map((facility, index) => (
                  <span 
                    key={index}
                    className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs"
                  >
                    {facility}
                  </span>
                ))}
              </div>
            </div>

            {/* 액션 버튼 */}
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="flex-1 text-purple-600 border-purple-200 hover:bg-purple-50"
              >
                <span className="mr-1">📍</span>
                지도 보기
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="flex-1 text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                <span className="mr-1">✏️</span>
                수정
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                🗑️
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {filteredStadiums.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🏟️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">구장이 없습니다</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? '검색 조건에 맞는 구장이 없습니다.' : '등록된 구장이 없습니다.'}
            </p>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <span className="mr-2">➕</span>
              첫 번째 구장 추가하기
            </Button>
          </div>
        </Card>
      )}

      {/* 하단 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{stadiums.length}</div>
            <div className="text-sm text-gray-600">총 구장 수</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(Math.round(stadiums.reduce((total, stadium) => total + stadium.hourlyRate, 0) / stadiums.length) || 0)}
            </div>
            <div className="text-sm text-gray-600">평균 시간당 요금</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {stadiums.filter(s => s.facilities.includes('주차장')).length}
            </div>
            <div className="text-sm text-gray-600">주차장 보유</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {stadiums.filter(s => s.facilities.includes('조명')).length}
            </div>
            <div className="text-sm text-gray-600">조명 시설</div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminStadiums;