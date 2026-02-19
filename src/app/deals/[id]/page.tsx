import Link from 'next/link';
import { notFound } from 'next/navigation';
import { readFile } from 'fs/promises';
import { join } from 'path';
import DealImage from '@/components/DealImage';

interface Deal {
  id: string;
  title: string;
  price?: number;
  originalPrice?: number;
  discountRate: number;
  hasPrice: boolean;
  priceText: string;
  mallName: string;
  mallLogo: string;
  tags?: string[];
  rating?: string | null;
  reviewCount?: number | null;
  timeLeft?: string;
  url: string;
  imageUrl?: string;
  description?: string;
  source: string;
  deliveryInfo: string;
  crawledAt: string;
  pubDate?: string;
  category?: string;
  createdAt?: string;
  updatedAt?: string;
  soldCount?: number | null;
  priceHistory?: boolean;
  compareAvailable?: boolean;
}

// 🗄️ 로컬 저장소에서 딜 찾기 (우선순위)
async function getDealFromLocalStorage(id: string): Promise<Deal | null> {
  try {
    console.log('🗄️ 로컬 저장소에서 딜 찾기:', id);
    
    const { getDealById } = await import('@/lib/simple-storage');
    const deal = await getDealById(id);
    
    if (deal) {
      console.log('✅ 로컬 저장소에서 딜 찾음:', deal.title);
      // 이미 프론트엔드 형식이므로 그대로 반환
      return deal;
    }
    
    console.log('❌ 로컬 저장소에서 딜 못찾음:', id);
  } catch (error) {
    console.log('⚠️ 로컬 저장소 조회 실패:', error);
  }
  
  return null;
}

// ⚡ 정적 딜 데이터에서 딜 찾기 (백업용)
async function getDealFromStatic(id: string): Promise<Deal | null> {
  try {
    console.log('📁 정적 데이터에서 딜 찾기:', id);
    
    const filePath = join(process.cwd(), 'public', 'data', 'deals.json');
    const fileContent = await readFile(filePath, 'utf8');
    const dealsData = JSON.parse(fileContent);
    
    if (dealsData.success && dealsData.data) {
      const deal = dealsData.data.find((d: Deal) => d.id === id);
      if (deal) {
        console.log('✅ 정적 데이터에서 딜 찾음:', deal.title);
        return deal;
      }
    }
    
    console.log('❌ 정적 데이터에서 딜 못찾음:', id);
  } catch (error) {
    console.log('⚠️ 정적 데이터 로드 실패:', error);
  }
  
  return null;
}

// 🔄 실시간 RSS API 호출 (정적 데이터 실패시 백업)
async function getDealFromAPI(id: string): Promise<Deal | null> {
  try {
    console.log('🔍 실시간 API에서 딜 데이터 가져오기:', id);
    
    // 외부 URL 사용 (내부 호출 문제 해결)
    const response = await fetch('https://hotdeal-nextjs.vercel.app/api/deals', {
      next: { revalidate: 60 }, // 1분 캐시
      headers: {
        'User-Agent': 'Next.js Detail Page'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.data) {
        console.log('✅ 실시간 API 성공:', data.data.length, '개 딜');
        
        const deal = data.data.find((d: Deal) => d.id === id);
        if (deal) {
          console.log('✅ API에서 딜 찾음:', deal.title);
          return deal;
        }
      }
    }
    
    console.log('❌ API에서 딜을 찾을 수 없음:', id);
  } catch (error) {
    console.log('⚠️ API 호출 실패:', error);
  }
  
  return null;
}

// 🎯 하이브리드 딜 찾기 (로컬 저장소 우선 + 정적 데이터 백업)
async function getDeal(id: string): Promise<Deal | null> {
  // 1단계: 로컬 저장소에서 우선 찾기
  let deal = await getDealFromLocalStorage(id);
  
  if (deal) {
    console.log('🗄️ 로컬 저장소 사용:', deal.title);
    return deal;
  }
  
  // 2단계: 로컬 저장소 실패시 정적 데이터 백업
  console.log('🔄 로컬 저장소 실패, 정적 데이터로 대체...');
  deal = await getDealFromStatic(id);
  
  if (deal) {
    console.log('⚡ 정적 데이터 백업 사용:', deal.title);
    return deal;
  }
  
  // 3단계: 정적 데이터도 실패시 실시간 API 호출
  console.log('🔄 정적 데이터도 실패, 실시간 API로 대체...');
  deal = await getDealFromAPI(id);
  
  if (deal) {
    console.log('🌐 실시간 API 사용:', deal.title);
    return deal;
  }
  
  return null;
}

// 사용 가능한 ID 목록 (정적 데이터 우선)
async function getAvailableIds(): Promise<string[]> {
  try {
    console.log('📋 사용 가능한 ID 목록 가져오기...');
    
    // 정적 데이터에서 ID 목록 추출
    const filePath = join(process.cwd(), 'public', 'data', 'deals.json');
    const fileContent = await readFile(filePath, 'utf8');
    const dealsData = JSON.parse(fileContent);
    
    if (dealsData.success && dealsData.data) {
      const ids = dealsData.data.map((d: Deal) => d.id);
      console.log('📋 정적 데이터 ID들:', ids.slice(0, 5), '...');
      return ids;
    }
  } catch (error) {
    console.log('⚠️ 정적 데이터 ID 목록 실패, API로 대체:', error);
  }
  
  // 백업: API에서 ID 목록
  try {
    const response = await fetch('https://hotdeal-nextjs.vercel.app/api/deals', {
      next: { revalidate: 300 }
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.data) {
        const ids = data.data.map((d: Deal) => d.id);
        console.log('📋 API ID들:', ids.slice(0, 5), '...');
        return ids;
      }
    }
  } catch (error) {
    console.log('⚠️ API ID 목록도 실패:', error);
  }
  
  return [];
}

// 정적 파라미터 생성 (실제 데이터 기반)
export async function generateStaticParams() {
  const ids = await getAvailableIds();
  console.log('📋 generateStaticParams 실행: 총', ids.length, '개 ID 생성');
  
  return ids.slice(0, 20).map((id) => ({ // 최대 20개 미리 생성
    id: id,
  }));
}

// 서버 컴포넌트 - 하이브리드 딜 로딩
export default async function DealDetailPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const resolvedParams = await params;
  const { id } = resolvedParams;
  
  console.log('🔍 하이브리드 상세페이지 로드:', id);
  
  const deal = await getDeal(id);

  if (!deal) {
    console.log('❌ 딜을 찾을 수 없음:', id);
    
    // 사용 가능한 ID 목록 가져오기
    const availableIds = await getAvailableIds();
    
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm p-4">
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            ← 핫딜 목록으로 돌아가기
          </Link>
        </nav>
        
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="text-6xl mb-4">😅</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">상품을 찾을 수 없습니다</h2>
            <p className="text-red-600 mb-4">요청한 ID: {id}</p>
            
            <div className="bg-blue-50 rounded-lg p-4 text-left text-sm mb-4">
              <h3 className="font-bold mb-2">💡 현재 사용 가능한 실제 상품들:</h3>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {availableIds.slice(0, 12).map((availableId) => (
                  <Link 
                    key={availableId}
                    href={`/deals/${availableId}`}
                    className="block text-blue-600 hover:underline text-xs"
                  >
                    <strong>{availableId}</strong>
                  </Link>
                ))}
              </div>
            </div>
            
            <Link 
              href="/" 
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg inline-block"
            >
              홈으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const savings = (deal.originalPrice || 0) - (deal.price || 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Link 
            href="/" 
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>핫딜 목록으로 돌아가기</span>
          </Link>
        </div>
      </nav>

      {/* 하이브리드 데이터 알림 */}
      <div className="bg-green-50 border-b">
        <div className="max-w-6xl mx-auto px-4 py-2">
          <p className="text-sm text-green-800">
            ✅ <strong>하이브리드 데이터:</strong> 정적 데이터 우선 + 실시간 API 백업으로 안정성 보장
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header with Image */}
          <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-8">
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                {/* 이미지 섹션 */}
                <div className="order-2 md:order-1">
                  <DealImage
                    imageUrl={deal.imageUrl || ''}
                    title={deal.title}
                    mallName={deal.mallName}
                    mallLogo={deal.mallLogo}
                    className="max-w-sm mx-auto"
                  />
                </div>
                
                {/* 정보 섹션 */}
                <div className="order-1 md:order-2 text-center md:text-left">
                  <div className="text-6xl mb-4 md:hidden">{deal.mallLogo}</div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 leading-tight">
                    {deal.title}
                  </h1>
                  <div className="space-y-2">
                    <p className="text-gray-600 text-lg">
                      {deal.mallName} • {deal.source?.replace('RSS-', '')}
                    </p>
                    <p className="text-sm text-gray-500">상품 ID: {deal.id}</p>
                    <div className="flex items-center justify-center md:justify-start space-x-4 mt-4">
                      {deal.rating && (
                        <div className="bg-white px-3 py-1 rounded-full text-sm font-medium text-gray-700">
                          ⭐ {deal.rating}점
                        </div>
                      )}
                      {deal.reviewCount && (
                        <div className="bg-white px-3 py-1 rounded-full text-sm font-medium text-gray-700">
                          📝 {deal.reviewCount.toLocaleString()}개 리뷰
                        </div>
                      )}
                      {!deal.rating && !deal.reviewCount && (
                        <div className="bg-white px-3 py-1 rounded-full text-sm font-medium text-gray-500">
                          📊 RSS 기본 정보
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Tags */}
            {deal.tags && deal.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {deal.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Price Info */}
            <div className={`${deal.hasPrice ? 'bg-red-50' : 'bg-gray-50'} rounded-xl p-6 mb-8`}>
              <div className="flex items-center justify-between">
                <div>
                  {deal.hasPrice ? (
                    <>
                      <div className="text-4xl font-bold text-red-600 mb-2">
                        {(deal.price || 0).toLocaleString()}원
                      </div>
                      {(deal.originalPrice || 0) > (deal.price || 0) && (
                        <div className="text-xl text-gray-500 line-through">
                          {(deal.originalPrice || 0).toLocaleString()}원
                        </div>
                      )}
                      {savings > 0 && (
                        <div className="text-lg text-green-600 font-medium mt-1">
                          {savings.toLocaleString()}원 절약
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="text-4xl font-bold text-gray-600 mb-2">
                        💭 가격 문의
                      </div>
                      <div className="text-lg text-gray-500">
                        실제 가격은 원문 사이트에서 확인해주세요
                      </div>
                    </>
                  )}
                </div>
                <div className="text-right">
                  <div className={`${deal.hasPrice && deal.discountRate > 0 ? 'bg-red-500' : 'bg-gray-500'} text-white px-6 py-3 rounded-xl font-bold text-2xl`}>
                    {deal.hasPrice && deal.discountRate > 0 ? `${deal.discountRate}%` : '원문확인'}
                  </div>
                </div>
              </div>
            </div>

            {/* Info Grid - 실제 데이터만 표시 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {deal.rating ? (
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">평점</div>
                  <div className="text-lg font-bold text-yellow-600">
                    ⭐ {deal.rating}
                  </div>
                </div>
              ) : (
                <div className="text-center p-4 bg-gray-50 rounded-lg opacity-60">
                  <div className="text-sm text-gray-500 mb-1">평점</div>
                  <div className="text-lg font-bold text-gray-500">
                    정보 없음
                  </div>
                </div>
              )}
              
              {deal.reviewCount ? (
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">리뷰</div>
                  <div className="text-lg font-bold text-blue-600">
                    {deal.reviewCount.toLocaleString()}개
                  </div>
                </div>
              ) : (
                <div className="text-center p-4 bg-gray-50 rounded-lg opacity-60">
                  <div className="text-sm text-gray-500 mb-1">리뷰</div>
                  <div className="text-lg font-bold text-gray-500">
                    정보 없음
                  </div>
                </div>
              )}
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">게시</div>
                <div className="text-lg font-bold text-green-600">
                  {deal.timeLeft}
                </div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">배송</div>
                <div className="text-lg font-bold text-purple-600">
                  {deal.deliveryInfo}
                </div>
              </div>
            </div>

            {/* Description */}
            {deal.description && (
              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-900 mb-3">상품 설명</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 leading-relaxed">
                    {deal.description}
                  </p>
                </div>
              </div>
            )}

            {/* 데이터 소스 정보 */}
            <div className="bg-blue-50 rounded-lg p-4 mb-8">
              <h3 className="text-lg font-bold text-blue-900 mb-3">📊 데이터 소스 정보</h3>
              <div className="grid grid-cols-1 gap-4 text-sm">
                <div>
                  <span className="text-blue-700 font-medium">데이터 소스:</span>
                  <span className="ml-2">{deal.source}</span>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">실제 URL:</span>
                  <div className="ml-2 break-all text-xs bg-gray-100 p-2 rounded mt-1">
                    {deal.url}
                  </div>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">수집 시간:</span>
                  <span className="ml-2">
                    {new Date(deal.crawledAt).toLocaleString('ko-KR')}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <a
                href={deal.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-red-500 hover:bg-red-600 text-white py-4 px-6 rounded-xl font-bold text-xl transition-colors flex items-center justify-center space-x-3"
              >
                <span>🛒</span>
                <span>{deal.mallName}에서 실제 구매하기</span>
                <span>🔗</span>
              </a>
              
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">
                  ✅ <strong>하이브리드 데이터 시스템</strong> - 정적 + 실시간 안정성 보장
                </p>
              </div>
              
              <Link
                href="/"
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-6 rounded-xl font-medium transition-colors text-center block"
              >
                다른 핫딜 보기
              </Link>
            </div>

            {/* System Status */}
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <span className="text-green-600">✅</span>
                <div className="text-sm text-green-800">
                  <p className="font-medium mb-1">하이브리드 데이터 시스템 작동 중!</p>
                  <p>정적 데이터 우선 사용으로 초고속 로딩, API 백업으로 안정성 보장합니다.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}