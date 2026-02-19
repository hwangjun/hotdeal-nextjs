import { NextRequest, NextResponse } from 'next/server';

// 가격 비교 더미 데이터
const priceCompareData: Record<string, any> = {
  "1": {
    productName: "🥩 한돈 언양식 석쇠 불고기 150g",
    prices: [
      { 
        mall: '쿠팡', 
        price: 25900, 
        originalPrice: 35900,
        discountRate: 28,
        shipping: 0, 
        shippingText: 'FREE',
        deliveryTime: '내일 도착',
        rating: 4.8,
        reviewCount: 2847,
        url: 'https://www.coupang.com/vp/products/...'
      },
      { 
        mall: '네이버쇼핑', 
        price: 27500, 
        originalPrice: 35900,
        discountRate: 23,
        shipping: 0, 
        shippingText: 'FREE',
        deliveryTime: '2일 내 도착',
        rating: 4.6,
        reviewCount: 1205,
        url: 'https://shopping.naver.com/...'
      },
      { 
        mall: 'G마켓', 
        price: 28900, 
        originalPrice: 35900,
        discountRate: 20,
        shipping: 0, 
        shippingText: 'FREE',
        deliveryTime: '3일 내 도착',
        rating: 4.4,
        reviewCount: 892,
        url: 'https://www.gmarket.co.kr/...'
      },
      { 
        mall: '29CM', 
        price: 31900, 
        originalPrice: 35900,
        discountRate: 11,
        shipping: 2500, 
        shippingText: '2,500원',
        deliveryTime: '3-5일 내 도착',
        rating: 4.2,
        reviewCount: 445,
        url: 'https://www.29cm.co.kr/...'
      }
    ]
  },
  "2": {
    productName: "🧴 클린 C 85 비타민",
    prices: [
      { 
        mall: '29CM', 
        price: 69900, 
        originalPrice: 89000,
        discountRate: 21,
        shipping: 0, 
        shippingText: 'FREE',
        deliveryTime: '당일 배송',
        rating: 4.9,
        reviewCount: 3245,
        url: 'https://www.29cm.co.kr/...'
      },
      { 
        mall: '쿠팡', 
        price: 72900, 
        originalPrice: 89000,
        discountRate: 18,
        shipping: 0, 
        shippingText: 'FREE',
        deliveryTime: '내일 도착',
        rating: 4.7,
        reviewCount: 1876,
        url: 'https://www.coupang.com/vp/products/...'
      },
      { 
        mall: '네이버쇼핑', 
        price: 75000, 
        originalPrice: 89000,
        discountRate: 16,
        shipping: 0, 
        shippingText: 'FREE',
        deliveryTime: '2일 내 도착',
        rating: 4.5,
        reviewCount: 1423,
        url: 'https://shopping.naver.com/...'
      }
    ]
  }
};

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  
  const compareData = priceCompareData[id];
  
  if (!compareData) {
    return NextResponse.json({
      success: false,
      message: '가격 비교 정보를 찾을 수 없습니다.'
    }, { status: 404 });
  }

  // 총 가격 기준으로 정렬 (가격 + 배송비)
  const sortedPrices = compareData.prices
    .map((item: any) => ({
      ...item,
      totalPrice: item.price + item.shipping
    }))
    .sort((a: any, b: any) => a.totalPrice - b.totalPrice);

  const bestDeal = sortedPrices[0];
  const worstDeal = sortedPrices[sortedPrices.length - 1];
  const savings = worstDeal.totalPrice - bestDeal.totalPrice;

  return NextResponse.json({
    success: true,
    data: {
      productId: id,
      productName: compareData.productName,
      prices: sortedPrices,
      bestDeal: {
        mall: bestDeal.mall,
        price: bestDeal.price,
        totalPrice: bestDeal.totalPrice,
        savings: savings > 0 ? savings : 0,
        savingsPercent: savings > 0 ? Math.round((savings / worstDeal.totalPrice) * 100) : 0
      },
      stats: {
        totalMalls: sortedPrices.length,
        priceRange: {
          min: bestDeal.totalPrice,
          max: worstDeal.totalPrice
        },
        avgPrice: Math.round(sortedPrices.reduce((sum: number, item: any) => sum + item.totalPrice, 0) / sortedPrices.length),
        avgDiscount: Math.round(sortedPrices.reduce((sum: number, item: any) => sum + item.discountRate, 0) / sortedPrices.length)
      }
    }
  });
}