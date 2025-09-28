import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTeam } from '../contexts/TeamContext';
import { communityApi } from '../api/modules/community';
import type { CommunityPostDetail, OwnershipCheckResponse } from '../api/types';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AuthModal from '../components/community/AuthModal';
import { communityAuthManager } from '../utils/communityAuth';
import { getErrorMessage } from '../utils/errorHandler';

const CommunityDetail: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { currentTeam } = useTeam();
  
  const [post, setPost] = useState<CommunityPostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [modalAction, setModalAction] = useState<'edit' | 'delete'>('delete');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [commentForm, setCommentForm] = useState({
    content: '',
    authorName: '',
    authorPassword: ''
  });
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [commentDeleteError, setCommentDeleteError] = useState<string | null>(null);
  const [commentMenuOpen, setCommentMenuOpen] = useState<number | null>(null);
  const [deleteCommentId, setDeleteCommentId] = useState<number | null>(null);
  const [deleteCommentPassword, setDeleteCommentPassword] = useState('');
  const [isProcessingComment, setIsProcessingComment] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      setCommentMenuOpen(null);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

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
        
        // 성공 메시지 처리 (location state에서)
        const state = window.history.state?.usr;
        if (state?.message) {
          setSuccessMessage(state.message);
          // 5초 후 메시지 자동 제거
          setTimeout(() => setSuccessMessage(null), 5000);
          // 메시지 표시 후 state 클리어
          window.history.replaceState({}, document.title);
        }
      } catch (err) {
        setError('게시글을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [currentTeam, postId]);

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
    setModalAction('edit');
    setShowAuthModal(true);
  };

  const handleDelete = () => {
    setModalAction('delete');
    setShowAuthModal(true);
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

  const handleCommentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCommentForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTeam || !postId) return;

    const requiredFields = [commentForm.content.trim(), commentForm.authorName.trim(), commentForm.authorPassword.trim()];
    if (!requiredFields.every(field => field)) {
      setCommentError('댓글 내용, 작성자명, 비밀번호는 필수 입력 항목입니다.');
      return;
    }

    setIsSubmittingComment(true);
    setCommentError(null);

    try {
      await communityApi.createComment(parseInt(postId), {
        content: commentForm.content.trim(),
        authorName: commentForm.authorName.trim(),
        authorPassword: commentForm.authorPassword.trim(),
        teamId: parseInt(currentTeam.id)
      });

      // 댓글 작성 후 폼 초기화
      setCommentForm({
        content: '',
        authorName: '',
        authorPassword: ''
      });

      // 게시글 다시 로드 (댓글 목록 업데이트)
      const updatedPost = await communityApi.getPost(parseInt(postId), parseInt(currentTeam.id));
      setPost(updatedPost);

      setSuccessMessage('댓글이 성공적으로 작성되었습니다.');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setCommentError(errorMessage);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleCommentDelete = async (commentId: number) => {
    if (!currentTeam || !deleteCommentPassword.trim()) {
      setCommentDeleteError('비밀번호를 입력해주세요.');
      return;
    }

    setIsProcessingComment(true);
    setCommentDeleteError(null);

    try {
      await communityApi.deleteComment(commentId, parseInt(currentTeam.id), deleteCommentPassword.trim());
      
      // 게시글 다시 로드 (댓글 목록 업데이트)
      const updatedPost = await communityApi.getPost(parseInt(postId!), parseInt(currentTeam.id));
      setPost(updatedPost);

      setSuccessMessage('댓글이 성공적으로 삭제되었습니다.');
      setTimeout(() => setSuccessMessage(null), 3000);
      
      // 상태 초기화
      setDeleteCommentId(null);
      setDeleteCommentPassword('');
      setCommentMenuOpen(null);
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setCommentDeleteError(errorMessage);
    } finally {
      setIsProcessingComment(false);
    }
  };

  const handleCommentMenuToggle = (commentId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    setCommentMenuOpen(commentMenuOpen === commentId ? null : commentId);
  };

  const handleDeleteCommentClick = (commentId: number) => {
    setDeleteCommentId(commentId);
    setCommentMenuOpen(null);
  };

  const handleCancelDeleteComment = () => {
    setDeleteCommentId(null);
    setDeleteCommentPassword('');
    setCommentDeleteError(null);
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
        {/* 성공 메시지 */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-green-800 font-medium">{successMessage}</span>
            </div>
            <button
              onClick={() => setSuccessMessage(null)}
              className="text-green-600 hover:text-green-800 transition-colors duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
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
              {post.isNotice && (
                <span className="inline-flex items-center px-3 py-1 text-sm font-medium bg-red-100 text-red-800 rounded-full">
                  공지사항
                </span>
              )}
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
          <div className="border-t border-gray-200">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                댓글 ({post.comments.length})
              </h3>
              
              {post.comments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.477 8-10 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.477-8 10-8s10 3.582 10 8z" />
                  </svg>
                  <p>아직 댓글이 없습니다.</p>
                  <p className="text-sm mt-1">첫 번째 댓글을 작성해보세요!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {post.comments.map((comment) => (
                    <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{comment.authorName}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">
                            {formatDate(comment.createdAt)}
                          </span>
                          <div className="relative">
                            <button
                              onClick={(e) => handleCommentMenuToggle(comment.id, e)}
                              className="p-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/>
                              </svg>
                            </button>
                            {commentMenuOpen === comment.id && (
                              <div className="absolute right-0 mt-1 w-24 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                                <button
                                  onClick={() => handleDeleteCommentClick(comment.id)}
                                  className="block w-full px-3 py-2 text-sm text-red-600 hover:bg-gray-50 text-left"
                                >
                                  삭제
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-800 whitespace-pre-wrap">{comment.content}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* 댓글 삭제 확인 */}
              {deleteCommentId && (
                <div className="mt-6 p-5 bg-white border-2 border-orange-300 rounded-lg shadow-sm">
                  <div className="flex items-center mb-4">
                    <svg className="w-5 h-5 text-orange-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <h5 className="text-base font-semibold text-orange-800">댓글을 삭제하시겠습니까?</h5>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      삭제하려면 작성 시 입력한 비밀번호를 입력해주세요
                    </label>
                    <input
                      type="password"
                      value={deleteCommentPassword}
                      onChange={(e) => setDeleteCommentPassword(e.target.value)}
                      placeholder="비밀번호 입력"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm bg-gray-50"
                      maxLength={50}
                    />
                  </div>
                  
                  {commentDeleteError && (
                    <div className="mb-4 p-3 bg-red-600 text-white rounded-lg flex items-center">
                      <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span className="text-sm font-medium">{commentDeleteError}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-end space-x-3 pt-2">
                    <button
                      onClick={handleCancelDeleteComment}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                      disabled={isProcessingComment}
                    >
                      취소
                    </button>
                    <button
                      onClick={() => handleCommentDelete(deleteCommentId)}
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center"
                      disabled={isProcessingComment || !deleteCommentPassword.trim()}
                    >
                      {isProcessingComment ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          삭제 중...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          삭제하기
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* 댓글 작성 폼 */}
              <div className="mt-8 border-t border-gray-200 pt-6">
                <h4 className="text-md font-semibold text-gray-900 mb-4">댓글 작성</h4>
                
                {commentError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-600 text-sm">{commentError}</p>
                  </div>
                )}

                <form onSubmit={handleCommentSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                      댓글 내용 <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="content"
                      name="content"
                      value={commentForm.content}
                      onChange={handleCommentChange}
                      placeholder="댓글을 입력해주세요"
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
                      maxLength={1000}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="authorName" className="block text-sm font-medium text-gray-700 mb-2">
                        작성자명 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="authorName"
                        name="authorName"
                        value={commentForm.authorName}
                        onChange={handleCommentChange}
                        placeholder="이름을 입력해주세요"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        maxLength={50}
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="authorPassword" className="block text-sm font-medium text-gray-700 mb-2">
                        비밀번호 <span className="text-red-500">*</span>
                        <span className="text-xs text-gray-500 block">댓글 삭제 시 필요합니다</span>
                      </label>
                      <input
                        type="password"
                        id="authorPassword"
                        name="authorPassword"
                        value={commentForm.authorPassword}
                        onChange={handleCommentChange}
                        placeholder="비밀번호를 입력해주세요"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        maxLength={50}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isSubmittingComment}
                    >
                      {isSubmittingComment ? '작성 중...' : '댓글 작성'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
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
      </div>
    </div>
  );
};

export default CommunityDetail;