'use client';

import { useState } from 'react';

interface DealImageProps {
  imageUrl: string;
  title: string;
  mallName: string;
  mallLogo: string;
  className?: string;
}

export default function DealImage({ imageUrl, title, mallName, mallLogo, className = "" }: DealImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // placeholder URL인지 확인 (안전성 체크)
  const isPlaceholderUrl = imageUrl && (imageUrl.includes('placeholder') || imageUrl.includes('via.placeholder'));

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  // 실제 이미지가 있는 경우
  if (!hasError && !isPlaceholderUrl && imageUrl && imageUrl.trim() !== '') {
    return (
      <div className={`relative overflow-hidden bg-gray-100 ${className}`}>
        {/* 로딩 상태 */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="flex flex-col items-center">
              <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              <div className="text-xs text-gray-500 mt-2">이미지 로딩중...</div>
            </div>
          </div>
        )}
        
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover transition-opacity duration-300"
          style={{ opacity: isLoading ? 0 : 1 }}
          onError={handleError}
          onLoad={handleLoad}
        />
        
        {/* 실제 이미지 위 오버레이 - 로딩 완료 후만 표시 */}
        {!isLoading && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
            <div className="text-white text-center">
              <div className="text-2xl mb-1">{mallLogo}</div>
              <div className="text-xs font-medium">{mallName}</div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 이미지가 없는 경우 - 전용 노이미지 디자인
  return (
    <div className={`relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-dashed border-gray-300 ${className}`}>
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center p-4">
          {/* 노이미지 아이콘 */}
          <div className="text-6xl mb-2 opacity-50">🖼️</div>
          
          {/* 쇼핑몰 정보 */}
          <div className="text-3xl mb-2">{mallLogo}</div>
          <div className="text-sm font-medium text-gray-700 mb-1">{mallName}</div>
          
          {/* 노이미지 텍스트 */}
          <div className="text-xs text-gray-500 bg-white px-3 py-1 rounded-full border">
            📷 이미지 없음
          </div>
        </div>
      </div>
      
      {/* 노이미지 패턴 배경 */}
      <div className="absolute inset-0 opacity-5">
        <div className="w-full h-full" style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3e%3cdefs%3e%3cpattern id='a' patternUnits='userSpaceOnUse' width='40' height='40' patternTransform='scale(0.5)'%3e%3crect x='0' y='0' width='100%25' height='100%25' fill='none'/%3e%3cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23000000' fill-opacity='0.1'/%3e%3c/pattern%3e%3c/defs%3e%3crect fill='url(%23a)' width='100%25' height='100%25'/%3e%3c/svg%3e")`,
          backgroundSize: '20px 20px'
        }}></div>
      </div>
    </div>
  );
}