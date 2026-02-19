import { writeFile, readFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// 🗄️ 간단한 JSON 파일 기반 저장소 (Supabase 대안)
// Vercel에서는 실제로 파일이 저장되지 않지만, 로컬에서는 완벽하게 작동합니다

interface Deal {
  id: string;
  title: string;
  price?: number;
  originalPrice?: number;
  discountRate: number;
  hasPrice: boolean;
  priceText: string;
  mallName: string;
  mallLogo: string;
  category: string;
  imageUrl?: string;
  tags: string[];
  url: string;
  description?: string;
  pubDate?: string;
  source: string;
  deliveryInfo: string;
  crawledAt: string;
  createdAt?: string;
  updatedAt?: string;
  // 프론트엔드 호환성 필드들
  rating?: string | null;
  reviewCount?: number | null;
  timeLeft?: string;
  soldCount?: number | null;
  priceHistory?: boolean;
  compareAvailable?: boolean;
}

interface PriceHistory {
  dealId: string;
  price?: number;
  originalPrice?: number;
  discountRate: number;
  crawledAt: string;
  createdAt: string;
}

interface CrawlLog {
  source: string;
  success: boolean;
  itemsCount: number;
  errorMessage?: string;
  crawledAt: string;
  createdAt: string;
}

const DATA_DIR = join(process.cwd(), 'data-local');
const DEALS_FILE = join(DATA_DIR, 'deals.json');
const HISTORY_FILE = join(DATA_DIR, 'price-history.json');
const LOGS_FILE = join(DATA_DIR, 'crawl-logs.json');

// 📁 디렉토리 초기화
async function initStorage() {
  try {
    if (!existsSync(DATA_DIR)) {
      await mkdir(DATA_DIR, { recursive: true });
      console.log('📁 데이터 디렉토리 생성:', DATA_DIR);
    }
    
    // 빈 파일들 생성
    const files = [
      { path: DEALS_FILE, data: [] },
      { path: HISTORY_FILE, data: [] },
      { path: LOGS_FILE, data: [] }
    ];
    
    for (const file of files) {
      if (!existsSync(file.path)) {
        await writeFile(file.path, JSON.stringify(file.data, null, 2));
        console.log('📄 초기 파일 생성:', file.path);
      }
    }
    
    return true;
  } catch (error) {
    console.log('⚠️ 로컬 저장소 초기화 실패:', error);
    return false;
  }
}

// 📖 JSON 파일 읽기
async function readJsonFile<T>(filePath: string): Promise<T[]> {
  try {
    const content = await readFile(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.log(`⚠️ 파일 읽기 실패 (${filePath}):`, error);
    return [];
  }
}

// 💾 JSON 파일 쓰기
async function writeJsonFile<T>(filePath: string, data: T[]): Promise<boolean> {
  try {
    await writeFile(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.log(`⚠️ 파일 쓰기 실패 (${filePath}):`, error);
    return false;
  }
}

// 💾 딜 저장/업데이트
export async function saveDeal(deal: any): Promise<void> {
  console.log(`💾 로컬 저장소에 딜 저장: ${deal.title.substring(0, 30)}...`);
  
  const initialized = await initStorage();
  if (!initialized) return;
  
  const deals = await readJsonFile<Deal>(DEALS_FILE);
  
  // 기존 딜 찾기
  const existingIndex = deals.findIndex(d => d.id === deal.id);
  
  const dealData: Deal = {
    id: deal.id,
    title: deal.title,
    price: deal.price,
    originalPrice: deal.originalPrice,
    discountRate: deal.discountRate || 0,
    hasPrice: deal.hasPrice || false,
    priceText: deal.priceText,
    mallName: deal.mallName,
    mallLogo: deal.mallLogo,
    category: deal.category || 'general',
    imageUrl: deal.imageUrl,
    tags: deal.tags || [],
    url: deal.url,
    description: deal.description,
    pubDate: deal.pubDate,
    source: deal.source,
    deliveryInfo: deal.deliveryInfo,
    crawledAt: deal.crawledAt,
    createdAt: deal.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  if (existingIndex >= 0) {
    // 업데이트
    deals[existingIndex] = dealData;
  } else {
    // 새로 추가
    deals.unshift(dealData); // 최신 딜을 맨 앞에
  }
  
  // 최대 1000개까지만 유지
  const trimmedDeals = deals.slice(0, 1000);
  
  const success = await writeJsonFile(DEALS_FILE, trimmedDeals);
  if (success) {
    console.log(`✅ 로컬 저장소 딜 저장 성공: ${deal.id}`);
  }
}

// 📈 가격 히스토리 저장
export async function savePriceHistory(dealId: string, price: number | null, originalPrice: number | null, discountRate: number): Promise<void> {
  if (price === null) return;
  
  console.log(`📈 가격 히스토리 저장: ${dealId} → ${price}원`);
  
  const initialized = await initStorage();
  if (!initialized) return;
  
  const history = await readJsonFile<PriceHistory>(HISTORY_FILE);
  
  const historyData: PriceHistory = {
    dealId,
    price: price || undefined,
    originalPrice: originalPrice || undefined,
    discountRate,
    crawledAt: new Date().toISOString(),
    createdAt: new Date().toISOString()
  };
  
  history.unshift(historyData); // 최신 기록을 맨 앞에
  
  // 최대 5000개까지만 유지
  const trimmedHistory = history.slice(0, 5000);
  
  const success = await writeJsonFile(HISTORY_FILE, trimmedHistory);
  if (success) {
    console.log(`✅ 가격 히스토리 저장 성공: ${dealId}`);
  }
}

// 📝 크롤링 로그 저장
export async function saveCrawlLog(source: string, success: boolean, itemsCount: number = 0, errorMessage?: string): Promise<void> {
  console.log(`📝 크롤링 로그: ${source} → ${success ? '성공' : '실패'} (${itemsCount}개)`);
  
  const initialized = await initStorage();
  if (!initialized) return;
  
  const logs = await readJsonFile<CrawlLog>(LOGS_FILE);
  
  const logData: CrawlLog = {
    source,
    success,
    itemsCount,
    errorMessage,
    crawledAt: new Date().toISOString(),
    createdAt: new Date().toISOString()
  };
  
  logs.unshift(logData); // 최신 로그를 맨 앞에
  
  // 최대 1000개까지만 유지
  const trimmedLogs = logs.slice(0, 1000);
  
  const writeSuccess = await writeJsonFile(LOGS_FILE, trimmedLogs);
  if (writeSuccess) {
    console.log(`✅ 크롤링 로그 저장 성공: ${source}`);
  }
}

// 🔍 최신 딜 조회
export async function getLatestDeals(limit: number = 50): Promise<Deal[]> {
  console.log(`🔍 로컬 저장소에서 최신 ${limit}개 딜 조회...`);
  
  const deals = await readJsonFile<Deal>(DEALS_FILE);
  
  // 가격 있는 것 우선, 그 다음 시간 순 정렬
  const sortedDeals = deals
    .sort((a, b) => {
      if (a.hasPrice && !b.hasPrice) return -1;
      if (!a.hasPrice && b.hasPrice) return 1;
      return new Date(b.crawledAt).getTime() - new Date(a.crawledAt).getTime();
    })
    .slice(0, limit);
  
  console.log(`✅ 로컬 저장소 딜 조회 성공: ${sortedDeals.length}개`);
  return sortedDeals;
}

// 🔍 특정 딜 조회
export async function getDealById(id: string): Promise<Deal | null> {
  console.log(`🔍 딜 상세 조회: ${id}`);
  
  const deals = await readJsonFile<Deal>(DEALS_FILE);
  const deal = deals.find(d => d.id === id);
  
  if (deal) {
    console.log(`✅ 딜 조회 성공: ${id}`);
    return deal;
  }
  
  console.log(`⚠️ 딜을 찾을 수 없음: ${id}`);
  return null;
}

// 📈 가격 히스토리 조회
export async function getPriceHistory(dealId: string, limit: number = 30): Promise<PriceHistory[]> {
  console.log(`📈 가격 히스토리 조회: ${dealId} (최근 ${limit}개)`);
  
  const history = await readJsonFile<PriceHistory>(HISTORY_FILE);
  const dealHistory = history
    .filter(h => h.dealId === dealId)
    .sort((a, b) => new Date(b.crawledAt).getTime() - new Date(a.crawledAt).getTime())
    .slice(0, limit);
  
  console.log(`✅ 가격 히스토리 조회 성공: ${dealId} → ${dealHistory.length}개`);
  return dealHistory;
}

// 📊 크롤링 통계
export async function getCrawlStats(hours: number = 24): Promise<any[]> {
  console.log(`📊 크롤링 통계 조회: 최근 ${hours}시간`);
  
  const logs = await readJsonFile<CrawlLog>(LOGS_FILE);
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);
  
  const recentLogs = logs.filter(log => 
    new Date(log.createdAt).getTime() > since.getTime()
  );
  
  // 소스별 통계 집계
  const stats = recentLogs.reduce((acc: any, log) => {
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
    acc[source].total_items += log.itemsCount;
    
    if (!acc[source].last_crawl || log.crawledAt > acc[source].last_crawl) {
      acc[source].last_crawl = log.crawledAt;
    }
    
    return acc;
  }, {});
  
  const result = Object.values(stats);
  console.log(`✅ 크롤링 통계: ${result.length}개 소스`);
  return result;
}

// 🧹 오래된 데이터 정리
export async function cleanupOldData(daysToKeep: number = 30): Promise<{historyDeleted: number, logDeleted: number}> {
  console.log(`🧹 ${daysToKeep}일 이전 데이터 정리...`);
  
  const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
  
  // 가격 히스토리 정리
  const history = await readJsonFile<PriceHistory>(HISTORY_FILE);
  const oldHistoryCount = history.length;
  const filteredHistory = history.filter(h => 
    new Date(h.createdAt).getTime() > cutoffDate.getTime()
  );
  await writeJsonFile(HISTORY_FILE, filteredHistory);
  
  // 크롤링 로그 정리
  const logs = await readJsonFile<CrawlLog>(LOGS_FILE);
  const oldLogsCount = logs.length;
  const filteredLogs = logs.filter(l => 
    new Date(l.createdAt).getTime() > cutoffDate.getTime()
  );
  await writeJsonFile(LOGS_FILE, filteredLogs);
  
  const historyDeleted = oldHistoryCount - filteredHistory.length;
  const logDeleted = oldLogsCount - filteredLogs.length;
  
  console.log(`🧹 데이터 정리 완료: 가격 히스토리 ${historyDeleted}개, 크롤링 로그 ${logDeleted}개 삭제`);
  
  return { historyDeleted, logDeleted };
}

// 🔧 연결 테스트
export async function testConnection(): Promise<boolean> {
  try {
    console.log('🔧 로컬 저장소 연결 테스트...');
    
    const initialized = await initStorage();
    if (!initialized) return false;
    
    const deals = await readJsonFile<Deal>(DEALS_FILE);
    console.log(`✅ 로컬 저장소 연결 성공! (${deals.length}개 딜)`);
    return true;
  } catch (error: any) {
    console.error('❌ 로컬 저장소 연결 실패:', error.message);
    return false;
  }
}

export default {
  saveDeal,
  savePriceHistory,
  saveCrawlLog,
  getLatestDeals,
  getDealById,
  getPriceHistory,
  getCrawlStats,
  cleanupOldData,
  testConnection
};