// API 테스터 - 개발 환경에서만 사용
console.log('API 테스터가 로드되었습니다.');

// 글로벌 API 테스터 함수들을 window 객체에 추가
declare global {
  interface Window {
    testAPI?: {
      gallery: () => void;
      team: () => void;
    };
  }
}

if (typeof window !== 'undefined') {
  window.testAPI = {
    gallery: () => {
      console.log('갤러리 API 테스트 시작...');
      // 갤러리 API 테스트 로직
    },
    team: () => {
      console.log('팀 API 테스트 시작...');
      // 팀 API 테스트 로직
    }
  };
}

export {};