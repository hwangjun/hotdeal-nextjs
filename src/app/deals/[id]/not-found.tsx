'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md mx-auto text-center">
        {/* 404 Icon */}
        <div className="mb-8">
          <svg 
            className="w-24 h-24 text-gray-400 mx-auto mb-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
            />
          </svg>
          <h1 className="text-6xl font-bold text-gray-400">404</h1>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            상품을 찾을 수 없습니다
          </h2>
          <p className="text-gray-600 leading-relaxed">
            요청하신 핫딜 상품이 존재하지 않거나<br />
            이미 삭제되었을 수 있습니다.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            href="/"
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            🏠 홈으로 돌아가기
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            ← 이전 페이지로
          </button>
        </div>

        {/* Suggestion */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-semibold text-blue-800 mb-2">💡 이런 방법도 있어요</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• 홈에서 다른 핫딜 상품 둘러보기</li>
            <li>• 검색으로 원하는 상품 찾기</li>
            <li>• 카테고리별로 상품 탐색하기</li>
          </ul>
        </div>
      </div>
    </div>
  );
}