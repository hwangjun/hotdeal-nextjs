'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { DealDetail } from '@/lib/types';

interface DealImageSectionProps {
  deal: DealDetail;
}

const DealImageSection: React.FC<DealImageSectionProps> = ({ deal }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  const handleImageClick = (index: number) => {
    setSelectedImage(index);
  };

  const handlePrevious = () => {
    setSelectedImage((prev) => (prev - 1 + deal.images.length) % deal.images.length);
  };

  const handleNext = () => {
    setSelectedImage((prev) => (prev + 1) % deal.images.length);
  };

  // 터치 스와이프 지원
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrevious();
    }
  };

  return (
    <div className="space-y-4">
      {/* 메인 이미지 */}
      <div className="relative aspect-square bg-white rounded-lg overflow-hidden shadow-lg">
        {/* 할인 배지 */}
        <div className="absolute top-4 left-4 z-10">
          <span className="bg-red-600 text-white px-3 py-1 rounded-lg text-sm font-bold shadow-md">
            -{deal.discountRate}%
          </span>
        </div>

        {/* 태그들 */}
        <div className="absolute top-4 right-4 z-10 flex flex-col space-y-1">
          {deal.tags.map((tag, index) => (
            <span 
              key={index}
              className={`px-2 py-1 rounded text-xs font-bold shadow-md ${
                tag === 'HOT' ? 'bg-red-500 text-white animate-pulse' :
                tag === 'NEW' ? 'bg-blue-500 text-white' :
                tag === '최저가' ? 'bg-green-500 text-white' :
                tag === '마감임박' ? 'bg-orange-500 text-white animate-bounce' :
                'bg-gray-500 text-white'
              }`}
            >
              {tag === 'HOT' && '🔥'} 
              {tag === 'NEW' && '✨'}
              {tag === '최저가' && '💰'}
              {tag === '마감임박' && '⏰'}
              {tag}
            </span>
          ))}
        </div>

        {/* 메인 이미지 또는 아이콘 */}
        <div 
          className="relative w-full h-full cursor-pointer"
          onClick={() => setIsZoomed(!isZoomed)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {deal.images.length > 0 ? (
            <Image
              src={deal.images[selectedImage]}
              alt={deal.title}
              fill
              className={`object-cover transition-transform duration-300 ${
                isZoomed ? 'scale-110' : 'scale-100'
              }`}
              priority
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${deal.imageGradient} flex items-center justify-center`}>
              <span className="text-8xl">{deal.imageIcon}</span>
            </div>
          )}
        </div>

        {/* 네비게이션 화살표 */}
        {deal.images.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-opacity-70 transition-all"
            >
              <span className="text-lg">‹</span>
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-opacity-70 transition-all"
            >
              <span className="text-lg">›</span>
            </button>
          </>
        )}

        {/* 이미지 인디케이터 */}
        {deal.images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {deal.images.map((_, index) => (
              <button
                key={index}
                onClick={() => handleImageClick(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === selectedImage 
                    ? 'bg-white scale-125' 
                    : 'bg-white bg-opacity-50'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* 썸네일 이미지들 */}
      {deal.images.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {deal.images.map((image, index) => (
            <button
              key={index}
              onClick={() => handleImageClick(index)}
              className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                index === selectedImage 
                  ? 'border-blue-500 shadow-lg' 
                  : 'border-gray-200'
              }`}
            >
              <Image
                src={image}
                alt={`${deal.title} ${index + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* 이미지 확대 안내 */}
      <p className="text-center text-sm text-gray-500">
        📱 이미지를 탭하여 확대/축소하거나 좌우로 스와이프하세요
      </p>
    </div>
  );
};

export default DealImageSection;