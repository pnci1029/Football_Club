import React from 'react';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-primary-500 rounded-full mb-6">
              <span className="text-4xl">⚽</span>
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Football Club
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            열정과 실력으로 무장한 최고의 축구 클럽
          </p>
        </div>

        {/* Team Motto */}
        <div className="bg-white rounded-2xl shadow-soft p-8 md:p-12 mb-16">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-600 mb-6">
              "하나된 마음, 끝없는 도전"
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed max-w-4xl mx-auto">
              우리는 단순히 축구를 하는 팀이 아닙니다. 서로를 믿고, 함께 땀 흘리며, 
              승리를 위해 하나가 되는 진정한 가족입니다. 매 경기마다 최선을 다하고, 
              팬들에게 감동을 선사하며, 축구의 아름다움을 보여주는 것이 우리의 사명입니다.
            </p>
          </div>
        </div>

        {/* Team Introduction */}
        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div className="bg-white rounded-xl shadow-card p-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mr-4">
                <span className="text-2xl">🏆</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">우리의 목표</h3>
            </div>
            <p className="text-gray-600 leading-relaxed">
              끊임없는 노력과 팀워크를 바탕으로 리그 우승을 목표로 합니다. 
              개인의 실력 향상과 팀 전술의 완성도를 높여 팬들이 자랑스러워할 수 있는 
              클럽으로 성장하겠습니다.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-card p-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <span className="text-2xl">💪</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">우리의 철학</h3>
            </div>
            <p className="text-gray-600 leading-relaxed">
              공정한 경기, 상대에 대한 존중, 그리고 끝까지 포기하지 않는 정신을 
              바탕으로 합니다. 승부를 떠나 축구를 사랑하는 모든 이들에게 
              감동을 주는 경기를 펼치겠습니다.
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="bg-primary-600 rounded-xl p-8 md:p-12 text-white">
            <h3 className="text-3xl font-bold mb-4">함께 만들어가는 승리의 역사</h3>
            <p className="text-xl mb-6 opacity-90">
              우리의 여정을 응원해주시고, 함께 꿈을 키워나가세요
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="bg-white bg-opacity-20 rounded-lg px-6 py-3">
                <div className="text-2xl font-bold">25+</div>
                <div className="text-sm opacity-80">선수단</div>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg px-6 py-3">
                <div className="text-2xl font-bold">15</div>
                <div className="text-sm opacity-80">시즌 경기</div>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg px-6 py-3">
                <div className="text-2xl font-bold">100%</div>
                <div className="text-sm opacity-80">열정</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;