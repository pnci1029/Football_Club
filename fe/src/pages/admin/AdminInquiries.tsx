import React, { useState, useEffect } from 'react';
import { adminInquiryService, InquiryDto, InquirySearchRequest, UpdateInquiryStatusRequest } from '../../services/adminInquiryService';
import { Button, Card } from '../../components/common';

interface StatusUpdateFormProps {
  currentStatus: string;
  onStatusUpdate: (status: string, note: string) => void;
  onCancel: () => void;
}

const StatusUpdateForm: React.FC<StatusUpdateFormProps> = ({ currentStatus, onStatusUpdate, onCancel }) => {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [adminNote, setAdminNote] = useState('');

  const statusOptions = [
    { value: 'PENDING', label: '대기중', color: 'text-yellow-600' },
    { value: 'CONTACTED', label: '연락완료', color: 'text-blue-600' },
    { value: 'COMPLETED', label: '서비스 생성완료', color: 'text-green-600' },
    { value: 'CANCELED', label: '취소/거절', color: 'text-red-600' }
  ];

  const handleSubmit = () => {
    if (selectedStatus === currentStatus && !adminNote.trim()) {
      alert('변경사항이 없습니다.');
      return;
    }
    onStatusUpdate(selectedStatus, adminNote.trim());
  };

  return (
    <div className="mt-6 border-t pt-4">
      <h4 className="text-sm font-medium text-gray-900 mb-3">상태 변경</h4>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            새 상태
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            관리자 메모 (선택사항)
          </label>
          <textarea
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
            placeholder="처리 내용이나 특이사항을 입력하세요..."
            rows={3}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div className="flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={onCancel}
          >
            닫기
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
          >
            상태 변경
          </Button>
        </div>
      </div>
    </div>
  );
};

const AdminInquiries: React.FC = () => {
  const [inquiries, setInquiries] = useState<InquiryDto[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    contacted: 0,
    completed: 0,
    canceled: 0
  });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchForm, setSearchForm] = useState<InquirySearchRequest>({});
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryDto | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const loadInquiries = async () => {
    try {
      setLoading(true);
      const response = selectedStatus === 'all' 
        ? await adminInquiryService.getAllInquiries(currentPage, 20, searchForm)
        : await adminInquiryService.getInquiriesByStatus(selectedStatus as any, currentPage, 20);
      
      if (response.success) {
        setInquiries(response.data.content);
        setTotalPages(response.data.totalPages);
      }
    } catch (error) {
      console.error('문의 목록 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await adminInquiryService.getInquiryStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('문의 통계 로드 실패:', error);
    }
  };

  useEffect(() => {
    loadInquiries();
  }, [currentPage, selectedStatus, searchForm]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    loadStats();
  }, []);

  const handleStatusChange = async (inquiryId: number, newStatus: string, adminNote?: string) => {
    try {
      const request: UpdateInquiryStatusRequest = {
        status: newStatus as any,
        adminNote
      };
      
      const response = await adminInquiryService.updateInquiryStatus(inquiryId, request);
      if (response.success) {
        loadInquiries();
        loadStats();
        setShowDetailModal(false);
      }
    } catch (error) {
      console.error('상태 변경 실패:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONTACTED: 'bg-blue-100 text-blue-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELED: 'bg-gray-100 text-gray-800'
    };
    
    const labels = {
      PENDING: '대기중',
      CONTACTED: '연락완료',
      COMPLETED: '서비스 생성완료',
      CANCELED: '취소/거절'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[status as keyof typeof badges]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">문의 관리</h1>
        <p className="text-gray-600">무료 체험 신청 및 문의 관리</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card className="p-4">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-500">전체 문의</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          <div className="text-sm text-gray-500">대기중</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-blue-600">{stats.contacted}</div>
          <div className="text-sm text-gray-500">연락완료</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          <div className="text-sm text-gray-500">서비스 생성완료</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-gray-600">{stats.canceled}</div>
          <div className="text-sm text-gray-500">취소/거절</div>
        </Card>
      </div>

      {/* 필터 */}
      <Card className="p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">상태</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="all">전체</option>
              <option value="PENDING">대기중</option>
              <option value="CONTACTED">연락완료</option>
              <option value="COMPLETED">서비스 생성완료</option>
              <option value="CANCELED">취소/거절</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
            <input
              type="text"
              placeholder="이름 검색"
              value={searchForm.name || ''}
              onChange={(e) => setSearchForm(prev => ({ ...prev, name: e.target.value }))}
              className="border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">팀명</label>
            <input
              type="text"
              placeholder="팀명 검색"
              value={searchForm.teamName || ''}
              onChange={(e) => setSearchForm(prev => ({ ...prev, teamName: e.target.value }))}
              className="border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
        </div>
      </Card>

      {/* 문의 목록 */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="text-gray-500">로딩 중...</div>
          </div>
        ) : inquiries.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-500">문의가 없습니다</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    신청자
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    연락처
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    팀명
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    신청일시
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {inquiries.map((inquiry) => (
                  <tr key={inquiry.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{inquiry.name}</div>
                        <div className="text-sm text-gray-500">{inquiry.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {inquiry.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {inquiry.teamName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(inquiry.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(inquiry.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedInquiry(inquiry);
                          setShowDetailModal(true);
                        }}
                      >
                        상세보기
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="mt-4 flex justify-center">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              disabled={currentPage === 0}
              onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
            >
              이전
            </Button>
            <span className="px-3 py-2 text-sm">
              {currentPage + 1} / {totalPages}
            </span>
            <Button
              variant="outline"
              disabled={currentPage >= totalPages - 1}
              onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
            >
              다음
            </Button>
          </div>
        </div>
      )}

      {/* 상세보기 모달 */}
      {showDetailModal && selectedInquiry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">문의 상세정보</h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">이름</label>
                  <div className="mt-1 text-sm text-gray-900">{selectedInquiry.name}</div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">이메일</label>
                  <div className="mt-1 text-sm text-gray-900">{selectedInquiry.email}</div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">연락처</label>
                  <div className="mt-1 text-sm text-gray-900">{selectedInquiry.phone}</div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">팀명</label>
                  <div className="mt-1 text-sm text-gray-900">{selectedInquiry.teamName}</div>
                </div>
                
                {selectedInquiry.message && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">문의내용</label>
                    <div className="mt-1 text-sm text-gray-900 p-3 bg-gray-50 rounded-md">
                      {selectedInquiry.message}
                    </div>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">현재 상태</label>
                  <div className="mt-1">{getStatusBadge(selectedInquiry.status)}</div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">신청일시</label>
                  <div className="mt-1 text-sm text-gray-900">{formatDate(selectedInquiry.createdAt)}</div>
                </div>
                
                {selectedInquiry.processedAt && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">처리일시</label>
                    <div className="mt-1 text-sm text-gray-900">{formatDate(selectedInquiry.processedAt)}</div>
                  </div>
                )}
                
                {selectedInquiry.adminNote && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">관리자 메모</label>
                    <div className="mt-1 text-sm text-gray-900 p-3 bg-yellow-50 rounded-md">
                      {selectedInquiry.adminNote}
                    </div>
                  </div>
                )}
              </div>
              
              <StatusUpdateForm 
                currentStatus={selectedInquiry.status}
                onStatusUpdate={(status, note) => handleStatusChange(selectedInquiry.id, status, note)}
                onCancel={() => setShowDetailModal(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInquiries;