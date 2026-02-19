import { NextRequest, NextResponse } from 'next/server';

// RSS 테스트 결과 타입 정의
interface RSSTestResult {
  url: string;
  status?: number;
  success: boolean;
  hasRSS: boolean;
  error?: string;
  itemCount?: number;
  contentLength?: number;
  preview?: string;
}

// 핫딜 커뮤니티별 RSS/API 주소 목록
const HOTDEAL_SOURCES = [
  {
    name: '뽐뿌',
    logo: '💰',
    rssUrls: [
      'http://www.ppomppu.co.kr/rss.php?id=ppomppu',
      'http://www.ppomppu.co.kr/rss.php?id=ppomppu_jirum'
    ],
    baseUrl: 'http://www.ppomppu.co.kr',
    category: 'community'
  },
  {
    name: 'FM코리아',
    logo: '🎮', 
    rssUrls: [
      'https://www.fmkorea.com/rss.xml',
      'https://www.fmkorea.com/rss/jirum.xml',
      'https://www.fmkorea.com/rss/best.xml'
    ],
    baseUrl: 'https://www.fmkorea.com',
    category: 'community'
  },
  {
    name: '퀘이사존',
    logo: '💻',
    rssUrls: [
      'https://quasarzone.com/rss/jirum',
      'https://quasarzone.com/rss.xml',
      'https://www.quasarzone.co.kr/bbs/rss.php?bo_table=jirum'
    ],
    baseUrl: 'https://quasarzone.com',
    category: 'tech'
  },
  {
    name: '루리웹',
    logo: '🎯',
    rssUrls: [
      'https://bbs.ruliweb.com/community/board/300002/rss',
      'https://bbs.ruliweb.com/rss/board/300002',
      'https://m.ruliweb.com/community/board/300002/rss'
    ],
    baseUrl: 'https://bbs.ruliweb.com',
    category: 'community'
  },
  {
    name: '어미새',
    logo: '🏠',
    rssUrls: [
      'https://www.eomisae.co.kr/rss.xml',
      'https://www.eomisae.co.kr/rss/jirum.xml',
      'https://eomisae.co.kr/rss.php?bo_table=jirum'
    ],
    baseUrl: 'https://www.eomisae.co.kr',
    category: 'community'
  },
  {
    name: '알구몬',
    logo: '🔍',
    rssUrls: [
      'https://www.algumon.com/rss.xml',
      'https://www.algumon.com/rss/jirum.xml',
      'https://algumon.com/rss.php?bo_table=jirum'
    ],
    baseUrl: 'https://www.algumon.com',
    category: 'deal'
  }
];

// RSS 피드 테스트 함수
async function testRSSFeed(url: string, sourceName: string): Promise<RSSTestResult> {
  try {
    console.log(`🔍 ${sourceName} RSS 테스트: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*',
      },
      signal: AbortSignal.timeout(10000) // 10초 타임아웃
    });

    if (!response.ok) {
      return {
        url,
        status: response.status,
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
        hasRSS: false,
        itemCount: 0
      };
    }

    const xmlText = await response.text();
    const hasRSSStructure = xmlText.includes('<rss') || xmlText.includes('<feed') || xmlText.includes('<item>');
    
    // 간단한 아이템 카운트
    const itemCount = (xmlText.match(/<item[^>]*>/gi) || []).length;
    
    return {
      url,
      status: response.status,
      success: true,
      hasRSS: hasRSSStructure,
      itemCount,
      contentLength: xmlText.length,
      preview: xmlText.substring(0, 200).replace(/\s+/g, ' ').trim()
    };
    
  } catch (error) {
    return {
      url,
      success: false,
      hasRSS: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류',
      itemCount: 0
    };
  }
}

// 메인 테스트 API
export async function GET(request: NextRequest) {
  console.log('🚀 핫딜 커뮤니티 RSS/API 확인 시작...');
  
  const results = [];
  
  for (const source of HOTDEAL_SOURCES) {
    console.log(`📡 ${source.name} 테스트 중...`);
    
    const sourceResult: any = {
      name: source.name,
      logo: source.logo,
      baseUrl: source.baseUrl,
      category: source.category,
      rssTests: [],
      validRSSUrls: [],
      recommendedUrl: null
    };
    
    // 각 RSS URL 테스트
    for (const rssUrl of source.rssUrls) {
      const testResult = await testRSSFeed(rssUrl, source.name);
      sourceResult.rssTests.push(testResult);
      
      if (testResult.success && testResult.hasRSS && (testResult.itemCount || 0) > 0) {
        sourceResult.validRSSUrls.push(rssUrl);
        
        // 첫 번째 성공한 URL을 추천
        if (!sourceResult.recommendedUrl) {
          sourceResult.recommendedUrl = rssUrl;
        }
      }
      
      // 각 요청 간 1초 대기
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    results.push(sourceResult);
  }
  
  // 결과 정리
  const summary = {
    totalSources: results.length,
    sourcesWithRSS: results.filter(r => r.validRSSUrls.length > 0).length,
    sourcesWithoutRSS: results.filter(r => r.validRSSUrls.length === 0).length,
    totalValidRSSUrls: results.reduce((sum, r) => sum + r.validRSSUrls.length, 0)
  };
  
  console.log(`✅ RSS 테스트 완료: ${summary.sourcesWithRSS}/${summary.totalSources} 사이트에서 RSS 지원`);
  
  return NextResponse.json({
    success: true,
    summary,
    sources: results,
    recommendations: results
      .filter(r => r.recommendedUrl)
      .map(r => ({
        name: r.name,
        logo: r.logo,
        url: r.recommendedUrl,
        category: r.category
      })),
    nextSteps: {
      rssImplementation: results.filter(r => r.validRSSUrls.length > 0),
      crawlingNeeded: results.filter(r => r.validRSSUrls.length === 0)
    },
    timestamp: new Date().toISOString()
  });
}

// POST로 개별 RSS 테스트
export async function POST(request: NextRequest) {
  try {
    const { url, name } = await request.json();
    
    if (!url) {
      return NextResponse.json({
        success: false,
        message: 'URL이 필요합니다.'
      }, { status: 400 });
    }
    
    console.log(`🔍 개별 RSS 테스트: ${name || 'Unknown'} - ${url}`);
    const result = await testRSSFeed(url, name || 'Test');
    
    return NextResponse.json({
      success: true,
      testResult: result,
      recommendation: result.success && result.hasRSS ? 'RSS 구현 가능' : '크롤링 필요'
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '요청 처리 실패'
    }, { status: 500 });
  }
}