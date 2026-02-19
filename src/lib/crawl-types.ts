// 실제 크롤링 데이터 타입 정의
export interface RealDeal {
  id: string;
  title: string;
  price: number;
  originalPrice: number;
  discountRate: number;
  mallName: string;
  mallUrl: string;
  productUrl: string;
  imageUrl: string;          // 실제 상품 이미지!
  category: string;
  rating: number;
  reviewCount: number;
  deliveryInfo: string;
  soldCount: string;
  tags: string[];            // HOT, NEW, 마감임박
  crawledAt: Date;
}

// 쇼핑몰별 크롤링 설정
export interface MallConfig {
  name: string;
  baseUrl: string;
  hotdealUrl: string;
  selectors: {
    container: string;
    title: string;
    price: string;
    originalPrice: string;
    discountRate?: string;
    imageUrl: string;
    productUrl: string;
    rating?: string;
    reviewCount?: string;
    deliveryInfo?: string;
    soldCount?: string;
    tags?: string;
  };
  headers?: Record<string, string>;
  waitTime?: number;
  needsBrowser?: boolean;
}

// 크롤링 결과 타입
export interface CrawlResult {
  success: boolean;
  data: RealDeal[];
  error?: string;
  crawledAt: Date;
  mallName: string;
}

// 캐시 타입
export interface CacheData {
  data: RealDeal[];
  lastUpdate: Date;
  ttl: number; // Time to live in minutes
}

// 에러 타입
export interface CrawlError {
  mallName: string;
  error: string;
  timestamp: Date;
  retryCount: number;
}

// 크롤링 스케줄러 상태
export interface SchedulerState {
  isRunning: boolean;
  lastRun: Date;
  nextRun: Date;
  successCount: number;
  errorCount: number;
  malls: {
    [mallName: string]: {
      lastSuccess: Date;
      lastError?: Date;
      errorMessage?: string;
      status: 'success' | 'error' | 'pending';
    };
  };
}

// API 응답 타입
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  timestamp: Date;
  totalCount?: number;
}

// 검색 및 필터 타입
export interface SearchQuery {
  q?: string;
  category?: string;
  mall?: string;
  minPrice?: number;
  maxPrice?: number;
  minDiscount?: number;
  sortBy?: 'price' | 'discount' | 'crawledAt' | 'rating';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// 통계 타입
export interface DealStats {
  totalDeals: number;
  averageDiscount: number;
  highestDiscount: RealDeal;
  lowestPrice: RealDeal;
  mostPopular: RealDeal;
  byMall: {
    [mallName: string]: {
      count: number;
      averageDiscount: number;
      averagePrice: number;
    };
  };
  byCategory: {
    [category: string]: number;
  };
  lastUpdated: Date;
}