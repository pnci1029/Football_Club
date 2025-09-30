import React, { useState } from 'react';
import { getErrorMessage, NetworkError } from '../../utils/errorHandler';

interface CommentFormProps {
  onSubmit: (comment: { content: string; authorName: string; authorPassword: string }) => Promise<void>;
  isSubmitting: boolean;
}

const CommentForm: React.FC<CommentFormProps> = ({ onSubmit, isSubmitting }) => {
  const [commentForm, setCommentForm] = useState({
    content: '',
    authorName: '',
    authorPassword: ''
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCommentForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const requiredFields = [commentForm.content.trim(), commentForm.authorName.trim(), commentForm.authorPassword.trim()];
    if (!requiredFields.every(field => field)) {
      setError('댓글 내용, 작성자명, 비밀번호는 필수 입력 항목입니다.');
      return;
    }

    try {
      await onSubmit({
        content: commentForm.content.trim(),
        authorName: commentForm.authorName.trim(),
        authorPassword: commentForm.authorPassword.trim()
      });
      
      setCommentForm({
        content: '',
        authorName: '',
        authorPassword: ''
      });
    } catch (err) {
      const errorMessage = getErrorMessage(err as NetworkError);
      setError(errorMessage);
    }
  };

  return (
    <div className="mt-8 border-t border-gray-200 pt-6">
      <h4 className="text-md font-semibold text-gray-900 mb-4">댓글 작성</h4>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
            댓글 내용 <span className="text-red-500">*</span>
          </label>
          <textarea
            id="content"
            name="content"
            value={commentForm.content}
            onChange={handleChange}
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
              onChange={handleChange}
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
              onChange={handleChange}
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
            disabled={isSubmitting}
          >
            {isSubmitting ? '작성 중...' : '댓글 작성'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CommentForm;