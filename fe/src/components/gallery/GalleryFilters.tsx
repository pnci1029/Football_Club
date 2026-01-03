import React, { useState, useEffect, useRef } from 'react';
import { GalleryCategory } from '../../types/gallery';

interface GalleryFiltersProps {
  selectedCategory: GalleryCategory | '';
  keyword: string;
  selectedTags: string[];
  startDate: string;
  endDate: string;
  onFilterChange: (filters: {
    category: GalleryCategory | '';
    keyword: string;
    tags: string[];
    startDate: string;
    endDate: string;
  }) => void;
}

const GalleryFilters: React.FC<GalleryFiltersProps> = ({
  selectedCategory,
  keyword,
  selectedTags,
  startDate,
  endDate,
  onFilterChange
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localKeyword, setLocalKeyword] = useState(keyword);
  const [tagInput, setTagInput] = useState('');
  const keywordTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const categories: { value: GalleryCategory | ''; label: string }[] = [
    { value: '', label: '전체' },
    { value: GalleryCategory.MATCH, label: '경기' },
    { value: GalleryCategory.TRAINING, label: '훈련' },
    { value: GalleryCategory.EVENT, label: '이벤트' },
    { value: GalleryCategory.PLAYER, label: '선수' },
    { value: GalleryCategory.FACILITY, label: '시설' },
    { value: GalleryCategory.ACHIEVEMENT, label: '성취' },
    { value: GalleryCategory.HIGHLIGHT, label: '하이라이트' },
    { value: GalleryCategory.ETC, label: '기타' }
  ];

  // 키워드 변경 디바운스
  useEffect(() => {
    if (keywordTimeoutRef.current) {
      clearTimeout(keywordTimeoutRef.current);
    }

    keywordTimeoutRef.current = setTimeout(() => {
      onFilterChange({
        category: selectedCategory,
        keyword: localKeyword,
        tags: selectedTags,
        startDate,
        endDate
      });
    }, 300);

    return () => {
      if (keywordTimeoutRef.current) {
        clearTimeout(keywordTimeoutRef.current);
      }
    };
  }, [localKeyword]);

  const handleCategoryChange = (category: GalleryCategory | '') => {
    onFilterChange({
      category,
      keyword: localKeyword,
      tags: selectedTags,
      startDate,
      endDate
    });
  };

  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    const updatedFilters = {
      category: selectedCategory,
      keyword: localKeyword,
      tags: selectedTags,
      startDate: field === 'startDate' ? value : startDate,
      endDate: field === 'endDate' ? value : endDate
    };
    onFilterChange(updatedFilters);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !selectedTags.includes(tagInput.trim())) {
      const newTags = [...selectedTags, tagInput.trim()];
      setTagInput('');
      onFilterChange({
        category: selectedCategory,
        keyword: localKeyword,
        tags: newTags,
        startDate,
        endDate
      });
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = selectedTags.filter(tag => tag !== tagToRemove);
    onFilterChange({
      category: selectedCategory,
      keyword: localKeyword,
      tags: newTags,
      startDate,
      endDate
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTag();
    }
  };

  const clearAllFilters = () => {
    setLocalKeyword('');
    setTagInput('');
    onFilterChange({
      category: '',
      keyword: '',
      tags: [],
      startDate: '',
      endDate: ''
    });
  };

  const hasActiveFilters = selectedCategory || keyword || selectedTags.length > 0 || startDate || endDate;

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
          </svg>
          필터
        </h3>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-sm text-red-600 hover:text-red-700 transition-colors"
            >
              필터 초기화
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-blue-600 hover:text-blue-700 transition-colors"
          >
            {isExpanded ? '접기' : '펼치기'}
          </button>
        </div>
      </div>

      {/* 기본 필터 - 항상 표시 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* 검색어 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">검색어</label>
          <div className="relative">
            <input
              type="text"
              value={localKeyword}
              onChange={(e) => setLocalKeyword(e.target.value)}
              placeholder="제목 또는 설명으로 검색..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* 카테고리 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">카테고리</label>
          <select
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value as GalleryCategory | '')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          >
            {categories.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 확장 필터 */}
      {isExpanded && (
        <div className="space-y-4 border-t pt-4">
          {/* 날짜 범위 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">시작 날짜</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => handleDateChange('startDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">종료 날짜</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => handleDateChange('endDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* 태그 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">태그</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="태그 입력..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={handleAddTag}
                disabled={!tagInput.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                추가
              </button>
            </div>
            
            {/* 선택된 태그들 */}
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedTags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                  >
                    #{tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryFilters;