import { createClient } from '@supabase/supabase-js'

// Supabase 환경 변수 (배포시 Vercel에서 설정 필요)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key'

// Supabase 클라이언트 생성
export const supabase = createClient(supabaseUrl, supabaseKey)

// 딜 데이터 타입 정의
export interface Deal {
  id: string;
  title: string;
  price?: number | null;
  original_price?: number | null;
  discount_rate: number;
  has_price: boolean;
  price_text: string;
  mall_name: string;
  mall_logo: string;
  category: string;
  image_url?: string | null;
  tags: string[]; // JSON 배열
  url: string;
  description?: string | null;
  pub_date?: string | null;
  source: string;
  delivery_info: string;
  crawled_at: string;
  created_at?: string;
  updated_at?: string;
}

// 가격 히스토리 타입
export interface PriceHistory {
  id?: number;
  deal_id: string;
  price?: number | null;
  original_price?: number | null;
  discount_rate: number;
  crawled_at: string;
  created_at?: string;
}

// 크롤링 로그 타입
export interface CrawlLog {
  id?: number;
  source: string;
  success: boolean;
  items_count: number;
  error_message?: string;
  crawled_at: string;
  created_at?: string;
}

// 🗄️ 딜 저장/업데이트
export async function saveDeal(deal: any) {
  console.log(`💾 Supabase에 딜 저장: ${deal.title.substring(0, 30)}...`);
  
  const dealData: Deal = {
    id: deal.id,
    title: deal.title,
    price: deal.price,
    original_price: deal.originalPrice,
    discount_rate: deal.discountRate || 0,
    has_price: deal.hasPrice || false,
    price_text: deal.priceText,
    mall_name: deal.mallName,
    mall_logo: deal.mallLogo,
    category: deal.category || 'general',
    image_url: deal.imageUrl,
    tags: deal.tags || [],
    url: deal.url,
    description: deal.description,
    pub_date: deal.pubDate,
    source: deal.source,
    delivery_info: deal.deliveryInfo,
    crawled_at: deal.crawledAt
  };

  const { data, error } = await supabase
    .from('deals')
    .upsert(dealData, { 
      onConflict: 'id',
      ignoreDuplicates: false 
    })
    .select();

  if (error) {
    console.error(`❌ Supabase 딜 저장 실패 (${deal.id}):`, error.message);
    throw error;
  }

  console.log(`✅ Supabase 딜 저장 성공: ${deal.id}`);
  return data;
}

// 🗄️ 가격 히스토리 저장
export async function savePriceHistory(dealId: string, price: number | null, originalPrice: number | null, discountRate: number) {
  if (price === null) return;
  
  console.log(`📈 가격 히스토리 저장: ${dealId} → ${price}원`);
  
  const historyData: PriceHistory = {
    deal_id: dealId,
    price,
    original_price: originalPrice,
    discount_rate: discountRate,
    crawled_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('price_history')
    .insert(historyData)
    .select();

  if (error) {
    console.error(`❌ 가격 히스토리 저장 실패 (${dealId}):`, error.message);
    throw error;
  }

  console.log(`✅ 가격 히스토리 저장 성공: ${dealId}`);
  return data;
}

// 🗄️ 크롤링 로그 저장
export async function saveCrawlLog(source: string, success: boolean, itemsCount: number = 0, errorMessage?: string) {
  console.log(`📝 크롤링 로그: ${source} → ${success ? '성공' : '실패'} (${itemsCount}개)`);
  
  const logData: CrawlLog = {
    source,
    success,
    items_count: itemsCount,
    error_message: errorMessage,
    crawled_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('crawl_logs')
    .insert(logData)
    .select();

  if (error) {
    console.error(`❌ 크롤링 로그 저장 실패 (${source}):`, error.message);
    throw error;
  }

  console.log(`✅ 크롤링 로그 저장 성공: ${source}`);
  return data;
}

// 🔍 최신 딜 조회
export async function getLatestDeals(limit: number = 50) {
  console.log(`🔍 Supabase에서 최신 ${limit}개 딜 조회...`);
  
  const { data, error } = await supabase
    .from('deals')
    .select('*')
    .order('crawled_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('❌ 최신 딜 조회 실패:', error.message);
    throw error;
  }

  console.log(`✅ Supabase 딜 조회 성공: ${data?.length || 0}개`);
  return data || [];
}

// 🔍 특정 딜 조회
export async function getDealById(id: string) {
  console.log(`🔍 딜 상세 조회: ${id}`);
  
  const { data, error } = await supabase
    .from('deals')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') { // No rows returned
      console.log(`⚠️ 딜을 찾을 수 없음: ${id}`);
      return null;
    }
    console.error(`❌ 딜 조회 실패 (${id}):`, error.message);
    throw error;
  }

  console.log(`✅ 딜 조회 성공: ${id}`);
  return data;
}

// 📈 가격 히스토리 조회
export async function getPriceHistory(dealId: string, limit: number = 30) {
  console.log(`📈 가격 히스토리 조회: ${dealId} (최근 ${limit}개)`);
  
  const { data, error } = await supabase
    .from('price_history')
    .select('price, original_price, discount_rate, crawled_at')
    .eq('deal_id', dealId)
    .order('crawled_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error(`❌ 가격 히스토리 조회 실패 (${dealId}):`, error.message);
    throw error;
  }

  console.log(`✅ 가격 히스토리 조회 성공: ${dealId} → ${data?.length || 0}개`);
  return data || [];
}

// 📊 크롤링 통계
export async function getCrawlStats(hours: number = 24) {
  console.log(`📊 크롤링 통계 조회: 최근 ${hours}시간`);
  
  const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
  
  const { data, error } = await supabase
    .from('crawl_logs')
    .select(`
      source,
      success,
      items_count,
      crawled_at
    `)
    .gte('created_at', since)
    .order('crawled_at', { ascending: false });

  if (error) {
    console.error('❌ 크롤링 통계 조회 실패:', error.message);
    throw error;
  }

  // 통계 집계
  const stats = data?.reduce((acc: any, log) => {
    const source = log.source;
    if (!acc[source]) {
      acc[source] = {
        source,
        total_crawls: 0,
        successful_crawls: 0,
        total_items: 0,
        last_crawl: null
      };
    }
    
    acc[source].total_crawls++;
    if (log.success) acc[source].successful_crawls++;
    acc[source].total_items += log.items_count;
    
    if (!acc[source].last_crawl || log.crawled_at > acc[source].last_crawl) {
      acc[source].last_crawl = log.crawled_at;
    }
    
    return acc;
  }, {});

  const result = Object.values(stats || {});
  console.log(`✅ 크롤링 통계: ${result.length}개 소스`);
  return result;
}

// 🧹 오래된 데이터 정리
export async function cleanupOldData(daysToKeep: number = 30) {
  console.log(`🧹 ${daysToKeep}일 이전 데이터 정리...`);
  
  const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000).toISOString();
  
  // 오래된 가격 히스토리 삭제
  const { data: historyData, error: historyError } = await supabase
    .from('price_history')
    .delete()
    .lt('created_at', cutoffDate)
    .select('id');
  
  // 오래된 크롤링 로그 삭제
  const { data: logData, error: logError } = await supabase
    .from('crawl_logs')
    .delete()
    .lt('created_at', cutoffDate)
    .select('id');
  
  const historyDeleted = historyData?.length || 0;
  const logDeleted = logData?.length || 0;
  
  console.log(`🧹 데이터 정리 완료: 가격 히스토리 ${historyDeleted}개, 크롤링 로그 ${logDeleted}개 삭제`);
  
  return { historyDeleted, logDeleted };
}

// 🔧 Supabase 연결 테스트
export async function testConnection() {
  try {
    console.log('🔧 Supabase 연결 테스트...');
    
    const { data, error } = await supabase
      .from('deals')
      .select('id')
      .limit(1);
    
    if (error) throw error;
    
    console.log('✅ Supabase 연결 성공!');
    return true;
  } catch (error: any) {
    console.error('❌ Supabase 연결 실패:', error.message);
    return false;
  }
}

export default supabase;