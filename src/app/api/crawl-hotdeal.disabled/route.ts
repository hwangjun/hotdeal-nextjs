import { NextRequest, NextResponse } from 'next/server';

// 실제 hotdeal.zip 크롤링 함수
async function crawlHotdealZip(productId?: string) {
  const baseUrl = 'https://hotdeal.zip/';
  const url = productId ? `${baseUrl}${productId}` : baseUrl;
  
  try {
    
    console.log(`🔍 크롤링 시작: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.8,en-US;q=0.5,en;q=0.3',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    
    // HTML 파싱 (간단한 정규식 사용)
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].replace(' - 핫딜모음', '') : '';
    
    // 가격 정보 추출 (패턴에 따라 조정)
    const priceMatches = html.match(/[\d,]+원/g) || [];
    const prices = priceMatches.map(p => parseInt(p.replace(/[^\d]/g, '')));
    
    // 할인율 추출
    const discountMatch = html.match(/(\d+)%/);
    const discountRate = discountMatch ? parseInt(discountMatch[1]) : 0;
    
    // 쇼핑몰 정보 추출
    const mallMatches = html.match(/(쿠팡|네이버|G마켓|11번가|옥션|인터파크)/g) || [];
    const malls = [...new Set(mallMatches)]; // 중복 제거
    
    // 리뷰/설명 추출 (텍스트 콘텐츠)
    const contentMatch = html.match(/<div[^>]*class="[^"]*content[^"]*"[^>]*>([^<]+)</i);
    const description = contentMatch ? contentMatch[1].trim() : '';

    const result = {
      id: productId || Date.now().toString(),
      title: title || '제목 없음',
      price: prices.length > 0 ? Math.min(...prices) : 0,
      originalPrice: prices.length > 1 ? Math.max(...prices) : 0,
      discountRate,
      malls,
      description,
      crawledAt: new Date().toISOString(),
      source: 'hotdeal.zip',
      url,
      success: true
    };

    console.log('✅ 크롤링 성공:', result);
    return result;

  } catch (error) {
    console.error('❌ 크롤링 실패:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류',
      url,
      crawledAt: new Date().toISOString()
    };
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('id');
  
  console.log('🚀 hotdeal.zip 크롤링 API 호출됨');
  
  if (productId) {
    // 특정 상품 크롤링
    const result = await crawlHotdealZip(productId);
    return NextResponse.json(result);
  } else {
    // 메인 페이지 크롤링 (여러 상품)
    const mainResult = await crawlHotdealZip();
    return NextResponse.json(mainResult);
  }
}

// POST로 실시간 크롤링 요청
export async function POST(request: NextRequest) {
  const { productIds } = await request.json();
  
  console.log('🔄 실시간 크롤링 시작:', productIds);
  
  if (!productIds || !Array.isArray(productIds)) {
    return NextResponse.json({
      success: false,
      message: 'productIds 배열이 필요합니다.'
    }, { status: 400 });
  }

  const results = [];
  
  for (const productId of productIds) {
    const result = await crawlHotdealZip(productId);
    results.push(result);
    
    // 요청 간격 (1초) - 서버 부하 방지
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  return NextResponse.json({
    success: true,
    crawledCount: results.length,
    successCount: results.filter(r => r.success).length,
    results,
    timestamp: new Date().toISOString()
  });
}