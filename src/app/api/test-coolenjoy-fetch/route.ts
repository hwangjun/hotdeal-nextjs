/**
 * 🌐 쿨앤조이 fetch API 직접 사용 테스트
 * rss-parser 대신 fetch를 직접 사용해서 우회 시도
 */

import { NextResponse } from 'next/server';

// XML 파싱 함수
function parseXMLtoItems(xmlText: string) {
  const items = [];
  const itemRegex = /<item>(.*?)<\/item>/gs;
  let match;
  
  while ((match = itemRegex.exec(xmlText)) !== null) {
    const itemXML = match[1];
    
    const titleMatch = itemXML.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/s);
    const linkMatch = itemXML.match(/<link>(.*?)<\/link>/s);
    const descMatch = itemXML.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/s);
    const pubDateMatch = itemXML.match(/<pubDate>(.*?)<\/pubDate>/s);
    
    items.push({
      title: titleMatch ? titleMatch[1].trim() : 'No title',
      link: linkMatch ? linkMatch[1].trim() : 'No link',
      description: descMatch ? descMatch[1].trim() : 'No description',
      pubDate: pubDateMatch ? pubDateMatch[1].trim() : 'No date'
    });
  }
  
  return items;
}

export async function GET() {
  const startTime = Date.now();
  const url = 'https://coolenjoy.net/bbs/rss.php?bo_table=jirum';
  
  const debugInfo = {
    url,
    timestamp: new Date().toISOString(),
    method: 'fetch API direct',
    steps: [] as any[]
  };

  try {
    debugInfo.steps.push({ step: 1, action: 'Starting fetch request', time: Date.now() });

    // 다양한 헤더로 실제 브라우저처럼 요청
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Upgrade-Insecure-Requests': '1'
      },
      // 15초 타임아웃으로 늘림
      signal: AbortSignal.timeout(15000)
    });

    const fetchTime = Date.now() - startTime;
    debugInfo.steps.push({ 
      step: 2, 
      action: 'Fetch completed', 
      time: Date.now(),
      fetchTime: `${fetchTime}ms`,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const xmlText = await response.text();
    const textTime = Date.now() - startTime;
    
    debugInfo.steps.push({
      step: 3,
      action: 'XML text received',
      time: Date.now(),
      totalTime: `${textTime}ms`,
      xmlLength: xmlText.length,
      startsWithXML: xmlText.startsWith('<?xml'),
      containsItems: xmlText.includes('<item>')
    });

    // XML 파싱
    const items = parseXMLtoItems(xmlText);
    const parseTime = Date.now() - startTime;
    
    debugInfo.steps.push({
      step: 4,
      action: 'XML parsing completed',
      time: Date.now(),
      totalTime: `${parseTime}ms`,
      itemCount: items.length
    });

    // 처음 3개 아이템 샘플
    const itemSamples = items.slice(0, 3).map((item, index) => {
      // 가격 패턴 테스트
      const pricePattern = /\(([0-9,]+)원[\/][^)]*\)/;
      const match = item.title.match(pricePattern);
      
      return {
        index: index + 1,
        title: item.title,
        hasPrice: !!match,
        extractedPrice: match ? parseInt(match[1].replace(/,/g, '')) : null,
        link: item.link
      };
    });

    debugInfo.steps.push({
      step: 5,
      action: 'Sample analysis completed',
      itemSamples
    });

    return NextResponse.json({
      success: true,
      message: '🎉 쿨앤조이 fetch 테스트 성공!',
      totalTime: `${Date.now() - startTime}ms`,
      debugInfo,
      summary: {
        method: 'fetch API direct',
        rssAccessible: true,
        itemCount: items.length,
        pricePatternMatches: itemSamples.filter(p => p.hasPrice).length,
        xmlValid: xmlText.startsWith('<?xml'),
        environment: 'Vercel Production'
      }
    });

  } catch (error: any) {
    const errorTime = Date.now() - startTime;
    
    debugInfo.steps.push({
      step: 'ERROR',
      action: 'Fetch failed',
      time: Date.now(),
      totalTime: `${errorTime}ms`,
      error: {
        name: error.name,
        message: error.message,
        cause: error.cause,
        stack: error.stack?.split('\n').slice(0, 5)
      }
    });

    return NextResponse.json({
      success: false,
      message: '❌ 쿨앤조이 fetch 테스트 실패',
      totalTime: `${errorTime}ms`,
      debugInfo,
      summary: {
        method: 'fetch API direct',
        rssAccessible: false,
        errorType: error.name,
        errorMessage: error.message,
        environment: 'Vercel Production'
      }
    });
  }
}

export async function POST() {
  return GET();
}