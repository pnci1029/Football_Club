import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTeam } from '../contexts/TeamContext';
import { useAuth } from '../contexts/AuthContext';
import PlayerCard from '../components/player/PlayerCard';
import { useParallelHomeData } from '../hooks/useParallelHomeData';
import { GRADIENT_OPTIONS } from '../types/hero';
import PlayerCardSkeleton from '../components/ui/PlayerCardSkeleton';
import HeroSectionSkeleton from '../components/ui/HeroSectionSkeleton';

const Home: React.FC = React.memo(() => {
  const { currentTeam, isLoading: teamLoading } = useTeam();
  const { admin, isAuthenticated } = useAuth();

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
            <h1 className={`text-2xl sm:text-3xl md:text-4xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 lg:mb-8 leading-tight drop-shadow-lg transition-all duration-1000 ${
              hasAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              {currentHero.title}
            </h1>

            <p className={`text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl mb-8 sm:mb-10 lg:mb-12 leading-relaxed drop-shadow-md transition-all duration-1000 delay-300 ${
              hasAnimated ? 'opacity-95 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              {currentHero.subtitle}
            </p>

            {/* 관리자 버튼 */}
            {isAuthenticated && admin && (
              <div className={`mb-8 sm:mb-10 transition-all duration-1000 delay-600 ${
                hasAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}>
                <Link
                  to="/admin/dashboard"
                  className="inline-flex items-center px-6 py-3 bg-white bg-opacity-20 hover:bg-opacity-30 text-white font-semibold rounded-lg backdrop-blur-sm border border-white border-opacity-30 hover:border-opacity-50 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  관리자 대시보드
                </Link>
              </div>
            )}

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
        <div className="text-center mb-8 sm:mb-10 lg:mb-12">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3 sm:mb-4">
            주전 선수단
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-lg lg:max-w-xl mx-auto leading-relaxed">
            우리 팀의 핵심 선수들을 소개합니다.
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
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-5 sm:p-6 lg:p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-50 to-accent-50 opacity-30"></div>
          <div className="relative z-10">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">더 알아보기</h3>
            <p className="text-sm lg:text-base text-gray-600 mb-4 sm:mb-6">우리 팀의 다양한 정보를 확인해보세요</p>

            <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:justify-center lg:gap-4">
              <a
                href="/players"
                className="bg-primary-600 text-white px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 rounded-lg hover:bg-primary-700 transition-colors duration-300 text-sm lg:text-base font-medium shadow-md touch-manipulation"
              >
                전체 선수단
              </a>
              <a
                href="/matches"
                className="border border-primary-600 text-primary-700 bg-white px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 rounded-lg hover:bg-primary-50 transition-colors duration-300 text-sm lg:text-base font-medium shadow-md touch-manipulation"
              >
                경기 일정
              </a>
              <a
                href="/stadiums"
                className="bg-accent-600 text-white px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 rounded-lg hover:bg-accent-700 transition-colors duration-300 text-sm lg:text-base font-medium shadow-md touch-manipulation"
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
