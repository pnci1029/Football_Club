# 카카오맵 컴포넌트 문제 해결 기록

## 문제 상황
- 로컬에서는 간헐적으로 "❌ mapContainer가 없음" 오류 발생
- 배포 서버에서는 항상 "❌ mapContainer가 없음" 오류 발생
- KakaoMap.tsx는 정상 동작하지만 KakaoMultiMap.tsx에서만 문제 발생

## 시도한 해결 방법들

### 1. useLayoutEffect 적용
**시도 내용**: `useEffect` → `useLayoutEffect`로 변경
**목적**: DOM 렌더링 후 동기적 실행 보장
**결과**: 실패 - 같은 오류 지속

### 2. 재시도 로직 추가
**시도 내용**: mapContainer.current가 없을 때 setTimeout으로 재시도
**목적**: DOM 생성 대기
**결과**: 실패 - 이전에 시도했으나 동작하지 않음

### 3. React key 전략 변경 (실패)
**시도 내용**: 고정 key를 동적 key로 변경
```tsx
// 변경 후  
key={`kakao-multi-map-${filteredStadiums.length}-${filteredStadiums.map(s => s.id).join('-')}`}
```
**목적**: 데이터 변경 시 컴포넌트 완전 재마운트
**결과**: 실패 - 로컬에서도 동작 불안정

### 4. 재시도 로직 개선 (최종 해결)
**문제 원인**:
- useLayoutEffect가 실행되는 시점에 mapContainer.current가 아직 null
- DOM 렌더링과 ref 할당 사이의 미세한 타이밍 차이

**해결 방법**:
```tsx
useLayoutEffect(() => {
  const initMap = () => {
    // DOM이 준비되지 않았다면 재시도
    if (!mapContainer.current) {
      console.log('⏳ mapContainer 준비 대기 중...');
      setTimeout(initMap, 10);  // 10ms 후 재시도
      return;
    }
    // 기존 초기화 로직...
  };
  
  // 즉시 초기화 시도
  initMap();
}, [stadiums, onStadiumClick, onMapError]);
```

**핵심 개선사항**:
1. **재귀적 재시도**: mapContainer가 없으면 10ms 후 재시도
2. **즉시 시작**: useLayoutEffect 내에서 바로 initMap() 호출
3. **에러 처리**: try-catch로 지도 초기화 실패 처리
4. **상세 로깅**: 각 단계별 상태 확인

## 로컬 vs 배포 환경 차이점

### 로컬 환경
- 개발 모드: React 렌더링 느림
- 네트워크 지연 적음
- 간헐적 문제 발생

### 배포 환경
- 프로덕션 모드: React 렌더링 빠름, 압축/최적화
- 카카오맵 스크립트 로드 지연
- 항상 문제 발생

### HTML 스크립트 로딩
```html
<!-- public/index.html (로컬) -->
<script src="//dapi.kakao.com/v2/maps/sdk.js?appkey=%REACT_APP_KAKAO_MAP_KEY%&autoload=false" async></script>

<!-- build/index.html (배포) -->  
<script src="//dapi.kakao.com/v2/maps/sdk.js?appkey=92f998e051835092a83ac25a2c56a3a3"></script>
```

## KakaoMap vs KakaoMultiMap 차이점

### KakaoMap.tsx (정상 동작)
- 단일 좌표 표시
- 개별 페이지에서 단독 사용
- 간단한 렌더링 사이클

### KakaoMultiMap.tsx (문제 발생)
- 다중 마커 표시  
- TeamMapSection에서 다른 컴포넌트와 함께 사용
- 복잡한 렌더링 사이클 (로딩 → API 호출 → 데이터 로드 → 컴포넌트 마운트)

## 권장 사항

1. **복잡한 맵 컴포넌트**: 데이터 변경 시 React key 변경으로 완전 재마운트
2. **단순한 맵 컴포넌트**: useLayoutEffect 또는 useEffect 사용 가능
3. **카카오맵 스크립트**: `autoload=false` 설정하고 `window.kakao.maps.load()` 사용
4. **DOM 참조**: mapContainer.current 존재 여부 반드시 확인

### 5. async/await DOM 대기 (실패)
**시도 내용**: async/await로 mapContainer 준비를 2초간 대기
```tsx
const waitForContainer = async () => {
  let attempts = 0;
  while (attempts < 200 && !mapContainer.current && mounted) {
    await new Promise(resolve => setTimeout(resolve, 5));
    attempts++;
  }
  // 이후 로직...
};
```
**목적**: 더 안정적인 DOM 준비 대기
**결과**: 실패 - 여전히 "❌ mapContainer 준비 실패 (2초 대기 후)" 오류

## 근본 원인 분석

문제의 핵심은 React의 렌더링 사이클과 ref 할당 타이밍이 아니라, **컴포넌트 자체가 조건부 렌더링**되고 있기 때문인 것으로 추정됩니다.

### TeamMapSection 구조 분석
```tsx
{filteredStadiums.length > 0 ? (
  <KakaoMultiMap 
    stadiums={filteredStadiums}
    // ...
  />
) : (
  // 빈 상태 UI
)}
```

**문제점**:
1. `filteredStadiums`가 빈 배열에서 데이터가 채워질 때 컴포넌트가 마운트됨
2. 이때 React는 컴포넌트를 생성하지만, ref는 아직 할당되지 않은 상태
3. useEffect가 실행되는 시점에 DOM 요소가 실제로 렌더링되지 않았음

### 6. document.getElementById 방식 (실패)
**시도 내용**: React ref 대신 고유 ID와 document.getElementById 사용
```tsx
const mapId = useRef(`kakao-map-${Date.now()}-${Math.random()}`).current;

useEffect(() => {
  const initMap = async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const mapContainer = document.getElementById(mapId);
    // 지도 초기화...
  };
  initMap();
}, [stadiums, mapId]);

// JSX
<div id={mapId} style={{ width: '100%', height }} />
```
**목적**: React의 ref 시스템을 우회하여 직접 DOM 조작
**결과**: 실패 - "❌ mapContainer를 찾을 수 없음" 지속

### 7. MutationObserver 방식 (실패)
**시도 내용**: DOM 변화를 실시간 감지하여 요소 발견
```tsx
const observer = new MutationObserver(() => {
  const mapContainer = document.getElementById(mapId);
  if (mapContainer) {
    observer.disconnect();
    initializeMap(mapContainer);
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});
```
**목적**: DOM 요소가 실제로 추가되는 순간을 정확히 포착
**결과**: 실패 - 5초 타임아웃으로 요소를 찾지 못함

### 8. Ref Callback 방식 (실패)
**시도 내용**: React ref callback으로 DOM 마운트 순간 캐치
```tsx
const [mapContainer, setMapContainer] = useState<HTMLElement | null>(null);

const mapRefCallback = useCallback((node: HTMLDivElement | null) => {
  if (node) {
    setMapContainer(node);
  }
}, [stadiums.length]);

// JSX
<div ref={mapRefCallback} style={{ width: '100%', height }} />
```
**목적**: DOM 요소 마운트 순간을 정확히 감지
**결과**: 실패 - ref callback이 호출되지 않음

### 9. KakaoMap 패턴 복사 (최종 해결)
**핵심 발견**: 정상 작동하는 KakaoMap.tsx와의 차이점 분석
- KakaoMap: 단순한 `useRef + useEffect` 패턴
- KakaoMultiMap: 복잡한 state 관리와 조건부 렌더링

**시도 내용**: KakaoMap과 동일한 패턴으로 단순화
```tsx
const mapContainer = useRef<HTMLDivElement>(null);

useEffect(() => {
  if (!window.kakao || !mapContainer.current || stadiums.length === 0) {
    return;
  }

  // 카카오맵 API가 로드되었는지 확인
  if (window.kakao.maps && window.kakao.maps.Map) {
    initializeMap();
  } else {
    window.kakao.maps?.load(initializeMap);
  }

  function initializeMap() {
    if (!mapContainer.current) return;
    
    const map = new window.kakao.maps.Map(mapContainer.current, mapOption);
    
    // 지도 크기 재조정 (중요!)
    setTimeout(() => {
      map.relayout();
      map.setCenter(center);
    }, 100);
    
    // 마커 생성...
  }
}, [stadiums, onStadiumClick, onMapError]);

return (
  <div 
    ref={mapContainer} 
    style={{ width: '100%', height, minHeight: '300px' }} 
    className={`rounded-lg overflow-hidden shadow-lg ${className}`}
  />
);
```
**목적**: 정상 작동하는 KakaoMap과 동일한 패턴 적용
**결과**: 성공 ✅ - 단순한 패턴으로 문제 해결

## 최종 해결책 분석

**핵심 문제점**: 과도한 복잡성과 조건부 렌더링
- **Loading/Error state 관리**: useState로 상태를 복잡하게 관리
- **조건부 렌더링**: `filteredStadiums.length > 0` 조건으로 컴포넌트 동적 마운트
- **복잡한 DOM 접근**: callback ref, MutationObserver 등 과도한 해결책 시도

**해결 원리**:
1. **단순한 패턴**: 정상 작동하는 KakaoMap과 동일한 `useRef + useEffect` 패턴
2. **조건부 로직 제거**: loading/error state 없이 단순한 early return
3. **직접 DOM 접근**: `mapContainer.current` 바로 사용
4. **KakaoMap 방식 복사**: 검증된 패턴을 그대로 적용

## 실패한 모든 방법들 요약

1. **useLayoutEffect 적용** (실패) - 동기적 실행으로도 해결 안됨
2. **재시도 로직 추가** (실패) - setTimeout 재시도로도 해결 안됨
3. **React key 전략 변경** (실패) - 컴포넌트 재마운트로도 해결 안됨
4. **재시도 로직 개선** (실패) - 더 긴 재시도로도 해결 안됨
5. **async/await DOM 대기** (실패) - 2초 대기로도 해결 안됨
6. **document.getElementById 방식** (실패) - DOM ID로도 해결 안됨
7. **MutationObserver 방식** (실패) - 실시간 DOM 감지로도 해결 안됨
8. **Ref Callback 방식** (실패) - React callback ref로도 해결 안됨
9. **KakaoMap 패턴 복사** (✅ **성공**) - 단순한 기존 패턴 적용

## 교훈

React에서 외부 라이브러리(카카오맵) 사용 시:
- **복잡한 해결책보다 검증된 단순한 패턴**이 더 효과적
- **정상 작동하는 기존 코드를 참고**하여 동일한 패턴 적용
- **과도한 state 관리와 조건부 렌더링** 피하기
- **loading/error state는 필요할 때만** 추가
- **DOM 생명주기**와 **React 렌더링 사이클** 불일치 주의
- **개발/배포 환경 차이**로 인한 타이밍 이슈 대비

## 최종 권장 패턴

```tsx
// ✅ 권장: 단순한 KakaoMap 패턴
const mapContainer = useRef<HTMLDivElement>(null);

useEffect(() => {
  if (!window.kakao || !mapContainer.current || data.length === 0) {
    return;
  }
  
  if (window.kakao.maps && window.kakao.maps.Map) {
    initializeMap();
  } else {
    window.kakao.maps?.load(initializeMap);
  }
  
  function initializeMap() {
    if (!mapContainer.current) return;
    // 지도 초기화...
  }
}, [data]);

return <div ref={mapContainer} style={{...}} />;
```

```tsx
// ❌ 비권장: 복잡한 state 관리
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState(null);
const [mapContainer, setMapContainer] = useState(null);

// 조건부 렌더링
if (isLoading) return <Loading />;
if (error) return <Error />;
return data.length > 0 ? <Map /> : <Empty />;
```