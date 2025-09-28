import React, { useState, useEffect } from 'react';
import type { CommunityComment } from '../../api/types';
import { getErrorMessage } from '../../utils/errorHandler';

interface CommentListProps {
  comments: CommunityComment[];
  onDeleteComment: (commentId: number, password: string) => Promise<void>;
  isProcessing: boolean;
}

const CommentList: React.FC<CommentListProps> = ({ comments, onDeleteComment, isProcessing }) => {
  const [commentMenuOpen, setCommentMenuOpen] = useState<number | null>(null);
  const [deleteCommentId, setDeleteCommentId] = useState<number | null>(null);
  const [deleteCommentPassword, setDeleteCommentPassword] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      setCommentMenuOpen(null);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

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
    setDeleteError(null);
  };

  const handleCommentDelete = async (commentId: number) => {
    if (!deleteCommentPassword.trim()) {
      setDeleteError('비밀번호를 입력해주세요.');
      return;
    }

    setDeleteError(null);

    try {
      await onDeleteComment(commentId, deleteCommentPassword.trim());
      setDeleteCommentId(null);
      setDeleteCommentPassword('');
      setCommentMenuOpen(null);
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setDeleteError(errorMessage);
    }
  };

  if (comments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.477 8-10 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.477-8 10-8s10 3.582 10 8z" />
        </svg>
        <p>아직 댓글이 없습니다.</p>
        <p className="text-sm mt-1">첫 번째 댓글을 작성해보세요!</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {comments.map((comment) => (
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
          
          {deleteError && (
            <div className="mb-4 p-3 bg-red-600 text-white rounded-lg flex items-center">
              <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="text-sm font-medium">{deleteError}</span>
            </div>
          )}
          
          <div className="flex justify-end space-x-3 pt-2">
            <button
              onClick={handleCancelDeleteComment}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              disabled={isProcessing}
            >
              취소
            </button>
            <button
              onClick={() => handleCommentDelete(deleteCommentId)}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center"
              disabled={isProcessing || !deleteCommentPassword.trim()}
            >
              {isProcessing ? (
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
    </>
  );
};

export default CommentList;