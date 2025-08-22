import React, { useState } from 'react';
import { Button, Card } from '../components/common';

const Landing: React.FC = () => {
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    teamName: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 문의 제출 로직 (실제로는 API 호출)
    alert('문의가 접수되었습니다. 빠른 시일 내에 연락드리겠습니다.');
    setContactForm({ name: '', email: '', teamName: '', message: '' });
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
    { name: '김철수 FC', domain: 'kim.football-club.local:3000', description: '서울 지역 축구 동호회' },
    { name: '박영희 유나이티드', domain: 'park.football-club.local:3000', description: '부산 지역 축구 동호회' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
      {/* 헤더 */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">⚽</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Football Club</h1>
            </div>
            <Button
              variant="primary"
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            >
              무료 체험하기
            </Button>
          </div>
        </div>
      </header>

      {/* 히어로 섹션 */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            축구 동호회를 위한<br />
            <span className="text-primary-600">올인원 관리 플랫폼</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            선수 관리부터 경기 일정, 구장 정보까지 한 곳에서 관리하세요.
            각 팀만의 전용 웹사이트를 제공합니다.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="primary"
              size="lg"
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            >
              무료로 시작하기
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
            >
              데모 보기
            </Button>
          </div>
        </div>
      </section>

      {/* 기능 소개 */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              축구 동호회에 필요한 모든 기능
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              복잡한 관리 업무를 간편하게, 팀원들과의 소통을 원활하게
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center p-6">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h4 className="text-xl font-semibold mb-2">{feature.title}</h4>
                <p className="text-gray-600">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 데모 섹션 */}
      <section id="demo" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              실제 동호회 사이트 체험해보기
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              아래 샘플 팀 사이트를 방문해서 실제 기능을 체험해보세요
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {sampleTeams.map((team, index) => (
              <Card key={index} className="p-6">
                <h4 className="text-xl font-semibold mb-2">{team.name}</h4>
                <p className="text-gray-600 mb-4">{team.description}</p>
                <Button
                  variant="primary"
                  onClick={() => window.open(`http://${team.domain}`, '_blank')}
                  className="w-full"
                >
                  {team.name} 사이트 방문하기
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 문의 섹션 */}
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              지금 바로 시작하세요
            </h3>
            <p className="text-gray-600">
              우리 팀만의 전용 사이트를 만들어보세요. 무료 체험 신청 후 즉시 이용 가능합니다.
            </p>
          </div>

          <Card className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    담당자 이름 *
                  </label>
                  <input
                    type="text"
                    required
                    value={contactForm.name}
                    onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="홍길동"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="team@example.com"
                  />
                </div>
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="우리 축구단"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  문의 내용
                </label>
                <textarea
                  rows={4}
                  value={contactForm.message}
                  onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="궁금한 점이나 요청사항을 자유롭게 작성해주세요."
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
              >
                무료 체험 신청하기
              </Button>
            </form>
          </Card>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">⚽</span>
            </div>
            <span className="text-xl font-bold">Football Club</span>
          </div>
          <p className="text-gray-400">
            
            축구 동호회를 위한 올인원 관리 플랫폼
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
