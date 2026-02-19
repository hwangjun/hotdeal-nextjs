import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 🗄️ Supabase 클라이언트 초기화
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ''
);

// 📊 Supabase에서 딜 조회 (읽기 전용)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const mall = searchParams.get('mall');

    console.log(`📊 딜 조회 요청: limit=${limit}, offset=${offset}, mall=${mall || 'all'}`);

    // Supabase에서 딜 조회
    let query = supabase
      .from('deals')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // 특정 쇼핑몰 필터링
    if (mall && mall !== 'all') {
      query = query.eq('mall_name', mall);
    }

    const { data: deals, error, count } = await query;

    if (error) {
      console.error('❌ Supabase 쿼리 에러:', error);
      return NextResponse.json({
        success: false,
        error: 'Database query failed',
        details: error.message,
        data: []
      }, { status: 500 });
    }

    if (!deals || deals.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        meta: {
          total: 0,
          withPrice: 0,
          timestamp: new Date().toISOString(),
          message: '조회된 딜이 없습니다'
        }
      });
    }

    // 📈 통계 계산
    const withPrice = deals.filter(deal => deal.has_price).length;
    const mallStats = deals.reduce((acc: any, deal) => {
      const mallName = deal.mall_name || 'Unknown';
      acc[mallName] = (acc[mallName] || 0) + 1;
      return acc;
    }, {});

    // 최신 업데이트 시간 계산
    const latestUpdate = new Date(deals[0]?.created_at || Date.now());
    const ageMinutes = (Date.now() - latestUpdate.getTime()) / (1000 * 60);

    console.log(`✅ 딜 조회 성공: ${deals.length}개 반환`);

    return NextResponse.json({
      success: true,
      data: deals,
      meta: {
        total: deals.length,
        withPrice,
        mallStats,
        timestamp: new Date().toISOString(),
        latestUpdate: latestUpdate.toISOString(),
        ageMinutes: Math.round(ageMinutes * 10) / 10,
        dataSource: 'Supabase',
        version: '2.0 - Read Only',
        features: {
          priceHistory: true,
          priceComparison: true,
          realTimeData: true,
          externalCrawling: true
        }
      }
    }, {
      headers: {
        // 캐시 설정: 1분 캐시, 5분까지 stale 허용
        'Cache-Control': 's-maxage=60, stale-while-revalidate=300'
      }
    });

  } catch (error) {
    console.error('❌ API 처리 중 오류:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error),
      data: []
    }, { status: 500 });
  }
}