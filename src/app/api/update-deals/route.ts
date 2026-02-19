import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

// 🗄️ 환경변수에 따라 저장소 선택
const USE_SUPABASE = process.env.USE_SUPABASE === 'true';

let storage: any;

if (USE_SUPABASE) {
  console.log('🗄️ Supabase 저장소 사용');
  storage = require('@/lib/supabase');
} else {
  console.log('📁 로컬 저장소 사용'); 
  storage = require('@/lib/simple-storage');
}

const {
  saveDeal, 
  savePriceHistory, 
  saveCrawlLog, 
  testConnection
} = storage;

// RSS 파서 설정
const parser = new Parser({
  customFields: {
    item: ['description', 'content:encoded', 'media:content']
  }
});

// RSS 소스 정의 (뽐뿌 + 쿨앤조이 활성화)
const RSS_SOURCES = [
  {
    name: 'ppomppu',
    displayName: '뽐뿌',
    url: 'http://www.ppomppu.co.kr/rss.php?id=ppomppu',
    logo: '💰',
    enabled: true
  },
  {
    name: 'coolenjoy',
    displayName: '쿨앤조이',
    url: 'https://coolenjoy.net/bbs/rss.php?bo_table=jirum',
    logo: '❄️',
    enabled: true
  }
];

// 가격 정보 추출 함수
function extractPriceInfo(title: string, sourceDisplayName: string) {
  if (sourceDisplayName === '뽐뿌' || sourceDisplayName === '쿨앤조이') {
    // 뽐뿌, 쿨앤조이 가격 패턴: (숫자원) 또는 (숫자,숫자원) 또는 (숫자원/숫자원)
    const pricePattern = /\(([0-9,]+)원(?:\/([0-9,]+)원)?\)/;
    const match = title.match(pricePattern);
    
    if (match) {
      const price = parseInt(match[1].replace(/,/g, ''));
      const originalPriceStr = match[2];
      
      if (originalPriceStr) {
        // 할인가 있는 경우
        const originalPrice = parseInt(originalPriceStr.replace(/,/g, ''));
        const discountRate = Math.round((1 - price / originalPrice) * 100);
        return {
          price,
          originalPrice,
          discountRate,
          hasPrice: true,
          priceText: `${price.toLocaleString()}원`,
          deliveryInfo: title.includes('무료') ? '무료배송' : '배송비 확인'
        };
      } else {
        // 일반 가격
        return {
          price,
          originalPrice: price,
          discountRate: 0,
          hasPrice: true,
          priceText: `${price.toLocaleString()}원`,
          deliveryInfo: title.includes('무료') ? '무료배송' : '배송비 확인'
        };
      }
    }
  }

  // 가격 정보 없음
  return {
    price: null,
    originalPrice: null,
    discountRate: 0,
    hasPrice: false,
    priceText: '가격 정보 없음',
    deliveryInfo: '원문 확인'
  };
}

// 카테고리 분류
function getCategory(title: string): string {
  if (title.includes('컴퓨터') || title.includes('노트북') || title.includes('모니터')) {
    return 'tech';
  }
  if (title.includes('의류') || title.includes('패션') || title.includes('신발')) {
    return 'fashion';  
  }
  if (title.includes('음식') || title.includes('식품') || title.includes('맛집')) {
    return 'food';
  }
  return 'general';
}

// 태그 생성
function generateTags(title: string, priceInfo: any) {
  const tags = [];
  
  if (title.includes('무료') || priceInfo.deliveryInfo === '무료배송') {
    tags.push('🚚 무배');
  }
  if (priceInfo.price && priceInfo.price < 10000) {
    tags.push('💰 저가');
  }
  if (priceInfo.discountRate >= 50) {
    tags.push('🔥 할인');
  }
  
  return tags;
}

// 시간 차이 계산
function calculateTimeAgo(pubDate: string): string {
  try {
    const now = new Date();
    const published = new Date(pubDate);
    const diffMinutes = Math.floor((now.getTime() - published.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return '방금 전';
    if (diffMinutes < 60) return `${diffMinutes}분 전`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}시간 전`;
    return `${Math.floor(diffMinutes / 1440)}일 전`;
  } catch {
    return '시간 정보 없음';
  }
}

// 🔄 RSS 수집 및 저장 함수
async function updateDealsData() {
  console.log('🔄 핫딜 데이터 업데이트 시작...');
  
  const allDeals = [];
  let totalSuccess = 0;

  for (const source of RSS_SOURCES.filter(s => s.enabled)) {
    try {
      console.log(`📡 ${source.displayName} RSS 파싱 시작...`);
      const feed = await parser.parseURL(source.url);
      
      if (feed.items && feed.items.length > 0) {
        const items = feed.items.slice(0, 15); // 최대 15개만
        
        for (const [index, item] of items.entries()) {
          const dealId = `${source.name}-${index + 1}`;
          const priceInfo = extractPriceInfo(item.title || '', source.displayName);
          const tags = generateTags(item.title || '', priceInfo);
          
          const deal = {
            id: dealId,
            title: item.title || '제목 없음',
            price: priceInfo.price,
            originalPrice: priceInfo.originalPrice,
            discountRate: priceInfo.discountRate,
            hasPrice: priceInfo.hasPrice,
            priceText: priceInfo.priceText,
            mallName: source.displayName,
            mallLogo: source.logo,
            category: getCategory(item.title || ''),
            imageUrl: '',
            tags,
            rating: null,
            reviewCount: null,
            soldCount: null,
            timeLeft: item.pubDate ? calculateTimeAgo(item.pubDate) : '시간 정보 없음',
            deliveryInfo: priceInfo.deliveryInfo,
            priceHistory: false,
            compareAvailable: false,
            url: item.link || source.url,
            description: item.contentSnippet || item.description || '',
            pubDate: item.pubDate || new Date().toISOString(),
            source: `RSS-${source.displayName}`,
            crawledAt: new Date().toISOString()
          };
          
          allDeals.push(deal);
          
          // 저장소에 저장
          try {
            await saveDeal(deal);
            
            if (deal.hasPrice && deal.price !== null) {
              await savePriceHistory(deal.id, deal.price, deal.originalPrice, deal.discountRate);
            }
          } catch (storageError) {
            console.error(`❌ 저장 실패 (${deal.id}):`, storageError);
          }
        }
        
        await saveCrawlLog(source.displayName, true, items.length);
        totalSuccess++;
        console.log(`✅ ${source.displayName}: ${items.length}개 딜 수집 완료`);
      } else {
        console.log(`⚠️ ${source.displayName}: 데이터 없음`);
        await saveCrawlLog(source.displayName, false, 0, 'No RSS items found');
      }
    } catch (sourceError) {
      console.error(`❌ ${source.displayName} RSS 파싱 실패:`, sourceError);
      const errorMsg = sourceError instanceof Error ? sourceError.message : String(sourceError);
      await saveCrawlLog(source.displayName, false, 0, errorMsg);
    }
  }

  // 정렬
  allDeals.sort((a, b) => {
    if (a.hasPrice && !b.hasPrice) return -1;
    if (!a.hasPrice && b.hasPrice) return 1;
    return new Date(b.pubDate || 0).getTime() - new Date(a.pubDate || 0).getTime();
  });
  
  console.log(`🎉 업데이트 완료: ${allDeals.length}개 딜 (${totalSuccess}/${RSS_SOURCES.filter(s => s.enabled).length} 소스)`);
  
  return {
    success: true,
    updated: allDeals.length,
    sources: totalSuccess,
    timestamp: new Date().toISOString(),
    storage: USE_SUPABASE ? 'Supabase PostgreSQL' : 'JSON Files'
  };
}

// 🚀 API 핸들러
export async function GET() {
  try {
    // 저장소 연결 확인
    const isConnected = await testConnection();
    if (!isConnected) {
      console.warn('⚠️ 저장소 연결 제한적, 계속 진행...');
    }
    
    // 데이터 업데이트 실행
    const result = await updateDealsData();
    
    return NextResponse.json({
      success: true,
      message: '🔄 핫딜 데이터 업데이트 완료!',
      data: result
    });
    
  } catch (error) {
    console.error('❌ 업데이트 API 에러:', error);
    
    return NextResponse.json({
      success: false,
      error: '데이터 업데이트 실패',
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}