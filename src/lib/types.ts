// Deal 관련 타입 정의
export interface Deal {
  id: number;
  title: string;
  originalPrice: number;
  dealPrice: number;
  discountRate: number;
  platform: string;
  platformColor: string;
  timeAgo: string;
  category: DealCategory[];
  tags: DealTag[];
  imageGradient: string;
  imageIcon: string;
  isUrgent?: boolean;
}

// 상세페이지용 Deal 확장 타입
export interface DealDetail extends Deal {
  images: string[];
  description: string;
  features: string[];
  shipping: string;
  mallInfo: {
    name: string;
    logo: string;
    rating: number;
    url: string;
  };
  options?: {
    name: string;
    values: string[];
  }[];
  specifications?: {
    [key: string]: string;
  };
}

// 카테고리 타입
export type DealCategory = 
  | 'hot' 
  | 'new' 
  | 'lowest' 
  | 'urgent' 
  | 'fashion' 
  | 'food' 
  | 'electronics' 
  | 'home' 
  | 'beauty' 
  | 'sports';

// 태그 타입
export type DealTag = 
  | 'HOT' 
  | 'NEW' 
  | '최저가' 
  | '마감임박' 
  | '무료배송' 
  | '쿠폰';

// 필터 버튼 타입
export interface FilterButton {
  key: DealCategory;
  label: string;
  emoji: string;
}

// 네비게이션 아이템 타입
export interface NavItem {
  key: string;
  label: string;
  icon: string;
  isActive?: boolean;
}

// 플랫폼 정보 타입
export interface Platform {
  name: string;
  color: string;
  bgColor: string;
}

// 검색 관련 타입
export interface SearchResult {
  query: string;
  results: Deal[];
  totalCount: number;
}

// 컴포넌트 Props 타입들
export interface DealCardProps {
  deal: Deal;
  onClick?: (deal: Deal) => void;
}

export interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  initialValue?: string;
}

export interface FilterBarProps {
  activeFilter: DealCategory;
  onFilterChange: (filter: DealCategory) => void;
}

export interface HeaderProps {
  title?: string;
  onSearchClick?: () => void;
}

export interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}