import Link from 'next/link';
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

// 📊 Supabase에서 최신 딜 조회
async function getLatestDeals(): Promise<Deal[]> {
  try {
    const { data: deals, error } = await supabase
      .from('deals')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('❌ Supabase 딜 조회 실패:', error);
      return [];
    }

    return deals || [];
  } catch (error) {
    console.error('❌ 딜 조회 중 오류:', error);
    return [];
  }
}

// 🏠 메인 페이지 컴포넌트
export default async function HomePage() {
  const deals = await getLatestDeals();
  const withPriceCount = deals.filter(deal => deal.has_price).length;
  
  // 쇼핑몰별 통계
  const mallStats = deals.reduce((acc: any, deal) => {
    const mall = deal.mall_name || 'Unknown';
    acc[mall] = (acc[mall] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                🔥 실시간 핫딜
              </h1>
              <p className="text-gray-600 mt-1">
                Supabase 실시간 연동 • 별도 크롤링 서버 운영
              </p>
            </div>
            <div className="text-right text-sm text-gray-500">
              <div>총 {deals.length}개 딜</div>
              <div>가격 정보: {withPriceCount}개</div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* 통계 카드 */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-gray-700 mb-2">📊 데이터 소스</h3>
            <p className="text-2xl font-bold text-blue-600">Supabase</p>
            <p className="text-sm text-gray-500">실시간 데이터베이스</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-gray-700 mb-2">🛒 쇼핑몰 현황</h3>
            <div className="space-y-1">
              {Object.entries(mallStats).map(([mall, count]) => (
                <div key={mall} className="flex justify-between text-sm">
                  <span>{mall}</span>
                  <span className="font-medium">{count as number}개</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-gray-700 mb-2">⚡ 시스템 상태</h3>
            <p className="text-2xl font-bold text-green-600">정상</p>
            <p className="text-sm text-gray-500">외부 크롤링 서버 연동</p>
          </div>
        </div>

        {/* 딜 목록 */}
        {deals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {deals.map((deal) => (
              <div key={deal.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                {/* 이미지 */}
                <div className="relative h-48 bg-gray-100">
                  <DealImage 
                    imageUrl={deal.image_url || ''} 
                    title={deal.title}
                    mallName={deal.mall_name}
                    mallLogo={deal.mall_logo || '🛒'}
                    className="w-full h-full object-cover"
                  />
                  {deal.mall_logo && (
                    <div className="absolute top-2 left-2 bg-white rounded-full px-2 py-1 text-sm">
                      {deal.mall_logo}
                    </div>
                  )}
                </div>

                {/* 내용 */}
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">
                    {deal.title}
                  </h3>
                  
                  {/* 가격 정보 */}
                  <div className="mb-3">
                    {deal.has_price && deal.price ? (
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-red-600">
                          {deal.price.toLocaleString()}원
                        </span>
                        {deal.discount_rate > 0 && (
                          <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-sm font-medium">
                            {deal.discount_rate}% 할인
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-500 text-sm">가격 정보 확인 필요</span>
                    )}
                  </div>

                  {/* 쇼핑몰 및 소스 */}
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                    <span className="font-medium">{deal.mall_name}</span>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {deal.source}
                    </span>
                  </div>

                  {/* 액션 버튼 */}
                  <div className="flex gap-2">
                    <a
                      href={deal.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded font-medium hover:bg-blue-700 transition-colors"
                    >
                      🛒 구매하러 가기
                    </a>
                    <Link
                      href={`/deals/${deal.id}`}
                      className="bg-gray-100 text-gray-700 px-4 py-2 rounded font-medium hover:bg-gray-200 transition-colors"
                    >
                      상세
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">
              딜을 불러오는 중...
            </h3>
            <p className="text-gray-500">
              잠시 후 다시 확인해 주세요
            </p>
          </div>
        )}

        {/* 하단 정보 */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>🚀 v2.0 - Supabase 실시간 연동 | 별도 크롤링 서버 운영</p>
          <p className="mt-1">데이터는 외부 크롤링 서버에서 자동 수집되어 실시간으로 업데이트됩니다</p>
        </div>
      </main>
    </div>
  );
}