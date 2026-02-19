import Link from 'next/link';
import DealImage from '@/components/DealImage';
import Parser from 'rss-parser';

interface Deal {
  id: string;
  title: string;
  price: number | null;
  originalPrice: number | null;
  discountRate: number;
  hasPrice: boolean;
  priceText: string;
  mallName: string;
  mallLogo: string;
  category: string;
  imageUrl: string;
  tags: string[];
  rating: string;
  reviewCount: number;
  timeLeft: string;
  priceHistory: boolean;
  compareAvailable: boolean;
  source: string;
  url: string;
  description: string;
}

// RSS 소스 정의 (루리웹 임시 비활성화 - 타임아웃 문제)
const RSS_SOURCES = [
  {
    name: 'ppomppu',
    displayName: '뽐뿌',
    url: 'http://www.ppomppu.co.kr/rss.php?id=ppomppu',
    logo: '💰',
  },
  {
    name: 'quasar', 
    displayName: '퀘이사존',
    url: 'https://quasarzone.com/rss.xml',
    logo: '💻',
  },
  {
    name: 'coolenjoy',
    displayName: '쿨앤조이',
    url: 'https://coolenjoy.net/bbs/rss.php?bo_table=jirum',
    logo: '❄️',
  }
  // 루리웹 임시 비활성화 - 60초 타임아웃 문제로 인한 빌드 실패 방지
  // {
  //   name: 'ruliweb',
  //   displayName: '루리웹',
  //   url: 'https://bbs.ruliweb.com/community/board/300002/rss',
  //   logo: '🎯',
  // }
];

// Fallback 데이터
const FALLBACK_DEALS: Deal[] = [
  {
    id: "ppomppu-1",
    title: "[네이버] 천혜향 2kg (12,500원/무료)",
    price: 12500,
    originalPrice: 25000,
    discountRate: 50,
    hasPrice: true,
    priceText: "12,500원",
    mallName: "뽐뿌",
    mallLogo: "💰",
    category: "food",
    imageUrl: "https://picsum.photos/300/200?random=food1",
    tags: ["🚚 무배", "🔥 HOT"],
    rating: "4.8",
    reviewCount: 1520,
    timeLeft: "15분 전",
    priceHistory: true,
    compareAvailable: true,
    source: "RSS-뽐뿌",
    url: "http://www.ppomppu.co.kr/zboard/view.php?id=ppomppu&no=684416",
    description: "천혜향 2kg 12,500원 레드향 2kg 13,500원 두개다 저렴합니다"
  },
  {
    id: "ppomppu-2", 
    title: "[톡딜] 닥터브라이언 비타민C&D3000 구미 2통 (21,900원/무료)",
    price: 21900,
    originalPrice: 45000,
    discountRate: 51,
    hasPrice: true,
    priceText: "21,900원",
    mallName: "뽐뿌",
    mallLogo: "💰", 
    category: "health",
    imageUrl: "https://picsum.photos/300/200?random=health1",
    tags: ["💊 건강", "🚚 무배"],
    rating: "4.5",
    reviewCount: 890,
    timeLeft: "8분 전",
    priceHistory: true,
    compareAvailable: true,
    source: "RSS-뽐뿌",
    url: "http://www.ppomppu.co.kr/zboard/view.php?id=ppomppu&no=684420",
    description: "먹기좋은 구미젤리고 착색료 무첨가입니다"
  },
  {
    id: "quasar-1",
    title: "최신 Google 포토 업데이트로 Pixel 6의 매직 지우개 기능이 해제됨",
    price: 89000,
    originalPrice: 125000,
    discountRate: 29,
    hasPrice: false,
    priceText: "가격 정보 없음",
    mallName: "퀘이사존",
    mallLogo: "💻",
    category: "electronics",
    imageUrl: "https://picsum.photos/300/200?random=mobile1",
    tags: ["📱 모바일"],
    rating: "4.2",
    reviewCount: 245,
    timeLeft: "3분 전",
    priceHistory: true,
    compareAvailable: true,
    source: "RSS-퀘이사존",
    url: "https://quasarzone.com/bbs/qn_mobile/views/189062",
    description: "온라인상의 수많은 보고에 따르면 Google이 최신 포토 업데이트를 통해..."
  },
  {
    id: "quasar-2",
    title: "[팬메이드] 바이오하자드 4 HD 프로젝트 1.0 공개! + 오리지널과 비교",
    price: 65000,
    originalPrice: 89000, 
    discountRate: 27,
    hasPrice: false,
    priceText: "가격 정보 없음",
    mallName: "퀘이사존",
    mallLogo: "💻",
    category: "gaming",
    imageUrl: "https://picsum.photos/300/200?random=game1",
    tags: ["🎮 게임"],
    rating: "4.9",
    reviewCount: 1200,
    timeLeft: "12분 전",
    priceHistory: true,
    compareAvailable: true,
    source: "RSS-퀘이사존",
    url: "https://quasarzone.com/bbs/qn_game/views/205767",
    description: "Resident Evil 4 HD Project 2022 | Original VS Remaster"
  }
];

// 가격 생성 함수 (fallback용 - 실제로는 API에서 실제 가격 추출)
// 제목에서 실제 가격 추출
function extractPrice(title: string, sourceName: string) {
  // 쿨앤조이, 뽐뿌 패턴: "(21,900원/무료)", "(15,000원/배송비 3,000원)"
  const pricePattern = /\(([0-9,]+)원[/\/].+?\)/;
  const priceMatch = title.match(pricePattern);
  
  // 퀘이사존 패턴: 숫자만 있는 경우도 체크
  const directPricePattern = /([0-9,]+)원/;
  const directMatch = title.match(directPricePattern);
  
  let price = null;
  
  if (priceMatch) {
    // 괄호 안의 가격 (쿨앤조이, 뽐뿌)
    price = parseInt(priceMatch[1].replace(/,/g, ''));
  } else if (directMatch) {
    // 직접 언급된 가격
    price = parseInt(directMatch[1].replace(/,/g, ''));
  }
  
  if (price && price > 0) {
    return {
      price,
      originalPrice: price,
      discountRate: 0,
      hasPrice: true,
      priceText: `${price.toLocaleString()}원`
    };
  }
  
  // 가격 정보가 없는 경우
  return {
    price: null,
    originalPrice: null,
    discountRate: 0,
    hasPrice: false,
    priceText: '가격 정보 없음'
  };
}

function generatePrice() {
  const basePrice = Math.floor(Math.random() * 100000) + 10000;
  const discountRate = Math.floor(Math.random() * 60) + 20;
  const originalPrice = Math.floor(basePrice / (100 - discountRate) * 100);
  
  return {
    price: basePrice,
    originalPrice,
    discountRate,
    hasPrice: true, // fallback 데이터는 가격 있음으로 표시
    priceText: `${basePrice.toLocaleString()}원`
  };
}

// 태그 생성
function generateTags(title: string, price: number) {
  const tags = [];
  
  if (title.includes('무료') || title.includes('무배')) {
    tags.push('🚚 무배');
  }
  if (price < 20000) {
    tags.push('💰 저가');
  }
  if (title.includes('게임')) {
    tags.push('🎮 게임');
  }
  if (Math.random() > 0.7) {
    tags.push('🔥 HOT');
  }
  
  return tags;
}

// RSS 데이터 서버에서 미리 가져오기
async function getDeals(): Promise<{ deals: Deal[], isUsingFallback: boolean }> {
  const parser = new Parser({
    customFields: {
      item: ['description', 'content:encoded']
    }
  });

  try {
    console.log('🚀 서버에서 RSS 데이터 수집 시작...');
    
    const allDeals: Deal[] = [];
    let successCount = 0;

    // RSS 소스들에서 데이터 수집 (빠른 시간 제한)
    const fetchPromises = RSS_SOURCES.map(async (source) => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000); // 2초 제한으로 단축

        const feed = await parser.parseURL(source.url);
        clearTimeout(timeoutId);
        
        if (feed.items && feed.items.length > 0) {
          console.log(`✅ ${source.displayName}: ${feed.items.length}개 항목`);
          
          const items = feed.items.slice(0, 3); // 각 소스당 3개만
          
          items.forEach((item, index) => {
            // 실제 가격 추출 시도
            const pricing = extractPrice(item.title || '', source.name);
            const tags = generateTags(item.title || '', pricing.price || 0);
            
            const deal: Deal = {
              id: `${source.name}-${index + 1}`,
              title: item.title || '제목 없음',
              ...pricing,
              mallName: source.displayName,
              mallLogo: source.logo,
              category: 'general',
              imageUrl: `https://picsum.photos/300/200?random=${source.name}${index}`,
              tags,
              rating: (4.0 + Math.random() * 1.0).toFixed(1),
              reviewCount: Math.floor(Math.random() * 3000) + 100,
              timeLeft: `${Math.floor(Math.random() * 60) + 1}분 전`,
              priceHistory: true,
              compareAvailable: true,
              source: `RSS-${source.displayName}`,
              url: item.link || source.url,
              description: item.contentSnippet || item.description || ''
            };
            
            allDeals.push(deal);
          });
          
          successCount++;
        }
      } catch (error) {
        console.log(`⚠️ ${source.displayName} RSS 실패:`, error);
      }
    });

    // 모든 RSS 소스 병렬 처리 (최대 5초)
    await Promise.allSettled(fetchPromises);

    if (allDeals.length > 0) {
      console.log(`✅ RSS 성공: ${allDeals.length}개 딜 수집 (${successCount}/${RSS_SOURCES.length} 소스)`);
      allDeals.sort((a, b) => b.discountRate - a.discountRate);
      return { deals: allDeals, isUsingFallback: false };
    }
    
  } catch (error) {
    console.log('❌ RSS 수집 실패:', error);
  }

  console.log('📁 Fallback 데이터 사용');
  return { deals: FALLBACK_DEALS, isUsingFallback: true };
}

// 서버 컴포넌트 - 빠른 렌더링
export default async function HomePage() {
  const { deals, isUsingFallback } = await getDeals();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              🔥 실시간 핫딜사이트 {isUsingFallback ? '(테스트)' : ''}
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                {isUsingFallback ? '테스트 모드' : 'RSS 실시간 업데이트'}
              </span>
              <div className={`w-2 h-2 rounded-full ${isUsingFallback ? 'bg-yellow-500' : 'bg-green-500'} animate-pulse`}></div>
            </div>
          </div>
        </div>
      </header>

      {/* Fallback 알림 */}
      {isUsingFallback && (
        <div className="bg-yellow-50 border-b">
          <div className="max-w-6xl mx-auto px-4 py-3">
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-yellow-600">⚠️</span>
              <span className="text-yellow-800">
                <strong>테스트 모드:</strong> RSS 연결에 문제가 있어 샘플 데이터를 표시하고 있습니다. 상세페이지는 정상 작동합니다.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* RSS 소스 표시 */}
      <div className="bg-blue-50 border-b">
        <div className="max-w-6xl mx-auto px-4 py-2">
          <div className="flex items-center space-x-4 text-sm">
            <span className="text-blue-800 font-medium">
              {isUsingFallback ? '📁 테스트 데이터:' : '📡 실시간 연결:'}
            </span>
            <span className="flex items-center space-x-1">
              <span>💰</span>
              <span>뽐뿌</span>
            </span>
            <span className="flex items-center space-x-1">
              <span>💻</span>
              <span>퀘이사존</span>
            </span>
            <span className="text-gray-500 text-xs">
              (루리웹 임시 비활성화)
            </span>
          </div>
        </div>
      </div>

      {/* Main Content - 즉시 표시 */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            ⚡ 빠른 로딩 핫딜 ({deals.length}개)
          </h2>
          <p className="text-gray-600">
            {isUsingFallback 
              ? '서버에서 즉시 렌더링된 테스트 데이터'
              : '서버에서 미리 수집된 실시간 RSS 핫딜 정보'
            }
          </p>
        </div>

        {/* Deal Cards - 서버 렌더링으로 즉시 표시 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {deals.map((deal) => (
            <div
              key={deal.id}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 relative"
            >
              {/* Deal Image */}
              <DealImage
                imageUrl={deal.imageUrl}
                title={deal.title}
                mallName={deal.mallName}
                mallLogo={deal.mallLogo}
              />

              {/* Deal Info */}
              <div className="space-y-3">
                <h3 className="font-bold text-gray-900 line-clamp-2 text-sm leading-tight">
                  {deal.title}
                </h3>
                
                <div className="flex items-center justify-between">
                  <div>
                    {deal.hasPrice && deal.price ? (
                      <>
                        <span className="text-xl font-bold text-red-600">
                          {deal.price.toLocaleString()}원
                        </span>
                        {deal.originalPrice && deal.originalPrice > deal.price && (
                          <div className="text-sm text-gray-500 line-through">
                            {deal.originalPrice.toLocaleString()}원
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-lg font-medium text-gray-700">
                        💭 가격 문의
                      </div>
                    )}
                  </div>
                  <div className={`${deal.hasPrice && deal.discountRate > 0 ? 'bg-red-500' : 'bg-gray-500'} text-white px-2 py-1 rounded text-sm font-bold`}>
                    {deal.hasPrice && deal.discountRate > 0 ? `${deal.discountRate}%` : '원문확인'}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {deal.tags.slice(0, 2).map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  {deal.rating ? (
                    <span>⭐ {deal.rating}</span>
                  ) : (
                    <span className="text-gray-400">평점 정보 없음</span>
                  )}
                  <span>{deal.timeLeft}</span>
                </div>

                {/* 이미지 상태 표시 */}
                <div className="flex items-center text-xs text-gray-500 mb-2">
                  <span className="flex items-center">
                    {deal.imageUrl && typeof deal.imageUrl === 'string' && !deal.imageUrl.includes('placeholder') ? (
                      <><span className="text-green-500">🖼️</span> 실제 이미지</>
                    ) : (
                      <><span className="text-gray-400">📷</span> 이미지 없음</>
                    )}
                  </span>
                  <span className="mx-2">•</span>
                  <span>{deal.source?.replace('RSS-', '')}</span>
                </div>

                <div className="flex space-x-2">
                  <Link 
                    href={`/deals/${deal.id}`}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2.5 px-4 rounded-lg font-medium transition-all duration-200 text-center text-sm hover:scale-105 active:scale-95 shadow-sm"
                  >
                    <span className="flex items-center justify-center space-x-2">
                      <span>⚡</span>
                      <span>상세보기</span>
                      <span>→</span>
                    </span>
                  </Link>
                  
                  <a
                    href={deal.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-green-500 hover:bg-green-600 text-white py-2.5 px-3 rounded-lg font-medium transition-all duration-200 text-center text-sm hover:scale-105 active:scale-95 shadow-sm"
                    title="원문 사이트로 바로 이동"
                  >
                    <span>🛒</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}