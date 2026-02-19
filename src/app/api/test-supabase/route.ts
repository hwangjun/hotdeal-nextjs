import { NextResponse } from 'next/server';
import { testConnection } from '@/lib/supabase';

// 🧪 Supabase 연결 테스트 API
export async function GET() {
  try {
    console.log('🧪 Supabase 연결 테스트 시작...');
    
    // 환경변수 확인
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        success: false,
        message: '❌ Supabase 환경변수가 설정되지 않았습니다',
        env: {
          url: !!supabaseUrl,
          key: !!supabaseKey
        }
      }, { status: 400 });
    }
    
    // 연결 테스트
    const isConnected = await testConnection();
    
    if (isConnected) {
      return NextResponse.json({
        success: true,
        message: '✅ Supabase 연결 성공!',
        timestamp: new Date().toISOString(),
        config: {
          url: supabaseUrl.substring(0, 30) + '...',
          keyExists: !!supabaseKey
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        message: '❌ Supabase 연결 실패 (테이블이 없거나 권한 문제)',
        help: 'Supabase 대시보드에서 supabase-tables.sql을 실행하세요'
      }, { status: 500 });
    }
    
  } catch (error: any) {
    console.error('💥 Supabase 테스트 에러:', error);
    
    return NextResponse.json({
      success: false,
      message: `❌ Supabase 연결 실패: ${error.message}`,
      error: error.code || 'UNKNOWN_ERROR'
    }, { status: 500 });
  }
}