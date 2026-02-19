import { RealDeal, CacheData } from './crawl-types';

// 메모리 캐시 스토어
class MemoryCache {
  private cache = new Map<string, CacheData>();
  private readonly DEFAULT_TTL = 10; // 10분 기본 TTL
  
  set(key: string, data: RealDeal[], ttlMinutes: number = this.DEFAULT_TTL): void {
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + ttlMinutes);
    
    this.cache.set(key, {
      data,
      lastUpdate: new Date(),
      ttl: ttlMinutes
    });
    
    console.log(`💾 Cached ${data.length} items with key: ${key} (TTL: ${ttlMinutes}m)`);
  }
  
  get(key: string): RealDeal[] | null {
    const cached = this.cache.get(key);
    
    if (!cached) {
      return null;
    }
    
    // TTL 체크
    const now = new Date();
    const expiry = new Date(cached.lastUpdate);
    expiry.setMinutes(expiry.getMinutes() + cached.ttl);
    
    if (now > expiry) {
      this.cache.delete(key);
      console.log(`🗑️ Cache expired and removed: ${key}`);
      return null;
    }
    
    console.log(`🎯 Cache hit: ${key} (${cached.data.length} items)`);
    return cached.data;
  }
  
  clear(key?: string): void {
    if (key) {
      this.cache.delete(key);
      console.log(`🗑️ Cache cleared: ${key}`);
    } else {
      this.cache.clear();
      console.log('🗑️ All cache cleared');
    }
  }
  
  getStats(): { keys: number; totalItems: number; oldestUpdate: Date | null } {
    let totalItems = 0;
    let oldestUpdate: Date | null = null;
    
    for (const [_, cached] of this.cache) {
      totalItems += cached.data.length;
      if (!oldestUpdate || cached.lastUpdate < oldestUpdate) {
        oldestUpdate = cached.lastUpdate;
      }
    }
    
    return {
      keys: this.cache.size,
      totalItems,
      oldestUpdate
    };
  }
  
  // 만료된 캐시 정리
  cleanup(): void {
    const now = new Date();
    const keysToDelete: string[] = [];
    
    for (const [key, cached] of this.cache) {
      const expiry = new Date(cached.lastUpdate);
      expiry.setMinutes(expiry.getMinutes() + cached.ttl);
      
      if (now > expiry) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.cache.delete(key));
    
    if (keysToDelete.length > 0) {
      console.log(`🧹 Cleaned up ${keysToDelete.length} expired cache entries`);
    }
  }
}

// 싱글톤 캐시 인스턴스
export const cache = new MemoryCache();

// 캐시 키 생성 유틸리티
export const generateCacheKey = (prefix: string, params: Record<string, any> = {}): string => {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}:${params[key]}`)
    .join('|');
    
  return sortedParams ? `${prefix}:${sortedParams}` : prefix;
};

// 캐시 키 상수
export const CACHE_KEYS = {
  ALL_DEALS: 'all_deals',
  MALL_DEALS: (mallName: string) => `mall_deals:${mallName}`,
  CATEGORY_DEALS: (category: string) => `category_deals:${category}`,
  SEARCH_RESULTS: (query: string) => `search:${query}`,
  HOT_DEALS: 'hot_deals',
  NEW_DEALS: 'new_deals',
  URGENT_DEALS: 'urgent_deals'
};

// 캐시 미들웨어 함수
export async function withCache<T>(
  key: string,
  fetchFunction: () => Promise<T>,
  ttlMinutes: number = 10
): Promise<T> {
  // 캐시된 데이터 확인
  const cached = cache.get(key);
  if (cached && Array.isArray(cached)) {
    return cached as T;
  }
  
  // 캐시 미스 - 새 데이터 페치
  console.log(`📡 Cache miss: ${key} - fetching new data`);
  const freshData = await fetchFunction();
  
  // 결과가 배열인 경우에만 캐시
  if (Array.isArray(freshData)) {
    cache.set(key, freshData as RealDeal[], ttlMinutes);
  }
  
  return freshData;
}

// 정기적 캐시 정리 (백그라운드)
setInterval(() => {
  cache.cleanup();
}, 5 * 60 * 1000); // 5분마다 정리