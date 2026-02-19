import { Deal } from '../types';

export const mockDeals: Deal[] = [
  // 전자제품 - 높은 할인율
  {
    id: 1,
    title: "갤럭시 S24 Ultra 256GB 자급제",
    originalPrice: 1590000,
    dealPrice: 1190000,
    discountRate: 25,
    platform: "쿠팡",
    platformColor: "#fa722e",
    timeAgo: "1시간 전",
    category: ['electronics', 'hot'],
    tags: ['HOT', '최저가', '무료배송'],
    imageGradient: "from-blue-500 to-purple-600",
    imageIcon: "📱"
  },
  
  // 패션 - NEW 상품
  {
    id: 2,
    title: "나이키 에어포스 1 화이트 남여공용",
    originalPrice: 129000,
    dealPrice: 89000,
    discountRate: 31,
    platform: "29CM",
    platformColor: "#000",
    timeAgo: "30분 전",
    category: ['fashion', 'new'],
    tags: ['NEW', '무료배송'],
    imageGradient: "from-gray-400 to-gray-600",
    imageIcon: "👟"
  },

  // 식품 - 마감임박
  {
    id: 3,
    title: "하겐다즈 아이스크림 6개입 선물세트",
    originalPrice: 45000,
    dealPrice: 22500,
    discountRate: 50,
    platform: "11번가",
    platformColor: "#ff6b35",
    timeAgo: "2시간 전",
    category: ['food', 'urgent'],
    tags: ['마감임박', '무료배송'],
    imageGradient: "from-pink-400 to-red-500",
    imageIcon: "🍦",
    isUrgent: true
  },

  // 뷰티 - 쿠폰 할인
  {
    id: 4,
    title: "설화수 자음생크림 60ml + 증정품 6종",
    originalPrice: 280000,
    dealPrice: 168000,
    discountRate: 40,
    platform: "네이버",
    platformColor: "#03c75a",
    timeAgo: "45분 전",
    category: ['beauty', 'hot'],
    tags: ['쿠폰', '무료배송'],
    imageGradient: "from-rose-400 to-pink-500",
    imageIcon: "💄"
  },

  // 홈인테리어
  {
    id: 5,
    title: "다이슨 V15 무선청소기 골드",
    originalPrice: 899000,
    dealPrice: 629300,
    discountRate: 30,
    platform: "G마켓",
    platformColor: "#4fc3f7",
    timeAgo: "1시간 전",
    category: ['home', 'hot'],
    tags: ['HOT', '최저가'],
    imageGradient: "from-yellow-400 to-orange-500",
    imageIcon: "🏠"
  },

  // 스포츠 - 높은 할인
  {
    id: 6,
    title: "아디다스 울트라부스트 22 러닝화",
    originalPrice: 210000,
    dealPrice: 105000,
    discountRate: 50,
    platform: "쿠팡",
    platformColor: "#fa722e",
    timeAgo: "3시간 전",
    category: ['sports', 'hot'],
    tags: ['HOT', '무료배송'],
    imageGradient: "from-green-400 to-blue-500",
    imageIcon: "⚽"
  },

  // 전자제품 - 애플 제품
  {
    id: 7,
    title: "아이폰 15 Pro 128GB 자급제 전색상",
    originalPrice: 1550000,
    dealPrice: 1395000,
    discountRate: 10,
    platform: "옥션",
    platformColor: "#ee4266",
    timeAgo: "2시간 전",
    category: ['electronics', 'new'],
    tags: ['NEW', '무료배송'],
    imageGradient: "from-purple-400 to-indigo-600",
    imageIcon: "📱"
  },

  // 식품 - 건강식품
  {
    id: 8,
    title: "종근당 락토핏 생유산균 골드 6개월분",
    originalPrice: 89000,
    dealPrice: 53400,
    discountRate: 40,
    platform: "29CM",
    platformColor: "#000",
    timeAgo: "4시간 전",
    category: ['food', 'hot'],
    tags: ['쿠폰', '무료배송'],
    imageGradient: "from-green-300 to-emerald-500",
    imageIcon: "💊"
  },

  // 패션 - 명품
  {
    id: 9,
    title: "구찌 GG 마몽 미니 백팩 블랙",
    originalPrice: 2890000,
    dealPrice: 2450000,
    discountRate: 15,
    platform: "위메프",
    platformColor: "#ff6b35",
    timeAgo: "1시간 전",
    category: ['fashion', 'hot'],
    tags: ['HOT'],
    imageGradient: "from-black to-gray-800",
    imageIcon: "🎒"
  },

  // 뷰티 - 마스크팩
  {
    id: 10,
    title: "메디힐 N.M.F 아쿠아링 마스크 30매",
    originalPrice: 39000,
    dealPrice: 15600,
    discountRate: 60,
    platform: "티몬",
    platformColor: "#ff6b35",
    timeAgo: "5시간 전",
    category: ['beauty', 'urgent'],
    tags: ['마감임박', '최저가'],
    imageGradient: "from-blue-300 to-cyan-400",
    imageIcon: "✨",
    isUrgent: true
  },

  // 전자제품 - 노트북
  {
    id: 11,
    title: "맥북 에어 M2 13인치 8GB 256GB",
    originalPrice: 1690000,
    dealPrice: 1423000,
    discountRate: 16,
    platform: "네이버",
    platformColor: "#03c75a",
    timeAgo: "30분 전",
    category: ['electronics', 'new'],
    tags: ['NEW', '무료배송'],
    imageGradient: "from-gray-300 to-slate-500",
    imageIcon: "💻"
  },

  // 홈인테리어 - 가구
  {
    id: 12,
    title: "이케아 말름 서랍장 4단 화이트",
    originalPrice: 149000,
    dealPrice: 119200,
    discountRate: 20,
    platform: "11번가",
    platformColor: "#ff6b35",
    timeAgo: "2시간 전",
    category: ['home'],
    tags: ['무료배송'],
    imageGradient: "from-amber-200 to-yellow-400",
    imageIcon: "🪑"
  },

  // 스포츠 - 운동기구
  {
    id: 13,
    title: "파워랙 홈트레이닝 풀세트 덤벨포함",
    originalPrice: 890000,
    dealPrice: 623000,
    discountRate: 30,
    platform: "G마켓",
    platformColor: "#4fc3f7",
    timeAgo: "6시간 전",
    category: ['sports', 'hot'],
    tags: ['HOT'],
    imageGradient: "from-red-400 to-pink-500",
    imageIcon: "🏋️"
  },

  // 식품 - 건강즙
  {
    id: 14,
    title: "정관장 홍삼정 에브리타임 30포",
    originalPrice: 65000,
    dealPrice: 32500,
    discountRate: 50,
    platform: "쿠팡",
    platformColor: "#fa722e",
    timeAgo: "1시간 전",
    category: ['food', 'urgent'],
    tags: ['마감임박', '쿠폰'],
    imageGradient: "from-red-300 to-rose-500",
    imageIcon: "🥤",
    isUrgent: true
  },

  // 패션 - 아우터
  {
    id: 15,
    title: "노스페이스 다운자켓 남녀공용 구스다운",
    originalPrice: 459000,
    dealPrice: 321300,
    discountRate: 30,
    platform: "29CM",
    platformColor: "#000",
    timeAgo: "4시간 전",
    category: ['fashion'],
    tags: ['무료배송'],
    imageGradient: "from-indigo-400 to-purple-600",
    imageIcon: "🧥"
  },

  // 뷰티 - 향수
  {
    id: 16,
    title: "샤넬 No.5 오드퍼퓸 50ml 정품",
    originalPrice: 189000,
    dealPrice: 151200,
    discountRate: 20,
    platform: "옥션",
    platformColor: "#ee4266",
    timeAgo: "3시간 전",
    category: ['beauty', 'new'],
    tags: ['NEW'],
    imageGradient: "from-pink-200 to-rose-400",
    imageIcon: "🌸"
  },

  // 전자제품 - 헤드폰
  {
    id: 17,
    title: "소니 WH-1000XM5 무선헤드폰 노이즈캔슬링",
    originalPrice: 449000,
    dealPrice: 314300,
    discountRate: 30,
    platform: "위메프",
    platformColor: "#ff6b35",
    timeAgo: "2시간 전",
    category: ['electronics', 'hot'],
    tags: ['HOT', '최저가'],
    imageGradient: "from-slate-400 to-gray-600",
    imageIcon: "🎧"
  },

  // 홈인테리어 - 조명
  {
    id: 18,
    title: "필립스 휴 스마트전구 컬러 4개세트",
    originalPrice: 289000,
    dealPrice: 202300,
    discountRate: 30,
    platform: "티몬",
    platformColor: "#ff6b35",
    timeAgo: "5시간 전",
    category: ['home', 'new'],
    tags: ['NEW', '무료배송'],
    imageGradient: "from-yellow-200 to-amber-400",
    imageIcon: "💡"
  },

  // 스포츠 - 골프
  {
    id: 19,
    title: "테일러메이드 스텔스2 드라이버 10.5도",
    originalPrice: 690000,
    dealPrice: 483000,
    discountRate: 30,
    platform: "11번가",
    platformColor: "#ff6b35",
    timeAgo: "1시간 전",
    category: ['sports'],
    tags: ['무료배송'],
    imageGradient: "from-green-300 to-teal-500",
    imageIcon: "🏌️"
  },

  // 식품 - 커피
  {
    id: 20,
    title: "블루보틀 원두 5종 선물세트 200g*5",
    originalPrice: 125000,
    dealPrice: 87500,
    discountRate: 30,
    platform: "네이버",
    platformColor: "#03c75a",
    timeAgo: "3시간 전",
    category: ['food', 'hot'],
    tags: ['HOT', '쿠폰'],
    imageGradient: "from-amber-400 to-orange-500",
    imageIcon: "☕"
  }
];

// 검색어 제안을 위한 키워드 리스트
export const searchSuggestions = [
  "갤럭시", "아이폰", "맥북", "나이키", "아디다스",
  "다이슨", "설화수", "구찌", "샤넬", "노스페이스",
  "하겐다즈", "정관장", "메디힐", "이케아", "소니",
  "필립스", "테일러메이드", "블루보틀", "파워랙"
];

// 인기 검색어
export const popularKeywords = [
  "갤럭시 S24", "아이폰 15", "다이슨 청소기", "나이키 신발",
  "설화수 크림", "맥북 에어", "에어포스", "홍삼정"
];