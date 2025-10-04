import React from 'react';
import AllTeamsCommunity from '../components/community/AllTeamsCommunity';

const AllCommunityPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 컨텐츠 */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">전체 팀 커뮤니티</h1>
          <p className="text-gray-600">모든 팀의 커뮤니티 게시글을 한 곳에서 확인하세요</p>
        </div>
        <AllTeamsCommunity />
      </main>
    </div>
  );
};

export default AllCommunityPage;