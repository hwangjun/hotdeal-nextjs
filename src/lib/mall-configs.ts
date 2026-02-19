import { MallConfig } from './crawl-types';

// 7개 주요 쇼핑몰 크롤링 설정
export const MALL_CONFIGS: Record<string, MallConfig> = {
  coupang: {
    name: '쿠팡',
    baseUrl: 'https://www.coupang.com',
    hotdealUrl: 'https://www.coupang.com/np/categories/393760',
    needsBrowser: true,
    waitTime: 3000,
    selectors: {
      container: '.search-product',
      title: '.name',
      price: '.price-value',
      originalPrice: '.base-price',
      discountRate: '.discount-percentage',
      imageUrl: '.search-product-wrap-img img',
      productUrl: '.search-product-link',
      rating: '.rating-total-review span:first-child',
      reviewCount: '.rating-total-review span:last-child',
      deliveryInfo: '.badge.rocket',
      tags: '.badge'
    },
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'ko-KR,ko;q=0.8,en-US;q=0.5,en;q=0.3'
    }
  },
  naver: {
    name: '네이버쇼핑',
    baseUrl: 'https://shopping.naver.com',
    hotdealUrl: 'https://shopping.naver.com/hotdeal',
    needsBrowser: true,
    waitTime: 2000,
    selectors: {
      container: '.basicList_item__0T9JD',
      title: '.basicList_title__VfX3c',
      price: '.price_num__S2p_v',
      originalPrice: '.price_original__Aw2qF',
      discountRate: '.price_discount__UsaTr',
      imageUrl: '.thumbnail_thumb__8xtk5 img',
      productUrl: '.basicList_link__1MaTN',
      rating: '.rating_star__7It_9',
      reviewCount: '.basicList_etc__1Jxc4',
      deliveryInfo: '.basicList_tag__1ZRas'
    },
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Referer': 'https://shopping.naver.com/'
    }
  },
  gmarket: {
    name: 'G마켓',
    baseUrl: 'http://www.gmarket.co.kr',
    hotdealUrl: 'http://corners.gmarket.co.kr/Bestsellers',
    needsBrowser: false,
    waitTime: 1500,
    selectors: {
      container: '.item-wrap',
      title: '.item-title',
      price: '.item_price',
      originalPrice: '.item_market_price',
      discountRate: '.item_discount',
      imageUrl: '.item-photo img',
      productUrl: '.item-link',
      rating: '.item-rating',
      reviewCount: '.item-review-count'
    },
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  },
  twentyninem: {
    name: '29CM',
    baseUrl: 'https://www.29cm.co.kr',
    hotdealUrl: 'https://www.29cm.co.kr/home/main',
    needsBrowser: true,
    waitTime: 2500,
    selectors: {
      container: '.css-1v4vdpn',
      title: '.css-1k0lp8w',
      price: '.css-18vfmjb',
      originalPrice: '.css-1wz8unu',
      discountRate: '.css-1f3k4ax',
      imageUrl: '.css-1r8cfon img',
      productUrl: '.css-1v4vdpn a',
      tags: '.css-tag'
    },
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    }
  },
  auction: {
    name: '옥션',
    baseUrl: 'http://www.auction.co.kr',
    hotdealUrl: 'http://corners.auction.co.kr/corner/AllKillBargainSale.aspx',
    needsBrowser: false,
    waitTime: 1000,
    selectors: {
      container: '.itemcard',
      title: '.item_title',
      price: '.price_real',
      originalPrice: '.price_original',
      discountRate: '.discount_percent',
      imageUrl: '.item_img img',
      productUrl: '.itemcard_info a'
    },
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  },
  lotteon: {
    name: '롯데온',
    baseUrl: 'https://www.lotteon.com',
    hotdealUrl: 'https://www.lotteon.com/',
    needsBrowser: true,
    waitTime: 2000,
    selectors: {
      container: '.srchProductItem',
      title: '.prd_name',
      price: '.price strong',
      originalPrice: '.price_regular',
      discountRate: '.discount_rate',
      imageUrl: '.prd_img img',
      productUrl: '.prd_info a',
      rating: '.rating_score',
      reviewCount: '.review_count'
    },
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  },
  epost: {
    name: '우체국쇼핑몰',
    baseUrl: 'https://shop.epost.go.kr',
    hotdealUrl: 'https://shop.epost.go.kr/',
    needsBrowser: true,
    waitTime: 1500,
    selectors: {
      container: '.goods-item',
      title: '.goods-name',
      price: '.price-sale',
      originalPrice: '.price-regular',
      discountRate: '.discount-rate',
      imageUrl: '.goods-img img',
      productUrl: '.goods-link'
    },
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  }
};

// 카테고리 매핑 (각 쇼핑몰의 카테고리를 통합된 카테고리로 매핑)
export const CATEGORY_MAPPING: Record<string, string> = {
  // 패션
  '패션': 'fashion',
  '의류': 'fashion',
  '신발': 'fashion',
  '가방': 'fashion',
  '액세서리': 'fashion',
  
  // 전자제품
  '전자제품': 'electronics',
  '디지털': 'electronics',
  '가전': 'electronics',
  '컴퓨터': 'electronics',
  '휴대폰': 'electronics',
  
  // 생활용품
  '생활용품': 'home',
  '홈': 'home',
  '인테리어': 'home',
  '주방': 'home',
  '청소': 'home',
  
  // 식품
  '식품': 'food',
  '음식': 'food',
  '간식': 'food',
  '음료': 'food',
  '건강식품': 'food',
  
  // 뷰티
  '뷰티': 'beauty',
  '화장품': 'beauty',
  '스킨케어': 'beauty',
  '헤어': 'beauty',
  
  // 스포츠
  '스포츠': 'sports',
  '운동': 'sports',
  '아웃도어': 'sports',
  '레저': 'sports'
};

// 태그 매핑
export const TAG_MAPPING: Record<string, string> = {
  '인기': 'HOT',
  '핫딜': 'HOT',
  '베스트': 'HOT',
  '추천': 'HOT',
  '신상': 'NEW',
  '새상품': 'NEW',
  '최저가': '최저가',
  '최저': '최저가',
  '마감': '마감임박',
  '마감임박': '마감임박',
  '한정': '마감임박',
  '무료배송': '무료배송',
  '배송무료': '무료배송',
  '쿠폰': '쿠폰'
};

// 사용자 에이전트 로테이션
export const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/120.0.0.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
];

// 랜덤 사용자 에이전트 선택
export const getRandomUserAgent = (): string => {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
};

// 쇼핑몰 URL 검증
export const validateMallUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};