import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { useTeam } from '../contexts/TeamContext';
import { communityApi } from '../api/modules/community';
import type { CommunityPostDetail } from '../api/types';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AuthModal from '../components/community/AuthModal';
import CommentSection from '../components/community/CommentSection';
import { communityAuthManager } from '../utils/communityAuth';
import { useToast } from '../components/Toast';
import { useAuth } from '../contexts/AuthContext';

const CommunityDetail: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentTeam } = useTeam();
  const { success, ToastContainer } = useToast();
  const { admin, isAuthenticated } = useAuth();
  
  const [post, setPost] = useState<CommunityPostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [modalAction, setModalAction] = useState<'edit' | 'delete'>('delete');
  const [isProcessing, setIsProcessing] = useState(false);


  useEffect(() => {
    const loadPost = async () => {
      if (!currentTeam || !postId) {
        setError('팀 정보 또는 게시글 ID를 찾을 수 없습니다.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await communityApi.getPost(parseInt(postId), parseInt(currentTeam.id));
        setPost(response);
        
        // 상세 조회 시 백엔드에서 자동으로 조회수 처리됨
      } catch (err) {
        setError('게시글을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [currentTeam, postId]);

  // navigate state로 전달된 메시지를 Toast로 표시
  useEffect(() => {
    if (location.state?.message) {
      success(location.state.message);
      // state 정리하여 새로고침 시 중복 표시 방지
      window.history.replaceState({}, document.title);
    }
  }, [location.state, success]); // useCallback으로 메모이제이션된 success 함수

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleEdit = () => {
    // 관리자인 경우 비밀번호 확인 없이 바로 수정 페이지로 이동
    if (isAuthenticated && admin) {
      navigate(`/community/write?edit=${postId}`);
    } else {
      setModalAction('edit');
      setShowAuthModal(true);
    }
  };

  const handleDelete = () => {
    // 관리자인 경우 비밀번호 확인 없이 바로 삭제
    if (isAuthenticated && admin) {
      handleDeleteAdmin();
    } else {
      setModalAction('delete');
      setShowAuthModal(true);
    }
  };

  // 관리자용 삭제 함수 (비밀번호 확인 없음)
  const handleDeleteAdmin = async () => {
    if (!currentTeam || !postId) {
      throw new Error('팀 정보 또는 게시글 ID를 찾을 수 없습니다.');
    }

    if (!window.confirm('이 게시글을 삭제하시겠습니까?')) {
      return;
    }

    try {
      setIsProcessing(true);
      // 관리자 API 사용
      const { adminCommunityApi } = await import('../api/modules/adminCommunity');
      await adminCommunityApi.deactivatePost(parseInt(postId), '관리자에 의한 삭제 처리');
      
      success('게시글이 삭제되었습니다.');
      navigate('/community', { 
        state: { message: '게시글이 성공적으로 삭제되었습니다.' }
      });
    } catch (err) {
      throw new Error('게시글 삭제에 실패했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePasswordConfirm = async (password: string) => {
    if (!currentTeam || !postId) {
      throw new Error('팀 정보 또는 게시글 ID를 찾을 수 없습니다.');
    }

    setIsProcessing(true);

    try {
      if (modalAction === 'edit') {
        // 수정: 비밀번호 확인 후 권한 저장 및 수정 페이지로 이동
        const authResponse = await communityApi.checkPostOwnership(
          parseInt(postId), 
          parseInt(currentTeam.id), 
          password
        );
        
        if (!authResponse.isOwner || !authResponse.canEdit) {
          throw new Error('수정 권한이 없습니다.');
        }
        
        // 임시 권한 저장
        communityAuthManager.setTemporaryAuth(
          'post', 
          parseInt(postId), 
          parseInt(currentTeam.id), 
          authResponse
        );
        
        setShowAuthModal(false);
        navigate(`/community/write?edit=${postId}`);
        
      } else if (modalAction === 'delete') {
        // 삭제: 권한 확인 후 삭제 진행
        const authResponse = await communityApi.checkPostOwnership(
          parseInt(postId), 
          parseInt(currentTeam.id), 
          password
        );
        
        if (!authResponse.isOwner || !authResponse.canDelete) {
          throw new Error('삭제 권한이 없습니다.');
        }
        
        await communityApi.deletePost(
          parseInt(postId), 
          parseInt(currentTeam.id), 
          password
        );
        
        setShowAuthModal(false);
        navigate('/community', { 
          state: { message: '게시글이 성공적으로 삭제되었습니다.' }
        });
      }
    } catch (err) {
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateComment = async (comment: { content: string; authorName: string; authorPassword: string }) => {
    if (!currentTeam || !postId) return;

    await communityApi.createComment(parseInt(postId), {
      ...comment,
      teamId: parseInt(currentTeam.id)
    });

    // 게시글 다시 로드 (댓글 목록 업데이트)
    const updatedPost = await communityApi.getPost(parseInt(postId), parseInt(currentTeam.id));
    setPost(updatedPost);
  };

  const handleDeleteComment = async (commentId: number, password: string) => {
    if (!currentTeam || !postId) return;

    await communityApi.deleteComment(commentId, parseInt(currentTeam.id), password);
    
    // 게시글 다시 로드 (댓글 목록 업데이트)
    const updatedPost = await communityApi.getPost(parseInt(postId), parseInt(currentTeam.id));
    setPost(updatedPost);
  };

  const handleSuccess = (message: string) => {
    success(message);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <div className="space-x-4">
              <button
                onClick={() => navigate('/community')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                목록으로 돌아가기
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 게시글 상세 */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* 헤더 */}
          <div className="border-b border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <Link
                to="/community"
                className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                목록으로
              </Link>
              <div className="flex items-center gap-2">
                {post.isNotice && (
                  <span className="inline-flex items-center px-3 py-1 text-sm font-medium bg-red-100 text-red-800 rounded-full">
                    공지사항
                  </span>
                )}
                {post.category && (
                  <span className="inline-flex items-center px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
                    {post.category}
                  </span>
                )}
              </div>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{post.title}</h1>
            
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center space-x-4">
                <span className="font-medium">{post.authorName}</span>
                <span>{formatDate(post.createdAt)}</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span>{post.viewCount}</span>
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.477 8-10 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.477-8 10-8s10 3.582 10 8z" />
                  </svg>
                  <span>{post.comments.length}</span>
                </div>
              </div>
            </div>

            {/* 수정/삭제 버튼 */}
            <div className="flex items-center space-x-2 mt-4">
              <button
                onClick={handleEdit}
                disabled={isProcessing}
                className="inline-flex items-center px-4 py-2 border border-blue-300 text-sm font-medium rounded-lg text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                수정하기
              </button>
              <button
                onClick={handleDelete}
                disabled={isProcessing}
                className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-lg text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                삭제하기
              </button>
            </div>
          </div>

          {/* 게시글 내용 */}
          <div className="p-6">
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                {post.content}
              </div>
            </div>
          </div>

          {/* 댓글 섹션 */}
          <CommentSection 
            comments={post.comments}
            onCreateComment={handleCreateComment}
            onDeleteComment={handleDeleteComment}
            onSuccess={handleSuccess}
          />
        </div>

        {/* 하단 버튼 */}
        <div className="mt-6 flex justify-center">
          <Link
            to="/community"
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
          >
            목록으로
          </Link>
        </div>

        {/* 인증 모달 */}
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onConfirm={handlePasswordConfirm}
          title={modalAction === 'edit' ? '게시글 수정' : '게시글 삭제'}
          message={modalAction === 'edit' 
            ? '게시글을 수정하려면 작성 시 입력한 비밀번호를 입력해주세요.'
            : '게시글을 삭제하려면 작성 시 입력한 비밀번호를 입력해주세요. 삭제된 게시글은 복구할 수 없습니다.'}
          actionLabel={modalAction === 'edit' ? '수정하기' : '삭제하기'}
          actionType={modalAction}
          isLoading={isProcessing}
        />

        <ToastContainer />
      </div>
    </div>
  );
};

export default CommunityDetail;