-- K-Taste Route Database Schema
-- International Tourist-focused Local Korean Cuisine Platform

-- Restaurants Table (맛집)
CREATE TABLE IF NOT EXISTS restaurants (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name_ko TEXT NOT NULL,
  name_en TEXT,
  name_ja TEXT,
  name_zh TEXT,
  name_th TEXT,
  
  -- Location
  region TEXT NOT NULL CHECK(region IN ('수도권', '강원도', '충청도', '전라도', '경상도', '제주도')),
  sector TEXT NOT NULL CHECK(sector IN ('공항권', '기차권', '전통시장', '노포', '향토음식', '자연권')),
  city TEXT NOT NULL,
  address TEXT NOT NULL,
  lat REAL,
  lng REAL,
  
  -- Restaurant Info
  cuisine_type TEXT,
  avg_price INTEGER,
  local_score INTEGER DEFAULT 0,
  gov_certified INTEGER DEFAULT 0,
  airport_priority TEXT CHECK(airport_priority IN ('1순위', '2순위', '기타')),
  
  -- Descriptions (multi-language)
  description_ko TEXT,
  description_en TEXT,
  description_ja TEXT,
  description_zh TEXT,
  description_th TEXT,
  
  -- Operating Status
  status TEXT DEFAULT '운영' CHECK(status IN ('운영', '휴업', '폐업')),
  
  -- Metadata
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Reviews Table (후기)
CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  restaurant_id TEXT NOT NULL,
  user_country TEXT CHECK(user_country IN ('KR', 'JP', 'CN', 'TW', 'TH', 'OTHER')),
  visit_date DATE,
  
  -- Review Content
  content_original TEXT NOT NULL,
  content_ko TEXT,
  content_en TEXT,
  content_ja TEXT,
  content_zh TEXT,
  content_th TEXT,
  
  -- Ratings
  revisit_mention INTEGER DEFAULT 0,
  rating INTEGER CHECK(rating >= 1 AND rating <= 5),
  
  -- Admin Control
  approved INTEGER DEFAULT 0,
  
  -- Metadata
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
);

-- Travel Packages Table (여행상품)
CREATE TABLE IF NOT EXISTS packages (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  
  -- Package Info
  title_ko TEXT NOT NULL,
  title_en TEXT,
  title_ja TEXT,
  title_zh TEXT,
  title_th TEXT,
  
  duration TEXT CHECK(duration IN ('3박4일', '4박5일')),
  regions TEXT, -- JSON array
  
  -- Pricing
  price_budget INTEGER,
  price_standard INTEGER,
  price_premium INTEGER,
  
  -- Details
  hotel_grade TEXT,
  restaurants TEXT, -- JSON array of restaurant IDs
  min_pax INTEGER,
  max_pax INTEGER,
  
  -- Description
  description_ko TEXT,
  description_en TEXT,
  description_ja TEXT,
  description_zh TEXT,
  description_th TEXT,
  
  -- Status
  status TEXT DEFAULT '판매중' CHECK(status IN ('판매중', '중단', '품절')),
  
  -- Metadata
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Bookings Table (예약)
CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  package_id TEXT NOT NULL,
  
  -- Customer Info
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  customer_country TEXT,
  
  -- Booking Details
  travel_date DATE NOT NULL,
  num_people INTEGER NOT NULL,
  package_type TEXT CHECK(package_type IN ('저가형', '스탠다드', '고급형')),
  total_price INTEGER NOT NULL,
  
  -- Status
  status TEXT DEFAULT '대기' CHECK(status IN ('대기', '확정', '취소', '완료')),
  
  -- Special Requests
  special_requests TEXT,
  
  -- Metadata
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (package_id) REFERENCES packages(id)
);

-- Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_restaurants_region ON restaurants(region);
CREATE INDEX IF NOT EXISTS idx_restaurants_sector ON restaurants(sector);
CREATE INDEX IF NOT EXISTS idx_restaurants_status ON restaurants(status);
CREATE INDEX IF NOT EXISTS idx_restaurants_airport ON restaurants(airport_priority);
CREATE INDEX IF NOT EXISTS idx_reviews_restaurant ON reviews(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_reviews_approved ON reviews(approved);
CREATE INDEX IF NOT EXISTS idx_packages_status ON packages(status);
CREATE INDEX IF NOT EXISTS idx_bookings_package ON bookings(package_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_travel_date ON bookings(travel_date);
