import { NextRequest, NextResponse } from 'next/server';

// 브런치 사이트 크롤링 함수
async function crawlBrunchSite(url: string) {
  try {
    console.log(`🔍 브런치 크롤링 시작: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.8,en-US;q=0.5,en;q=0.3',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Cache-Control': 'max-age=0'
      },
      redirect: 'follow'
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    console.log(`✅ HTML 가져오기 성공: ${html.length} 문자`);
    
    // HTML 파싱으로 데이터 추출
    const extractedData = parseHtmlContent(html);
    
    return {
      success: true,
      url,
      crawledAt: new Date().toISOString(),
      contentLength: html.length,
      ...extractedData
    };

  } catch (error) {
    console.error('❌ 브런치 크롤링 실패:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류',
      url,
      crawledAt: new Date().toISOString()
    };
  }
}

// HTML 파싱 함수
function parseHtmlContent(html: string) {
  try {
    // 제목 추출
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : '';
    
    // 메타 설명 추출
    const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);
    const description = descMatch ? descMatch[1].trim() : '';
    
    // 작성자 정보 추출
    const authorMatch = html.match(/<meta[^>]+property=["']article:author["'][^>]+content=["']([^"']+)["']/i) ||
                       html.match(/작성자[:\s]*([^<\n]+)/i);
    const author = authorMatch ? authorMatch[1].trim() : '';
    
    // 게시날짜 추출
    const dateMatch = html.match(/<time[^>]*datetime=["']([^"']+)["']/i) ||
                     html.match(/<meta[^>]+property=["']article:published_time["'][^>]+content=["']([^"']+)["']/i);
    const publishedDate = dateMatch ? dateMatch[1].trim() : '';
    
    // 본문 텍스트 추출 (간단한 방법)
    let content = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // 스크립트 제거
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')   // 스타일 제거
      .replace(/<[^>]+>/g, ' ')                         // HTML 태그 제거
      .replace(/\s+/g, ' ')                             // 공백 정리
      .trim();
    
    // 너무 긴 내용은 앞부분만
    if (content.length > 1000) {
      content = content.substring(0, 1000) + '...';
    }
    
    // 링크 추출
    const linkMatches = html.match(/https?:\/\/[^\s"'<>]+/gi) || [];
    const links = [...new Set(linkMatches)].slice(0, 10); // 중복 제거, 최대 10개
    
    // 이미지 추출
    const imgMatches = html.match(/<img[^>]+src=["']([^"']+)["']/gi) || [];
    const images = imgMatches.map(match => {
      const srcMatch = match.match(/src=["']([^"']+)["']/i);
      return srcMatch ? srcMatch[1] : null;
    }).filter(Boolean).slice(0, 5); // 최대 5개
    
    return {
      title,
      description,
      author,
      publishedDate,
      content,
      links: links.length > 0 ? links : [],
      images: images.length > 0 ? images : [],
      stats: {
        contentLength: content.length,
        linkCount: links.length,
        imageCount: images.length
      }
    };
    
  } catch (error) {
    console.error('❌ HTML 파싱 실패:', error);
    return {
      title: '',
      description: '',
      author: '',
      content: '',
      links: [],
      images: [],
      parseError: error instanceof Error ? error.message : '파싱 오류'
    };
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get('url');
  
  if (!targetUrl) {
    return NextResponse.json({
      success: false,
      message: 'URL 파라미터가 필요합니다. ?url=https://example.com'
    }, { status: 400 });
  }
  
  // URL 검증
  try {
    new URL(targetUrl);
  } catch {
    return NextResponse.json({
      success: false,
      message: '유효하지 않은 URL입니다.'
    }, { status: 400 });
  }
  
  console.log('🚀 브런치 크롤링 API 호출됨:', targetUrl);
  
  const result = await crawlBrunchSite(targetUrl);
  return NextResponse.json(result);
}

// POST로 여러 URL 동시 크롤링
export async function POST(request: NextRequest) {
  try {
    const { urls } = await request.json();
    
    if (!urls || !Array.isArray(urls)) {
      return NextResponse.json({
        success: false,
        message: 'urls 배열이 필요합니다.'
      }, { status: 400 });
    }

    console.log('🔄 다중 브런치 크롤링 시작:', urls);
    
    const results = [];
    
    for (const url of urls) {
      try {
        new URL(url); // URL 검증
        const result = await crawlBrunchSite(url);
        results.push(result);
        
        // 요청 간격 (2초) - 서버 부하 방지
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch {
        results.push({
          success: false,
          error: '유효하지 않은 URL',
          url,
          crawledAt: new Date().toISOString()
        });
      }
    }

    return NextResponse.json({
      success: true,
      crawledCount: results.length,
      successCount: results.filter(r => r.success).length,
      results,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '요청 처리 실패'
    }, { status: 500 });
  }
}