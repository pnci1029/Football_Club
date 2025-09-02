import React, { useState, useRef } from 'react';
import { ImageService } from '../../services/imageService';
import LoadingSpinner from './LoadingSpinner';

interface ImageUploadProps {
  value?: string;
  onChange: (imageUrl: string) => void;
  onError?: (error: string) => void;
  className?: string;
  placeholder?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  value = '',
  onChange,
  onError,
  className = '',
  placeholder = '이미지를 업로드하세요'
}) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>(value);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    setUploading(true);
    try {
      // 미리보기 생성
      const preview = ImageService.createPreviewUrl(file);
      setPreviewUrl(preview);

      // 파일 업로드
      const result = await ImageService.uploadImage(file);
      
      // 미리보기 URL 해제
      ImageService.revokePreviewUrl(preview);
      
      // 업로드된 이미지 URL 설정
      setPreviewUrl(result.url);
      onChange(result.url);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '업로드에 실패했습니다.';
      onError?.(errorMessage);
      setPreviewUrl(value); // 원래 값으로 복원
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFileSelect(file);
    } else {
      onError?.('이미지 파일만 업로드 가능합니다.');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    setPreviewUrl('');
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* 숨겨진 파일 입력 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
      />

      {/* 업로드 영역 */}
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200
          ${dragOver 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }
          ${previewUrl ? 'aspect-square' : 'aspect-video min-h-[120px]'}
        `}
      >
        {uploading ? (
          // 업로드 중 표시
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-lg">
            <div className="text-center">
              <LoadingSpinner size="md" />
              <p className="mt-2 text-sm text-gray-600">업로드 중...</p>
            </div>
          </div>
        ) : previewUrl ? (
          // 이미지 미리보기
          <div className="relative h-full group">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-full object-cover rounded-lg"
            />
            {/* 제거 버튼 */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
              }}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
            >
              ×
            </button>
            {/* 변경 오버레이 */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center">
              <p className="text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                클릭하여 변경
              </p>
            </div>
          </div>
        ) : (
          // 업로드 안내
          <div className="flex flex-col items-center justify-center h-full py-6 text-center">
            <svg
              className="w-10 h-10 text-gray-400 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-sm text-gray-600 font-medium">{placeholder}</p>
            <p className="text-xs text-gray-500 mt-1">
              또는 파일을 드래그하여 업로드
            </p>
            <p className="text-xs text-gray-400 mt-1">
              JPG, PNG, GIF, WebP (최대 10MB)
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;