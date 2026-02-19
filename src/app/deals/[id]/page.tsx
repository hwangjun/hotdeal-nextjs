import { notFound } from 'next/navigation';
import DealImage from '@/components/DealImage';
import { createClient } from '@supabase/supabase-js';

interface Deal {
  id: string;
  title: string;
  price: number | null;
  original_price: number | null;
  discount_rate: number;
  has_price: boolean;
  price_text: string;
  mall_name: string;
  mall_logo: string;
  category: string;
  image_url: string;
  tags: string[];
  url: string;
  description: string;
  created_at: string;
  source: string;
}

// 🗄️ Supabase 클라이언트
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

// 📊 Supabase에서 딜 조회
async function getDealById(id: string): Promise<Deal | null> {
  try {
    console.log('📊 Supabase에서 딜 조회:', id);

    const { data: deal, error } = await supabase
      .from('deals')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('❌ Supabase 딜 조회 실패:', error);
      return null;
    }

    if (!deal) {
      console.log('❌ 딜을 찾을 수 없음:', id);
      return null;
    }

    console.log('✅ Supabase에서 딜 찾음:', deal.title);
    return deal;

  } catch (error) {
    console.error('❌ 딜 조회 중 오류:', error);
    return null;
  }
}

// 🎯 딜 상세 페이지 컴포넌트
export default async function DealPage({ params }: { params: { id: string } }) {
  const { id } = params;
  
  // Supabase에서 딜 조회
  const deal = await getDealById(id);
  
  if (!deal) {
    notFound();
  }

  // 가격 정보 처리
  const hasPrice = deal.has_price && deal.price !== null;
  const discountRate = deal.discount_rate || 0;
  const priceDisplay = hasPrice ? deal.price?.toLocaleString() + '원' : deal.price_text || '가격 확인';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 뒤로 가기 */}
        <div className="mb-6">
          <a 
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← 목록으로 돌아가기
          </a>
        </div>

        {/* 메인 카드 */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* 이미지 섹션 */}
            <div className="relative h-64 lg:h-96 bg-gray-100">
              <DealImage 
                imageUrl={deal.image_url || ''} 
                title={deal.title}
                size="large"
                className="w-full h-full object-cover"
              />
              {discountRate > 0 && (
                <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-2 rounded-lg font-bold shadow-md">
                  {discountRate}% 할인
                </div>
              )}
            </div>

            {/* 정보 섹션 */}
            <div className="p-6 lg:p-8">
              <div className="space-y-6">
                {/* 제목 */}
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
                  {deal.title}
                </h1>

                {/* 가격 정보 */}
                <div className="space-y-3">
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl lg:text-4xl font-bold text-red-600">
                      {priceDisplay}
                    </span>
                    {hasPrice && deal.original_price && deal.original_price > (deal.price || 0) && (
                      <span className="text-lg text-gray-500 line-through">
                        {deal.original_price.toLocaleString()}원
                      </span>
                    )}
                  </div>
                  
                  {!hasPrice && (
                    <p className="text-sm text-gray-600">
                      정확한 가격은 상품 페이지에서 확인해 주세요
                    </p>
                  )}
                </div>

                {/* 쇼핑몰 정보 */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-gray-900">판매처</h3>
                    <p className="text-gray-600">{deal.mall_name}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">소스</h3>
                    <p className="text-gray-600">{deal.source}</p>
                  </div>
                </div>

                {/* 설명 */}
                {deal.description && (
                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-900">상품 설명</h3>
                    <p className="text-gray-700 whitespace-pre-line">
                      {deal.description}
                    </p>
                  </div>
                )}

                {/* 태그 */}
                {deal.tags && deal.tags.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-900">태그</h3>
                    <div className="flex flex-wrap gap-2">
                      {deal.tags.map((tag, index) => (
                        <span 
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* 액션 버튼 */}
                <div className="space-y-3 pt-4">
                  <a
                    href={deal.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-blue-600 text-white text-center py-4 px-6 rounded-lg font-bold text-lg hover:bg-blue-700 transition-colors block"
                  >
                    페이지로 이동
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 추가 정보 */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 딜 정보 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-bold text-gray-900 mb-4">📋 딜 정보</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">등록일:</span>
                <span className="font-medium">
                  {new Date(deal.created_at).toLocaleDateString('ko-KR')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">카테고리:</span>
                <span className="font-medium">{deal.category || '일반'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">딜 ID:</span>
                <span className="font-medium font-mono text-xs">{deal.id}</span>
              </div>
            </div>
          </div>

          {/* 주의사항 */}
          <div className="bg-amber-50 rounded-lg shadow p-6">
            <h3 className="font-bold text-amber-800 mb-4">⚠️ 주의사항</h3>
            <div className="space-y-2 text-sm text-amber-700">
              <p>• 가격은 변동될 수 있으며, 최종 가격은 쇼핑몰에서 확인해 주세요</p>
              <p>• 할인 혜택은 조기 마감될 수 있습니다</p>
              <p>• 배송비 및 기타 조건은 각 쇼핑몰 정책을 확인하세요</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}