import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useHeroSlides } from '../../hooks/useHeroSlides';
import { HeroSlide, CreateHeroSlideRequest, GRADIENT_OPTIONS } from '../../types/hero';
import { HeroService } from '../../services/heroService';
import { Button, Card, LoadingSpinner, Modal } from '../../components/common';
import ImageUpload from '../../components/common/ImageUpload';
import { useToast } from '../../components/Toast';
import ConfirmDeleteModal from '../../components/admin/ConfirmDeleteModal';

const AdminHeroSlides: React.FC = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const teamIdNumber = Number(teamId);
  const { slides, loading, error, refetch } = useHeroSlides(teamIdNumber, false);
  const { success, error: showError, ToastContainer } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingSlide, setDeletingSlide] = useState<HeroSlide | null>(null);
  const [formData, setFormData] = useState<CreateHeroSlideRequest>({
    title: '',
    subtitle: '',
    backgroundImage: '',
    gradientColor: 'slate',
    isActive: true,
    sortOrder: 0
  });
  const [submitting, setSubmitting] = useState(false);

  const gradientNames = {
    slate: '슬레이트 (회색)',
    blue: '블루',
    green: '그린',
    purple: '퍼플',
    red: '레드'
  };

  const handleCreate = () => {
    setEditingSlide(null);
    setFormData({
      title: '',
      subtitle: '',
      backgroundImage: '',
      gradientColor: 'slate',
      isActive: true,
      sortOrder: slides.length
    });
    setShowModal(true);
  };

  const handleEdit = (slide: HeroSlide) => {
    setEditingSlide(slide);
    setFormData({
      title: slide.title,
      subtitle: slide.subtitle,
      backgroundImage: slide.backgroundImage || '',
      gradientColor: slide.gradientColor,
      isActive: slide.isActive,
      sortOrder: slide.sortOrder
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (slides.length >= 5 && !editingSlide) {
      showError('최대 5개의 슬라이드만 생성할 수 있습니다.');
      return;
    }

    setSubmitting(true);
    try {
      if (editingSlide) {
        await HeroService.updateSlide(editingSlide.id, formData);
        success('슬라이드가 수정되었습니다.');
      } else {
        await HeroService.createSlide(teamIdNumber, formData);
        success('슬라이드가 생성되었습니다.');
      }
      
      await refetch();
      setShowModal(false);
    } catch (err) {
      console.error('슬라이드 저장 실패:', err);
      showError('슬라이드 저장에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (slide: HeroSlide) => {
    if (slides.length <= 1) {
      showError('최소 1개의 슬라이드는 유지해야 합니다.');
      return;
    }
    setDeletingSlide(slide);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingSlide) return;

    try {
      await HeroService.deleteSlide(deletingSlide.id);
      await refetch();
      success('슬라이드가 삭제되었습니다.');
      setShowDeleteModal(false);
      setDeletingSlide(null);
    } catch (err) {
      console.error('슬라이드 삭제 실패:', err);
      showError('슬라이드 삭제에 실패했습니다.');
    }
  };

  const handleToggleActive = async (slide: HeroSlide) => {
    try {
      await HeroService.updateSlide(slide.id, {
        isActive: !slide.isActive
      });
      await refetch();
      success(`슬라이드가 ${!slide.isActive ? '활성화' : '비활성화'}되었습니다.`);
    } catch (err) {
      console.error('슬라이드 상태 변경 실패:', err);
      showError('슬라이드 상태 변경에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">히어로 슬라이드 관리</h1>
          <p className="text-gray-600">메인 화면의 히어로 슬라이드를 관리합니다 (최소 1개, 최대 5개)</p>
        </div>
        <Button 
          onClick={handleCreate}
          disabled={slides.length >= 5}
          className={slides.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''}
        >
          슬라이드 추가 ({slides.length}/5)
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid gap-4">
        {slides.map((slide, _index) => (
          <Card key={slide.id} className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {slide.title}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    slide.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {slide.isActive ? '활성' : '비활성'}
                  </span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                    순서: {slide.sortOrder + 1}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-3">{slide.subtitle}</p>
                
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>그라데이션: {gradientNames[slide.gradientColor]}</span>
                  {slide.backgroundImage && (
                    <span>배경 이미지: 설정됨</span>
                  )}
                </div>

                {/* 미리보기 */}
                <div className={`mt-4 h-24 rounded-lg bg-gradient-to-r ${GRADIENT_OPTIONS[slide.gradientColor]} relative overflow-hidden`}>
                  {slide.backgroundImage && (
                    <div 
                      className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                      style={{ backgroundImage: `url(${slide.backgroundImage})` }}
                    />
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                    <div className="text-white text-center">
                      <h4 className="font-bold text-sm">{slide.title}</h4>
                      <p className="text-xs opacity-90">{slide.subtitle}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleActive(slide)}
                >
                  {slide.isActive ? '비활성화' : '활성화'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(slide)}
                >
                  수정
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteClick(slide)}
                  className="text-red-600 hover:text-red-700"
                  disabled={slides.length <= 1}
                >
                  삭제
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* 슬라이드 생성/수정 모달 */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingSlide ? '슬라이드 수정' : '슬라이드 추가'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              제목 *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
              maxLength={100}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              부제목 *
            </label>
            <textarea
              value={formData.subtitle}
              onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={3}
              required
              maxLength={200}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              그라데이션 색상
            </label>
            <select
              value={formData.gradientColor}
              onChange={(e) => setFormData({...formData, gradientColor: e.target.value as any})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {Object.entries(gradientNames).map(([value, name]) => (
                <option key={value} value={value}>{name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              배경 이미지 (선택)
            </label>
            <ImageUpload
              value={formData.backgroundImage}
              onChange={(url) => setFormData({...formData, backgroundImage: url})}
              placeholder="배경 이미지를 업로드하세요"
            />
            <p className="text-xs text-gray-500 mt-1">
              배경 이미지가 있으면 그라데이션 대신 표시됩니다
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              정렬 순서
            </label>
            <input
              type="number"
              min={0}
              max={4}
              value={formData.sortOrder}
              onChange={(e) => setFormData({...formData, sortOrder: parseInt(e.target.value) || 0})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              작은 숫자가 먼저 표시됩니다
            </p>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
              className="mr-2"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
              활성 상태
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowModal(false)}
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={submitting}
            >
              {submitting ? '저장 중...' : '저장'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* 삭제 확인 모달 */}
      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeletingSlide(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="슬라이드 삭제"
        itemName={deletingSlide?.title || ''}
        itemType="슬라이드"
      />

      <ToastContainer />
    </div>
  );
};

export default AdminHeroSlides;