/**
 * 🚀 고속 핫딜 업데이트 API (뽐뿌 전용)
 * - 1분마다 실행되는 고속 수집기
 * - 뽐뿌 RSS만 처리하여 속도 최적화
 * - 응답 시간 < 3초 목표
 */

import { NextResponse } from 'next/server';
import Parser from 'rss-parser';
import { saveDeal } from '@/lib/simple-storage';

// 성능 모니터링용 타이머
const startTime = Date.now();

// RSS 파서 초기화
const parser = new Parser({
  timeout: 10000, // 10초 타임아웃
  maxRedirects: 3,
});

// 뽐뿌 전용 고속 수집
async function collectPpomppu() {
  const url = 'http://www.ppomppu.co.kr/rss.php?id=ppomppu';
  
  try {
    console.log('📡 뽐뿌 RSS 수집 중...');
    const feed = await parser.parseURL(url);
    
    const deals = feed.items.map((item, index) => {
      // 가격 추출 (제목에서)
      const priceMatch = item.title?.match(/\(([0-9,]+)원/);
      const price = priceMatch ? parseInt(priceMatch[1].replace(/,/g, '')) : null;
      
      return {
        id: `ppomppu-${Date.now()}-${index}`,
        title: item.title || '제목 없음',
        price: price,
        original_price: price,
        discount_rate: 0,
        has_price: !!price,
        price_text: price ? `${price.toLocaleString()}원` : '가격 정보 없음',
        mall_name: '뽐뿌',
        mall_logo: '💰',
        category: 'general',
        image_url: '',
        tags: price ? ['🚚 무배'] : [],
        url: item.link || '',
        description: item.contentSnippet || item.content || '',
        pub_date: item.pubDate || item.isoDate || new Date().toISOString(),
        source: 'RSS-뽐뿌',
        delivery_info: price ? '무료배송' : '원문 확인',
        crawled_at: new Date().toISOString()
      };
    });
    
    console.log(`✅ 뽐뿌: ${deals.length}개 수집`);
    return deals;
    
  } catch (error) {
    console.error('❌ 뽐뿌 RSS 수집 실패:', error);
    return [];
  }
}

export async function POST() {
  try {
    console.log('🚀 고속 핫딜 업데이트 시작 (뽐뿌 전용)...');
    const updateStartTime = Date.now();

    // 뽐뿌만 빠르게 수집
    const deals = await collectPpomppu();
    
    // Supabase에 저장
    let saved = 0;
    if (deals.length > 0) {
      try {
        for (const deal of deals) {
          await saveDeal(deal);
          saved++;
        }
        console.log(`💾 ${saved}개 딜 저장 완료`);
      } catch (saveError) {
        console.error('❌ 딜 저장 실패:', saveError);
      }
    }
    
    const updateEndTime = Date.now();
    const totalTime = updateEndTime - startTime;
    const updateTime = updateEndTime - updateStartTime;

    // 성공 응답
    return NextResponse.json({
      success: true,
      message: '⚡ 고속 핫딜 업데이트 완료!',
      data: {
        success: true,
        updated: saved,
        sources: deals.length > 0 ? 1 : 0,
        fastMode: true,
        onlyPpomppu: true,
        timestamp: new Date().toISOString(),
        performance: {
          totalTime: `${totalTime}ms`,
          updateTime: `${updateTime}ms`,
          target: '< 3000ms'
        },
        storage: 'Supabase PostgreSQL',
        collected: deals.length,
        saved: saved
      }
    });

  } catch (error) {
    console.error('❌ 고속 업데이트 실패:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Fast update failed',
      message: '고속 업데이트 중 오류 발생',
      timestamp: new Date().toISOString(),
      fastMode: true,
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET 요청도 지원 (GitHub Actions 호환)
export async function GET() {
  return POST();
}

// 옵션 헤더
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}