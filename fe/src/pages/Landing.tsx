import React, { useState } from 'react';
import { Button, Card } from '../components/common';
import { inquiryService, CreateInquiryRequest } from '../services/inquiryService';
import { getTeamUrl } from '../utils/config';

const Landing: React.FC = () => {
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    teamName: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      // 연락처 유효성 검사
      const phoneRegex = /^[0-9]{11}$/;
      if (!phoneRegex.test(contactForm.phone)) {
        throw new Error('연락처는 11자리 숫자만 입력 가능합니다.');
      }

      const request: CreateInquiryRequest = {
        name: contactForm.name,
        email: contactForm.email,
        phone: contactForm.phone,
        teamName: contactForm.teamName,
        message: contactForm.message || undefined
      };

      const response = await inquiryService.createInquiry(request);

      if (response.success) {
        setSubmitMessage({
          type: 'success',
          text: response.message || '문의가 접수되었습니다. 빠른 시일 내에 연락드리겠습니다.'
        });
        setContactForm({ name: '', email: '', phone: '', teamName: '', message: '' });
      } else {
        throw new Error(response.error?.message || '문의 접수에 실패했습니다.');
      }
    } catch (error: unknown) {
      setSubmitMessage({
        type: 'error',
        text: error instanceof Error ? error.message : '문의 접수 중 오류가 발생했습니다. 다시 시도해주세요.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const features = [
    {
      icon: '⚽',
      title: '선수 관리',
      description: '팀 선수들의 정보와 통계를 체계적으로 관리하세요'
    },
    {
      icon: '🏟️',
      title: '구장 정보',
      description: '자주 이용하는 구장 정보를 저장하고 공유하세요'
    },
    {
      icon: '📅',
      title: '경기 일정',
      description: '팀의 경기 일정을 관리하고 결과를 기록하세요'
    },
    {
      icon: '📊',
      title: '통계 분석',
      description: '선수와 팀의 성과를 데이터로 분석해보세요'
    }
  ];

  const sampleTeams = [
    { name: '김철수 FC', teamCode: 'kim', description: '서울 지역 축구 동호회' },
    { name: '박영희 유나이티드', teamCode: 'park', description: '부산 지역 축구 동호회' }
  ];
  console.log(sampleTeams.toString())

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
      {/* 헤더 - 모바일 최적화 */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm sm:text-lg">⚽</span>
              </div>
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900">Football Club</h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button
                variant="outline"
                size="sm"
                className="text-sm px-3 py-2 sm:px-4 sm:py-2 sm:text-base"
                onClick={() => window.location.href = '/community'}
              >
                커뮤니티
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="text-sm px-3 py-2 sm:px-4 sm:py-2 sm:text-base"
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
              >
                무료 체험
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 히어로 섹션 - 모바일 최적화 */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
            축구 동호회를 위한<br />
            <span className="text-primary-600">올인원 관리 플랫폼</span>
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 max-w-2xl lg:max-w-3xl mx-auto leading-relaxed">
            선수 관리부터 경기 일정, 구장 정보까지 한 곳에서 관리하세요.<br className="hidden sm:block" />
            각 팀만의 전용 웹사이트를 제공합니다.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-md sm:max-w-none mx-auto">
            <Button
              variant="primary"
              size="lg"
              className="w-full sm:w-auto text-base sm:text-lg py-3 sm:py-4 px-6 sm:px-8"
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            >
              무료로 시작하기
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto text-base sm:text-lg py-3 sm:py-4 px-6 sm:px-8"
              onClick={() => window.location.href = '/community'}
            >
              데모 보기
            </Button>
          </div>
        </div>
      </section>

      {/* 기능 소개 - 모바일 최적화 */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
              축구 동호회에 필요한 모든 기능
            </h3>
            <p className="text-sm sm:text-base text-gray-600 max-w-xl lg:max-w-2xl mx-auto">
              복잡한 관리 업무를 간편하게, 팀원들과의 소통을 원활하게
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center p-4 sm:p-6 hover:shadow-lg transition-shadow duration-300">
                <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">{feature.icon}</div>
                <h4 className="text-lg sm:text-xl font-semibold mb-2">{feature.title}</h4>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>


      {/* 샘플 팀 섹션 */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
              실제 동호회 사이트 체험해보기
            </h3>
            <p className="text-sm sm:text-base text-gray-600 max-w-xl lg:max-w-2xl mx-auto">
              아래 샘플 팀 사이트를 방문해서 실제 기능을 체험해보세요
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            {sampleTeams.map((team, index) => (
              <Card key={index} className="p-4 sm:p-6">
                <h4 className="text-lg sm:text-xl font-semibold mb-2">{team.name}</h4>
                <p className="text-sm sm:text-base text-gray-600 mb-4 leading-relaxed">{team.description}</p>
                <Button
                  variant="primary"
                  onClick={() => window.open(getTeamUrl(team.teamCode), '_blank')}
                  className="w-full py-3 text-sm sm:text-base"
                >
                  {team.name} 사이트 방문하기
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 문의 섹션 - 모바일 최적화 */}
      <section id="contact" className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
              지금 바로 시작하세요
            </h3>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              우리 팀만의 전용 사이트를 만들어보세요.<br className="sm:hidden" /> 무료 체험 신청 후 즉시 이용 가능합니다.
            </p>
          </div>

          <Card className="p-4 sm:p-6 lg:p-8">
            {submitMessage && (
              <div className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg text-sm sm:text-base ${
                submitMessage.type === 'success' 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {submitMessage.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    담당자 이름 *
                  </label>
                  <input
                    type="text"
                    required
                    value={contactForm.name}
                    onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 sm:px-4 py-3 sm:py-2 text-base sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="홍길동"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    이메일 *
                  </label>
                  <input
                    type="email"
                    required
                    value={contactForm.email}
                    onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 sm:px-4 py-3 sm:py-2 text-base sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="team@example.com"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    연락처 *
                  </label>
                  <input
                    type="tel"
                    required
                    value={contactForm.phone}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      if (value.length <= 11) {
                        setContactForm(prev => ({ ...prev, phone: value }));
                      }
                    }}
                    className="w-full px-3 sm:px-4 py-3 sm:py-2 text-base sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="01012345678"
                    maxLength={11}
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    팀 이름 *
                  </label>
                  <input
                    type="text"
                    required
                    value={contactForm.teamName}
                    onChange={(e) => setContactForm(prev => ({ ...prev, teamName: e.target.value }))}
                    className="w-full px-3 sm:px-4 py-3 sm:py-2 text-base sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="우리 축구단"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  문의 내용
                </label>
                <textarea
                  rows={4}
                  value={contactForm.message}
                  onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                  className="w-full px-3 sm:px-4 py-3 sm:py-2 text-base sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  placeholder="궁금한 점이나 요청사항을 자유롭게 작성해주세요."
                  disabled={isSubmitting}
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full py-4 sm:py-3 text-base sm:text-lg font-medium"
                disabled={isSubmitting}
              >
                {isSubmitting ? '신청 중...' : '무료 체험 신청하기'}
              </Button>
            </form>
          </Card>
        </div>
      </section>

      {/* 푸터 - 모바일 최적화 */}
      <footer className="bg-gray-900 text-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm sm:text-base">⚽</span>
            </div>
            <span className="text-lg sm:text-xl font-bold">Football Club</span>
          </div>
          <p className="text-sm sm:text-base text-gray-400">
            축구 동호회를 위한 올인원 관리 플랫폼
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
