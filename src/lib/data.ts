// 임시 더미 데이터 파일 (이제 RSS 실시간 데이터 사용)

export const deals: any[] = [];

export const navItems = [
  { key: 'home', label: '홈', icon: '🏠' },
  { key: 'deals', label: '핫딜', icon: '🔥' },
  { key: 'categories', label: '카테고리', icon: '📂' },
  { key: 'profile', label: '프로필', icon: '👤' }
];

export const categories = [
  { id: 'all', name: '전체', icon: '🌟' },
  { id: 'electronics', name: '전자기기', icon: '📱' },
  { id: 'fashion', name: '패션', icon: '👕' },
  { id: 'food', name: '식품', icon: '🍽️' },
  { id: 'living', name: '생활', icon: '🏠' },
  { id: 'health', name: '건강', icon: '💊' }
];

export function getDealDetail(id: string) {
  return null;
}

export function formatPrice(price: number) {
  return price.toLocaleString() + '원';
}

export function getPlatformInfo(platform: string) {
  return {
    name: platform,
    logo: '🏪',
    color: 'blue',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800'
  };
}

export function getRelatedDeals(dealId: string) {
  return [];
}

export const filterButtons = [
  { key: 'all', label: '전체' },
  { key: 'hot', label: '인기' },
  { key: 'new', label: '신규' },
  { key: 'discount', label: '할인' }
];

export const platforms = [];
export const sortOptions = [];
export const dealTypes = [];
export const priceRanges = [];