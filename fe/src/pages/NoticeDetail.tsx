import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTeam } from '../contexts/TeamContext';
import { noticeApi } from '../api/modules/notice';
import type { NoticeDetail as NoticeDetailType, NoticeComment, CreateNoticeCommentRequest } from '../api/types';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useToast } from '../components/Toast';
import { useAuth } from '../contexts/AuthContext';
import NoticeEditModal from '../components/admin/NoticeEditModal';

const NoticeDetail: React.FC = () => {
  const { noticeId } = useParams<{ noticeId: string }>();
  const navigate = useNavigate();
  const { currentTeam } = useTeam();
  const { success, error, ToastContainer } = useToast();
  const { admin, isAuthenticated } = useAuth();

  const [notice, setNotice] = useState<NoticeDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentForm, setCommentForm] = useState({
    content: '',
    authorName: '',
    authorEmail: '',
    authorPassword: ''
  });
  const [submittingComment, setSubmittingComment] = useState(false);
  
  // 삭제 관련 상태
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteCommentModal, setShowDeleteCommentModal] = useState(false);
  const [deletingComment, setDeletingComment] = useState<NoticeComment | null>(null);
  const [deletePassword, setDeletePassword] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    if (noticeId && currentTeam) {
      loadNotice();
    }
  }, [noticeId, currentTeam]);

  const loadNotice = async () => {
    if (!noticeId || !currentTeam) return;

    try {
      setLoading(true);
      const data = await noticeApi.getNotice(parseInt(noticeId), parseInt(currentTeam.id));
      setNotice(data);
      
      // 상세 조회 시 백엔드에서 자동으로 조회수 처리됨
    } catch (err) {
      error('공지사항을 불러오는데 실패했습니다.');
      console.error('Failed to load notice:', err);
      navigate('/notices');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!commentForm.content.trim() || !commentForm.authorName.trim() || !commentForm.authorPassword.trim()) {
      error('모든 필드를 입력해주세요.');
      return;
    }

    if (!currentTeam || !noticeId) return;

    try {
      setSubmittingComment(true);
      const commentData: CreateNoticeCommentRequest = {
        content: commentForm.content,
        authorName: commentForm.authorName,
        authorEmail: commentForm.authorEmail,
        authorPassword: commentForm.authorPassword,
        teamId: parseInt(currentTeam.id)
      };

      await noticeApi.createComment(parseInt(noticeId), commentData);
      success('댓글이 성공적으로 작성되었습니다.');
      setCommentForm({ content: '', authorName: '', authorEmail: '', authorPassword: '' });
      loadNotice(); // 댓글 목록 새로고침
    } catch (err) {
      error('댓글 작성에 실패했습니다.');
      console.error('Failed to create comment:', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleEditNotice = () => {
    setShowEditModal(true);
  };

  const handleEditSuccess = () => {
    success('공지사항이 수정되었습니다.');
    loadNotice(); // 수정된 내용 다시 로드
    setShowEditModal(false);
  };

  const handleDeleteNotice = () => {
    // 관리자인 경우 비밀번호 확인 없이 바로 삭제
    if (isAuthenticated && admin) {
      confirmDeleteNoticeAdmin();
    } else {
      setShowDeleteModal(true);
    }
  };

  // 관리자용 삭제 함수 (비밀번호 확인 없음)
  const confirmDeleteNoticeAdmin = async () => {
    if (!currentTeam || !noticeId) {
      error('팀 정보 또는 공지사항 ID를 찾을 수 없습니다.');
      return;
    }

    if (!window.confirm('이 공지사항을 삭제하시겠습니까?')) {
      return;
    }

    try {
      // 관리자 API 사용 (adminNoticeApi 사용 필요)
      const adminNoticeApi = await import('../api/modules/adminNotice');
      await adminNoticeApi.adminNoticeApi.deleteNotice(parseInt(noticeId), parseInt(currentTeam.id));
      success('공지사항이 삭제되었습니다.');
      navigate('/notices');
    } catch (err) {
      error('공지사항 삭제에 실패했습니다.');
      console.error('Failed to delete notice:', err);
    }
  };

  const confirmDeleteNotice = async () => {
    if (!currentTeam || !noticeId || !deletePassword.trim()) {
      error('비밀번호를 입력해주세요.');
      return;
    }

    try {
      await noticeApi.deleteNotice(parseInt(noticeId), parseInt(currentTeam.id), deletePassword);
      success('공지사항이 삭제되었습니다.');
      navigate('/notices');
    } catch (err) {
      error('공지사항 삭제에 실패했습니다. 비밀번호를 확인해주세요.');
      console.error('Failed to delete notice:', err);
    } finally {
      setShowDeleteModal(false);
      setDeletePassword('');
    }
  };

  const handleDeleteComment = (comment: NoticeComment) => {
    // 관리자인 경우 비밀번호 확인 없이 바로 삭제
    if (isAuthenticated && admin) {
      confirmDeleteCommentAdmin(comment);
    } else {
      setDeletingComment(comment);
      setShowDeleteCommentModal(true);
    }
  };

  // 관리자용 댓글 삭제 함수 (비밀번호 확인 없음)
  const confirmDeleteCommentAdmin = async (comment: NoticeComment) => {
    if (!currentTeam) {
      error('팀 정보를 찾을 수 없습니다.');
      return;
    }

    if (!window.confirm('이 댓글을 삭제하시겠습니까?')) {
      return;
    }

    try {
      // 관리자 API로 댓글 삭제 (adminNoticeApi에 댓글 삭제 API가 있는지 확인 필요)
      await noticeApi.deleteComment(comment.id, parseInt(currentTeam.id), 'admin_delete');
      success('댓글이 삭제되었습니다.');
      loadNotice(); // 댓글 목록 새로고침
    } catch (err) {
      error('댓글 삭제에 실패했습니다.');
      console.error('Failed to delete comment:', err);
    }
  };

  const confirmDeleteComment = async () => {
    if (!currentTeam || !deletingComment || !deletePassword.trim()) {
      error('비밀번호를 입력해주세요.');
      return;
    }

    try {
      await noticeApi.deleteComment(deletingComment.id, parseInt(currentTeam.id), deletePassword);
      success('댓글이 삭제되었습니다.');
      loadNotice(); // 댓글 목록 새로고침
    } catch (err) {
      error('댓글 삭제에 실패했습니다. 비밀번호를 확인해주세요.');
      console.error('Failed to delete comment:', err);
    } finally {
      setShowDeleteCommentModal(false);
      setDeletingComment(null);
      setDeletePassword('');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!notice) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">공지사항을 찾을 수 없습니다.</p>
          <Link
            to="/notices"
            className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 뒤로가기 버튼 */}
        <div className="mb-6">
          <Link
            to="/notices"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            공지사항 목록으로 돌아가기
          </Link>
        </div>

        {/* 공지사항 내용 */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
          {/* 헤더 */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">
                    공지
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-4">{notice.title}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>작성자: {notice.authorName}</span>
                  <span>작성일: {formatDate(notice.createdAt)}</span>
                  <span>조회수: {notice.viewCount}</span>
                </div>
              </div>
              {/* 관리자로 로그인했을 때만 수정/삭제 버튼 표시 */}
              {isAuthenticated && admin && (
                <div className="flex space-x-2">
                  <button
                    onClick={handleEditNotice}
                    className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    수정
                  </button>
                  <button
                    onClick={handleDeleteNotice}
                    className="px-3 py-1 text-sm text-red-600 hover:text-red-800 transition-colors"
                  >
                    삭제
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 본문 */}
          <div className="px-6 py-8">
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap text-gray-900 leading-relaxed">
                {notice.content}
              </div>
            </div>
          </div>
        </div>

        {/* 댓글 섹션 */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              댓글 {notice.comments.length}개
            </h2>
          </div>

          {/* 댓글 목록 */}
          <div className="divide-y divide-gray-200">
            {notice.comments.map((comment) => (
              <div key={comment.id} className="px-6 py-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-gray-900">{comment.authorName}</span>
                      <span className="text-sm text-gray-500">{formatDate(comment.createdAt)}</span>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                  </div>
                  {/* 관리자로 로그인했을 때만 댓글 삭제 버튼 표시 */}
                  {isAuthenticated && admin && (
                    <button
                      onClick={() => handleDeleteComment(comment)}
                      className="text-sm text-red-600 hover:text-red-800 transition-colors"
                    >
                      삭제
                    </button>
                  )}
                </div>
              </div>
            ))}

            {notice.comments.length === 0 && (
              <div className="px-6 py-8 text-center text-gray-500">
                아직 댓글이 없습니다. 첫 번째 댓글을 작성해보세요!
              </div>
            )}
          </div>

          {/* 댓글 작성 폼 */}
          <div className="px-6 py-6 border-t border-gray-200 bg-gray-50">
            <form onSubmit={handleSubmitComment} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="이름 *"
                  value={commentForm.authorName}
                  onChange={(e) => setCommentForm(prev => ({ ...prev, authorName: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <input
                  type="email"
                  placeholder="이메일 (선택)"
                  value={commentForm.authorEmail}
                  onChange={(e) => setCommentForm(prev => ({ ...prev, authorEmail: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <input
                type="password"
                placeholder="비밀번호 * (수정/삭제 시 필요)"
                value={commentForm.authorPassword}
                onChange={(e) => setCommentForm(prev => ({ ...prev, authorPassword: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <textarea
                placeholder="댓글을 입력하세요 *"
                value={commentForm.content}
                onChange={(e) => setCommentForm(prev => ({ ...prev, content: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submittingComment}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submittingComment ? '작성 중...' : '댓글 작성'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* 일반 사용자용 비밀번호 입력 모달 */}
      {(showDeleteModal || showDeleteCommentModal) && !(isAuthenticated && admin) && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="mt-3 text-center sm:mt-0 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  삭제를 위한 비밀번호 입력
                </h3>
                <input
                  type="password"
                  placeholder="작성 시 입력했던 비밀번호"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      showDeleteModal ? confirmDeleteNotice() : confirmDeleteComment();
                    }
                  }}
                />
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowDeleteModal(false);
                      setShowDeleteCommentModal(false);
                      setDeletingComment(null);
                      setDeletePassword('');
                    }}
                    className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    취소
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      showDeleteModal ? confirmDeleteNotice() : confirmDeleteComment();
                    }}
                    className="flex-1 px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
                  >
                    삭제
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 공지사항 수정 모달 */}
      {notice && (
        <NoticeEditModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSuccess={handleEditSuccess}
          notice={{
            id: notice.id,
            title: notice.title,
            content: notice.content,
            authorName: notice.authorName,
            viewCount: notice.viewCount,
            commentCount: notice.comments.length,
            createdAt: notice.createdAt,
            updatedAt: notice.updatedAt,
            isGlobalVisible: false
          }}
        />
      )}

      <ToastContainer />
    </div>
  );
};

export default NoticeDetail;