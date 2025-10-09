import React, { useState, useEffect } from 'react';
import { useTeam } from '../contexts/TeamContext';
import PlayerCard from '../components/player/PlayerCard';
import { useParallelHomeData } from '../hooks/useParallelHomeData';
import { GRADIENT_OPTIONS } from '../types/hero';
import PlayerCardSkeleton from '../components/ui/PlayerCardSkeleton';
import HeroSectionSkeleton from '../components/ui/HeroSectionSkeleton';

const Home: React.FC = React.memo(() => {
  const { currentTeam, isLoading: teamLoading } = useTeam();

  // 팀이 로드된 후에만 데이터를 로드
  const teamId = currentTeam?.id ? Number(currentTeam.id) : null;
  const { players, heroSlides, isLoading: dataLoading } = useParallelHomeData(teamId);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  const mainPlayers = players.filter(player => player.isActive).slice(0, 11);

  // 로딩 상태: 데이터가 하나도 없을 때만 스켈레톤 표시
  const hasData = players.length > 0 || heroSlides.length > 0;
  const isLoading = (teamLoading && !hasData) || (currentTeam && dataLoading && !hasData);

  // 슬라이드가 없을 때 기본 슬라이드
  const defaultSlides = [
    {
      id: 0,
      title: currentTeam?.name || 'Football Club',
      subtitle: currentTeam?.description || '우리들의 축구 클럽',
      gradientColor: 'slate' as const,
      backgroundImage: undefined,
      isActive: true,
      sortOrder: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  const currentSlides = heroSlides.length > 0 ? heroSlides : defaultSlides;

  // 첫 로드 애니메이션 트리거
  useEffect(() => {
    if (!isLoading && !hasAnimated) {
      const timer = setTimeout(() => {
        setHasAnimated(true);
      }, 500); // 이미지가 먼저 로드된 후 텍스트 애니메이션 시작
      return () => clearTimeout(timer);
    }
  }, [isLoading, hasAnimated]);

  // 자동 슬라이드
  useEffect(() => {
    if (currentSlides.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % currentSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [currentSlides.length]);

  const currentHero = currentSlides[currentSlide];
  const gradientClass = GRADIENT_OPTIONS[currentHero.gradientColor.toLowerCase() as keyof typeof GRADIENT_OPTIONS];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Section - 모바일 최적화 */}
      {isLoading ? (
        <HeroSectionSkeleton />
      ) : (
        <div className={`relative text-white overflow-hidden transition-all duration-1000 h-screen w-full`}>
        {/* 배경 이미지 또는 그라데이션 */}
        {currentHero.backgroundImage ? (
          <>
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 transition-transform duration-700"
              style={{ backgroundImage: `url(${currentHero.backgroundImage})` }}
            />
            <div className="absolute inset-0 bg-black opacity-30"></div>
          </>
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-r ${gradientClass}`}>
            <div className="absolute inset-0 bg-black opacity-15"></div>
          </div>
        )}

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex items-center justify-center h-full">
          <div className="text-center max-w-5xl mx-auto">
            <h1 className={`text-3xl sm:text-4xl md:text-5xl lg:text-7xl xl:text-8xl font-bold mb-4 sm:mb-6 lg:mb-8 leading-tight drop-shadow-lg transition-all duration-1000 ${
              hasAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              {currentHero.title}
            </h1>

            <p className={`text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl mb-8 sm:mb-10 lg:mb-12 leading-relaxed drop-shadow-md transition-all duration-1000 delay-300 ${
              hasAnimated ? 'opacity-95 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              {currentHero.subtitle}
            </p>

            {/* 슬라이드 인디케이터 - 모바일 최적화 (2개 이상일 때만 표시) */}
            {currentSlides.length > 1 && (
              <div className={`flex justify-center space-x-3 sm:space-x-4 transition-all duration-1000 delay-500 ${
                hasAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}>
                {currentSlides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 rounded-full transition-all duration-300 touch-manipulation ${
                      index === currentSlide ? 'bg-white scale-125' : 'bg-white bg-opacity-50'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
        </div>
      )}

      {/* 선수 수 간단 표시 - 모바일 최적화 */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 relative">
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center bg-white rounded-2xl p-4 sm:p-6 shadow-lg">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3 sm:mr-4">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900">{mainPlayers.length}명</div>
              <div className="text-sm sm:text-base text-gray-600">등록 선수</div>
            </div>
          </div>
        </div>

        {/* Main Squad - 모바일 최적화 */}
        <div className="text-center mb-10 sm:mb-12 lg:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4 sm:mb-6">
            주전 선수단
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-xl lg:max-w-2xl mx-auto leading-relaxed">
            우리 팀의 핵심 선수들을 소개합니다. 각자의 특별한 재능으로 팀의 승리를 이끌어갑니다.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 mb-12 sm:mb-16 lg:mb-20">
            {Array.from({ length: 10 }).map((_, index) => (
              <PlayerCardSkeleton key={index} />
            ))}
          </div>
        ) : mainPlayers.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 mb-12 sm:mb-16 lg:mb-20">
            {mainPlayers.map((player, index) => (
              <div
                key={player.id}
                className="transform hover:scale-105 transition-all duration-300"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: 'fadeInUp 0.6s ease-out forwards'
                }}
              >
                <PlayerCard
                  player={player}
                  showStats={false}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 sm:py-16 mb-12 sm:mb-16">
            <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">⚽</div>
            <div className="text-gray-400 text-lg sm:text-xl">등록된 선수가 없습니다</div>
            <div className="text-gray-500 text-sm sm:text-base mt-2">곧 새로운 선수들이 합류할 예정입니다</div>
          </div>
        )}

        {/* Quick Navigation - 모바일 최적화 */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 lg:p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 opacity-50"></div>
          <div className="relative z-10">
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">더 알아보기</h3>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 mb-6 sm:mb-8">우리 팀의 다양한 정보를 확인해보세요</p>

            <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:justify-center lg:gap-6">
              <a
                href="/players"
                className="bg-blue-600 text-white px-6 sm:px-8 lg:px-10 py-3 sm:py-4 rounded-lg sm:rounded-xl hover:bg-blue-700 transition-colors duration-300 text-sm sm:text-base lg:text-lg font-medium shadow-lg touch-manipulation"
              >
                전체 선수단
              </a>
              <a
                href="/matches"
                className="border-2 border-blue-600 text-blue-600 px-6 sm:px-8 lg:px-10 py-3 sm:py-4 rounded-lg sm:rounded-xl hover:bg-blue-50 transition-colors duration-300 text-sm sm:text-base lg:text-lg font-medium shadow-lg touch-manipulation"
              >
                경기 일정
              </a>
              <a
                href="/stadiums"
                className="bg-green-600 text-white px-6 sm:px-8 lg:px-10 py-3 sm:py-4 rounded-lg sm:rounded-xl hover:bg-green-700 transition-colors duration-300 text-sm sm:text-base lg:text-lg font-medium shadow-lg touch-manipulation"
              >
                구장 정보
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

Home.displayName = 'Home';

export default Home;
