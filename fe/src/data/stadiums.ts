export interface Stadium {
  id: number;
  name: string;
  address: string;
  capacity?: number;
  surface: 'natural' | 'artificial';
  facilities: string[];
  pricePerHour?: number;
  availableHours: {
    start: string;
    end: string;
  };
  contact?: {
    phone: string;
    email?: string;
  };
  images: string[];
  coordinates?: {
    lat: number;
    lng: number;
  };
  description: string;
}

export const dummyStadiums: Stadium[] = [
  {
    id: 1,
    name: '서울월드컵경기장',
    address: '서울특별시 마포구 월드컵로 240',
    capacity: 66704,
    surface: 'natural',
    facilities: ['주차장', '샤워실', '락커룸', '의무실', '매점', 'WIFI'],
    pricePerHour: 150000,
    availableHours: {
      start: '06:00',
      end: '22:00'
    },
    contact: {
      phone: '02-2128-2002',
      email: 'info@worldcuppark.co.kr'
    },
    images: [
      'https://images.unsplash.com/photo-1459865264687-595d652de67e?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=800&h=600&fit=crop'
    ],
    coordinates: {
      lat: 37.5683,
      lng: 126.8971
    },
    description: '2002 FIFA 월드컵의 무대였던 서울월드컵경기장으로, 최고급 천연잔디와 완벽한 시설을 자랑합니다.'
  },
  {
    id: 2,
    name: '잠실종합운동장 보조경기장',
    address: '서울특별시 송파구 올림픽로 25',
    capacity: 3000,
    surface: 'natural',
    facilities: ['주차장', '샤워실', '락커룸', '의무실'],
    pricePerHour: 80000,
    availableHours: {
      start: '07:00',
      end: '21:00'
    },
    contact: {
      phone: '02-2240-8800'
    },
    images: [
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop'
    ],
    coordinates: {
      lat: 37.5142,
      lng: 127.0719
    },
    description: '1986 아시안게임과 1988 서울올림픽의 역사가 살아 숨쉬는 경기장입니다.'
  },
  {
    id: 3,
    name: '상암 DMC 스타디움',
    address: '서울특별시 마포구 상암동 1602',
    surface: 'artificial',
    facilities: ['주차장', '샤워실', '조명시설', '매점'],
    pricePerHour: 60000,
    availableHours: {
      start: '06:00',
      end: '23:00'
    },
    contact: {
      phone: '02-300-5000'
    },
    images: [
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&h=600&fit=crop'
    ],
    coordinates: {
      lat: 37.5778,
      lng: 126.8967
    },
    description: '최신 인조잔디와 우수한 조명시설을 갖춘 현대적인 축구장입니다.'
  },
  {
    id: 4,
    name: '한강공원 축구장',
    address: '서울특별시 영등포구 여의도동 한강공원 내',
    surface: 'natural',
    facilities: ['주차장', '샤워실', '자연경관'],
    pricePerHour: 40000,
    availableHours: {
      start: '08:00',
      end: '18:00'
    },
    contact: {
      phone: '02-3780-0561'
    },
    images: [
      'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=800&h=600&fit=crop'
    ],
    coordinates: {
      lat: 37.5219,
      lng: 126.9317
    },
    description: '한강의 아름다운 자연경관을 배경으로 축구를 즐길 수 있는 특별한 공간입니다.'
  },
  {
    id: 5,
    name: '올림픽공원 체육관 축구장',
    address: '서울특별시 송파구 방이동 88-3',
    capacity: 5000,
    surface: 'artificial',
    facilities: ['주차장', '샤워실', '락커룸', '의무실', '매점', '관중석'],
    pricePerHour: 90000,
    availableHours: {
      start: '06:30',
      end: '22:00'
    },
    contact: {
      phone: '02-410-1114',
      email: 'sports@kspo.or.kr'
    },
    images: [
      'https://images.unsplash.com/photo-1589952283406-b53fe7b99b56?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1564121876740-6bb08a6f9e13?w=800&h=600&fit=crop'
    ],
    coordinates: {
      lat: 37.5194,
      lng: 127.1241
    },
    description: '올림픽의 정신이 깃든 곳에서 최고 수준의 축구 경기를 경험하세요.'
  },
  {
    id: 6,
    name: '은평구민체육센터',
    address: '서울특별시 은평구 진관동 192-12',
    surface: 'artificial',
    facilities: ['주차장', '샤워실', '락커룸', '카페테리아'],
    pricePerHour: 35000,
    availableHours: {
      start: '09:00',
      end: '21:00'
    },
    contact: {
      phone: '02-351-3451'
    },
    images: [
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop'
    ],
    coordinates: {
      lat: 37.6350,
      lng: 126.9239
    },
    description: '지역 주민들을 위한 깨끗하고 현대적인 시설의 축구장입니다.'
  }
];