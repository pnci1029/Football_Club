import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card } from '../../components/common';
import { adminTeamService, AdminTeam } from '../../services/adminTeamService';
import { adminService } from '../../services/adminService';
import { adminNoticeService } from '../../services/adminNoticeService';
import { Notice } from '../../types/interfaces/notice';
import { StadiumDto } from '../../types/interfaces/admin/index';
import TeamEditModal from '../../components/admin/TeamEditModal';
import StadiumCreateModal from '../../components/admin/StadiumCreateModal';
import StadiumEditModal from '../../components/admin/StadiumEditModal';
import ConfirmDeleteModal from '../../components/admin/ConfirmDeleteModal';
import { useToast } from '../../components/Toast';
import ConfirmModal from '../../components/ConfirmModal';
import AdminManagement from '../../components/admin/AdminManagement';

type TabKey = 'overview' | 'stadiums' | 'notices' | 'players' | 'admins';

const AdminTeamDetail: React.FC = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const { showToast, ToastContainer, success, error, warning } = useToast();
  
  const [team, setTeam] = useState<AdminTeam | null>(null);
  const [stadiums, setStadiums] = useState<StadiumDto[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateStadiumModal, setShowCreateStadiumModal] = useState(false);
  const [showEditStadiumModal, setShowEditStadiumModal] = useState(false);
  const [editingStadium, setEditingStadium] = useState<StadiumDto | null>(null);
  const [showDeleteStadiumModal, setShowDeleteStadiumModal] = useState(false);
  const [deletingStadium, setDeletingStadium] = useState<StadiumDto | null>(null);
  const [showDeleteNoticeModal, setShowDeleteNoticeModal] = useState(false);
  const [deletingNotice, setDeletingNotice] = useState<Notice | null>(null);
  const [noticeForm, setNoticeForm] = useState({
    title: '',
    content: '',
    authorName: '관리자',
    authorPassword: '',
    isGlobalVisible: false,
  });
  const [showNoticeForm, setShowNoticeForm] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [showEditNoticeForm, setShowEditNoticeForm] = useState(false);

  useEffect(() => {
    if (teamId) {
      loadTeamDetails();
      loadTeamStadiums();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamId]);

  useEffect(() => {
    if (teamId && activeTab === 'notices') {
      loadTeamNotices();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamId, activeTab]);

  const loadTeamDetails = async () => {
    try {
      setLoading(true);
      const response = await adminTeamService.getTeam(parseInt(teamId!));
      if (response.success) {
        setTeam(response.data);
      } else {
        console.error('Failed to load team details');
      }
    } catch (err) {
      console.error('Error loading team details:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadTeamStadiums = async () => {
    try {
      const response = await adminService.getStadiumsByTeam(parseInt(teamId!), 0, 100);
      setStadiums(response.content);
    } catch (err) {
      console.error('Error loading team stadiums:', error);
    }
  };

  const loadTeamNotices = async () => {
    try {
      const response = await adminNoticeService.getNoticesByTeamForAdmin(parseInt(teamId!), 0, 10);
      setNotices(response.content);
    } catch (err) {
      console.error('Error loading team notices:', error);
      setNotices([]); // 오류 시 빈 배열로 설정
    }
  };

  const handleEditTeam = () => {
    setShowEditModal(true);
  };

  const handleTeamUpdated = () => {
    loadTeamDetails();
  };

  const handleCreateStadium = () => {
    setShowCreateStadiumModal(true);
  };

  const handleStadiumCreated = () => {
    loadTeamStadiums();
  };

  const handleEditStadium = (stadium: StadiumDto) => {
    setEditingStadium(stadium);
    setShowEditStadiumModal(true);
  };

  const handleStadiumUpdated = () => {
    loadTeamStadiums();
  };

  const handleDeleteStadium = (stadium: StadiumDto) => {
    setDeletingStadium(stadium);
    setShowDeleteStadiumModal(true);
  };


  const handleViewPlayers = () => {
    navigate(`/admin/players?teamId=${teamId}`);
  };

  const handleNoticeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeForm.title.trim() || !noticeForm.content.trim() || !noticeForm.authorPassword) {
      warning('모든 필드를 입력해주세요.');
      return;
    }

    try {
      await adminNoticeService.createNotice({
        title: noticeForm.title,
        content: noticeForm.content,
        authorName: noticeForm.authorName,
        authorPassword: noticeForm.authorPassword,
        teamId: parseInt(teamId!),
        isGlobalVisible: noticeForm.isGlobalVisible,
      });
      
      success('공지사항이 성공적으로 작성되었습니다.');
      setNoticeForm({ title: '', content: '', authorName: '관리자', authorPassword: '', isGlobalVisible: false });
      setShowNoticeForm(false);
      loadTeamNotices();
    } catch (err) {
      error('공지사항 작성에 실패했습니다.');
      console.error('Error creating notice:', err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const handleEditNotice = (notice: Notice) => {
    setEditingNotice(notice);
    setNoticeForm({
      title: notice.title,
      content: notice.content,
      authorName: notice.authorName,
      authorPassword: '', // 관리자는 비밀번호 필요없음
      isGlobalVisible: notice.isGlobalVisible || false,
    });
    setShowEditNoticeForm(true);
  };

  const handleUpdateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNotice || !noticeForm.title.trim() || !noticeForm.content.trim()) {
      warning('제목과 내용을 입력해주세요.');
      return;
    }

    try {
      await adminNoticeService.adminUpdateNotice(editingNotice.id, {
        title: noticeForm.title,
        content: noticeForm.content,
        teamId: parseInt(teamId!),
        isGlobalVisible: noticeForm.isGlobalVisible,
      });
      
      success('공지사항이 성공적으로 수정되었습니다.');
      setNoticeForm({ title: '', content: '', authorName: '관리자', authorPassword: '', isGlobalVisible: false });
      setShowEditNoticeForm(false);
      setEditingNotice(null);
      loadTeamNotices();
    } catch (err) {
      error('공지사항 수정에 실패했습니다.');
      console.error('Error updating notice:', err);
    }
  };

  const handleDeleteNotice = (notice: Notice) => {
    setDeletingNotice(notice);
    setShowDeleteNoticeModal(true);
  };

  const confirmDeleteNotice = async () => {
    if (!deletingNotice) return;

    try {
      await adminNoticeService.adminDeleteNotice(parseInt(teamId!), deletingNotice.id);
      success('공지사항이 성공적으로 삭제되었습니다.');
      loadTeamNotices();
    } catch (err) {
      error('공지사항 삭제에 실패했습니다.');
      console.error('Error deleting notice:', err);
    } finally {
      setShowDeleteNoticeModal(false);
      setDeletingNotice(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">로딩 중...</div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="text-center py-12">
        
        <h3 className="text-lg font-medium text-gray-900 mb-2">팀을 찾을 수 없습니다</h3>
        <Button onClick={() => navigate('/admin/teams')}>팀 목록으로 돌아가기</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin/teams')}
            className="mr-4 text-gray-600 border-gray-300 hover:bg-gray-50"
          >
            <span className="mr-1">←</span>
            팀 목록
          </Button>
          <div className="flex items-center">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-green-400 to-green-600 mr-4 flex items-center justify-center">
              {team.logoUrl ? (
                <img 
                  src={team.logoUrl}
                  alt={`${team.name} 로고`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white text-xl font-bold">{team.code}</span>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{team.name}</h1>
              <p className="text-gray-600 mt-1">{team.description}</p>
              <div className="flex items-center mt-2">
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium mr-2">
                  {team.code}
                </span>
                <span className="text-gray-500 text-sm">
                  생성일: {new Date(team.createdAt).toLocaleDateString('ko-KR')}
                </span>
              </div>
            </div>
          </div>
        </div>
        <Button 
          className="bg-blue-600 hover:bg-blue-700"
          onClick={handleEditTeam}
        >
          <span className="mr-2">✏️</span>
          팀 정보 수정
        </Button>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{team.playerCount || 0}</div>
            <div className="text-sm text-gray-600">소속 선수</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{stadiums.length}</div>
            <div className="text-sm text-gray-600">보유 구장</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{notices.length}</div>
            <div className="text-sm text-gray-600">공지사항</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">0</div>
            <div className="text-sm text-gray-600">예정 경기</div>
          </div>
        </Card>
      </div>

      {/* 탭 네비게이션 */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'overview', label: '개요', icon: '📊' },
            { key: 'stadiums', label: '구장 관리', icon: '🏟️' },
            { key: 'notices', label: '공지사항', icon: '📢' },
            { key: 'players', label: '선수 관리', icon: '👥' },
            { key: 'admins', label: '관리자 관리', icon: '👮' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as TabKey)}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* 탭별 컨텐츠 */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">팀 개요</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">기본 정보</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">팀명:</span> {team.name}</div>
                    <div><span className="font-medium">코드:</span> {team.code}</div>
                    <div><span className="font-medium">설명:</span> {team.description}</div>
                    <div><span className="font-medium">생성일:</span> {new Date(team.createdAt).toLocaleDateString('ko-KR')}</div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">빠른 액션</h3>
                  <div className="space-y-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setActiveTab('players')}
                      className="w-full justify-start"
                    >
                      👥 선수 관리
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setActiveTab('stadiums')}
                      className="w-full justify-start"
                    >
                      🏟️ 구장 관리
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setActiveTab('notices')}
                      className="w-full justify-start"
                    >
                      📢 공지사항 관리
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'stadiums' && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">보유 구장</h2>
            <Button
              size="sm"
              className="bg-purple-600 hover:bg-purple-700"
              onClick={handleCreateStadium}
            >
              <span className="mr-1">➕</span>
              구장 추가
            </Button>
          </div>

          {stadiums.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stadiums.map((stadium) => (
                <div key={stadium.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="mb-3">
                    <h3 className="font-bold text-gray-900 mb-1">{stadium.name}</h3>
                    <p className="text-gray-600 text-sm mb-2">{stadium.address}</p>
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>시간당: {stadium.hourlyRate?.toLocaleString()}원</span>
                      <span>{stadium.availableHours}</span>
                    </div>
                  </div>
                  
                  {stadium.facilities && stadium.facilities.length > 0 && (
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-1">
                        {stadium.facilities.slice(0, 3).map((facility, index) => (
                          <span 
                            key={index}
                            className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs"
                          >
                            {facility}
                          </span>
                        ))}
                        {stadium.facilities.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{stadium.facilities.length - 3}개
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1 text-blue-600 border-blue-200 hover:bg-blue-50"
                      onClick={() => handleEditStadium(stadium)}
                    >
                      <span className="mr-1">✏️</span>
                      수정
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => handleDeleteStadium(stadium)}
                    >
                      🗑️
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 text-4xl mb-2">🏟️</div>
              <p className="text-gray-600 mb-4">등록된 구장이 없습니다</p>
              <Button
                className="bg-purple-600 hover:bg-purple-700"
                onClick={handleCreateStadium}
              >
                <span className="mr-2">➕</span>
                첫 번째 구장 추가하기
              </Button>
            </div>
          )}
        </Card>
      )}

      {activeTab === 'notices' && (
        <div className="space-y-6">
          {/* 공지사항 작성 폼 */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">공지사항 관리</h2>
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => setShowNoticeForm(!showNoticeForm)}
              >
                <span className="mr-1">📝</span>
                {showNoticeForm ? '취소' : '새 공지사항 작성'}
              </Button>
            </div>

            {/* 공지사항 수정 폼 */}
            {showEditNoticeForm && editingNotice && (
              <form onSubmit={handleUpdateNotice} className="mb-6 p-4 border border-gray-200 rounded-lg bg-blue-50">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">공지사항 수정</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      제목 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={noticeForm.title}
                      onChange={(e) => setNoticeForm(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="공지사항 제목을 입력하세요"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      내용 <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={noticeForm.content}
                      onChange={(e) => setNoticeForm(prev => ({ ...prev, content: e.target.value }))}
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="공지사항 내용을 입력하세요"
                      required
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="editIsGlobalVisible"
                      checked={noticeForm.isGlobalVisible}
                      onChange={(e) => setNoticeForm(prev => ({ ...prev, isGlobalVisible: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <label htmlFor="editIsGlobalVisible" className="ml-2 text-sm font-medium text-gray-700">
                      전체 메인 페이지에 노출
                    </label>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowEditNoticeForm(false);
                        setEditingNotice(null);
                        setNoticeForm({ title: '', content: '', authorName: '관리자', authorPassword: '', isGlobalVisible: false });
                      }}
                    >
                      취소
                    </Button>
                    <Button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      수정 완료
                    </Button>
                  </div>
                </div>
              </form>
            )}

            {showNoticeForm && (
              <form onSubmit={handleNoticeSubmit} className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      제목 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={noticeForm.title}
                      onChange={(e) => setNoticeForm(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="공지사항 제목을 입력하세요"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      내용 <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={noticeForm.content}
                      onChange={(e) => setNoticeForm(prev => ({ ...prev, content: e.target.value }))}
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="공지사항 내용을 입력하세요"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        작성자명 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={noticeForm.authorName}
                        onChange={(e) => setNoticeForm(prev => ({ ...prev, authorName: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        비밀번호 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        value={noticeForm.authorPassword}
                        onChange={(e) => setNoticeForm(prev => ({ ...prev, authorPassword: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="수정/삭제시 사용할 비밀번호"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isGlobalVisible"
                      checked={noticeForm.isGlobalVisible}
                      onChange={(e) => setNoticeForm(prev => ({ ...prev, isGlobalVisible: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <label htmlFor="isGlobalVisible" className="ml-2 text-sm font-medium text-gray-700">
                      전체 메인 페이지에 노출
                    </label>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowNoticeForm(false)}
                    >
                      취소
                    </Button>
                    <Button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      공지사항 등록
                    </Button>
                  </div>
                </div>
              </form>
            )}

            {/* 공지사항 목록 */}
            {notices.length > 0 ? (
              <div className="space-y-4">
                {notices.map((notice) => (
                  <div key={notice.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900">{notice.title}</h3>
                      <span className="text-sm text-gray-500">{formatDate(notice.createdAt)}</span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {notice.content.length > 100 
                        ? `${notice.content.substring(0, 100)}...` 
                        : notice.content
                      }
                    </p>
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <div>
                        <span className="mr-4">작성자: {notice.authorName}</span>
                        <span className="mr-4">조회: {notice.viewCount}</span>
                        <span>댓글: {notice.commentCount}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-blue-600 border-blue-200 hover:bg-blue-50"
                          onClick={() => handleEditNotice(notice)}
                        >
                          수정
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => handleDeleteNotice(notice)}
                        >
                          삭제
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 text-4xl mb-2">📢</div>
                <p className="text-gray-600 mb-4">등록된 공지사항이 없습니다</p>
                <Button
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => setShowNoticeForm(true)}
                >
                  <span className="mr-2">📝</span>
                  첫 번째 공지사항 작성하기
                </Button>
              </div>
            )}
          </Card>
        </div>
      )}

      {activeTab === 'players' && (
        <Card>
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">👥</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">선수 관리</h3>
            <p className="text-gray-600 mb-4">이 팀의 선수들을 관리할 수 있습니다</p>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={handleViewPlayers}
            >
              선수 관리 페이지로 이동
            </Button>
          </div>
        </Card>
      )}

      {activeTab === 'admins' && teamId && (
        <AdminManagement teamId={parseInt(teamId)} />
      )}

      {/* 팀 수정 모달 */}
      <TeamEditModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        team={team}
        onTeamUpdated={handleTeamUpdated}
      />

      {/* 구장 생성 모달 */}
      <StadiumCreateModal
        isOpen={showCreateStadiumModal}
        onClose={() => setShowCreateStadiumModal(false)}
        onStadiumCreated={handleStadiumCreated}
        teamId={parseInt(teamId!)}
      />

      {/* 구장 수정 모달 */}
      <StadiumEditModal
        isOpen={showEditStadiumModal}
        onClose={() => setShowEditStadiumModal(false)}
        stadium={editingStadium}
        onStadiumUpdated={handleStadiumUpdated}
      />

      {/* 구장 삭제 확인 모달 */}
      <ConfirmDeleteModal
        isOpen={showDeleteStadiumModal}
        onClose={() => {
          setShowDeleteStadiumModal(false);
          setDeletingStadium(null);
        }}
        title="구장 삭제"
        itemName={deletingStadium?.name || ''}
        itemType="구장"
        stadiumId={deletingStadium?.id}
        onSuccess={() => {
          loadTeamStadiums();
          setShowDeleteStadiumModal(false);
          setDeletingStadium(null);
        }}
      />

      {/* 공지사항 삭제 확인 모달 */}
      <ConfirmModal
        isOpen={showDeleteNoticeModal}
        title="공지사항 삭제"
        message={`"${deletingNotice?.title}" 공지사항을 삭제하시겠습니까?`}
        confirmText="삭제"
        cancelText="취소"
        onConfirm={confirmDeleteNotice}
        onCancel={() => {
          setShowDeleteNoticeModal(false);
          setDeletingNotice(null);
        }}
        type="danger"
      />

      {/* 토스트 컨테이너 */}
      <ToastContainer />
    </div>
  );
};

export default AdminTeamDetail;