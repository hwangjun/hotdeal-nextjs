import { NextResponse } from 'next/server';

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
  getLatestDeals,
  getCrawlStats,
  testConnection
} = storage;

// RSS 소스 정의 (메타데이터용)
const RSS_SOURCES = [
  {
    name: 'ppomppu',
    displayName: '뽐뿌',
    logo: '💰',
    enabled: true
  }
];

// 🚀 초고속 캐시 우선 API
export async function GET() {
  try {
    console.log('⚡ 캐시 우선 핫딜 API 시작...');
    
    // 저장소 연결 확인
    const isConnected = await testConnection();
    console.log(`🗄️ 저장소 상태: ${isConnected ? '정상' : '제한적 작동'}`);
    
    // 🗄️ 저장소에서 최신 데이터 조회 (초고속)
    try {
      const cachedDeals = await getLatestDeals(50);
      
      if (cachedDeals && cachedDeals.length > 0) {
        // 데이터 나이 확인
        const latestCrawl = new Date(cachedDeals[0].crawledAt || cachedDeals[0].created_at).getTime();
        const now = Date.now();
        const ageMinutes = (now - latestCrawl) / (1000 * 60);
        
        console.log(`⚡ 캐시된 데이터 즉시 반환: ${cachedDeals.length}개 딜 (${ageMinutes.toFixed(1)}분 전)`);
        
        const crawlStats = await getCrawlStats(24);
        
        // 15분 이상 오래된 데이터면 백그라운드 업데이트 힌트
        const needsUpdate = ageMinutes > 15;
        
        return NextResponse.json({
          success: true,
          data: cachedDeals,
          meta: {
            total: cachedDeals.length,
            withPrice: cachedDeals.filter((d: any) => d.hasPrice).length,
            timestamp: new Date().toISOString(),
            cached: true,
            fresh: ageMinutes < 10,
            ageMinutes: ageMinutes.toFixed(1),
            dataSource: 'Cached-Data',
            responseTime: '< 100ms',
            strategy: 'Cache-First',
            needsUpdate: needsUpdate,
            updateHint: needsUpdate ? 'GitHub Actions에서 곧 업데이트됩니다' : null,
            localStorage: {
              enabled: true,
              source: 'primary',
              storage: USE_SUPABASE ? 'Supabase PostgreSQL' : 'JSON Files',
              crawlStats: crawlStats
            },
            features: {
              priceHistory: true,
              priceComparison: false,
              realTimeUpdates: true,
              rssFeeds: true,
              liveSource: true,
              realImages: true,
              realPrices: true,
              fakeDataRemoved: true,
              localStorage: true
            },
            sources: RSS_SOURCES.filter(s => s.enabled).map(s => `${s.logo} ${s.displayName} RSS (실제 데이터 + ${USE_SUPABASE ? 'Supabase' : '로컬 저장'})`)
          }
        }, {
          headers: {
            // Edge 캐싱 설정 (3분 캐시, 10분까지 stale 허용)
            'Cache-Control': 's-maxage=180, stale-while-revalidate=600'
          }
        });
      } else {
        console.log('📦 캐시된 데이터 없음, 폴백 데이터 사용');
      }
    } catch (storageError) {
      console.log('⚠️ 저장소 조회 실패:', storageError);
    }
    
    // 🔄 캐시 실패 시 폴백: 정적 데이터 반환
    console.log('🔄 정적 폴백 데이터 사용');
    
    // 정적 데이터 읽기 시도
    try {
      const { readFile } = await import('fs/promises');
      const { join } = await import('path');
      
      const staticDataPath = join(process.cwd(), 'public', 'data', 'deals.json');
      const staticData = await readFile(staticDataPath, 'utf-8');
      const fallbackDeals = JSON.parse(staticData);
      
      return NextResponse.json({
        success: true,
        data: fallbackDeals.slice(0, 10), // 최대 10개
        meta: {
          total: Math.min(fallbackDeals.length, 10),
          withPrice: fallbackDeals.filter((d: any) => d.hasPrice).length,
          timestamp: new Date().toISOString(),
          cached: true,
          fresh: false,
          dataSource: 'Static-Fallback',
          responseTime: '< 50ms',
          strategy: 'Fallback-Mode',
          warning: '캐시 데이터를 불러올 수 없어 정적 데이터를 사용합니다',
          localStorage: {
            enabled: false,
            source: 'fallback',
            storage: 'Static JSON',
            crawlStats: []
          },
          features: {
            priceHistory: false,
            priceComparison: false,
            realTimeUpdates: false,
            rssFeeds: false,
            liveSource: false,
            realImages: true,
            realPrices: true,
            fakeDataRemoved: true,
            localStorage: false
          },
          sources: ['📁 정적 폴백 데이터']
        }
      });
    } catch (staticError) {
      console.error('❌ 정적 데이터도 읽기 실패:', staticError);
    }
    
    // 모든 방법 실패 시
    return NextResponse.json({
      success: false,
      error: '모든 데이터 소스 실패',
      message: '잠시 후 다시 시도해 주세요',
      data: []
    }, { status: 503 });
    
  } catch (error) {
    console.error('❌ API 에러:', error);
    
    return NextResponse.json({
      success: false,
      error: 'API 처리 실패',
      details: error instanceof Error ? error.message : String(error),
      data: []
    }, { status: 500 });
  }
}