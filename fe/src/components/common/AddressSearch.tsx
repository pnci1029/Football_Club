import React, { useState } from 'react';
import DaumPostcode from 'react-daum-postcode';

interface Address {
  roadAddress: string;      // 도로명 주소
  jibunAddress: string;     // 지번 주소
  zonecode: string;         // 우편번호
  sido: string;             // 시도
  sigungu: string;          // 시군구
  bname: string;            // 법정동/법정리명
}

interface AddressSearchProps {
  onSelect: (address: Address) => void;
  onClose: () => void;
  isOpen: boolean;
  placeholder?: string;
  className?: string;
}

const AddressSearch: React.FC<AddressSearchProps> = ({
  onSelect,
  onClose,
  isOpen,
  placeholder = "주소를 검색하세요",
  className = ""
}) => {
  const [showPostcode, setShowPostcode] = useState(false);

  const handleComplete = (data: any) => {
    const address: Address = {
      roadAddress: data.roadAddress || data.autoRoadAddress,
      jibunAddress: data.jibunAddress || data.autoJibunAddress,
      zonecode: data.zonecode,
      sido: data.sido,
      sigungu: data.sigungu,
      bname: data.bname
    };

    onSelect(address);
    setShowPostcode(false);
  };

  const handleOpenPostcode = () => {
    setShowPostcode(true);
  };

  const handleClosePostcode = () => {
    setShowPostcode(false);
    onClose();
  };

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handleOpenPostcode}
        className="w-full px-3 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:bg-gray-50"
      >
        <span className="text-gray-500">{placeholder}</span>
      </button>

      {showPostcode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">주소 검색</h3>
              <button
                onClick={handleClosePostcode}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <DaumPostcode
                onComplete={handleComplete}
                onClose={handleClosePostcode}
                style={{ width: '100%', height: '400px' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressSearch;