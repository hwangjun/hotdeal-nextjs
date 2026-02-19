/**
 * 🧪 쿨앤조이 RSS 테스트 전용 API
 * Vercel 환경에서의 쿨앤조이 수집 실패 원인 파악
 */

import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

export async function GET() {
  const startTime = Date.now();
  const url = 'https://coolenjoy.net/bbs/rss.php?bo_table=jirum';
  
  const debugInfo = {
    url,
    timestamp: new Date().toISOString(),
    environment: 'Vercel',
    steps: [] as any[]
  };

  try {
    // Step 1: 기본 파서 테스트
    debugInfo.steps.push({ step: 1, action: 'Creating basic parser', time: Date.now() });
    
    const basicParser = new Parser({
      timeout: 10000,
      maxRedirects: 3
    });

    debugInfo.steps.push({ step: 2, action: 'Starting RSS fetch', time: Date.now() });

    // Step 2: RSS 파싱 시도
    const feed = await basicParser.parseURL(url);
    const fetchTime = Date.now() - startTime;
    
    debugInfo.steps.push({ 
      step: 3, 
      action: 'RSS fetch completed', 
      time: Date.now(),
      fetchTime: `${fetchTime}ms`
    });

    // Step 3: 피드 구조 분석
    const feedAnalysis = {
      title: feed.title || 'No title',
      description: feed.description || 'No description',
      link: feed.link || 'No link',
      itemCount: feed.items?.length || 0,
      language: feed.language || 'Not specified',
      lastBuildDate: feed.lastBuildDate || 'Not specified'
    };

    debugInfo.steps.push({
      step: 4,
      action: 'Feed analysis completed',
      feedAnalysis
    });

    // Step 4: 처음 3개 아이템 분석
    const itemSamples = feed.items?.slice(0, 3).map((item, index) => ({
      index: index + 1,
      title: item.title || 'No title',
      link: item.link || 'No link',
      pubDate: item.pubDate || 'No date',
      hasContent: !!item.content,
      hasDescription: !!item.description,
      contentLength: item.content?.length || 0,
      descriptionLength: item.description?.length || 0
    })) || [];

    debugInfo.steps.push({
      step: 5,
      action: 'Item samples analyzed',
      itemSamples
    });

    // 가격 패턴 테스트
    const priceTests = itemSamples.map(item => {
      const pricePattern = /\(([0-9,]+)원[\/][^)]*\)/;
      const match = item.title.match(pricePattern);
      
      return {
        title: item.title,
        hasPrice: !!match,
        extractedPrice: match ? parseInt(match[1].replace(/,/g, '')) : null
      };
    });

    debugInfo.steps.push({
      step: 6,
      action: 'Price pattern testing completed',
      priceTests
    });

    return NextResponse.json({
      success: true,
      message: '🎉 쿨앤조이 RSS 테스트 성공!',
      totalTime: `${Date.now() - startTime}ms`,
      debugInfo,
      summary: {
        rssAccessible: true,
        itemCount: feed.items?.length || 0,
        pricePatternMatches: priceTests.filter(p => p.hasPrice).length,
        environment: 'Vercel Production'
      }
    });

  } catch (error: any) {
    const errorTime = Date.now() - startTime;
    
    debugInfo.steps.push({
      step: 'ERROR',
      action: 'RSS fetch failed',
      time: Date.now(),
      error: {
        name: error.name,
        message: error.message,
        code: error.code,
        stack: error.stack?.split('\n').slice(0, 5) // 처음 5줄만
      }
    });

    return NextResponse.json({
      success: false,
      message: '❌ 쿨앤조이 RSS 테스트 실패',
      totalTime: `${errorTime}ms`,
      debugInfo,
      summary: {
        rssAccessible: false,
        errorType: error.name,
        errorMessage: error.message,
        environment: 'Vercel Production'
      }
    });
  }
}

export async function POST() {
  return GET(); // POST도 같은 동작
}