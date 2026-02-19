/**
 * 🔴 실시간 딜 업데이트 표시 컴포넌트
 * - Supabase Realtime으로 새 딜 실시간 알림
 * - 사용자 친화적인 알림 UI
 * - 브라우저 푸시 알림 지원
 */

'use client';

import { useRealtimeDeals } from '@/hooks/useRealtimeDeals';
import { useState, useEffect } from 'react';

export default function RealtimeUpdates() {
  const { newDeals, isConnected, totalNewDeals, clearNewDeals } = useRealtimeDeals();
  const [showNotification, setShowNotification] = useState(false);

  // 새 딜이 있을 때 알림 표시
  useEffect(() => {
    if (newDeals.length > 0) {
      setShowNotification(true);
      
      // 10초 후 자동 숨김
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 10000);
      
      return () => clearTimeout(timer);
    }
  }, [newDeals.length]);

  // 알림 닫기
  const handleClose = () => {
    setShowNotification(false);
    clearNewDeals();
  };

  // 새 딜이 없으면 연결 상태만 표시
  if (newDeals.length === 0) {
    return (
      <div className="fixed bottom-4 right-4 z-40">
        <div className="bg-white shadow-lg rounded-lg p-2 flex items-center space-x-2 text-xs">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
          <span className="text-gray-600">
            {isConnected ? '실시간 연결됨' : '연결 끊김'}
          </span>
        </div>
      </div>
    );
  }

  if (!showNotification) return null;

  const latestDeal = newDeals[0];

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in-from-top">
      <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white p-4 rounded-lg shadow-2xl max-w-sm border-l-4 border-yellow-300">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="text-xl animate-bounce">🔥</span>
            <span className="font-bold text-sm">새 핫딜!</span>
            <span className="bg-white text-red-500 text-xs px-2 py-1 rounded-full font-bold">
              +{totalNewDeals}
            </span>
          </div>
          <button 
            onClick={handleClose}
            className="text-white hover:text-gray-200 text-lg leading-none"
          >
            ✕
          </button>
        </div>
        
        {/* 딜 정보 */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm line-clamp-2">
            {latestDeal.title}
          </h4>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold">
                {latestDeal.price ? `${latestDeal.price.toLocaleString()}원` : '가격 확인'}
              </span>
              <span className="bg-white text-red-500 text-xs px-1 rounded">
                {latestDeal.mall_name}
              </span>
            </div>
            
            <a
              href={latestDeal.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-red-500 px-2 py-1 rounded text-xs font-bold hover:bg-gray-100 transition-colors"
            >
              보기 →
            </a>
          </div>
        </div>
        
        {/* 연결 상태 */}
        <div className="flex items-center mt-3 pt-2 border-t border-white/20">
          <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-300 animate-pulse' : 'bg-red-300'}`}></div>
          <span className="text-xs opacity-90">
            {isConnected ? '실시간 업데이트 중' : '연결 확인 중'}
          </span>
          <span className="text-xs opacity-70 ml-auto">
            방금 전
          </span>
        </div>
      </div>
      
      {/* 추가 딜들 미리보기 */}
      {newDeals.length > 1 && (
        <div className="mt-2 bg-white shadow-lg rounded p-2 text-gray-800 text-xs">
          <p className="font-medium">외 {newDeals.length - 1}개 더 업데이트됨</p>
        </div>
      )}
    </div>
  );
}

// 애니메이션 CSS 클래스 (globals.css에 추가 필요)
export const realtimeStyles = `
@keyframes slide-in-from-top {
  0% {
    transform: translateY(-100%);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

.animate-slide-in-from-top {
  animation: slide-in-from-top 0.5s ease-out;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
`;