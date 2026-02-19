-- 🗄️ 핫딜사이트 Supabase 테이블 생성 SQL
-- Supabase 대시보드의 SQL Editor에서 실행하세요

-- 딜 테이블 생성
CREATE TABLE IF NOT EXISTS deals (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    price INTEGER,
    original_price INTEGER,
    discount_rate INTEGER DEFAULT 0,
    has_price BOOLEAN DEFAULT false,
    price_text TEXT,
    mall_name TEXT NOT NULL,
    mall_logo TEXT,
    category TEXT DEFAULT 'general',
    image_url TEXT,
    tags JSONB DEFAULT '[]', -- PostgreSQL JSONB 타입
    url TEXT NOT NULL,
    description TEXT,
    pub_date TIMESTAMPTZ,
    source TEXT NOT NULL,
    delivery_info TEXT,
    crawled_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 가격 히스토리 테이블
CREATE TABLE IF NOT EXISTS price_history (
    id SERIAL PRIMARY KEY,
    deal_id TEXT NOT NULL,
    price INTEGER,
    original_price INTEGER,
    discount_rate INTEGER DEFAULT 0,
    crawled_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (deal_id) REFERENCES deals (id) ON DELETE CASCADE
);

-- 크롤링 로그 테이블
CREATE TABLE IF NOT EXISTS crawl_logs (
    id SERIAL PRIMARY KEY,
    source TEXT NOT NULL,
    success BOOLEAN NOT NULL,
    items_count INTEGER DEFAULT 0,
    error_message TEXT,
    crawled_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_deals_crawled_at ON deals (crawled_at DESC);
CREATE INDEX IF NOT EXISTS idx_deals_source ON deals (source);
CREATE INDEX IF NOT EXISTS idx_deals_has_price ON deals (has_price DESC);
CREATE INDEX IF NOT EXISTS idx_deals_category ON deals (category);
CREATE INDEX IF NOT EXISTS idx_price_history_deal_id ON price_history (deal_id);
CREATE INDEX IF NOT EXISTS idx_price_history_crawled_at ON price_history (crawled_at DESC);
CREATE INDEX IF NOT EXISTS idx_crawl_logs_source ON crawl_logs (source);
CREATE INDEX IF NOT EXISTS idx_crawl_logs_created_at ON crawl_logs (created_at DESC);

-- 업데이트 트리거 (updated_at 자동 갱신)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_deals_updated_at 
    BEFORE UPDATE ON deals 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) 정책 설정 - 공개 읽기 허용
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE crawl_logs ENABLE ROW LEVEL SECURITY;

-- 공개 읽기 정책
CREATE POLICY "Public read access" ON deals FOR SELECT USING (true);
CREATE POLICY "Public read access" ON price_history FOR SELECT USING (true);
CREATE POLICY "Public read access" ON crawl_logs FOR SELECT USING (true);

-- 서버에서만 쓰기 가능 (anon key로는 읽기만)
CREATE POLICY "Service role write access" ON deals FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role write access" ON price_history FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role write access" ON crawl_logs FOR ALL USING (auth.role() = 'service_role');

-- 뷰 생성 (통계용)
CREATE OR REPLACE VIEW deal_stats AS
SELECT 
    source,
    COUNT(*) as total_deals,
    COUNT(*) FILTER (WHERE has_price = true) as deals_with_price,
    AVG(price) FILTER (WHERE price > 0) as avg_price,
    MAX(crawled_at) as latest_crawl,
    MIN(crawled_at) as earliest_crawl
FROM deals 
GROUP BY source;

-- 뷰 권한 설정
GRANT SELECT ON deal_stats TO anon;
GRANT SELECT ON deal_stats TO authenticated;

-- 테이블 권한 설정
GRANT SELECT ON deals TO anon;
GRANT SELECT ON price_history TO anon;
GRANT SELECT ON crawl_logs TO anon;

-- 완료 메시지
SELECT 'Supabase 테이블 생성 완료! 🎉' as message;