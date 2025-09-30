import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTeam } from '../contexts/TeamContext';
import { communityApi } from '../api/modules/community';
import { communityAuthManager } from '../utils/communityAuth';
import { getErrorMessage, NetworkError } from '../utils/errorHandler';

const CommunityWrite: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentTeam } = useTeam();
  const editPostId = searchParams.get('edit');
  const isEditing = !!editPostId;
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    authorName: '',
    authorEmail: '',
    authorPhone: '',
    authorPassword: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadPostForEdit = async () => {
      if (!isEditing || !editPostId || !currentTeam) {
        return;
      }
      
      try {
        setIsLoading(true);
        
        // 임시 권한 확인
        const tempAuth = communityAuthManager.getTemporaryAuth(
          'post', 
          parseInt(editPostId), 
          parseInt(currentTeam.id)
        );
        
        if (!tempAuth || !tempAuth.isOwner || !tempAuth.canEdit) {
          setError('수정 권한이 없거나 만료되었습니다. 다시 시도해주세요.');
          navigate('/community');
          return;
        }
        
        // 게시글 로드
        const post = await communityApi.getPost(parseInt(editPostId), parseInt(currentTeam.id));
        setFormData({
          title: post.title,
          content: post.content,
          authorName: post.authorName,
          authorEmail: post.authorEmail || '',
          authorPhone: post.authorPhone || '',
          authorPassword: '' // 보안상 비밀번호는 초기화
        });
      } catch (err) {
        const errorMessage = getErrorMessage(err as NetworkError);
        setError(errorMessage);
        navigate('/community');
      } finally {
        setIsLoading(false);
      }
    };

    loadPostForEdit();
  }, [isEditing, editPostId, currentTeam, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const requiredFields = [formData.title.trim(), formData.content.trim(), formData.authorName.trim()];
    const passwordToUse = formData.authorPassword.trim();
    
    if (!requiredFields.every(field => field) || !passwordToUse) {
      setError('제목, 내용, 작성자명, 비밀번호는 필수 입력 항목입니다.');
      return;
    }

    setIsSubmitting(true);

    if (!currentTeam) {
      setError('팀 정보를 찾을 수 없습니다.');
      return;
    }

    try {
      if (isEditing && editPostId) {
        await communityApi.updatePost(parseInt(editPostId), {
          title: formData.title.trim(),
          content: formData.content.trim(),
          authorPassword: passwordToUse,
          teamId: parseInt(currentTeam.id)
        });
        
        // 수정 완료 후 임시 권한 정리
        communityAuthManager.clearTemporaryAuth('post', parseInt(editPostId), parseInt(currentTeam.id));
        
        navigate(`/community/${editPostId}`, { 
          state: { message: '게시글이 성공적으로 수정되었습니다.' }
        });
      } else {
        const newPost = await communityApi.createPost({
          title: formData.title.trim(),
          content: formData.content.trim(),
          authorName: formData.authorName.trim(),
          authorEmail: formData.authorEmail.trim() || undefined,
          authorPhone: formData.authorPhone.trim() || undefined,
          authorPassword: passwordToUse,
          teamId: parseInt(currentTeam.id)
        });
        
        navigate('/community', { 
          state: { message: '게시글이 성공적으로 작성되었습니다.' }
        });
      }
    } catch (err) {
      const errorMessage = getErrorMessage(err as NetworkError);
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    // 수정 모드인 경우 임시 권한 정리
    if (isEditing && editPostId && currentTeam) {
      communityAuthManager.clearTemporaryAuth('post', parseInt(editPostId), parseInt(currentTeam.id));
    }
    navigate('/community');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{isEditing ? '글 수정' : '글쓰기'}</h1>
          <p className="text-gray-600 mt-2">{isEditing ? '게시글을 수정해주세요.' : '경기 관련 문의나 메시지를 남겨주세요.'}</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              제목 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="제목을 입력해주세요"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              maxLength={200}
              required
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              내용 <span className="text-red-500">*</span>
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="내용을 입력해주세요"
              rows={12}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
              maxLength={10000}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="authorName" className="block text-sm font-medium text-gray-700 mb-2">
                작성자명 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="authorName"
                name="authorName"
                value={formData.authorName}
                onChange={handleChange}
                placeholder="이름을 입력해주세요"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                maxLength={50}
                required
                disabled={isEditing}
              />
            </div>

            <div>
              <label htmlFor="authorEmail" className="block text-sm font-medium text-gray-700 mb-2">
                이메일
              </label>
              <input
                type="email"
                id="authorEmail"
                name="authorEmail"
                value={formData.authorEmail}
                onChange={handleChange}
                placeholder="이메일을 입력해주세요"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                maxLength={100}
                disabled={isEditing}
              />
            </div>

            <div>
              <label htmlFor="authorPhone" className="block text-sm font-medium text-gray-700 mb-2">
                전화번호
              </label>
              <input
                type="tel"
                id="authorPhone"
                name="authorPhone"
                value={formData.authorPhone}
                onChange={handleChange}
                placeholder="전화번호를 입력해주세요"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                maxLength={20}
                disabled={isEditing}
              />
            </div>
            
            <div>
              <label htmlFor="authorPassword" className="block text-sm font-medium text-gray-700 mb-2">
                비밀번호 <span className="text-red-500">*</span>
                <span className="text-xs text-gray-500 block">
                  {isEditing ? '게시글 수정을 위해 비밀번호를 입력해주세요' : '게시글 수정/삭제 시 필요합니다'}
                </span>
              </label>
              <input
                type="password"
                id="authorPassword"
                name="authorPassword"
                value={formData.authorPassword}
                onChange={handleChange}
                placeholder={isEditing ? "수정을 위한 비밀번호를 입력해주세요" : "비밀번호를 입력해주세요"}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                maxLength={50}
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
              disabled={isSubmitting}
            >
              취소
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting || isLoading}
            >
              {isSubmitting ? (isEditing ? '수정 중...' : '작성 중...') : (isEditing ? '수정 완료' : '작성 완료')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CommunityWrite;