/**
 * 🔴 Supabase Realtime을 활용한 실시간 딜 업데이트 Hook
 * - 새 딜이 DB에 추가되면 즉시 UI 업데이트
 * - WebSocket 기반 실시간 푸시
 * - 사용자 경험 향상
 */

'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

interface Deal {
  id: string;
  title: string;
  price: number | null;
  original_price: number | null;
  mall_name: string;
  url: string;
  created_at: string;
  updated_at: string;
}

interface RealtimeState {
  newDeals: Deal[];
  isConnected: boolean;
  lastUpdate: Date | null;
  totalNewDeals: number;
}

export function useRealtimeDeals() {
  const [state, setState] = useState<RealtimeState>({
    newDeals: [],
    isConnected: false,
    lastUpdate: null,
    totalNewDeals: 0,
  });

  useEffect(() => {
    console.log('🔴 Supabase Realtime 구독 시작...');
    
    let channel: RealtimeChannel;

    const setupRealtimeSubscription = () => {
      // deals 테이블의 INSERT 이벤트 구독
      channel = supabase
        .channel('deals-realtime')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'deals'
          },
          (payload) => {
            console.log('🔥 새 딜 실시간 수신:', payload.new);
            
            const newDeal = payload.new as Deal;
            
            setState(prev => ({
              ...prev,
              newDeals: [newDeal, ...prev.newDeals.slice(0, 9)], // 최대 10개 유지
              lastUpdate: new Date(),
              totalNewDeals: prev.totalNewDeals + 1,
            }));
            
            // 브라우저 알림 (권한 있을 때만)
            if (Notification.permission === 'granted') {
              new Notification('🔥 새 핫딜!', {
                body: `${newDeal.title} - ${newDeal.price ? `${newDeal.price.toLocaleString()}원` : '가격 확인'}`,
                icon: '/favicon-32x32.png',
                tag: 'hotdeal-notification',
              });
            }
          }
        )
        .on('presence', { event: 'sync' }, () => {
          console.log('👥 실시간 연결 상태 동기화');
        })
        .subscribe((status) => {
          console.log('📡 Supabase Realtime 상태:', status);
          
          setState(prev => ({
            ...prev,
            isConnected: status === 'SUBSCRIBED',
          }));
        });
    };

    // 연결 설정
    setupRealtimeSubscription();

    // 알림 권한 요청
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          console.log('🔔 알림 권한:', permission);
        });
      }
    }

    // 정리 함수
    return () => {
      console.log('🔴 Supabase Realtime 구독 해제');
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  // 새 딜 알림 초기화
  const clearNewDeals = () => {
    setState(prev => ({
      ...prev,
      newDeals: [],
      totalNewDeals: 0,
    }));
  };

  return {
    ...state,
    clearNewDeals,
  };
}

// Hook만 export (컴포넌트는 별도 파일로 분리)