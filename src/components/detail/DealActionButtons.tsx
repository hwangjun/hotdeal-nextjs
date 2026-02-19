'use client';

import React from 'react';

interface DealActionButtonsProps {
  onFavorite: () => void;
  onShare: () => void;
  onPurchase: () => void;
  isFavorite: boolean;
  isLoading: boolean;
  isMobile?: boolean;
}

const DealActionButtons: React.FC<DealActionButtonsProps> = ({
  onFavorite,
  onShare,
  onPurchase,
  isFavorite,
  isLoading,
  isMobile = false
}) => {
  if (isMobile) {
    return (
      <div className="flex space-x-3">
        {/* 즐겨찾기 버튼 */}
        <button
          onClick={onFavorite}
          className="flex-shrink-0 w-12 h-12 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center hover:border-red-400 hover:bg-red-50 transition-all"
        >
          <span className="text-xl">
            {isFavorite ? '❤️' : '🤍'}
          </span>
        </button>

        {/* 공유하기 버튼 */}
        <button
          onClick={onShare}
          className="flex-shrink-0 w-12 h-12 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center hover:border-blue-400 hover:bg-blue-50 transition-all"
        >
          <span className="text-xl">📤</span>
        </button>

        {/* 구매하기 버튼 */}
        <button
          onClick={onPurchase}
          disabled={isLoading}
          className="flex-1 h-12 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-bold text-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2 shadow-lg"
        >
          {isLoading ? (
            <>
              <span className="animate-spin">⚡</span>
              <span>연결중...</span>
            </>
          ) : (
            <>
              <span>🛒</span>
              <span>구매하러 가기</span>
            </>
          )}
        </button>
      </div>
    );
  }

  // 데스크톱 버전
  return (
    <div className="space-y-3">
      {/* 상단 액션 버튼들 */}
      <div className="flex space-x-3">
        {/* 즐겨찾기 버튼 */}
        <button
          onClick={onFavorite}
          className={`flex-1 px-4 py-3 rounded-lg border-2 font-medium transition-all flex items-center justify-center space-x-2 ${
            isFavorite
              ? 'border-red-400 bg-red-50 text-red-600'
              : 'border-gray-300 text-gray-700 hover:border-red-400 hover:bg-red-50 hover:text-red-600'
          }`}
        >
          <span className="text-lg">
            {isFavorite ? '❤️' : '🤍'}
          </span>
          <span>{isFavorite ? '찜 완료' : '찜하기'}</span>
        </button>

        {/* 공유하기 버튼 */}
        <button
          onClick={onShare}
          className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-medium hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 transition-all flex items-center justify-center space-x-2"
        >
          <span className="text-lg">📤</span>
          <span>공유하기</span>
        </button>
      </div>

      {/* 구매하기 버튼 */}
      <button
        onClick={onPurchase}
        disabled={isLoading}
        className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-bold text-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-3 shadow-lg"
      >
        {isLoading ? (
          <>
            <span className="animate-spin text-xl">⚡</span>
            <span>쇼핑몰 연결중...</span>
          </>
        ) : (
          <>
            <span className="text-xl">🛒</span>
            <span>지금 구매하러 가기</span>
            <span className="text-xl">→</span>
          </>
        )}
      </button>

      {/* 추가 안내 */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <span className="text-2xl">🔒</span>
          <div>
            <h4 className="font-semibold text-green-800 mb-1">안전한 구매</h4>
            <div className="text-sm text-green-700 space-y-1">
              <p>✓ 공식 판매처 연결로 안전한 거래</p>
              <p>✓ 결제는 해당 쇼핑몰에서 진행</p>
              <p>✓ 고객센터 및 A/S 지원</p>
            </div>
          </div>
        </div>
      </div>

      {/* 가격 알림 */}
      <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
        <div className="flex items-center space-x-2">
          <span>🔔</span>
          <span className="text-sm font-medium text-yellow-800">
            가격 변동 알림을 받고 싶으시면 찜하기를 눌러주세요!
          </span>
        </div>
      </div>
    </div>
  );
};

export default DealActionButtons;