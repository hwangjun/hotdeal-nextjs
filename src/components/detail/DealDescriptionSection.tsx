'use client';

import React, { useState } from 'react';
import { DealDetail } from '@/lib/types';

interface DealDescriptionSectionProps {
  deal: DealDetail;
}

const DealDescriptionSection: React.FC<DealDescriptionSectionProps> = ({ deal }) => {
  const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'reviews'>('description');

  const tabs = [
    { id: 'description', label: '상품설명', emoji: '📝' },
    { id: 'specifications', label: '상세정보', emoji: '📊' },
    { id: 'reviews', label: '리뷰', emoji: '💬' },
  ] as const;

  const generateReviews = () => {
    const reviews = [
      {
        id: 1,
        author: '구매고객1',
        rating: 5,
        date: '2024-02-15',
        content: '가격 대비 정말 만족스럽습니다! 품질도 좋고 배송도 빨랐어요. 추천합니다.',
        helpful: 12,
        images: []
      },
      {
        id: 2,
        author: '구매고객2',
        rating: 4,
        date: '2024-02-14',
        content: '생각보다 크기가 작았지만 품질은 좋네요. 색상도 예쁘고 만족합니다.',
        helpful: 8,
        images: []
      },
      {
        id: 3,
        author: '구매고객3',
        rating: 5,
        date: '2024-02-13',
        content: '재구매 의사 있습니다. 포장도 깔끔하고 상품 상태 완벽했어요!',
        helpful: 15,
        images: []
      }
    ];
    return reviews;
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-300'}>
        ⭐
      </span>
    ));
  };

  const reviews = generateReviews();
  const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* 탭 헤더 */}
      <div className="flex border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-4 py-3 text-center font-medium text-sm transition-all ${
              activeTab === tab.id
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <span className="mr-1">{tab.emoji}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* 탭 내용 */}
      <div className="p-6">
        {/* 상품 설명 */}
        {activeTab === 'description' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-800">상품 설명</h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {deal.description}
              </p>
            </div>

            {/* 특징 */}
            <div>
              <h4 className="font-semibold mb-3 text-gray-800">제품 특징</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {deal.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg">
                    <span className="text-green-600">✓</span>
                    <span className="text-green-800">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 배송 안내 */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-semibold mb-2 text-blue-800 flex items-center">
                <span className="mr-2">🚚</span>
                배송 안내
              </h4>
              <div className="text-sm text-blue-700 space-y-1">
                <p>• {deal.shipping}</p>
                <p>• 평일 오후 3시 이전 주문 시 당일 발송</p>
                <p>• 주말/공휴일 제외</p>
              </div>
            </div>

            {/* 교환/반품 안내 */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold mb-2 text-gray-800 flex items-center">
                <span className="mr-2">🔄</span>
                교환/반품 안내
              </h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p>• 상품 수령 후 7일 이내 교환/반품 가능</p>
                <p>• 단순 변심으로 인한 반품 시 배송비 고객 부담</p>
                <p>• 상품 하자 시 무료 교환/반품</p>
              </div>
            </div>
          </div>
        )}

        {/* 상세 정보 */}
        {activeTab === 'specifications' && deal.specifications && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">상품 상세정보</h3>
            <div className="overflow-hidden rounded-lg border border-gray-200">
              {Object.entries(deal.specifications).map(([key, value], index) => (
                <div
                  key={key}
                  className={`flex ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} border-b border-gray-200 last:border-b-0`}
                >
                  <div className="w-1/3 px-4 py-3 font-medium text-gray-800 bg-gray-100">
                    {key}
                  </div>
                  <div className="w-2/3 px-4 py-3 text-gray-700">
                    {value}
                  </div>
                </div>
              ))}
            </div>

            {/* 추가 정보 */}
            <div className="bg-yellow-50 rounded-lg p-4 mt-6">
              <h4 className="font-semibold mb-2 text-yellow-800 flex items-center">
                <span className="mr-2">ℹ️</span>
                추가 정보
              </h4>
              <div className="text-sm text-yellow-700 space-y-1">
                <p>• 모니터 설정에 따라 실제 색상과 다를 수 있습니다</p>
                <p>• 상품 사양은 제조사 사정에 의해 변경될 수 있습니다</p>
                <p>• 정확한 상품 정보는 판매처에서 확인해주세요</p>
              </div>
            </div>
          </div>
        )}

        {/* 리뷰 */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            {/* 리뷰 통계 */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">고객 리뷰</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    {renderStars(Math.floor(averageRating))}
                    <span className="font-bold text-xl">{averageRating.toFixed(1)}</span>
                    <span className="text-gray-600">({reviews.length}개 리뷰)</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">만족도</div>
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round((averageRating / 5) * 100)}%
                  </div>
                </div>
              </div>
            </div>

            {/* 리뷰 목록 */}
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold">
                          {review.author[0]}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-800">{review.author}</div>
                        <div className="flex items-center space-x-2">
                          {renderStars(review.rating)}
                          <span className="text-sm text-gray-500">{review.date}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-700 leading-relaxed mb-3">
                    {review.content}
                  </p>

                  <div className="flex items-center justify-between text-sm">
                    <button className="text-blue-600 hover:text-blue-800 flex items-center space-x-1">
                      <span>👍</span>
                      <span>도움됨 ({review.helpful})</span>
                    </button>
                    
                    <button className="text-gray-500 hover:text-gray-700">
                      신고하기
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* 리뷰 더보기 */}
            <div className="text-center">
              <button className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                리뷰 더보기 ({reviews.length}개 중 3개 표시)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DealDescriptionSection;