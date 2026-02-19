import { NextRequest, NextResponse } from 'next/server';

// 가격 히스토리 더미 데이터 (실제로는 DB에서 가져옴)
const priceHistoryData: Record<string, any[]> = {
  "1": [
    { date: '2026-01-15', price: 35000, mall: '쿠팡' },
    { date: '2026-01-20', price: 33000, mall: '쿠팡' },
    { date: '2026-01-25', price: 31000, mall: '쿠팡' },
    { date: '2026-02-01', price: 28000, mall: '쿠팡' },
    { date: '2026-02-10', price: 29900, mall: '쿠팡' },
    { date: '2026-02-15', price: 27500, mall: '쿠팡' },
    { date: '2026-02-18', price: 25900, mall: '쿠팡' }
  ],
  "2": [
    { date: '2026-01-15', price: 89000, mall: '네이버쇼핑' },
    { date: '2026-01-22', price: 85000, mall: '네이버쇼핑' },
    { date: '2026-02-01', price: 79900, mall: '네이버쇼핑' },
    { date: '2026-02-10', price: 75000, mall: '네이버쇼핑' },
    { date: '2026-02-18', price: 69900, mall: '네이버쇼핑' }
  ]
};

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  
  const history = priceHistoryData[id] || [];
  
  if (history.length === 0) {
    return NextResponse.json({
      success: false,
      message: '가격 히스토리를 찾을 수 없습니다.'
    }, { status: 404 });
  }

  // 가격 변동률 계산
  const firstPrice = history[0].price;
  const lastPrice = history[history.length - 1].price;
  const changePercent = Math.round(((lastPrice - firstPrice) / firstPrice) * 100);
  const changeAmount = lastPrice - firstPrice;

  return NextResponse.json({
    success: true,
    data: {
      productId: id,
      history,
      stats: {
        lowestPrice: Math.min(...history.map(h => h.price)),
        highestPrice: Math.max(...history.map(h => h.price)),
        currentPrice: lastPrice,
        changePercent,
        changeAmount,
        trend: changeAmount < 0 ? 'down' : 'up'
      },
      chartData: {
        labels: history.map(h => h.date),
        datasets: [{
          label: '가격 변동',
          data: history.map(h => h.price),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true
        }]
      }
    }
  });
}