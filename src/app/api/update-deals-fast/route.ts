/**
 * 🚀 고속 핫딜 업데이트 API (뽐뿌 + 쿨앤조이)
 * - 1분마다 실행되는 고속 수집기
 * - 빠른 소스들만 처리하여 속도 최적화
 * - 응답 시간 < 5초 목표
 */

import { NextResponse } from 'next/server';
import Parser from 'rss-parser';
import { saveDeal } from '@/lib/simple-storage';

// 성능 모니터링용 타이머
const startTime = Date.now();

// RSS 파서 초기화 (단순하고 안정적인 설정)
const parser = new Parser({
  timeout: 10000, // 10초 (원래대로)
  maxRedirects: 3
});

// 가격 추출 함수 (100% 성공률 목표)
function extractPrice(title: string, source: string) {
  console.log(`💰 가격 추출 시도: "${title}"`);
  
  // 패턴 1: 괄호 안의 일반 가격 "(16,400원/무배)", "(21,900원/무료)"  
  const pricePattern1 = /\(([0-9,]+)원[\/][^)]*\)/;
  const match1 = title.match(pricePattern1);
  
  if (match1) {
    const price = parseInt(match1[1].replace(/,/g, ''));
    console.log(`✅ 패턴1 매치: ${match1[1]} → ${price}`);
    return price;
  }
  
  // 패턴 2: 유클, 카드 등 접두사가 있는 가격 "(유클11,900원/유클무료)", "(카드9,800원/무료)"
  const pricePattern2 = /\((?:\w+)?([0-9,]+)원[\/][^)]*\)/;
  const match2 = title.match(pricePattern2);
  
  if (match2) {
    const price = parseInt(match2[1].replace(/,/g, ''));
    console.log(`✅ 패턴2 매치: ${match2[1]} → ${price}`);
    return price;
  }
  
  // 패턴 3: 단순 괄호 가격 "(16400원)"
  const pricePattern3 = /\((?:\w+)?([0-9,]+)원\)/;
  const match3 = title.match(pricePattern3);
  
  if (match3) {
    const price = parseInt(match3[1].replace(/,/g, ''));
    console.log(`✅ 패턴3 매치: ${match3[1]} → ${price}`);
    return price;
  }
  
  // 패턴 4: 카드할인 등 "카드11,830원"
  const pricePattern4 = /카드([0-9,]+)원/;
  const match4 = title.match(pricePattern4);
  
  if (match4) {
    const price = parseInt(match4[1].replace(/,/g, ''));
    console.log(`✅ 패턴4 매치: ${match4[1]} → ${price}`);
    return price;
  }
  
  // 패턴 5: 일반 텍스트 중 가격 "11,900원"
  const pricePattern5 = /([0-9,]+)원/;
  const match5 = title.match(pricePattern5);
  
  if (match5) {
    const price = parseInt(match5[1].replace(/,/g, ''));
    // 너무 큰 숫자는 제외 (연도 등)
    if (price >= 100 && price <= 10000000) {
      console.log(`✅ 패턴5 매치: ${match5[1]} → ${price}`);
      return price;
    }
  }
  
  console.log(`❌ 가격 매치 실패`);
  return null;
}

// 뽐뿌 고속 수집 (에러 처리 강화)
async function collectPpomppu() {
  const url = 'http://www.ppomppu.co.kr/rss.php?id=ppomppu';
  
  try {
    console.log('💰 뽐뿌 RSS 수집 시작...');
    console.log(`📡 URL: ${url}`);
    
    const startTime = Date.now();
    const feed = await parser.parseURL(url);
    const endTime = Date.now();
    
    console.log(`⏱️ 뽐뿌 RSS 파싱 완료: ${endTime - startTime}ms`);
    console.log(`📊 수집된 항목 수: ${feed.items?.length || 0}`);
    
    if (!feed.items || feed.items.length === 0) {
      console.log('⚠️ 뽐뿌: RSS 항목이 없음');
      return [];
    }
    
    const deals = feed.items.slice(0, 10).map((item, index) => {
      console.log(`🔍 처리 중: ${item.title || '제목없음'}`);
      const price = extractPrice(item.title || '', 'ppomppu');
      
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
        tags: price && item.title?.includes('무료') ? ['🚚 무배'] : [],
        url: item.link || '',
        description: item.contentSnippet || item.content || '',
        pub_date: item.pubDate || item.isoDate || new Date().toISOString(),
        source: 'RSS-뽐뿌',
        delivery_info: price && item.title?.includes('무료') ? '무료배송' : '원문 확인',
        crawled_at: new Date().toISOString()
      };
    });
    
    console.log(`✅ 뽐뿌: ${deals.length}개 수집 완료`);
    return deals;
    
  } catch (error) {
    console.error('❌ 뽐뿌 RSS 수집 실패:', error);
    console.error(`❌ 에러 타입: ${error instanceof Error ? error.name : 'Unknown'}`);
    console.error(`❌ 에러 메시지: ${error instanceof Error ? error.message : String(error)}`);
    return [];
  }
}

// 루리웹 고속 수집 (안정적인 RSS 파서 사용)
async function collectRuliweb() {
  const url = 'https://bbs.ruliweb.com/market/board/1020/rss';
  
  try {
    console.log('🎮 루리웹 RSS 수집 시작...');
    
    const startTime = Date.now();
    
    // 안정적인 rss-parser 사용 (루리웹은 차단 없음)
    const feed = await parser.parseURL(url);
    
    const endTime = Date.now();
    
    console.log(`⏱️ 루리웹 RSS 파싱 완료: ${endTime - startTime}ms`);
    console.log(`📊 수집된 항목 수: ${feed.items?.length || 0}`);
    console.log(`🎯 피드 제목: ${feed.title || 'Unknown'}`);
    
    if (!feed.items || feed.items.length === 0) {
      console.log('⚠️ 루리웹: RSS 항목이 없음');
      return [];
    }
    
    const deals = feed.items.slice(0, 10).map((item, index) => {
      console.log(`🔍 처리 중: ${item.title || '제목없음'}`);
      const price = extractPrice(item.title || '', 'ruliweb');
      
      return {
        id: `ruliweb-${Date.now()}-${index}`,
        title: item.title || '제목 없음',
        price: price,
        original_price: price,
        discount_rate: 0,
        has_price: !!price,
        price_text: price ? `${price.toLocaleString()}원` : '가격 정보 없음',
        mall_name: '루리웹',
        mall_logo: '🎮',
        category: 'general',
        image_url: '',
        tags: price && item.title?.includes('무료') ? ['🚚 무배'] : [],
        url: item.link || '',
        description: item.contentSnippet || item.content || '',
        pub_date: item.pubDate || item.isoDate || new Date().toISOString(),
        source: 'RSS-루리웹',
        delivery_info: price && item.title?.includes('무료') ? '무료배송' : '원문 확인',
        crawled_at: new Date().toISOString()
      };
    });
    
    console.log(`✅ 루리웹: ${deals.length}개 수집 완료`);
    return deals;
    
  } catch (error) {
    console.error('❌ 루리웹 RSS 수집 실패:', error);
    console.error(`❌ 에러 타입: ${error instanceof Error ? error.name : 'Unknown'}`);
    console.error(`❌ 에러 메시지: ${error instanceof Error ? error.message : String(error)}`);
    return [];
  }
}

export async function POST() {
  try {
    console.log('🚀 고속 핫딜 업데이트 시작 (뽐뿌 + 쿨앤조이)...');
    const updateStartTime = Date.now();

    // 두 소스를 병렬로 빠르게 수집
    console.log('🚀 뽐뿌 + 루리웹 병렬 수집 시작...');
    
    const [ppomppu, ruliweb] = await Promise.all([
      collectPpomppu(),
      collectRuliweb()
    ]);
    
    console.log(`📊 수집 결과: 뽐뿌 ${ppomppu.length}개, 루리웹 ${ruliweb.length}개`);
    
    // 결과 합치기
    const deals = [...ppomppu, ...ruliweb];
    console.log(`📦 총 딜 수: ${deals.length}개`);
    
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
        sources: (ppomppu.length > 0 ? 1 : 0) + (ruliweb.length > 0 ? 1 : 0),
        fastMode: true,
        sources_detail: {
          ppomppu: ppomppu.length,
          ruliweb: ruliweb.length
        },
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
}// 강제 업데이트 Thu Feb 19 18:24:38 KST 2026
