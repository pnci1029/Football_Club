import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Team {
  id: number;
  name: string;
  code: string;
}

interface CreateNoticeForm {
  title: string;
  content: string;
  authorName: string;
  authorEmail: string;
  authorPhone: string;
  authorPassword: string;
  teamId: number | null;
}

const AdminNoticeCreate: React.FC = () => {
  const navigate = useNavigate();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<CreateNoticeForm>({
    title: '',
    content: '',
    authorName: '관리자',
    authorEmail: '',
    authorPhone: '',
    authorPassword: '',
    teamId: null,
  });

  // 팀 목록 로드
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await fetch('/v1/admin/teams');
        const data = await response.json();
        if (data.success) {
          setTeams(data.data);
          if (data.data.length > 0) {
            setForm(prev => ({ ...prev, teamId: data.data[0].id }));
          }
        }
      } catch (error) {
        console.error('팀 목록 로딩 실패:', error);
      }
    };

    fetchTeams();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'teamId' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.teamId) {
      alert('팀을 선택해주세요.');
      return;
    }

    if (!form.title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }

    if (!form.content.trim()) {
      alert('내용을 입력해주세요.');
      return;
    }

    if (!form.authorPassword) {
      alert('비밀번호를 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/v1/notices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: form.title,
          content: form.content,
          authorName: form.authorName,
          authorEmail: form.authorEmail || null,
          authorPhone: form.authorPhone || null,
          authorPassword: form.authorPassword,
          teamId: form.teamId,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        alert('공지사항이 성공적으로 작성되었습니다.');
        navigate('/admin/notices');
      } else {
        alert(data.message || '공지사항 작성에 실패했습니다.');
      }
    } catch (error) {
      console.error('공지사항 작성 실패:', error);
      alert('공지사항 작성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="border-b border-gray-200 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">공지사항 작성</h1>
            <p className="text-gray-600 mt-2">새로운 공지사항을 작성합니다</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/admin/notices')}
            className="text-gray-500 hover:text-gray-700"
          >
            ← 목록으로 돌아가기
          </button>
        </div>
      </div>

      {/* 작성 폼 */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 팀 선택 */}
          <div>
            <label htmlFor="teamId" className="block text-sm font-medium text-gray-700 mb-1">
              대상 팀 <span className="text-red-500">*</span>
            </label>
            <select
              id="teamId"
              name="teamId"
              value={form.teamId || ''}
              onChange={handleInputChange}
              required
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">팀을 선택하세요</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name} ({team.code})
                </option>
              ))}
            </select>
          </div>

          {/* 제목 */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              제목 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={form.title}
              onChange={handleInputChange}
              required
              maxLength={200}
              placeholder="공지사항 제목을 입력하세요"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-sm text-gray-500 mt-1">{form.title.length}/200</p>
          </div>

          {/* 내용 */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
              내용 <span className="text-red-500">*</span>
            </label>
            <textarea
              id="content"
              name="content"
              value={form.content}
              onChange={handleInputChange}
              required
              maxLength={10000}
              rows={10}
              placeholder="공지사항 내용을 입력하세요"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-sm text-gray-500 mt-1">{form.content.length}/10,000</p>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">작성자 정보</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 작성자명 */}
              <div>
                <label htmlFor="authorName" className="block text-sm font-medium text-gray-700 mb-1">
                  작성자명 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="authorName"
                  name="authorName"
                  value={form.authorName}
                  onChange={handleInputChange}
                  required
                  maxLength={50}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* 비밀번호 */}
              <div>
                <label htmlFor="authorPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  비밀번호 <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  id="authorPassword"
                  name="authorPassword"
                  value={form.authorPassword}
                  onChange={handleInputChange}
                  required
                  placeholder="수정/삭제시 사용할 비밀번호"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-sm text-gray-500 mt-1">공지사항 수정/삭제시 필요합니다</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {/* 이메일 */}
              <div>
                <label htmlFor="authorEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  이메일 (선택)
                </label>
                <input
                  type="email"
                  id="authorEmail"
                  name="authorEmail"
                  value={form.authorEmail}
                  onChange={handleInputChange}
                  maxLength={100}
                  placeholder="admin@example.com"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* 연락처 */}
              <div>
                <label htmlFor="authorPhone" className="block text-sm font-medium text-gray-700 mb-1">
                  연락처 (선택)
                </label>
                <input
                  type="tel"
                  id="authorPhone"
                  name="authorPhone"
                  value={form.authorPhone}
                  onChange={handleInputChange}
                  maxLength={20}
                  placeholder="010-1234-5678"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* 버튼 */}
          <div className="border-t border-gray-200 pt-6 flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/admin/notices')}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '작성 중...' : '공지사항 작성'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminNoticeCreate;