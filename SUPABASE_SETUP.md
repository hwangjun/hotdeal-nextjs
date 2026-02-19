# 🗄️ Supabase 설정 가이드

## 🚀 **1. Supabase 프로젝트 생성**

1. **Supabase 계정 생성**: https://supabase.com 에서 가입
2. **새 프로젝트 생성**: "New Project" 클릭
3. **프로젝트 설정**:
   - Organization: 본인 계정 선택
   - Name: `hotdeal-nextjs`
   - Database Password: 강력한 비밀번호 설정
   - Region: Northeast Asia (ap-northeast-1) 권장

## 🗄️ **2. 데이터베이스 테이블 생성**

1. **SQL Editor 접속**: 프로젝트 대시보드 → SQL Editor
2. **테이블 생성**: `supabase-tables.sql` 파일의 전체 내용을 복사
3. **SQL 실행**: "RUN" 버튼 클릭하여 실행
4. **결과 확인**: "Supabase 테이블 생성 완료! 🎉" 메시지 확인

## 🔐 **3. API 키 설정**

1. **설정 메뉴**: 프로젝트 대시보드 → Settings → API
2. **URL 복사**: Project URL을 복사
3. **키 복사**: `anon` `public` 키를 복사
4. **환경 변수 설정**:

```bash
# .env.local 파일 생성
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🔧 **4. 로컬 테스트**

```bash
# 패키지 설치
npm install @supabase/supabase-js

# 개발 서버 실행
npm run dev

# API 테스트
curl http://localhost:3000/api/deals
```

## 🌐 **5. Vercel 배포**

1. **Vercel 환경 변수 설정**:
   - Vercel 대시보드 → 프로젝트 → Settings → Environment Variables
   - `NEXT_PUBLIC_SUPABASE_URL` 추가
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` 추가

2. **배포**:
```bash
vercel --prod
```

## 📊 **6. 데이터 확인**

### **Supabase 대시보드에서**:
- Table Editor → `deals` → 저장된 딜 데이터 확인
- Table Editor → `price_history` → 가격 변화 히스토리 확인
- Table Editor → `crawl_logs` → RSS 수집 로그 확인

### **API에서**:
```bash
# 실제 사이트 API 호출
curl https://your-site.vercel.app/api/deals

# 응답에서 확인할 항목들:
# - "supabase": { "enabled": true, "saved": N, "database": "PostgreSQL" }
# - "features": { "supabaseStorage": true }
```

## ⚠️ **주의사항**

1. **Service Role Key**: 절대로 클라이언트에서 사용하지 마세요
2. **RLS 정책**: 이미 설정되어 있으므로 수정하지 마세요
3. **읽기 전용**: anon key는 읽기만 가능합니다
4. **백업**: 중요한 데이터는 정기적으로 백업하세요

## 🔍 **트러블슈팅**

### **연결 실패시**:
```bash
# 환경 변수 확인
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# 네트워크 연결 확인
curl -I https://your-project.supabase.co
```

### **테이블 없음 에러**:
- SQL Editor에서 `supabase-tables.sql` 다시 실행
- Table Editor에서 테이블 존재 여부 확인

### **권한 오류**:
- RLS 정책이 올바르게 설정되었는지 확인
- anon key vs service role key 사용 여부 확인

## ✅ **성공 확인 체크리스트**

- [ ] Supabase 프로젝트 생성 완료
- [ ] 테이블 3개 생성 완료 (deals, price_history, crawl_logs)
- [ ] 환경 변수 설정 완료
- [ ] 로컬에서 API 연결 테스트 성공
- [ ] Vercel 배포 성공
- [ ] 실제 딜 데이터가 Supabase에 저장되는 것 확인
- [ ] 가격 히스토리가 누적되는 것 확인

🎉 **모든 체크리스트 완료시 Supabase 연동 성공!**