-- K-Medical Tourism Tables for Gyeongsan City
-- 경산시 의료·한방 관광 특화 테이블

-- 1. 병원 (Hospitals)
CREATE TABLE IF NOT EXISTS hospitals (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name_ko TEXT NOT NULL,
  name_en TEXT,
  name_zh TEXT,
  name_ja TEXT,
  name_vi TEXT,
  type TEXT CHECK(type IN ('종합병원', '한의원', '요양병원', '건강검진센터')) NOT NULL,
  city TEXT NOT NULL DEFAULT '경산시',
  address TEXT NOT NULL,
  lat REAL,
  lng REAL,
  phone TEXT,
  features TEXT, -- JSON: ["365일 진료", "외국인 전용", "통역 서비스"]
  specialties TEXT, -- JSON: ["건강검진", "한방치료", "통증치료"]
  certified INTEGER DEFAULT 0, -- 의료관광 인증
  description_ko TEXT,
  description_en TEXT,
  description_zh TEXT,
  description_ja TEXT,
  description_vi TEXT,
  status TEXT DEFAULT '운영' CHECK(status IN ('운영', '휴업', '폐업')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. 건강검진 패키지 (Health Checkup Packages)
CREATE TABLE IF NOT EXISTS health_packages (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  hospital_id TEXT NOT NULL,
  name_ko TEXT NOT NULL,
  name_en TEXT,
  name_zh TEXT,
  name_ja TEXT,
  name_vi TEXT,
  package_type TEXT CHECK(package_type IN ('기본검진', '정밀검진', '암검진', 'VIP패키지', '맞춤검진')) NOT NULL,
  target_country TEXT, -- JSON: ["CN", "TW", "VN", "MN", "AE"]
  target_gender TEXT CHECK(target_gender IN ('남성', '여성', '공통')),
  target_age_min INTEGER,
  target_age_max INTEGER,
  checkup_items TEXT, -- JSON: ["혈액검사", "위내시경", "대장내시경", "CT", "MRI"]
  duration_hours INTEGER, -- 소요시간 (시간)
  price_krw INTEGER NOT NULL,
  price_usd INTEGER,
  price_cny INTEGER,
  recommended_for TEXT, -- JSON: ["위·대장 질환", "심혈관 질환", "당뇨병"]
  includes TEXT, -- JSON: ["식사 제공", "리포트 영문 제공", "통역 서비스"]
  description_ko TEXT,
  description_en TEXT,
  description_zh TEXT,
  description_ja TEXT,
  description_vi TEXT,
  popular_rank INTEGER DEFAULT 0,
  status TEXT DEFAULT '판매중' CHECK(status IN ('판매중', '중단', '품절')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id)
);

-- 3. 한방 힐링 프로그램 (Korean Medicine Wellness Programs)
CREATE TABLE IF NOT EXISTS wellness_programs (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  hospital_id TEXT NOT NULL,
  name_ko TEXT NOT NULL,
  name_en TEXT,
  name_zh TEXT,
  name_ja TEXT,
  name_vi TEXT,
  program_type TEXT CHECK(program_type IN ('침·뜸', '추나', '약침', '한방테라피', '사상체질')) NOT NULL,
  target_symptom TEXT, -- JSON: ["소화기 질환", "근골격 통증", "스트레스"]
  duration_minutes INTEGER, -- 소요시간 (분)
  sessions INTEGER DEFAULT 1, -- 회차
  price_krw INTEGER NOT NULL,
  price_usd INTEGER,
  includes TEXT, -- JSON: ["체질 분석", "생활 가이드 PDF", "한방차 제공"]
  benefits_ko TEXT,
  benefits_en TEXT,
  benefits_zh TEXT,
  description_ko TEXT,
  description_en TEXT,
  description_zh TEXT,
  description_ja TEXT,
  description_vi TEXT,
  popular_rank INTEGER DEFAULT 0,
  status TEXT DEFAULT '판매중' CHECK(status IN ('판매중', '중단', '품절')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id)
);

-- 4. 의료관광 예약 (Medical Tourism Bookings)
CREATE TABLE IF NOT EXISTS medical_bookings (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  customer_country TEXT NOT NULL, -- ISO code: CN, TW, VN, MN, AE
  customer_gender TEXT CHECK(customer_gender IN ('남성', '여성', '기타')),
  customer_age INTEGER,
  passport_number TEXT,
  
  -- 건강검진
  health_package_id TEXT,
  checkup_date DATE,
  checkup_time TEXT,
  medical_history TEXT, -- 병력
  family_history TEXT, -- 가족력
  allergies TEXT, -- 알레르기
  medications TEXT, -- 복용 약물
  
  -- 한방 프로그램
  wellness_program_id TEXT,
  wellness_date DATE,
  wellness_time TEXT,
  symptoms TEXT, -- 증상
  
  -- 부가 서비스
  needs_interpreter INTEGER DEFAULT 0,
  interpreter_language TEXT,
  needs_transportation INTEGER DEFAULT 0,
  pickup_location TEXT,
  needs_accommodation INTEGER DEFAULT 0,
  hotel_nights INTEGER,
  
  -- 결제
  total_price_krw INTEGER,
  total_price_usd INTEGER,
  payment_status TEXT DEFAULT '대기' CHECK(payment_status IN ('대기', '완료', '취소', '환불')),
  payment_method TEXT,
  
  -- 상태
  booking_status TEXT DEFAULT '신청' CHECK(booking_status IN ('신청', '확인', '검진완료', '한방완료', '취소')),
  booking_notes TEXT,
  admin_notes TEXT,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (health_package_id) REFERENCES health_packages(id),
  FOREIGN KEY (wellness_program_id) REFERENCES wellness_programs(id)
);

-- 5. 검진 결과 (Checkup Results)
CREATE TABLE IF NOT EXISTS checkup_results (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  booking_id TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  checkup_date DATE NOT NULL,
  
  -- 결과 요약
  overall_status TEXT CHECK(overall_status IN ('정상', '경증', '중증', '추가검사필요')) DEFAULT '정상',
  summary_ko TEXT,
  summary_en TEXT,
  summary_zh TEXT,
  summary_ja TEXT,
  summary_vi TEXT,
  
  -- 상세 결과 (JSON)
  blood_test TEXT, -- JSON
  urine_test TEXT, -- JSON
  imaging_results TEXT, -- JSON: CT, MRI, X-ray
  endoscopy_results TEXT, -- JSON: 위내시경, 대장내시경
  
  -- 권장사항
  recommendations_ko TEXT,
  recommendations_en TEXT,
  recommendations_zh TEXT,
  lifestyle_guide TEXT, -- JSON: 식단, 운동, 수면
  
  -- 추가 검사
  needs_followup INTEGER DEFAULT 0,
  followup_tests TEXT, -- JSON
  followup_date DATE,
  
  -- 파일
  report_url TEXT, -- PDF 리포트 URL
  images_url TEXT, -- JSON: 영상 이미지 URL
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (booking_id) REFERENCES medical_bookings(id)
);

-- 6. 의료관광 통계 (Medical Tourism Statistics)
CREATE TABLE IF NOT EXISTS medical_stats (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  date DATE NOT NULL,
  country TEXT NOT NULL,
  visitors_count INTEGER DEFAULT 0,
  checkup_count INTEGER DEFAULT 0,
  wellness_count INTEGER DEFAULT 0,
  avg_spending_krw INTEGER DEFAULT 0,
  avg_stay_days REAL DEFAULT 0,
  repeat_visitors INTEGER DEFAULT 0,
  family_visitors INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(date, country)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_hospitals_city ON hospitals(city);
CREATE INDEX IF NOT EXISTS idx_hospitals_type ON hospitals(type);
CREATE INDEX IF NOT EXISTS idx_health_packages_hospital ON health_packages(hospital_id);
CREATE INDEX IF NOT EXISTS idx_health_packages_type ON health_packages(package_type);
CREATE INDEX IF NOT EXISTS idx_wellness_programs_hospital ON wellness_programs(hospital_id);
CREATE INDEX IF NOT EXISTS idx_wellness_programs_type ON wellness_programs(program_type);
CREATE INDEX IF NOT EXISTS idx_medical_bookings_customer ON medical_bookings(customer_email);
CREATE INDEX IF NOT EXISTS idx_medical_bookings_date ON medical_bookings(checkup_date);
CREATE INDEX IF NOT EXISTS idx_medical_bookings_country ON medical_bookings(customer_country);
CREATE INDEX IF NOT EXISTS idx_checkup_results_booking ON checkup_results(booking_id);
CREATE INDEX IF NOT EXISTS idx_medical_stats_date ON medical_stats(date);
CREATE INDEX IF NOT EXISTS idx_medical_stats_country ON medical_stats(country);
