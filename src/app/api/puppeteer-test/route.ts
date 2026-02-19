/**
 * 🤖 Puppeteer 크롤링 테스트 API
 * RSS 차단을 완전히 우회하는 헤드리스 브라우저 크롤링
 */

import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export async function GET() {
  const startTime = Date.now();
  let browser = null;
  
  const debugInfo = {
    timestamp: new Date().toISOString(),
    method: 'Puppeteer headless browser',
    steps: [] as any[]
  };

  try {
    debugInfo.steps.push({ step: 1, action: 'Starting Puppeteer browser', time: Date.now() });

    // Puppeteer 브라우저 실행
    browser = await puppeteer.launch({
      headless: 'new', // 최신 헤드리스 모드
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process', // Vercel 호환성
        '--disable-gpu'
      ]
    });

    const launchTime = Date.now() - startTime;
    debugInfo.steps.push({ 
      step: 2, 
      action: 'Browser launched', 
      time: Date.now(),
      launchTime: `${launchTime}ms`
    });

    const page = await browser.newPage();
    
    // 실제 브라우저처럼 설정
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1920, height: 1080 });

    debugInfo.steps.push({ step: 3, action: 'Page configured', time: Date.now() });

    // 쿨앤조이 RSS 페이지로 이동
    const url = 'https://coolenjoy.net/bbs/rss.php?bo_table=jirum';
    
    debugInfo.steps.push({ step: 4, action: 'Navigating to RSS page', url, time: Date.now() });

    const response = await page.goto(url, { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });

    const navTime = Date.now() - startTime;
    debugInfo.steps.push({ 
      step: 5, 
      action: 'Page loaded', 
      time: Date.now(),
      navTime: `${navTime}ms`,
      status: response?.status() || 'unknown'
    });

    // RSS XML 콘텐츠 추출
    const xmlContent = await page.content();
    const contentTime = Date.now() - startTime;
    
    debugInfo.steps.push({
      step: 6,
      action: 'Content extracted',
      time: Date.now(),
      contentTime: `${contentTime}ms`,
      contentLength: xmlContent.length,
      isXML: xmlContent.includes('<?xml'),
      hasItems: xmlContent.includes('<item>')
    });

    // XML에서 아이템 추출 (정규식 사용)
    const itemMatches = xmlContent.match(/<item>(.*?)<\/item>/gs) || [];
    
    const items = itemMatches.slice(0, 10).map((itemXML, index) => {
      const titleMatch = itemXML.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/s) || 
                        itemXML.match(/<title>(.*?)<\/title>/s);
      const linkMatch = itemXML.match(/<link>(.*?)<\/link>/s);
      const descMatch = itemXML.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/s) || 
                       itemXML.match(/<description>(.*?)<\/description>/s);
      
      const title = titleMatch ? titleMatch[1].trim() : `아이템 ${index + 1}`;
      
      // 가격 패턴 추출
      const pricePattern = /\(([0-9,]+)원[\/\)]/;
      const priceMatch = title.match(pricePattern);
      const price = priceMatch ? parseInt(priceMatch[1].replace(/,/g, '')) : null;
      
      return {
        index: index + 1,
        title,
        link: linkMatch ? linkMatch[1].trim() : '',
        description: descMatch ? descMatch[1].trim().substring(0, 100) + '...' : '',
        hasPrice: !!price,
        price: price ? `${price.toLocaleString()}원` : '가격 정보 없음'
      };
    });

    const parseTime = Date.now() - startTime;
    debugInfo.steps.push({
      step: 7,
      action: 'Items parsed',
      time: Date.now(),
      parseTime: `${parseTime}ms`,
      itemCount: items.length,
      priceMatches: items.filter(item => item.hasPrice).length
    });

    return NextResponse.json({
      success: true,
      message: '🤖 Puppeteer 크롤링 성공!',
      totalTime: `${Date.now() - startTime}ms`,
      debugInfo,
      data: {
        method: 'Puppeteer headless browser',
        url,
        itemCount: items.length,
        priceMatches: items.filter(item => item.hasPrice).length,
        samples: items.slice(0, 3),
        environment: 'Vercel + Puppeteer'
      }
    });

  } catch (error: any) {
    const errorTime = Date.now() - startTime;
    
    debugInfo.steps.push({
      step: 'ERROR',
      action: 'Puppeteer crawling failed',
      time: Date.now(),
      totalTime: `${errorTime}ms`,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack?.split('\n').slice(0, 5)
      }
    });

    return NextResponse.json({
      success: false,
      message: '❌ Puppeteer 크롤링 실패',
      totalTime: `${errorTime}ms`,
      debugInfo,
      summary: {
        method: 'Puppeteer headless browser',
        accessible: false,
        errorType: error.name,
        errorMessage: error.message,
        environment: 'Vercel + Puppeteer'
      }
    });

  } finally {
    // 브라우저 정리
    if (browser) {
      try {
        await browser.close();
        debugInfo.steps.push({ step: 'CLEANUP', action: 'Browser closed', time: Date.now() });
      } catch (e) {
        console.error('브라우저 정리 실패:', e);
      }
    }
  }
}

export async function POST() {
  return GET();
}