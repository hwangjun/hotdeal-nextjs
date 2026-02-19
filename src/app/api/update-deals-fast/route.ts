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

// 가격 추출 함수 (수정됨)
function extractPrice(title: string, source: string) {
  console.log(`💰 가격 추출 시도: "${title}"`);
  
  // 패턴 1: 괄호 안의 가격 "(16,400원/무배)", "(21,900원/무료)"  
  const pricePattern1 = /\(([0-9,]+)원[\/][^)]*\)/;
  const match1 = title.match(pricePattern1);
  
  if (match1) {
    const price = parseInt(match1[1].replace(/,/g, ''));
    console.log(`✅ 패턴1 매치: ${match1[1]} → ${price}`);
    return price;
  }
  
  // 패턴 2: 단순 괄호 가격 "(16400원)"
  const pricePattern2 = /\(([0-9,]+)원\)/;
  const match2 = title.match(pricePattern2);
  
  if (match2) {
    const price = parseInt(match2[1].replace(/,/g, ''));
    console.log(`✅ 패턴2 매치: ${match2[1]} → ${price}`);
    return price;
  }
  
  // 패턴 3: 카드할인 등 "카드11,830원"
  const pricePattern3 = /카드([0-9,]+)원/;
  const match3 = title.match(pricePattern3);
  
  if (match3) {
    const price = parseInt(match3[1].replace(/,/g, ''));
    console.log(`✅ 패턴3 매치: ${match3[1]} → ${price}`);
    return price;
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

// 쿨앤조이 고속 수집 (Vercel 환경 최적화)
async function collectCoolenjoy() {
  const url = 'https://coolenjoy.net/bbs/rss.php?bo_table=jirum';
  
  try {
    console.log('❄️ 쿨앤조이 RSS 수집 시작...');
    
    const startTime = Date.now();
    
    // 더 안정적인 방식으로 RSS 요청
    const feed = await parser.parseURL(url);
    
    const endTime = Date.now();
    
    console.log(`⏱️ 쿨앤조이 RSS 파싱 완료: ${endTime - startTime}ms`);
    console.log(`📊 수집된 항목 수: ${feed.items?.length || 0}`);
    console.log(`🎯 피드 제목: ${feed.title || 'Unknown'}`);
    
    if (!feed.items || feed.items.length === 0) {
      console.log('⚠️ 쿨앤조이: RSS 항목이 없음');
      console.log('🔍 피드 구조:', Object.keys(feed));
      return [];
    }
    
    const deals = feed.items.slice(0, 10).map((item, index) => {
      console.log(`🔍 처리 중: ${item.title || '제목없음'}`);
      const price = extractPrice(item.title || '', 'coolenjoy');
      
      return {
        id: `coolenjoy-${Date.now()}-${index}`,
        title: item.title || '제목 없음',
        price: price,
        original_price: price,
        discount_rate: 0,
        has_price: !!price,
        price_text: price ? `${price.toLocaleString()}원` : '가격 정보 없음',
        mall_name: '쿨앤조이',
        mall_logo: '❄️',
        category: 'general',
        image_url: '',
        tags: price && item.title?.includes('무료') ? ['🚚 무배'] : [],
        url: item.link || '',
        description: item.contentSnippet || item.content || '',
        pub_date: item.pubDate || item.isoDate || new Date().toISOString(),
        source: 'RSS-쿨앤조이',
        delivery_info: price && item.title?.includes('무료') ? '무료배송' : '원문 확인',
        crawled_at: new Date().toISOString()
      };
    });
    
    console.log(`✅ 쿨앤조이: ${deals.length}개 수집 완료`);
    return deals;
    
  } catch (error) {
    console.error('❌ 쿨앤조이 RSS 수집 실패:', error);
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
    console.log('🚀 뽐뿌 + 쿨앤조이 병렬 수집 시작...');
    
    const [ppomppu, coolenjoy] = await Promise.all([
      collectPpomppu(),
      collectCoolenjoy()
    ]);
    
    console.log(`📊 수집 결과: 뽐뿌 ${ppomppu.length}개, 쿨앤조이 ${coolenjoy.length}개`);
    
    // 결과 합치기
    const deals = [...ppomppu, ...coolenjoy];
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
        sources: (ppomppu.length > 0 ? 1 : 0) + (coolenjoy.length > 0 ? 1 : 0),
        fastMode: true,
        sources_detail: {
          ppomppu: ppomppu.length,
          coolenjoy: coolenjoy.length
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
}