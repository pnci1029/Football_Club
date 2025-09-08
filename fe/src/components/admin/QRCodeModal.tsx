import React, { useEffect, useState, useCallback } from 'react';
import QRCode from 'qrcode';
import Modal from '../common/Modal';
import { Button } from '../common';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamName: string;
  teamCode: string;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  teamName,
  teamCode
}) => {
  const [qrCodeDataURL, setQrCodeDataURL] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const url = `https://${teamCode}.football-club.kr`;

  const generateQRCode = useCallback(async () => {
    try {
      setLoading(true);
      const qrDataURL = await QRCode.toDataURL(url, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
      setQrCodeDataURL(qrDataURL);
    } catch (error) {
      console.error('QR Code generation failed:', error);
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    if (isOpen && teamCode) {
      generateQRCode();
    }
  }, [isOpen, teamCode, generateQRCode]);

  const downloadQRCode = () => {
    if (!qrCodeDataURL) return;

    const link = document.createElement('a');
    link.download = `${teamCode}_QR.png`;
    link.href = qrCodeDataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      alert('URL이 클립보드에 복사되었습니다!');
    } catch (error) {
      // 클립보드 복사 실패 시 폴백
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('URL이 클립보드에 복사되었습니다!');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${teamName} QR 코드`}
      size="sm"
    >
      <div className="space-y-4 text-center">
        {/* QR 코드 표시 */}
        <div className="flex justify-center">
          {loading ? (
            <div className="w-64 h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <img
                src={qrCodeDataURL}
                alt={`${teamName} QR Code`}
                className="w-64 h-64"
              />
            </div>
          )}
        </div>

        {/* URL 표시 */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">연결 주소:</p>
          <p className="font-mono text-sm text-blue-600 break-all">{url}</p>
        </div>

        {/* 설명 */}
        <div className="text-left bg-blue-50 p-3 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">📱 사용 방법</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• 스마트폰 카메라로 QR 코드를 스캔하세요</li>
            <li>• 자동으로 {teamName} 사이트로 이동됩니다</li>
            <li>• QR 코드를 인쇄하여 오프라인에서도 활용하세요</li>
          </ul>
        </div>

        {/* 버튼들 */}
        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={copyToClipboard}
            className="flex-1 text-gray-600"
          >
            🔗 URL 복사
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={downloadQRCode}
            disabled={loading}
            className="flex-1 text-blue-600"
          >
            💾 다운로드
          </Button>
        </div>

        <div className="pt-2">
          <Button
            type="button"
            onClick={onClose}
            className="w-full bg-gray-600 hover:bg-gray-700"
          >
            닫기
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default QRCodeModal;