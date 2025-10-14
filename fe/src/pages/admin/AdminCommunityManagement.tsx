import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { AdminCommunityPost, AdminPageResponse, AdminCommunityPostDetail } from '../../types/interfaces/admin';
import { Button, Card } from '../../components/common';
import { useToast } from '../../components/Toast';
import { UnknownError, getErrorMessage } from '../../types/error';

interface PostDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  postDetail: AdminCommunityPostDetail | null;
  onCommentAction: (commentId: number, action: 'activate' | 'deactivate' | 'delete') => void;
}

const PostDetailModal: React.FC<PostDetailModalProps> = ({ isOpen, onClose, postDetail, onCommentAction }) => {
  if (!isOpen || !postDetail) return null;

  const { post, comments } = postDetail;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">게시글 상세 정보</h3>
          <Button variant="outline" size="sm" onClick={onClose}>닫기</Button>
        </div>

        {/* 게시글 정보 */}
        <Card className="mb-6">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-medium">{post.title}</h4>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  post.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {post.isActive ? '활성' : '비활성'}
                </span>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  post.isNotice ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {post.isNotice ? '공지' : '일반'}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
              <div>작성자: {post.authorName}</div>
              <div>카테고리: {post.category}</div>
              <div>조회수: {post.viewCount}</div>
              <div>댓글수: {post.commentCount}</div>
              <div>팀: {post.teamName} ({post.teamCode})</div>
              <div>작성일: {new Date(post.createdAt).toLocaleString()}</div>
            </div>
            
            <div className="border-t pt-4">
              <div className="prose max-w-none">
                <div dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br>') }} />
              </div>
            </div>
          </div>
        </Card>

        {/* 댓글 목록 */}
        <div>
          <h5 className="text-lg font-medium mb-4">댓글 ({comments.length}개)</h5>
          <div className="space-y-4">
            {comments.map((comment) => (
              <Card key={comment.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-medium">{comment.authorName}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(comment.createdAt).toLocaleString()}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        comment.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {comment.isActive ? '활성' : '비활성'}
                      </span>
                    </div>
                    <div className="text-gray-700">
                      {comment.content}
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onCommentAction(comment.id, comment.isActive ? 'deactivate' : 'activate')}
                    >
                      {comment.isActive ? '비활성화' : '활성화'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onCommentAction(comment.id, 'delete')}
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      삭제
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
            {comments.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                댓글이 없습니다.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminCommunityManagement: React.FC = () => {
  const [posts, setPosts] = useState<AdminPageResponse<AdminCommunityPost> | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [availableTeams, setAvailableTeams] = useState<string[]>([]);
  const [selectedPostDetail, setSelectedPostDetail] = useState<AdminCommunityPostDetail | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const { showToast, ToastContainer } = useToast();

  const categories = [
    { value: '', label: '전체 카테고리' },
    { value: 'GENERAL', label: '자유게시판' },
    { value: 'MATCH_REVIEW', label: '경기후기' },
    { value: 'RECRUITMENT', label: '모집공고' },
    { value: 'QNA', label: '질문답변' },
    { value: 'EVENT', label: '이벤트' }
  ];

  const statusOptions = [
    { value: '', label: '전체 상태' },
    { value: 'true', label: '활성' },
    { value: 'false', label: '비활성' }
  ];

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const isActiveFilter = selectedStatus === '' ? undefined : selectedStatus === 'true';
      const data = await adminService.getCommunityPosts(
        0, 20, 
        selectedTeam || undefined, 
        selectedCategory || undefined, 
        isActiveFilter
      );
      setPosts(data);
    } catch (error) {
      console.error('커뮤니티 게시글 로딩 실패:', error);
      showToast('커뮤니티 게시글을 불러올 수 없습니다.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableTeams = async () => {
    try {
      const tenants = await adminService.getAllTenants();
      setAvailableTeams(tenants.map(tenant => tenant.code));
    } catch (error) {
      console.error('팀 목록 로딩 실패:', error);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchAvailableTeams();
  }, [selectedTeam, selectedCategory, selectedStatus]);

  const handlePostAction = async (postId: number, action: 'activate' | 'deactivate' | 'delete') => {
    try {
      switch (action) {
        case 'activate':
          await adminService.activateCommunityPost(postId);
          showToast('게시글이 활성화되었습니다.', 'success');
          break;
        case 'deactivate':
          await adminService.deactivateCommunityPost(postId);
          showToast('게시글이 비활성화되었습니다.', 'success');
          break;
        case 'delete':
          if (window.confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
            await adminService.deleteCommunityPost(postId);
            showToast('게시글이 삭제되었습니다.', 'success');
          } else {
            return;
          }
          break;
      }
      fetchPosts();
    } catch (err: UnknownError) {
      console.error('게시글 작업 실패:', err);
      const errorMessage = getErrorMessage(err, '작업에 실패했습니다.');
      showToast(errorMessage, 'error');
    }
  };

  const handleCommentAction = async (commentId: number, action: 'activate' | 'deactivate' | 'delete') => {
    try {
      switch (action) {
        case 'activate':
          await adminService.activateCommunityComment(commentId);
          showToast('댓글이 활성화되었습니다.', 'success');
          break;
        case 'deactivate':
          await adminService.deactivateCommunityComment(commentId);
          showToast('댓글이 비활성화되었습니다.', 'success');
          break;
        case 'delete':
          if (window.confirm('정말로 이 댓글을 삭제하시겠습니까?')) {
            await adminService.deleteCommunityComment(commentId);
            showToast('댓글이 삭제되었습니다.', 'success');
          } else {
            return;
          }
          break;
      }
      // 댓글 변경 후 상세 정보 다시 로드
      if (selectedPostDetail) {
        const updatedDetail = await adminService.getCommunityPostDetail(selectedPostDetail.post.id);
        setSelectedPostDetail(updatedDetail);
      }
      fetchPosts();
    } catch (err: UnknownError) {
      console.error('댓글 작업 실패:', err);
      const errorMessage = getErrorMessage(err, '작업에 실패했습니다.');
      showToast(errorMessage, 'error');
    }
  };

  const handleViewDetail = async (postId: number) => {
    try {
      const detail = await adminService.getCommunityPostDetail(postId);
      setSelectedPostDetail(detail);
      setIsDetailModalOpen(true);
    } catch (error) {
      console.error('게시글 상세 정보 로딩 실패:', error);
      showToast('게시글 상세 정보를 불러올 수 없습니다.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">커뮤니티 관리</h1>
        <p className="text-gray-600 mt-1">전체 팀의 커뮤니티 게시글과 댓글을 관리합니다</p>
      </div>

      {/* 필터 */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">팀 선택</label>
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">전체 팀</option>
              {availableTeams.map(team => (
                <option key={team} value={team}>{team}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>{category.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">상태</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <Button variant="primary" onClick={fetchPosts} className="w-full">
              필터 적용
            </Button>
          </div>
        </div>
      </Card>

      {/* 통계 */}
      {posts && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="flex items-center">
              <div className="text-2xl mr-3">📝</div>
              <div>
                <p className="text-sm text-gray-500">전체 게시글</p>
                <p className="text-2xl font-bold">{posts.totalElements}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center">
              <div className="text-2xl mr-3">✅</div>
              <div>
                <p className="text-sm text-gray-500">활성 게시글</p>
                <p className="text-2xl font-bold">
                  {posts.content.filter(post => post.isActive).length}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center">
              <div className="text-2xl mr-3">📌</div>
              <div>
                <p className="text-sm text-gray-500">공지사항</p>
                <p className="text-2xl font-bold">
                  {posts.content.filter(post => post.isNotice).length}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* 게시글 목록 */}
      <Card>
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">게시글 목록</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">제목</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">작성자</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">팀</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">카테고리</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">조회수</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">댓글</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">작성일</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">작업</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {posts?.content.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div>
                        <div className="font-medium text-gray-900">{post.title}</div>
                        {post.isNotice && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            공지
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{post.authorName}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{post.teamName}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{post.category}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      post.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {post.isActive ? '활성' : '비활성'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{post.viewCount}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{post.commentCount}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetail(post.id)}
                      >
                        상세
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePostAction(post.id, post.isActive ? 'deactivate' : 'activate')}
                      >
                        {post.isActive ? '비활성화' : '활성화'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePostAction(post.id, 'delete')}
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        삭제
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {posts?.content.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            검색 조건에 맞는 게시글이 없습니다.
          </div>
        )}
      </Card>

      {/* 상세 모달 */}
      <PostDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        postDetail={selectedPostDetail}
        onCommentAction={handleCommentAction}
      />

      <ToastContainer />
    </div>
  );
};

export default AdminCommunityManagement;