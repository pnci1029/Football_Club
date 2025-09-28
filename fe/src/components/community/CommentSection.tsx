import React, { useState } from 'react';
import type { CommunityComment } from '../../api/types';
import CommentList from './CommentList';
import CommentForm from './CommentForm';

interface CommentSectionProps {
  comments: CommunityComment[];
  onCreateComment: (comment: { content: string; authorName: string; authorPassword: string }) => Promise<void>;
  onDeleteComment: (commentId: number, password: string) => Promise<void>;
  onSuccess: (message: string) => void;
}

const CommentSection: React.FC<CommentSectionProps> = ({ 
  comments, 
  onCreateComment, 
  onDeleteComment,
  onSuccess 
}) => {
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isProcessingComment, setIsProcessingComment] = useState(false);

  const handleCommentSubmit = async (comment: { content: string; authorName: string; authorPassword: string }) => {
    setIsSubmittingComment(true);
    try {
      await onCreateComment(comment);
      onSuccess('댓글이 성공적으로 작성되었습니다.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleCommentDelete = async (commentId: number, password: string) => {
    setIsProcessingComment(true);
    try {
      await onDeleteComment(commentId, password);
      onSuccess('댓글이 성공적으로 삭제되었습니다.');
    } finally {
      setIsProcessingComment(false);
    }
  };

  return (
    <div className="border-t border-gray-200">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          댓글 ({comments.length})
        </h3>
        
        <CommentList 
          comments={comments}
          onDeleteComment={handleCommentDelete}
          isProcessing={isProcessingComment}
        />

        <CommentForm 
          onSubmit={handleCommentSubmit}
          isSubmitting={isSubmittingComment}
        />
      </div>
    </div>
  );
};

export default CommentSection;