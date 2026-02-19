import { Deal, DealCategory } from '../types';

// 검색 함수
export function searchDeals(deals: Deal[], query: string): Deal[] {
  if (!query.trim()) return deals;

  const searchQuery = query.toLowerCase().trim();
  
  return deals.filter(deal => {
    // 제목에서 검색
    const titleMatch = deal.title.toLowerCase().includes(searchQuery);
    
    // 플랫폼명에서 검색
    const platformMatch = deal.platform.toLowerCase().includes(searchQuery);
    
    // 카테고리에서 검색 (한글 매핑)
    const categoryKeywords: Record<string, string[]> = {
      '전자': ['electronics'],
      '패션': ['fashion'],
      '식품': ['food'],
      '뷰티': ['beauty'],
      '홈': ['home'],
      '스포츠': ['sports'],
      '핫': ['hot'],
      '신상': ['new'],
      '최저가': ['lowest'],
      '마감': ['urgent']
    };
    
    const categoryMatch = Object.entries(categoryKeywords).some(([korean, english]) => {
      return searchQuery.includes(korean) && 
             english.some(cat => deal.category.includes(cat as DealCategory));
    });

    return titleMatch || platformMatch || categoryMatch;
  });
}

// 필터링 함수
export function filterDeals(
  deals: Deal[], 
  filters: {
    category?: DealCategory | 'all';
    priceRange?: [number, number];
    discountFilter?: number;
    platformFilter?: string[];
  }
): Deal[] {
  let filteredDeals = [...deals];

  // 카테고리 필터
  if (filters.category && filters.category !== 'all') {
    filteredDeals = filteredDeals.filter(deal => 
      deal.category.includes(filters.category as DealCategory)
    );
  }

  // 가격 범위 필터
  if (filters.priceRange) {
    const [minPrice, maxPrice] = filters.priceRange;
    filteredDeals = filteredDeals.filter(deal => 
      deal.dealPrice >= minPrice && deal.dealPrice <= maxPrice
    );
  }

  // 할인율 필터
  if (filters.discountFilter && filters.discountFilter > 0) {
    filteredDeals = filteredDeals.filter(deal => 
      deal.discountRate >= (filters.discountFilter || 0)
    );
  }

  // 플랫폼 필터
  if (filters.platformFilter && filters.platformFilter.length > 0) {
    filteredDeals = filteredDeals.filter(deal => 
      filters.platformFilter!.includes(deal.platform)
    );
  }

  return filteredDeals;
}

// 정렬 함수
export function sortDeals(deals: Deal[], sortBy: 'latest' | 'price_low' | 'price_high' | 'discount'): Deal[] {
  const sortedDeals = [...deals];

  switch (sortBy) {
    case 'latest':
      // timeAgo를 기준으로 정렬 (간단한 문자열 비교)
      return sortedDeals.sort((a, b) => {
        const timeA = parseTimeAgo(a.timeAgo);
        const timeB = parseTimeAgo(b.timeAgo);
        return timeA - timeB;
      });

    case 'price_low':
      return sortedDeals.sort((a, b) => a.dealPrice - b.dealPrice);

    case 'price_high':
      return sortedDeals.sort((a, b) => b.dealPrice - a.dealPrice);

    case 'discount':
      return sortedDeals.sort((a, b) => b.discountRate - a.discountRate);

    default:
      return sortedDeals;
  }
}

// timeAgo 문자열을 숫자로 변환 (정렬용)
function parseTimeAgo(timeAgo: string): number {
  if (timeAgo.includes('분')) {
    return parseInt(timeAgo) || 0;
  } else if (timeAgo.includes('시간')) {
    return (parseInt(timeAgo) || 0) * 60;
  } else if (timeAgo.includes('일')) {
    return (parseInt(timeAgo) || 0) * 60 * 24;
  }
  return 0;
}

// 검색어 자동완성
export function getSearchSuggestions(query: string, suggestions: string[]): string[] {
  if (!query.trim()) return [];
  
  const queryLower = query.toLowerCase();
  return suggestions
    .filter(suggestion => suggestion.toLowerCase().includes(queryLower))
    .slice(0, 5); // 최대 5개까지만
}

// 검색어 하이라이팅
export function highlightSearchTerm(text: string, searchTerm: string): string {
  if (!searchTerm.trim()) return text;
  
  const regex = new RegExp(`(${searchTerm})`, 'gi');
  return text.replace(regex, '<mark class="bg-yellow-200">$1</mark>');
}

// 가격 포맷팅
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    minimumFractionDigits: 0,
  }).format(price);
}

// 할인 금액 계산
export function calculateDiscountAmount(originalPrice: number, dealPrice: number): number {
  return originalPrice - dealPrice;
}

// 디바운스 훅을 위한 유틸리티
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}