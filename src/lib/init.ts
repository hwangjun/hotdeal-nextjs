// 시스템 초기화 (간소화 버전)
let initialized = false;

export async function initializeSystem() {
  if (initialized) return;
  
  console.log('🚀 핫딜사이트 초기화 중...');
  initialized = true;
  console.log('✅ 시스템 초기화 완료');
}

// 자동 초기화 (서버 시작 시)
if (typeof window === 'undefined') {
  setTimeout(() => {
    initializeSystem();
  }, 1000);
}
