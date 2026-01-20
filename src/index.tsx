import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import { translations } from './i18n/translations'
import { translations } from './i18n/translations'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

// Enable CORS
app.use('/api/*', cors())

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }))

// API Routes

// Database initialization endpoint (development only)
app.post('/api/init-db', async (c) => {
  const { DB } = c.env

  try {
    // Read schema from migrations file
    const schema = `
      CREATE TABLE IF NOT EXISTS restaurants (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        name_ko TEXT NOT NULL,
        name_en TEXT,
        name_ja TEXT,
        name_zh TEXT,
        name_th TEXT,
        region TEXT NOT NULL CHECK(region IN ('수도권', '강원도', '충청도', '전라도', '경상도', '제주도')),
        sector TEXT NOT NULL CHECK(sector IN ('공항권', '기차권', '전통시장', '노포', '향토음식', '자연권')),
        city TEXT NOT NULL,
        address TEXT NOT NULL,
        lat REAL,
        lng REAL,
        cuisine_type TEXT,
        avg_price INTEGER,
        local_score INTEGER DEFAULT 0,
        gov_certified INTEGER DEFAULT 0,
        airport_priority TEXT CHECK(airport_priority IN ('1순위', '2순위', '기타')),
        description_ko TEXT,
        description_en TEXT,
        description_ja TEXT,
        description_zh TEXT,
        description_th TEXT,
        status TEXT DEFAULT '운영' CHECK(status IN ('운영', '휴업', '폐업')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS reviews (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        restaurant_id TEXT NOT NULL,
        user_country TEXT CHECK(user_country IN ('KR', 'JP', 'CN', 'TW', 'TH', 'OTHER')),
        visit_date DATE,
        content_original TEXT NOT NULL,
        content_ko TEXT,
        content_en TEXT,
        content_ja TEXT,
        content_zh TEXT,
        content_th TEXT,
        revisit_mention INTEGER DEFAULT 0,
        rating INTEGER CHECK(rating >= 1 AND rating <= 5),
        approved INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
      );

      CREATE TABLE IF NOT EXISTS packages (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        title_ko TEXT NOT NULL,
        title_en TEXT,
        title_ja TEXT,
        title_zh TEXT,
        title_th TEXT,
        duration TEXT CHECK(duration IN ('3박4일', '4박5일')),
        regions TEXT,
        price_budget INTEGER,
        price_standard INTEGER,
        price_premium INTEGER,
        hotel_grade TEXT,
        restaurants TEXT,
        min_pax INTEGER,
        max_pax INTEGER,
        description_ko TEXT,
        description_en TEXT,
        description_ja TEXT,
        description_zh TEXT,
        description_th TEXT,
        status TEXT DEFAULT '판매중' CHECK(status IN ('판매중', '중단', '품절')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS bookings (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        package_id TEXT NOT NULL,
        customer_name TEXT NOT NULL,
        customer_email TEXT NOT NULL,
        customer_phone TEXT,
        customer_country TEXT,
        travel_date DATE NOT NULL,
        num_people INTEGER NOT NULL,
        package_type TEXT CHECK(package_type IN ('저가형', '스탠다드', '고급형')),
        total_price INTEGER NOT NULL,
        status TEXT DEFAULT '대기' CHECK(status IN ('대기', '확정', '취소', '완료')),
        special_requests TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (package_id) REFERENCES packages(id)
      );

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
        features TEXT,
        specialties TEXT,
        certified INTEGER DEFAULT 0,
        description_ko TEXT,
        description_en TEXT,
        description_zh TEXT,
        description_ja TEXT,
        description_vi TEXT,
        status TEXT DEFAULT '운영' CHECK(status IN ('운영', '휴업', '폐업')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS health_packages (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        hospital_id TEXT NOT NULL,
        name_ko TEXT NOT NULL,
        name_en TEXT,
        name_zh TEXT,
        name_ja TEXT,
        name_vi TEXT,
        package_type TEXT CHECK(package_type IN ('기본검진', '정밀검진', '암검진', 'VIP패키지', '맞춤검진')) NOT NULL,
        target_country TEXT,
        target_gender TEXT CHECK(target_gender IN ('남성', '여성', '공통')),
        target_age_min INTEGER,
        target_age_max INTEGER,
        checkup_items TEXT,
        duration_hours INTEGER,
        price_krw INTEGER NOT NULL,
        price_usd INTEGER,
        price_cny INTEGER,
        recommended_for TEXT,
        includes TEXT,
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

      CREATE TABLE IF NOT EXISTS wellness_programs (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        hospital_id TEXT NOT NULL,
        name_ko TEXT NOT NULL,
        name_en TEXT,
        name_zh TEXT,
        name_ja TEXT,
        name_vi TEXT,
        program_type TEXT CHECK(program_type IN ('침·뜸', '추나', '약침', '한방테라피', '사상체질')) NOT NULL,
        target_symptom TEXT,
        duration_minutes INTEGER,
        sessions INTEGER DEFAULT 1,
        price_krw INTEGER NOT NULL,
        price_usd INTEGER,
        includes TEXT,
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

      CREATE TABLE IF NOT EXISTS medical_bookings (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        customer_name TEXT NOT NULL,
        customer_email TEXT NOT NULL,
        customer_phone TEXT,
        customer_country TEXT NOT NULL,
        customer_gender TEXT CHECK(customer_gender IN ('남성', '여성', '기타')),
        customer_age INTEGER,
        passport_number TEXT,
        health_package_id TEXT,
        checkup_date DATE,
        checkup_time TEXT,
        medical_history TEXT,
        family_history TEXT,
        allergies TEXT,
        medications TEXT,
        wellness_program_id TEXT,
        wellness_date DATE,
        wellness_time TEXT,
        symptoms TEXT,
        needs_interpreter INTEGER DEFAULT 0,
        interpreter_language TEXT,
        needs_transportation INTEGER DEFAULT 0,
        pickup_location TEXT,
        needs_accommodation INTEGER DEFAULT 0,
        hotel_nights INTEGER,
        total_price_krw INTEGER,
        total_price_usd INTEGER,
        payment_status TEXT DEFAULT '대기' CHECK(payment_status IN ('대기', '완료', '취소', '환불')),
        payment_method TEXT,
        booking_status TEXT DEFAULT '신청' CHECK(booking_status IN ('신청', '확인', '검진완료', '한방완료', '취소')),
        booking_notes TEXT,
        admin_notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (health_package_id) REFERENCES health_packages(id),
        FOREIGN KEY (wellness_program_id) REFERENCES wellness_programs(id)
      );

      CREATE INDEX IF NOT EXISTS idx_hospitals_city ON hospitals(city);
      CREATE INDEX IF NOT EXISTS idx_hospitals_type ON hospitals(type);
      CREATE INDEX IF NOT EXISTS idx_health_packages_hospital ON health_packages(hospital_id);
      CREATE INDEX IF NOT EXISTS idx_health_packages_type ON health_packages(package_type);
      CREATE INDEX IF NOT EXISTS idx_wellness_programs_hospital ON wellness_programs(hospital_id);
      CREATE INDEX IF NOT EXISTS idx_wellness_programs_type ON wellness_programs(program_type);
      CREATE INDEX IF NOT EXISTS idx_medical_bookings_customer ON medical_bookings(customer_email);
      CREATE INDEX IF NOT EXISTS idx_medical_bookings_date ON medical_bookings(checkup_date);
      CREATE INDEX IF NOT EXISTS idx_medical_bookings_country ON medical_bookings(customer_country);
    `

    // Execute schema statements
    const statements = schema.split(';').filter(s => s.trim())
    for (const statement of statements) {
      if (statement.trim()) {
        await DB.prepare(statement).run()
      }
    }

    // Load seed data if tables are empty
    const { results: restaurantCount } = await DB.prepare('SELECT COUNT(*) as count FROM restaurants').all()
    if (restaurantCount[0].count === 0) {
      // Insert sample restaurants
      await DB.prepare(`
        INSERT INTO restaurants (name_ko, name_en, name_ja, name_zh, region, sector, city, address, cuisine_type, avg_price, local_score, gov_certified, airport_priority, description_ko, description_en, description_ja, description_zh, status)
        VALUES 
        ('이문설농탕', 'Imun Seolleongtang', '李門雪濃湯', '李门雪浓汤', '수도권', '노포', '서울시 종로구', '서울특별시 종로구 돈화문로 152', '설렁탕', 15000, 95, 1, '1순위', '1904년부터 100년 이상 이어온 전통 설렁탕 노포입니다. 진한 사골 육수와 부드러운 고기가 일품입니다.', 'Traditional seolleongtang (ox bone soup) restaurant established in 1904. Famous for rich bone broth and tender meat.', '1904年創業の伝統的なソルロンタン（牛骨スープ）の老舗です。', '1904年创业的传统雪浓汤老店。', '운영'),
        ('광장시장 육회', 'Gwangjang Market Yukhoe', '広蔵市場ユッケ', '广藏市场生拌牛肉', '수도권', '전통시장', '서울시 종로구', '서울특별시 종로구 창경궁로 88 광장시장', '육회', 20000, 90, 1, '1순위', '서울에서 가장 오래된 전통시장 광장시장의 명물 육회입니다. 신선한 생고기에 배와 참기름으로 버무립니다.', 'Famous yukhoe (Korean beef tartare) at Seoul''s oldest traditional market. Fresh raw beef mixed with pear and sesame oil.', 'ソウルで最も古い伝統市場、広蔵市場の名物ユッケです。', '首尔最古老传统市场广藏市场的著名生拌牛肉。', '운영'),
        ('삼진어묵 본점', 'Samjin Eomuk Main Store', '三進おでん本店', '三进鱼糕总店', '경상도', '공항권', '부산시 영도구', '부산광역시 영도구 태종로 99', '어묵', 8000, 88, 1, '1순위', '1953년 창업한 부산 대표 어묵 전문점입니다. 신선한 생선 살로 만든 수제 어묵이 유명합니다.', 'Busan''s representative fish cake specialty store established in 1953. Famous for handmade fish cakes.', '1953年創業の釜山を代表する練り物専門店です。', '1953年创立的釜山代表性鱼糕专门店。', '운영')
      `).run()

      // Insert sample packages
      await DB.prepare(`
        INSERT INTO packages (title_ko, title_en, title_ja, title_zh, duration, regions, price_budget, price_standard, price_premium, hotel_grade, description_ko, description_en, status)
        VALUES 
        ('수도권 노포 미식 투어 3박4일', 'Seoul Old Restaurant Tour 3N4D', 'ソウル老舗グルメツアー3泊4日', '首尔老店美食之旅3晚4天', '3박4일', '["수도권"]', 700, 1100, 1800, '3성급', '서울의 100년 전통 노포를 중심으로 한 미식 투어입니다. 설렁탕, 냉면, 육회 등 전통 음식을 맛볼 수 있습니다.', 'Culinary tour centered on Seoul''s 100-year-old traditional restaurants. Taste seolleongtang, naengmyeon, yukhoe.', '판매중'),
        ('부산 경상도 해안 미식 투어 4박5일', 'Busan Gyeongsang Coastal Cuisine Tour 4N5D', '釜山慶尚道海岸グルメツアー4泊5日', '釜山庆尚道海岸美食之旅4晚5天', '4박5일', '["경상도"]', 800, 1300, 2100, '4성급', '부산과 경상도 해안을 따라 신선한 해산물과 돼지국밥을 즐기는 투어입니다.', 'Tour along Busan and Gyeongsang coast enjoying fresh seafood and pork soup rice.', '판매중')
      `).run()
    }

    // Load K-Medical seed data if hospitals table is empty
    const { results: hospitalCount } = await DB.prepare('SELECT COUNT(*) as count FROM hospitals').all()
    if (hospitalCount[0].count === 0) {
      // Insert sample hospitals (K-Medical Tourism)
      await DB.prepare(`
        INSERT INTO hospitals (name_ko, name_en, name_zh, type, city, address, phone, features, specialties, certified, description_ko, description_en, status)
        VALUES 
        ('경산중앙병원', 'Gyeongsan Jungang Hospital', '庆山中央医院', '종합병원', '경산시', '경상북도 경산시 중앙로 123', '053-810-8000', '["종합건강증진센터", "국가검진", "5대암 검진", "외국인 전용"]', '["건강검진", "암검진", "정밀검진"]', 1, '경산시 대표 종합병원으로 종합건강증진센터를 기반으로 국가검진 및 5대암 검진을 제공합니다.', 'Representative general hospital in Gyeongsan providing comprehensive health screenings and cancer screenings.', '운영'),
        ('세명병원', 'Semyung Hospital', '世明医院', '종합병원', '경산시', '경상북도 경산시 중앙로 456', '053-810-7000', '["정기검진", "기업검진", "통역서비스"]', '["건강검진", "기업검진", "정밀검진"]', 1, '정기 건강검진과 기업 임직원 검진을 전문으로 하는 병원입니다.', 'Hospital specializing in regular health checkups and corporate examinations.', '운영'),
        ('경산S한의원', 'Gyeongsan S Korean Medicine Clinic', '庆山S韩医院', '한의원', '경산시', '경상북도 경산시 중앙로 789', '053-810-9000', '["한방치료", "체질분석", "침·뜸", "추나요법"]', '["한방치료", "통증치료", "체질분석"]', 1, '검진 후 맞춤 한방 치료를 제공하는 한의원입니다. 소화기, 근골격 질환 전문.', 'Korean medicine clinic providing customized treatments after checkups.', '운영')
      `).run()

      // Insert sample health packages
      await DB.prepare(`
        INSERT INTO health_packages (hospital_id, name_ko, name_en, name_zh, package_type, target_country, target_gender, checkup_items, duration_hours, price_krw, price_usd, price_cny, recommended_for, includes, description_ko, description_en, status)
        SELECT 
          h.id,
          '기본 건강검진 패키지',
          'Basic Health Checkup Package',
          '基本健康检查套餐',
          '기본검진',
          '["CN","TW","VN","MN","AE"]',
          '공통',
          '["혈액검사","소변검사","흉부X-ray","심전도","복부초음파"]',
          3,
          250000,
          200,
          1400,
          '["일반 건강 관리","정기 검진"]',
          '["식사 제공","리포트 영문 제공","통역 서비스"]',
          '대도시 대비 저렴한 비용으로 빠른 기본 건강검진을 받으실 수 있습니다.',
          'Affordable basic health checkup with fast service.',
          '판매중'
        FROM hospitals h WHERE h.name_ko = '경산중앙병원' LIMIT 1
      `).run()

      await DB.prepare(`
        INSERT INTO health_packages (hospital_id, name_ko, name_en, name_zh, package_type, target_country, target_gender, checkup_items, duration_hours, price_krw, price_usd, price_cny, recommended_for, includes, description_ko, description_en, status)
        SELECT 
          h.id,
          '정밀 건강검진 패키지 (중국인 추천)',
          'Comprehensive Health Checkup (Recommended for Chinese)',
          '精密健康检查套餐（推荐中国人）',
          '정밀검진',
          '["CN","TW"]',
          '공통',
          '["혈액검사","소변검사","위내시경","대장내시경","CT","MRI","복부초음파"]',
          5,
          800000,
          650,
          4500,
          '["위·대장 질환","소화기 질환","암 조기 발견"]',
          '["식사 제공","리포트 영문/중문 제공","통역 서비스","호텔 픽업"]',
          '중국인에게 흔한 위·대장 질환을 중점적으로 검진합니다. 대기시간 최소화.',
          'Focused checkup for stomach and colon diseases common in Chinese. Minimal wait time.',
          '판매중'
        FROM hospitals h WHERE h.name_ko = '경산중앙병원' LIMIT 1
      `).run()

      await DB.prepare(`
        INSERT INTO health_packages (hospital_id, name_ko, name_en, name_zh, package_type, target_country, target_gender, checkup_items, duration_hours, price_krw, price_usd, price_cny, recommended_for, includes, description_ko, description_en, status)
        SELECT 
          h.id,
          '심혈관 정밀검진 (중동인 추천)',
          'Cardiovascular Checkup (Recommended for Middle East)',
          '心血管精密检查（推荐中东人）',
          '정밀검진',
          '["AE","SA"]',
          '공통',
          '["혈액검사","심장초음파","심전도","운동부하검사","CT","경동맥초음파"]',
          4,
          700000,
          560,
          4000,
          '["심혈관 질환","고혈압","당뇨병"]',
          '["식사 제공","리포트 영문/아랍어 제공","통역 서비스","공항 픽업"]',
          '중동 지역 고위험군에 맞춤 심혈관 집중 검진 프로그램입니다.',
          'Specialized cardiovascular checkup program for Middle Eastern high-risk groups.',
          '판매중'
        FROM hospitals h WHERE h.name_ko = '세명병원' LIMIT 1
      `).run()

      // Insert sample wellness programs
      await DB.prepare(`
        INSERT INTO wellness_programs (hospital_id, name_ko, name_en, name_zh, program_type, target_symptom, duration_minutes, sessions, price_krw, price_usd, includes, benefits_ko, benefits_en, description_ko, description_en, status)
        SELECT 
          h.id,
          '소화기 질환 한방 치료',
          'Digestive Disorder Korean Medicine Treatment',
          '消化器疾病韩医治疗',
          '침·뜸',
          '["소화기 질환","위염","역류성식도염"]',
          60,
          3,
          180000,
          145,
          '["체질 분석","생활 가이드 PDF","한방차 제공"]',
          '검진 후 발견된 소화기 질환을 침·뜸으로 치료합니다.',
          'Treat digestive disorders found in checkup with acupuncture and moxibustion.',
          '위내시경 후 발견된 위염, 역류성 식도염 등을 한방으로 치료합니다.',
          'Treat gastritis and reflux esophagitis with Korean medicine.',
          '판매중'
        FROM hospitals h WHERE h.name_ko = '경산S한의원' LIMIT 1
      `).run()

      await DB.prepare(`
        INSERT INTO wellness_programs (hospital_id, name_ko, name_en, name_zh, program_type, target_symptom, duration_minutes, sessions, price_krw, price_usd, includes, benefits_ko, benefits_en, description_ko, description_en, status)
        SELECT 
          h.id,
          '근골격 통증 추나 치료',
          'Musculoskeletal Pain Chuna Treatment',
          '肌肉骨骼疼痛推拿治疗',
          '추나',
          '["근골격 통증","허리 통증","목 통증"]',
          90,
          5,
          350000,
          280,
          '["체질 분석","생활 가이드 PDF","운동 처방"]',
          '만성 근골격 통증을 추나요법으로 치료합니다.',
          'Treat chronic musculoskeletal pain with Chuna therapy.',
          '허리, 목, 어깨 통증을 한방 추나요법으로 치료하고 운동 처방을 제공합니다.',
          'Treat back, neck, shoulder pain with Chuna and provide exercise prescription.',
          '판매중'
        FROM hospitals h WHERE h.name_ko = '경산S한의원' LIMIT 1
      `).run()
    }

    return c.json({ success: true, message: 'Database initialized successfully' })
  } catch (error: any) {
    console.error('Database initialization error:', error)
    return c.json({ error: error.message }, 500)
  }
})

// Translations endpoint
app.get('/api/translations', (c) => {
  return c.json(translations)
})

// Featured restaurants for homepage
app.get('/api/restaurants/featured', async (c) => {
  const { DB } = c.env

  try {
    const { results } = await DB.prepare(`
      SELECT * FROM restaurants 
      WHERE status = '운영' AND gov_certified = 1
      ORDER BY local_score DESC
      LIMIT 6
    `).all()

    return c.json(results)
  } catch (error) {
    console.error('Database error:', error)
    return c.json({ error: 'Failed to fetch restaurants' }, 500)
  }
})

// Get all restaurants with filters
app.get('/api/restaurants', async (c) => {
  const { DB } = c.env
  const lang = c.req.query('lang') || 'ko'
  const region = c.req.query('region')
  const sector = c.req.query('sector')

  try {
    let query = 'SELECT * FROM restaurants WHERE status = \'운영\''
    const params: string[] = []

    if (region) {
      query += ' AND region = ?'
      params.push(region)
    }

    if (sector) {
      query += ' AND sector = ?'
      params.push(sector)
    }

    query += ' ORDER BY local_score DESC, created_at DESC'

    const stmt = params.length > 0 
      ? DB.prepare(query).bind(...params)
      : DB.prepare(query)

    const { results } = await stmt.all()
    return c.json(results)
  } catch (error) {
    console.error('Database error:', error)
    return c.json({ error: 'Failed to fetch restaurants' }, 500)
  }
})

// Get restaurant by ID
app.get('/api/restaurants/:id', async (c) => {
  const { DB } = c.env
  const id = c.req.param('id')

  try {
    const { results } = await DB.prepare(`
      SELECT * FROM restaurants WHERE id = ?
    `).bind(id).all()

    if (results.length === 0) {
      return c.json({ error: 'Restaurant not found' }, 404)
    }

    return c.json(results[0])
  } catch (error) {
    return c.json({ error: 'Failed to fetch restaurant' }, 500)
  }
})

// Get reviews for a restaurant
app.get('/api/restaurants/:id/reviews', async (c) => {
  const { DB } = c.env
  const id = c.req.param('id')

  try {
    const { results } = await DB.prepare(`
      SELECT * FROM reviews 
      WHERE restaurant_id = ? AND approved = 1
      ORDER BY created_at DESC
    `).bind(id).all()

    return c.json(results)
  } catch (error) {
    return c.json({ error: 'Failed to fetch reviews' }, 500)
  }
})

// Get all packages
app.get('/api/packages', async (c) => {
  const { DB } = c.env
  const lang = c.req.query('lang') || 'ko'
  const limit = c.req.query('limit')

  try {
    let query = 'SELECT * FROM packages WHERE status = \'판매중\' ORDER BY created_at DESC'
    
    if (limit) {
      query += ` LIMIT ${parseInt(limit)}`
    }

    const { results } = await DB.prepare(query).all()
    return c.json(results)
  } catch (error) {
    return c.json({ error: 'Failed to fetch packages' }, 500)
  }
})

// Get package by ID
app.get('/api/packages/:id', async (c) => {
  const { DB } = c.env
  const id = c.req.param('id')

  try {
    const { results } = await DB.prepare(`
      SELECT * FROM packages WHERE id = ?
    `).bind(id).all()

    if (results.length === 0) {
      return c.json({ error: 'Package not found' }, 404)
    }

    return c.json(results[0])
  } catch (error) {
    return c.json({ error: 'Failed to fetch package' }, 500)
  }
})

// Create booking (form submission)
app.post('/api/bookings', async (c) => {
  const { DB } = c.env

  try {
    const formData = await c.req.formData()
    
    const package_id = formData.get('package_id')
    const customer_name = formData.get('customer_name')
    const customer_email = formData.get('customer_email')
    const customer_phone = formData.get('customer_phone')
    const customer_country = formData.get('customer_country')
    const travel_date = formData.get('travel_date')
    const num_people = parseInt(formData.get('num_people') as string)
    const package_type = formData.get('package_type')
    const special_requests = formData.get('special_requests')

    // Calculate total price based on package type and num_people
    let basePrice = 1100 // Default to standard
    if (package_type === '저가형') basePrice = 700
    else if (package_type === '고급형') basePrice = 1800
    const total_price = basePrice * num_people
    
    const { results } = await DB.prepare(`
      INSERT INTO bookings (
        package_id, customer_name, customer_email, customer_phone, 
        customer_country, travel_date, num_people, package_type, 
        total_price, special_requests
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      package_id,
      customer_name,
      customer_email,
      customer_phone || null,
      customer_country || null,
      travel_date,
      num_people,
      package_type,
      total_price,
      special_requests || null
    ).run()

    // Redirect to success page
    return c.redirect('/reserve/success')
  } catch (error) {
    console.error('Booking error:', error)
    return c.redirect('/reserve/error')
  }
})

// Admin: Bulk upload restaurants via CSV
app.post('/api/admin/restaurants/upload', async (c) => {
  const { DB } = c.env

  try {
    const formData = await c.req.formData()
    const csvFile = formData.get('csv_file')
    
    if (!csvFile) {
      return c.json({ error: 'CSV file is required' }, 400)
    }

    // Parse CSV content (expecting format: restaurant_id,name_ko,name_en,name_ja,name_zh,name_th,region,sector,city,address,cuisine,avg_price,gov_certified,airport_priority,description,status)
    const csvText = await csvFile.text()
    const lines = csvText.split('\n').filter(line => line.trim())
    
    // Skip header line
    const dataLines = lines.slice(1)
    
    let successCount = 0
    let errorCount = 0
    
    for (const line of dataLines) {
      try {
        const fields = line.split(',').map(f => f.trim())
        
        if (fields.length < 16) continue
        
        const [
          restaurant_id,
          name_ko,
          name_en,
          name_ja,
          name_zh,
          name_th,
          region,
          sector,
          city,
          address,
          cuisine_type,
          avg_price,
          gov_certified,
          airport_priority,
          description,
          status
        ] = fields
        
        await DB.prepare(`
          INSERT INTO restaurants (
            id, name_ko, name_en, name_ja, name_zh, name_th,
            region, sector, city, address, cuisine_type, avg_price,
            gov_certified, airport_priority, description_ko, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          restaurant_id,
          name_ko,
          name_en,
          name_ja,
          name_zh,
          name_th,
          region,
          sector,
          city,
          address,
          cuisine_type,
          parseInt(avg_price),
          gov_certified === 'Y' ? 1 : 0,
          airport_priority,
          description,
          status === 'ACTIVE' ? '운영' : status === 'HOLD' ? '휴업' : '폐업'
        ).run()
        
        successCount++
      } catch (error) {
        console.error('Failed to insert row:', error)
        errorCount++
      }
    }
    
    return c.json({ 
      success: true, 
      message: `Uploaded ${successCount} restaurants, ${errorCount} errors` 
    })
  } catch (error) {
    console.error('CSV upload error:', error)
    return c.json({ error: 'Failed to upload CSV' }, 500)
  }
})

// Admin Routes

// Get all restaurants (admin)
app.get('/api/admin/restaurants', async (c) => {
  const { DB } = c.env

  try {
    const { results } = await DB.prepare(`
      SELECT * FROM restaurants ORDER BY created_at DESC
    `).all()

    return c.json(results)
  } catch (error) {
    return c.json({ error: 'Failed to fetch restaurants' }, 500)
  }
})

// Get all reviews (admin)
app.get('/api/admin/reviews', async (c) => {
  const { DB } = c.env

  try {
    const { results } = await DB.prepare(`
      SELECT 
        r.*,
        res.name_ko as restaurant_name
      FROM reviews r
      LEFT JOIN restaurants res ON r.restaurant_id = res.id
      ORDER BY r.created_at DESC
    `).all()

    return c.json(results)
  } catch (error) {
    return c.json({ error: 'Failed to fetch reviews' }, 500)
  }
})

// Get all packages (admin)
app.get('/api/admin/packages', async (c) => {
  const { DB } = c.env

  try {
    const { results } = await DB.prepare(`
      SELECT * FROM packages ORDER BY created_at DESC
    `).all()

    return c.json(results)
  } catch (error) {
    return c.json({ error: 'Failed to fetch packages' }, 500)
  }
})

// Get all bookings (admin)
app.get('/api/admin/bookings', async (c) => {
  const { DB } = c.env

  try {
    const { results } = await DB.prepare(`
      SELECT 
        b.*,
        p.title_ko as package_title
      FROM bookings b
      LEFT JOIN packages p ON b.package_id = p.id
      ORDER BY b.created_at DESC
    `).all()

    return c.json(results)
  } catch (error) {
    return c.json({ error: 'Failed to fetch bookings' }, 500)
  }
})

// ============================================
// K-MEDICAL TOURISM API ENDPOINTS
// ============================================

// Get all hospitals
app.get('/api/hospitals', async (c) => {
  const { DB } = c.env
  const type = c.req.query('type')
  const city = c.req.query('city') || '경산시'

  try {
    let query = 'SELECT * FROM hospitals WHERE status = \'운영\' AND city = ?'
    const params: string[] = [city]

    if (type) {
      query += ' AND type = ?'
      params.push(type)
    }

    query += ' ORDER BY certified DESC, created_at DESC'

    const stmt = DB.prepare(query).bind(...params)
    const { results } = await stmt.all()
    return c.json(results)
  } catch (error) {
    console.error('Database error:', error)
    return c.json({ error: 'Failed to fetch hospitals' }, 500)
  }
})

// Get hospital by ID
app.get('/api/hospitals/:id', async (c) => {
  const { DB } = c.env
  const id = c.req.param('id')

  try {
    const { results } = await DB.prepare(`
      SELECT * FROM hospitals WHERE id = ?
    `).bind(id).all()

    if (results.length === 0) {
      return c.json({ error: 'Hospital not found' }, 404)
    }

    return c.json(results[0])
  } catch (error) {
    return c.json({ error: 'Failed to fetch hospital' }, 500)
  }
})

// Get health checkup packages
app.get('/api/health-packages', async (c) => {
  const { DB } = c.env
  const hospital_id = c.req.query('hospital_id')
  const package_type = c.req.query('package_type')
  const country = c.req.query('country')

  try {
    let query = `
      SELECT hp.*, h.name_ko as hospital_name, h.name_en as hospital_name_en
      FROM health_packages hp
      LEFT JOIN hospitals h ON hp.hospital_id = h.id
      WHERE hp.status = '판매중'
    `
    const params: string[] = []

    if (hospital_id) {
      query += ' AND hp.hospital_id = ?'
      params.push(hospital_id)
    }

    if (package_type) {
      query += ' AND hp.package_type = ?'
      params.push(package_type)
    }

    if (country) {
      query += ' AND (hp.target_country LIKE ? OR hp.target_country IS NULL)'
      params.push(`%${country}%`)
    }

    query += ' ORDER BY hp.popular_rank DESC, hp.price_krw ASC'

    const stmt = params.length > 0 
      ? DB.prepare(query).bind(...params)
      : DB.prepare(query)

    const { results } = await stmt.all()
    return c.json(results)
  } catch (error) {
    console.error('Database error:', error)
    return c.json({ error: 'Failed to fetch health packages' }, 500)
  }
})

// Get health package by ID
app.get('/api/health-packages/:id', async (c) => {
  const { DB } = c.env
  const id = c.req.param('id')

  try {
    const { results } = await DB.prepare(`
      SELECT hp.*, h.name_ko as hospital_name, h.name_en as hospital_name_en, h.address, h.phone
      FROM health_packages hp
      LEFT JOIN hospitals h ON hp.hospital_id = h.id
      WHERE hp.id = ?
    `).bind(id).all()

    if (results.length === 0) {
      return c.json({ error: 'Health package not found' }, 404)
    }

    return c.json(results[0])
  } catch (error) {
    return c.json({ error: 'Failed to fetch health package' }, 500)
  }
})

// Get wellness programs
app.get('/api/wellness-programs', async (c) => {
  const { DB } = c.env
  const hospital_id = c.req.query('hospital_id')
  const program_type = c.req.query('program_type')

  try {
    let query = `
      SELECT wp.*, h.name_ko as hospital_name, h.name_en as hospital_name_en
      FROM wellness_programs wp
      LEFT JOIN hospitals h ON wp.hospital_id = h.id
      WHERE wp.status = '판매중'
    `
    const params: string[] = []

    if (hospital_id) {
      query += ' AND wp.hospital_id = ?'
      params.push(hospital_id)
    }

    if (program_type) {
      query += ' AND wp.program_type = ?'
      params.push(program_type)
    }

    query += ' ORDER BY wp.popular_rank DESC, wp.price_krw ASC'

    const stmt = params.length > 0 
      ? DB.prepare(query).bind(...params)
      : DB.prepare(query)

    const { results } = await stmt.all()
    return c.json(results)
  } catch (error) {
    console.error('Database error:', error)
    return c.json({ error: 'Failed to fetch wellness programs' }, 500)
  }
})

// Get wellness program by ID
app.get('/api/wellness-programs/:id', async (c) => {
  const { DB } = c.env
  const id = c.req.param('id')

  try {
    const { results } = await DB.prepare(`
      SELECT wp.*, h.name_ko as hospital_name, h.name_en as hospital_name_en, h.address, h.phone
      FROM wellness_programs wp
      LEFT JOIN hospitals h ON wp.hospital_id = h.id
      WHERE wp.id = ?
    `).bind(id).all()

    if (results.length === 0) {
      return c.json({ error: 'Wellness program not found' }, 404)
    }

    return c.json(results[0])
  } catch (error) {
    return c.json({ error: 'Failed to fetch wellness program' }, 500)
  }
})

// Create medical booking
app.post('/api/medical-bookings', async (c) => {
  const { DB } = c.env

  try {
    const formData = await c.req.formData()
    
    const customer_name = formData.get('customer_name')
    const customer_email = formData.get('customer_email')
    const customer_phone = formData.get('customer_phone')
    const customer_country = formData.get('customer_country')
    const customer_gender = formData.get('customer_gender')
    const customer_age = formData.get('customer_age') ? parseInt(formData.get('customer_age') as string) : null
    const passport_number = formData.get('passport_number')
    
    const health_package_id = formData.get('health_package_id')
    const checkup_date = formData.get('checkup_date')
    const checkup_time = formData.get('checkup_time')
    const medical_history = formData.get('medical_history')
    const family_history = formData.get('family_history')
    const allergies = formData.get('allergies')
    const medications = formData.get('medications')
    
    const wellness_program_id = formData.get('wellness_program_id')
    const wellness_date = formData.get('wellness_date')
    const wellness_time = formData.get('wellness_time')
    const symptoms = formData.get('symptoms')
    
    const needs_interpreter = formData.get('needs_interpreter') ? 1 : 0
    const interpreter_language = formData.get('interpreter_language')
    const needs_transportation = formData.get('needs_transportation') ? 1 : 0
    const pickup_location = formData.get('pickup_location')
    const needs_accommodation = formData.get('needs_accommodation') ? 1 : 0
    const hotel_nights = formData.get('hotel_nights') ? parseInt(formData.get('hotel_nights') as string) : null

    // Calculate total price (simplified - in production, fetch from package)
    let total_price_krw = 250000 // Default basic checkup
    let total_price_usd = 200

    if (health_package_id) {
      const { results: packageResults } = await DB.prepare(`
        SELECT price_krw, price_usd FROM health_packages WHERE id = ?
      `).bind(health_package_id).all()
      
      if (packageResults.length > 0) {
        total_price_krw = packageResults[0].price_krw
        total_price_usd = packageResults[0].price_usd
      }
    }

    if (wellness_program_id) {
      const { results: programResults } = await DB.prepare(`
        SELECT price_krw, price_usd FROM wellness_programs WHERE id = ?
      `).bind(wellness_program_id).all()
      
      if (programResults.length > 0) {
        total_price_krw += programResults[0].price_krw
        total_price_usd += programResults[0].price_usd || Math.round(programResults[0].price_krw / 1250)
      }
    }

    // Add accommodation cost if needed
    if (needs_accommodation && hotel_nights) {
      const accommodation_cost_per_night = 80000 // 80,000 KRW per night
      total_price_krw += accommodation_cost_per_night * hotel_nights
      total_price_usd += Math.round((accommodation_cost_per_night * hotel_nights) / 1250)
    }
    
    const { results } = await DB.prepare(`
      INSERT INTO medical_bookings (
        customer_name, customer_email, customer_phone, customer_country,
        customer_gender, customer_age, passport_number,
        health_package_id, checkup_date, checkup_time,
        medical_history, family_history, allergies, medications,
        wellness_program_id, wellness_date, wellness_time, symptoms,
        needs_interpreter, interpreter_language,
        needs_transportation, pickup_location,
        needs_accommodation, hotel_nights,
        total_price_krw, total_price_usd
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      customer_name,
      customer_email,
      customer_phone || null,
      customer_country,
      customer_gender || null,
      customer_age,
      passport_number || null,
      health_package_id || null,
      checkup_date || null,
      checkup_time || null,
      medical_history || null,
      family_history || null,
      allergies || null,
      medications || null,
      wellness_program_id || null,
      wellness_date || null,
      wellness_time || null,
      symptoms || null,
      needs_interpreter,
      interpreter_language || null,
      needs_transportation,
      pickup_location || null,
      needs_accommodation,
      hotel_nights,
      total_price_krw,
      total_price_usd
    ).run()

    // Redirect to success page
    return c.redirect('/medical/success')
  } catch (error) {
    console.error('Medical booking error:', error)
    return c.redirect('/medical/error')
  }
})

// Admin: Get all medical bookings
app.get('/api/admin/medical-bookings', async (c) => {
  const { DB } = c.env

  try {
    const { results } = await DB.prepare(`
      SELECT 
        mb.*,
        hp.name_ko as health_package_name,
        wp.name_ko as wellness_program_name
      FROM medical_bookings mb
      LEFT JOIN health_packages hp ON mb.health_package_id = hp.id
      LEFT JOIN wellness_programs wp ON mb.wellness_program_id = wp.id
      ORDER BY mb.created_at DESC
    `).all()

    return c.json(results)
  } catch (error) {
    return c.json({ error: 'Failed to fetch medical bookings' }, 500)
  }
})

// Admin: Get all hospitals
app.get('/api/admin/hospitals', async (c) => {
  const { DB } = c.env

  try {
    const { results } = await DB.prepare(`
      SELECT * FROM hospitals ORDER BY created_at DESC
    `).all()

    return c.json(results)
  } catch (error) {
    return c.json({ error: 'Failed to fetch hospitals' }, 500)
  }
})

// Admin: Get all health packages
app.get('/api/admin/health-packages', async (c) => {
  const { DB } = c.env

  try {
    const { results } = await DB.prepare(`
      SELECT hp.*, h.name_ko as hospital_name
      FROM health_packages hp
      LEFT JOIN hospitals h ON hp.hospital_id = h.id
      ORDER BY hp.created_at DESC
    `).all()

    return c.json(results)
  } catch (error) {
    return c.json({ error: 'Failed to fetch health packages' }, 500)
  }
})

// Admin: Get all wellness programs
app.get('/api/admin/wellness-programs', async (c) => {
  const { DB } = c.env

  try {
    const { results } = await DB.prepare(`
      SELECT wp.*, h.name_ko as hospital_name
      FROM wellness_programs wp
      LEFT JOIN hospitals h ON wp.hospital_id = h.id
      ORDER BY wp.created_at DESC
    `).all()

    return c.json(results)
  } catch (error) {
    return c.json({ error: 'Failed to fetch wellness programs' }, 500)
  }
})


// Reservation success page
app.get('/reserve/success', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>예약 완료 - K-Taste Route</title>
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <link href="/static/styles.css" rel="stylesheet">
    </head>
    <body>
        <div class="container" style="max-width: 600px; padding: 8rem 2rem; text-align: center;">
            <div style="font-size: 4rem; margin-bottom: 2rem;">✅</div>
            <h1 style="margin-bottom: 1rem; color: var(--accent);">예약이 완료되었습니다!</h1>
            <p style="color: var(--text-secondary); margin-bottom: 2rem; line-height: 1.8;">
                예약 신청이 성공적으로 접수되었습니다.<br>
                입력하신 이메일로 확인 메일이 발송됩니다.<br>
                영업일 기준 1~2일 내로 연락드리겠습니다.
            </p>
            <a href="/" class="btn btn-primary">홈으로 돌아가기</a>
        </div>
    </body>
    </html>
  `)
})

// Reservation error page
app.get('/reserve/error', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>예약 실패 - K-Taste Route</title>
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <link href="/static/styles.css" rel="stylesheet">
    </head>
    <body>
        <div class="container" style="max-width: 600px; padding: 8rem 2rem; text-align: center;">
            <div style="font-size: 4rem; margin-bottom: 2rem;">❌</div>
            <h1 style="margin-bottom: 1rem; color: red;">예약 처리 중 오류가 발생했습니다</h1>
            <p style="color: var(--text-secondary); margin-bottom: 2rem; line-height: 1.8;">
                죄송합니다. 예약 처리 중 문제가 발생했습니다.<br>
                다시 시도해 주시거나, 이메일로 직접 문의해 주세요.<br>
                <a href="mailto:contact@k-taste-route.com" style="color: var(--accent);">contact@k-taste-route.com</a>
            </p>
            <a href="/reserve" class="btn btn-primary">다시 시도하기</a>
            <a href="/" class="btn btn-secondary" style="margin-left: 1rem;">홈으로 돌아가기</a>
        </div>
    </body>
    </html>
  `)
})

// Medical booking success page
app.get('/medical/success', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>예약 완료 - K-Medical Tourism</title>
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <link href="/static/styles.css" rel="stylesheet">
    </head>
    <body>
        <div class="container" style="max-width: 600px; padding: 8rem 2rem; text-align: center;">
            <div style="font-size: 4rem; margin-bottom: 2rem;">✅</div>
            <h1 style="margin-bottom: 1rem; color: var(--accent);">건강검진 예약이 완료되었습니다!</h1>
            <p style="color: var(--text-secondary); margin-bottom: 2rem; line-height: 1.8;">
                K-Medical Tourism 예약 신청이 성공적으로 접수되었습니다.<br>
                입력하신 이메일로 확인 메일이 발송됩니다.<br>
                영업일 기준 1~2일 내로 병원에서 직접 연락드리겠습니다.
            </p>
            <a href="/medical" class="btn btn-primary">K-Medical 홈으로</a>
            <a href="/" class="btn btn-secondary" style="margin-left: 1rem;">메인 홈으로</a>
        </div>
    </body>
    </html>
  `)
})

// Medical booking error page
app.get('/medical/error', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>예약 실패 - K-Medical Tourism</title>
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <link href="/static/styles.css" rel="stylesheet">
    </head>
    <body>
        <div class="container" style="max-width: 600px; padding: 8rem 2rem; text-align: center;">
            <div style="font-size: 4rem; margin-bottom: 2rem;">❌</div>
            <h1 style="margin-bottom: 1rem; color: red;">예약 처리 중 오류가 발생했습니다</h1>
            <p style="color: var(--text-secondary); margin-bottom: 2rem; line-height: 1.8;">
                죄송합니다. 예약 처리 중 문제가 발생했습니다.<br>
                다시 시도해 주시거나, 이메일로 직접 문의해 주세요.<br>
                <a href="mailto:medical@k-taste-route.com" style="color: var(--accent);">medical@k-taste-route.com</a>
            </p>
            <a href="/medical/reserve" class="btn btn-primary">다시 시도하기</a>
            <a href="/medical" class="btn btn-secondary" style="margin-left: 1rem;">K-Medical 홈으로</a>
        </div>
    </body>
    </html>
  `)
})

// K-Medical Tourism main page
app.get('/medical', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>K-Medical Tourism - 경산시 건강검진 & 한방 헬스 투어</title>
        <meta name="description" content="1-3일 완결형 K-메디컬 한방 헬스 투어. 저렴한 비용, 대기시간 최소화, 한방 결합.">
        
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard-dynamic-subset.min.css" rel="stylesheet">
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <link href="/static/styles.css" rel="stylesheet">
    </head>
    <body>
        <!-- Navigation -->
        <nav class="navbar">
            <div class="navbar-container">
                <a href="/" class="navbar-logo">LOCAL TABLE KOREA</a>
                
                <button class="mobile-menu-toggle" aria-label="Toggle menu">
                    ☰
                </button>
                
                <ul class="navbar-menu">
                    <li><a href="/" class="navbar-link">홈</a></li>
                    <li><a href="/medical" class="navbar-link">K-Medical</a></li>
                    <li><a href="/" class="navbar-link" data-page="regions">지역별 맛집</a></li>
                    <li><a href="/" class="navbar-link" data-page="packages">미식 투어</a></li>
                    
                    <div class="lang-selector">
                        <button class="lang-btn active" data-lang="ko">한국어</button>
                        <button class="lang-btn" data-lang="en">EN</button>
                        <button class="lang-btn" data-lang="zh">中文</button>
                        <button class="lang-btn" data-lang="vi">Tiếng Việt</button>
                    </div>
                </ul>
            </div>
        </nav>

        <!-- Hero Section -->
        <section class="hero">
            <div class="hero-content">
                <h1 class="hero-title">K-Medical Tourism</h1>
                <p class="hero-subtitle">1-3일 완결형 건강검진 & 한방 헬스 투어</p>
                <p class="hero-description">
                    대도시 대비 저렴한 비용 + 대기시간 최소화 + 한방 결합<br>
                    경산시 종합병원 연계로 빠르고 합리적인 건강검진과 한방 치료를 한 번에
                </p>
                <a href="#packages" class="cta-button">건강검진 패키지 보기</a>
            </div>
        </section>

        <!-- Main Content -->
        <main id="medical-content" style="padding: 4rem 2rem;">
            <div class="container">
                <!-- Features Section -->
                <section style="margin-bottom: 6rem;">
                    <h2 style="text-align: center; margin-bottom: 3rem; font-size: 2rem;">왜 경산시인가?</h2>
                    <div class="grid-3">
                        <div class="card">
                            <div class="card-content" style="text-align: center;">
                                <div style="font-size: 3rem; margin-bottom: 1rem;">💰</div>
                                <h3 style="margin-bottom: 1rem;">저렴한 비용</h3>
                                <p style="color: var(--text-secondary);">서울 대비 30-40% 저렴한 검진 비용으로 동일한 품질의 건강검진을 받으실 수 있습니다.</p>
                            </div>
                        </div>
                        <div class="card">
                            <div class="card-content" style="text-align: center;">
                                <div style="font-size: 3rem; margin-bottom: 1rem;">⏱️</div>
                                <h3 style="margin-bottom: 1rem;">대기시간 최소화</h3>
                                <p style="color: var(--text-secondary);">외국인 전용 예약 시스템으로 대기 없이 빠른 검진이 가능합니다. 당일 결과 확인.</p>
                            </div>
                        </div>
                        <div class="card">
                            <div class="card-content" style="text-align: center;">
                                <div style="font-size: 3rem; margin-bottom: 1rem;">🌿</div>
                                <h3 style="margin-bottom: 1rem;">한방 치료 결합</h3>
                                <p style="color: var(--text-secondary);">검진 후 발견된 문제를 즉시 한방으로 치료. 침·뜸, 추나, 한방테라피 제공.</p>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Health Packages Section -->
                <section id="packages" style="margin-bottom: 6rem;">
                    <h2 style="text-align: center; margin-bottom: 3rem; font-size: 2rem;">건강검진 패키지</h2>
                    <div id="health-packages-list" class="grid-3">
                        <div class="loading">
                            <div class="spinner"></div>
                            <p>Loading health packages...</p>
                        </div>
                    </div>
                </section>

                <!-- Wellness Programs Section -->
                <section id="wellness" style="margin-bottom: 6rem;">
                    <h2 style="text-align: center; margin-bottom: 3rem; font-size: 2rem;">한방 힐링 프로그램</h2>
                    <div id="wellness-programs-list" class="grid-3">
                        <div class="loading">
                            <div class="spinner"></div>
                            <p>Loading wellness programs...</p>
                        </div>
                    </div>
                </section>

                <!-- Partner Hospitals Section -->
                <section style="margin-bottom: 6rem; background: var(--bg-gray); padding: 4rem 2rem; border-radius: 12px;">
                    <h2 style="text-align: center; margin-bottom: 3rem; font-size: 2rem;">연계 병원</h2>
                    <div id="hospitals-list" class="grid-3">
                        <div class="loading">
                            <div class="spinner"></div>
                            <p>Loading hospitals...</p>
                        </div>
                    </div>
                </section>

                <!-- CTA Section -->
                <section style="text-align: center; padding: 4rem 2rem; background: var(--bg-white); border-radius: 12px;">
                    <h2 style="margin-bottom: 1rem; font-size: 2rem;">지금 예약하고 건강을 챙기세요</h2>
                    <p style="color: var(--text-secondary); margin-bottom: 2rem;">
                        영업일 기준 1-2일 내 병원에서 직접 연락드립니다.
                    </p>
                    <a href="/medical/reserve" class="btn btn-primary" style="padding: 1rem 3rem; font-size: 1.125rem;">
                        건강검진 예약하기
                    </a>
                </section>
            </div>
        </main>

        <!-- Footer -->
        <footer class="footer">
            <div class="footer-content">
                <div class="footer-section">
                    <h3>K-Medical Tourism</h3>
                    <p>경산시 건강검진 & 한방 헬스 투어 플랫폼</p>
                </div>
                <div class="footer-section">
                    <h3>서비스</h3>
                    <ul class="footer-links">
                        <li><a href="#packages">건강검진 패키지</a></li>
                        <li><a href="#wellness">한방 힐링</a></li>
                        <li><a href="/medical/reserve">예약하기</a></li>
                    </ul>
                </div>
                <div class="footer-section">
                    <h3>연계 병원</h3>
                    <ul class="footer-links">
                        <li>경산중앙병원</li>
                        <li>세명병원</li>
                        <li>경산S한의원</li>
                    </ul>
                </div>
                <div class="footer-section">
                    <h3>문의</h3>
                    <ul class="footer-links">
                        <li><a href="mailto:medical@k-taste-route.com">medical@k-taste-route.com</a></li>
                        <li>053-810-8000</li>
                    </ul>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2026 K-Medical Tourism by LOCAL TABLE KOREA. All rights reserved.</p>
            </div>
        </footer>

        <!-- Scripts -->
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/medical.js"></script>
    </body>
    </html>
  `)
})

// K-Medical reservation page
app.get('/medical/reserve', async (c) => {
  const { DB } = c.env
  const packageId = c.req.query('package_id')
  const programId = c.req.query('program_id')

  // Get package info if specified
  let healthPackage = null
  let wellnessProgram = null
  
  if (packageId) {
    try {
      const { results } = await DB.prepare(`
        SELECT hp.*, h.name_ko as hospital_name
        FROM health_packages hp
        LEFT JOIN hospitals h ON hp.hospital_id = h.id
        WHERE hp.id = ?
      `).bind(packageId).all()
      if (results.length > 0) {
        healthPackage = results[0]
      }
    } catch (error) {
      console.error('Failed to fetch health package:', error)
    }
  }

  if (programId) {
    try {
      const { results } = await DB.prepare(`
        SELECT wp.*, h.name_ko as hospital_name
        FROM wellness_programs wp
        LEFT JOIN hospitals h ON wp.hospital_id = h.id
        WHERE wp.id = ?
      `).bind(programId).all()
      if (results.length > 0) {
        wellnessProgram = results[0]
      }
    } catch (error) {
      console.error('Failed to fetch wellness program:', error)
    }
  }

  return c.html(`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>건강검진 예약 - K-Medical Tourism</title>
        
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard-dynamic-subset.min.css" rel="stylesheet">
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <link href="/static/styles.css" rel="stylesheet">
    </head>
    <body>
        <nav class="navbar">
            <div class="navbar-container">
                <a href="/" class="navbar-logo">LOCAL TABLE KOREA</a>
            </div>
        </nav>

        <div class="container" style="max-width: 900px; padding: 8rem 2rem 4rem;">
            <div style="text-align: center; margin-bottom: 3rem;">
                <h1 style="margin-bottom: 1rem;">건강검진 & 한방 투어 예약</h1>
                <p style="color: var(--text-secondary);">아래 양식을 작성하여 예약을 신청하세요.</p>
            </div>

            ${healthPackage || wellnessProgram ? `
              <div class="card" style="margin-bottom: 3rem; background: var(--bg-gray);">
                <div class="card-content">
                  ${healthPackage ? `
                    <h3 style="margin-bottom: 0.5rem;">건강검진: ${healthPackage.name_ko}</h3>
                    <p style="color: var(--text-secondary); margin-bottom: 0.5rem;">${healthPackage.hospital_name}</p>
                    <div style="display: flex; gap: 2rem; margin-bottom: 1rem;">
                      <div>
                        <span style="font-size: 0.875rem; color: var(--text-secondary);">소요시간</span>
                        <strong style="display: block; font-size: 1.125rem;">${healthPackage.duration_hours}시간</strong>
                      </div>
                      <div>
                        <span style="font-size: 0.875rem; color: var(--text-secondary);">가격 (KRW)</span>
                        <strong style="display: block; color: var(--accent); font-size: 1.25rem;">₩${healthPackage.price_krw.toLocaleString()}</strong>
                      </div>
                      <div>
                        <span style="font-size: 0.875rem; color: var(--text-secondary);">가격 (USD)</span>
                        <strong style="display: block; color: var(--accent); font-size: 1.25rem;">$${healthPackage.price_usd}</strong>
                      </div>
                    </div>
                  ` : ''}
                  ${wellnessProgram ? `
                    <h3 style="margin-bottom: 0.5rem; margin-top: 1.5rem;">한방 프로그램: ${wellnessProgram.name_ko}</h3>
                    <p style="color: var(--text-secondary); margin-bottom: 0.5rem;">${wellnessProgram.hospital_name}</p>
                    <div style="display: flex; gap: 2rem;">
                      <div>
                        <span style="font-size: 0.875rem; color: var(--text-secondary);">소요시간</span>
                        <strong style="display: block; font-size: 1.125rem;">${wellnessProgram.duration_minutes}분 x ${wellnessProgram.sessions}회</strong>
                      </div>
                      <div>
                        <span style="font-size: 0.875rem; color: var(--text-secondary);">가격 (KRW)</span>
                        <strong style="display: block; color: var(--accent); font-size: 1.25rem;">₩${wellnessProgram.price_krw.toLocaleString()}</strong>
                      </div>
                    </div>
                  ` : ''}
                </div>
              </div>
            ` : ''}

            <form action="/api/medical-bookings" method="post" enctype="multipart/form-data" class="card">
                <div class="card-content">
                    <input type="hidden" name="health_package_id" value="${packageId || ''}">
                    <input type="hidden" name="wellness_program_id" value="${programId || ''}">

                    <h3 style="margin-bottom: 2rem;">기본 정보</h3>

                    <div class="form-group">
                        <label class="form-label">이름 (Name) *</label>
                        <input type="text" name="customer_name" class="form-input" required>
                    </div>

                    <div class="form-group">
                        <label class="form-label">이메일 (Email) *</label>
                        <input type="email" name="customer_email" class="form-input" required>
                    </div>

                    <div class="form-group">
                        <label class="form-label">전화번호 (Phone) *</label>
                        <input type="tel" name="customer_phone" class="form-input" placeholder="+82-10-1234-5678" required>
                    </div>

                    <div class="form-group">
                        <label class="form-label">국가 (Country) *</label>
                        <select name="customer_country" class="form-select" required>
                            <option value="">선택하세요 / Select</option>
                            <option value="CN">🇨🇳 China (중국)</option>
                            <option value="TW">🇹🇼 Taiwan (대만)</option>
                            <option value="VN">🇻🇳 Vietnam (베트남)</option>
                            <option value="MN">🇲🇳 Mongolia (몽골)</option>
                            <option value="AE">🇦🇪 UAE (아랍에미리트)</option>
                            <option value="SA">🇸🇦 Saudi Arabia (사우디아라비아)</option>
                            <option value="OTHER">Other</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label class="form-label">성별 (Gender)</label>
                        <select name="customer_gender" class="form-select">
                            <option value="">선택하세요 / Select</option>
                            <option value="남성">남성 (Male)</option>
                            <option value="여성">여성 (Female)</option>
                            <option value="기타">기타 (Other)</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label class="form-label">나이 (Age)</label>
                        <input type="number" name="customer_age" class="form-input" min="18" max="120" placeholder="예: 35">
                    </div>

                    <div class="form-group">
                        <label class="form-label">여권 번호 (Passport Number - Optional)</label>
                        <input type="text" name="passport_number" class="form-input" placeholder="M12345678">
                    </div>

                    <hr style="margin: 3rem 0; border: none; border-top: 1px solid var(--border);">

                    <h3 style="margin-bottom: 2rem;">건강검진 정보</h3>

                    <div class="form-group">
                        <label class="form-label">검진 희망일 (Preferred Date) *</label>
                        <input type="date" name="checkup_date" class="form-input" required>
                    </div>

                    <div class="form-group">
                        <label class="form-label">검진 희망 시간 (Preferred Time)</label>
                        <select name="checkup_time" class="form-select">
                            <option value="">선택하세요 / Select</option>
                            <option value="09:00">오전 9시 (09:00)</option>
                            <option value="10:00">오전 10시 (10:00)</option>
                            <option value="11:00">오전 11시 (11:00)</option>
                            <option value="14:00">오후 2시 (14:00)</option>
                            <option value="15:00">오후 3시 (15:00)</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label class="form-label">병력 (Medical History)</label>
                        <textarea name="medical_history" class="form-textarea" rows="3" placeholder="현재 앓고 있는 질병이나 과거 병력을 입력하세요."></textarea>
                    </div>

                    <div class="form-group">
                        <label class="form-label">가족력 (Family History)</label>
                        <textarea name="family_history" class="form-textarea" rows="2" placeholder="가족 중 유전성 질환이 있는 경우 입력하세요."></textarea>
                    </div>

                    <div class="form-group">
                        <label class="form-label">알레르기 (Allergies)</label>
                        <input type="text" name="allergies" class="form-input" placeholder="예: 페니실린, 갑각류 등">
                    </div>

                    <div class="form-group">
                        <label class="form-label">복용 중인 약물 (Current Medications)</label>
                        <textarea name="medications" class="form-textarea" rows="2" placeholder="현재 복용 중인 약물이 있으면 입력하세요."></textarea>
                    </div>

                    <hr style="margin: 3rem 0; border: none; border-top: 1px solid var(--border);">

                    <h3 style="margin-bottom: 2rem;">부가 서비스</h3>

                    <div class="form-group">
                        <label style="display: flex; align-items: center; cursor: pointer;">
                            <input type="checkbox" name="needs_interpreter" value="1" style="margin-right: 0.5rem;">
                            <span>통역 서비스 필요 (Need Interpreter)</span>
                        </label>
                    </div>

                    <div class="form-group">
                        <label class="form-label">통역 언어 (Interpreter Language)</label>
                        <select name="interpreter_language" class="form-select">
                            <option value="">선택하세요 / Select</option>
                            <option value="중국어">중국어 (Chinese)</option>
                            <option value="영어">영어 (English)</option>
                            <option value="베트남어">베트남어 (Vietnamese)</option>
                            <option value="아랍어">아랍어 (Arabic)</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label style="display: flex; align-items: center; cursor: pointer;">
                            <input type="checkbox" name="needs_transportation" value="1" style="margin-right: 0.5rem;">
                            <span>공항 픽업 필요 (Need Airport Pickup)</span>
                        </label>
                    </div>

                    <div class="form-group">
                        <label class="form-label">픽업 장소 (Pickup Location)</label>
                        <input type="text" name="pickup_location" class="form-input" placeholder="예: 인천국제공항, 김해국제공항">
                    </div>

                    <div class="form-group">
                        <label style="display: flex; align-items: center; cursor: pointer;">
                            <input type="checkbox" name="needs_accommodation" value="1" style="margin-right: 0.5rem;">
                            <span>숙소 필요 (Need Accommodation)</span>
                        </label>
                    </div>

                    <div class="form-group">
                        <label class="form-label">숙박 일수 (Hotel Nights)</label>
                        <input type="number" name="hotel_nights" class="form-input" min="1" max="7" placeholder="예: 2">
                        <small style="color: var(--text-secondary);">1박당 약 80,000원 추가</small>
                    </div>

                    <button type="submit" class="btn btn-primary" style="width: 100%; padding: 1rem; font-size: 1.125rem; margin-top: 2rem;">
                        예약 신청하기 (Submit Reservation)
                    </button>
                </div>
            </form>

            <div style="text-align: center; margin-top: 2rem;">
                <a href="/medical" style="color: var(--accent); text-decoration: none;">← 돌아가기 (Go Back)</a>
            </div>
        </div>
    </body>
    </html>
  `)
})



// Admin page (separate route)
app.get('/admin', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>관리자 페이지 - K-Taste Route</title>
        
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard-dynamic-subset.min.css" rel="stylesheet">
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <link href="/static/styles.css" rel="stylesheet">
    </head>
    <body>
        <nav class="navbar">
            <div class="navbar-container">
                <a href="/" class="navbar-logo">LOCAL TABLE KOREA - 관리자</a>
            </div>
        </nav>

        <div class="admin-container">
            <div class="admin-header">
                <h1>관리자 대시보드</h1>
                <p style="color: var(--text-secondary);">맛집, 후기, 패키지, 예약을 관리하세요.</p>
            </div>

            <div class="admin-tabs">
                <button class="admin-tab active" data-tab="restaurants">맛집 관리</button>
                <button class="admin-tab" data-tab="reviews">후기 관리</button>
                <button class="admin-tab" data-tab="packages">패키지 관리</button>
                <button class="admin-tab" data-tab="bookings">예약 관리</button>
            </div>

            <div id="admin-content">
                <div class="loading">
                    <div class="spinner"></div>
                    <p>Loading...</p>
                </div>
            </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/admin.js"></script>
    </body>
    </html>
  `)
})

// Reservation page (separate route - NO JS except image preview)
app.get('/reserve', async (c) => {
  const { DB } = c.env
  const packageId = c.req.query('id')

  // Get package info
  let packageInfo = null
  if (packageId) {
    try {
      const { results } = await DB.prepare('SELECT * FROM packages WHERE id = ?').bind(packageId).all()
      if (results.length > 0) {
        packageInfo = results[0]
      }
    } catch (error) {
      console.error('Failed to fetch package:', error)
    }
  }

  return c.html(`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>예약하기 - K-Taste Route</title>
        
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard-dynamic-subset.min.css" rel="stylesheet">
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <link href="/static/styles.css" rel="stylesheet">
    </head>
    <body>
        <nav class="navbar">
            <div class="navbar-container">
                <a href="/" class="navbar-logo">LOCAL TABLE KOREA</a>
            </div>
        </nav>

        <div class="container" style="max-width: 800px; padding: 8rem 2rem 4rem;">
            <div style="text-align: center; margin-bottom: 3rem;">
                <h1 style="margin-bottom: 1rem;">미식 투어 예약</h1>
                <p style="color: var(--text-secondary);">아래 양식을 작성하여 예약을 신청하세요.</p>
            </div>

            ${packageInfo ? `
              <div class="card" style="margin-bottom: 3rem; background: var(--bg-gray);">
                <div class="card-content">
                  <h3 style="margin-bottom: 0.5rem;">${packageInfo.title_ko}</h3>
                  <p style="color: var(--text-secondary); margin-bottom: 1rem;">${packageInfo.duration}</p>
                  <div style="display: flex; gap: 2rem;">
                    <div>
                      <span style="font-size: 0.875rem; color: var(--text-secondary);">저가형</span>
                      <strong style="display: block; color: var(--accent); font-size: 1.25rem;">$${packageInfo.price_budget}</strong>
                    </div>
                    <div>
                      <span style="font-size: 0.875rem; color: var(--text-secondary);">스탠다드</span>
                      <strong style="display: block; color: var(--accent); font-size: 1.25rem;">$${packageInfo.price_standard}</strong>
                    </div>
                    <div>
                      <span style="font-size: 0.875rem; color: var(--text-secondary);">고급형</span>
                      <strong style="display: block; color: var(--accent); font-size: 1.25rem;">$${packageInfo.price_premium}</strong>
                    </div>
                  </div>
                </div>
              </div>
            ` : ''}

            <form action="/api/bookings" method="post" enctype="multipart/form-data" class="card">
                <div class="card-content">
                    <input type="hidden" name="package_id" value="${packageId || ''}">

                    <div class="form-group">
                        <label class="form-label">이름 (Name) *</label>
                        <input type="text" name="customer_name" class="form-input" required>
                    </div>

                    <div class="form-group">
                        <label class="form-label">이메일 (Email) *</label>
                        <input type="email" name="customer_email" class="form-input" required>
                    </div>

                    <div class="form-group">
                        <label class="form-label">전화번호 (Phone)</label>
                        <input type="tel" name="customer_phone" class="form-input" placeholder="+82-10-1234-5678">
                    </div>

                    <div class="form-group">
                        <label class="form-label">국가 (Country) *</label>
                        <select name="customer_country" class="form-select" required>
                            <option value="">선택하세요 / Select</option>
                            <option value="JP">🇯🇵 Japan (일본)</option>
                            <option value="CN">🇨🇳 China (중국)</option>
                            <option value="TW">🇹🇼 Taiwan (대만)</option>
                            <option value="TH">🇹🇭 Thailand (태국)</option>
                            <option value="US">🇺🇸 United States</option>
                            <option value="OTHER">Other</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label class="form-label">여행 시작일 (Travel Date) *</label>
                        <input type="date" name="travel_date" class="form-input" required>
                    </div>

                    <div class="form-group">
                        <label class="form-label">인원 수 (Number of People) *</label>
                        <input type="number" name="num_people" class="form-input" min="1" max="12" value="2" required>
                        <small style="color: var(--text-secondary);">최소 1명, 최대 12명</small>
                    </div>

                    <div class="form-group">
                        <label class="form-label">패키지 타입 (Package Type) *</label>
                        <select name="package_type" class="form-select" required>
                            <option value="">선택하세요 / Select</option>
                            <option value="저가형">저가형 (Budget)</option>
                            <option value="스탠다드">스탠다드 (Standard)</option>
                            <option value="고급형">고급형 (Premium)</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label class="form-label">특별 요청사항 (Special Requests)</label>
                        <textarea name="special_requests" class="form-textarea" rows="4" placeholder="음식 알레르기, 특별한 요구사항 등을 입력하세요."></textarea>
                    </div>

                    <div class="form-group">
                        <label class="form-label">여권 사진 업로드 (Passport Photo - Optional)</label>
                        <input type="file" accept="image/*" onchange="previewImage(this)" class="form-input">
                        <img id="preview" style="max-width: 300px; margin-top: 1rem; display: none; border-radius: 8px; border: 2px solid var(--border);">
                    </div>

                    <button type="submit" class="btn btn-primary" style="width: 100%; padding: 1rem; font-size: 1.125rem;">
                        예약 신청하기 (Submit Reservation)
                    </button>
                </div>
            </form>

            <div style="text-align: center; margin-top: 2rem;">
                <a href="/" style="color: var(--accent); text-decoration: none;">← 돌아가기 (Go Back)</a>
            </div>
        </div>

        <!-- Minimal JS for image preview ONLY -->
        <script>
        function previewImage(input) {
          if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
              const preview = document.getElementById('preview');
              preview.src = e.target.result;
              preview.style.display = 'block';
            };
            reader.readAsDataURL(input.files[0]);
          }
        }
        </script>
    </body>
    </html>
  `)
})

// Home page with beautiful HTML
app.get('/', async (c) => {
  const { DB } = c.env
  const lang = c.req.query('lang') || 'ko'
  
  // Fetch featured restaurants
  let restaurants = []
  try {
    const { results } = await DB.prepare(`
      SELECT * FROM restaurants 
      WHERE status = '운영' AND gov_certified = 1 
      ORDER BY local_score DESC 
      LIMIT 3
    `).all()
    restaurants = results
  } catch (error) {
    console.error('Failed to fetch restaurants:', error)
  }
  
  // Fetch packages
  let packages = []
  try {
    const { results } = await DB.prepare(`
      SELECT * FROM packages 
      WHERE status = '판매중' 
      ORDER BY created_at DESC 
      LIMIT 2
    `).all()
    packages = results
  } catch (error) {
    console.error('Failed to fetch packages:', error)
  }
  
  // Get translations from i18n data
  const i18n = translations[lang] || translations['ko']
  
  return c.html(`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>LOCAL TABLE KOREA - 한국 로컬 미식 여행 플랫폼</title>
        <meta name="description" content="해외 관광객을 위한 진짜 한국 로컬 맛집과 미식 투어 패키지">
        
        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard-dynamic-subset.min.css" rel="stylesheet">
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700&family=Noto+Sans+JP:wght@300;400;500;600;700&family=Noto+Sans+SC:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        
        <!-- Styles -->
        <link href="/static/styles.css" rel="stylesheet">
    </head>
    <body>
        <!-- Navigation -->
        <nav class="navbar">
            <div class="navbar-container">
                <a href="/" class="navbar-logo">LOCAL TABLE KOREA</a>
                
                <button class="mobile-menu-toggle" aria-label="Toggle menu">
                    ☰
                </button>
                
                <ul class="navbar-menu">
                    <li><a href="/" class="navbar-link">${i18n['nav.home']}</a></li>
                    <li><a href="/medical" class="navbar-link">K-Medical</a></li>
                    <li><a href="/" class="navbar-link" data-page="regions">${i18n['nav.regions']}</a></li>
                    <li><a href="/" class="navbar-link" data-page="packages">${i18n['nav.packages']}</a></li>
                    
                    <div class="lang-selector">
                        <button class="lang-selector-toggle">
                            <span>${lang === 'ko' ? '한국어' : lang === 'en' ? 'English' : lang === 'ja' ? '日本語' : lang === 'zh' ? '中文' : 'ไทย'}</span>
                        </button>
                        <div class="lang-dropdown">
                            <button class="lang-btn ${lang === 'ko' ? 'active' : ''}" data-lang="ko">한국어 (Korean)</button>
                            <button class="lang-btn ${lang === 'en' ? 'active' : ''}" data-lang="en">English</button>
                            <button class="lang-btn ${lang === 'ja' ? 'active' : ''}" data-lang="ja">日本語 (Japanese)</button>
                            <button class="lang-btn ${lang === 'zh' ? 'active' : ''}" data-lang="zh">中文 (Chinese)</button>
                            <button class="lang-btn ${lang === 'th' ? 'active' : ''}" data-lang="th">ไทย (Thai)</button>
                        </div>
                    </div>
                </ul>
            </div>
        </nav>

        <!-- Hero Section -->
        <section class="hero">
            <div class="hero-content">
                <h1 class="hero-title">${i18n['hero.title']}</h1>
                <p class="hero-subtitle">${i18n['hero.subtitle']}</p>
                <p class="hero-description">${i18n['hero.description']}</p>
                
                <!-- 3개 버튼 1열 배치 -->
                <div class="hero-buttons" style="display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; margin-top: 32px;">
                    <button id="start-tour-btn" class="hero-cta-button" style="flex: 1; min-width: 200px; max-width: 280px; padding: 16px 24px; background: #E85C4A; color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.3s;">
                        🚀 ${lang === 'ko' ? '미식 투어 시작하기' : lang === 'en' ? 'Start Food Tour' : lang === 'ja' ? '美食ツアー開始' : lang === 'zh' ? '开始美食之旅' : 'เริ่มทัวร์อาหาร'}
                    </button>
                    <button id="local-picks-btn" class="hero-cta-button" style="flex: 1; min-width: 200px; max-width: 280px; padding: 16px 24px; background: #2C5F2D; color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.3s;">
                        🍽️ ${lang === 'ko' ? '추천 로컬 맛집' : lang === 'en' ? 'Local Picks' : lang === 'ja' ? 'おすすめローカル店' : lang === 'zh' ? '推荐本地美食' : 'ร้านท้องถิ่นแนะนำ'}
                    </button>
                    <button id="tour-packages-btn" class="hero-cta-button" style="flex: 1; min-width: 200px; max-width: 280px; padding: 16px 24px; background: #FF6B35; color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.3s;">
                        📦 ${lang === 'ko' ? '미식 투어 패키지' : lang === 'en' ? 'Tour Packages' : lang === 'ja' ? 'ツアーパッケージ' : lang === 'zh' ? '旅游套餐' : 'แพ็คเกจทัวร์'}
                    </button>
                </div>
            </div>
        </section>

        <!-- Main Content -->
        <main id="main-content">
            <!-- Chatbot Widget -->
            <div id="chatbot-widget">
                <button id="chatbot-toggle" class="chatbot-toggle" aria-label="Open chatbot">
                    💬
                </button>
                <div id="chatbot-panel" class="chatbot-panel" style="display: none;">
                    <div class="chatbot-header">
                        <h3>FAQ</h3>
                        <button id="chatbot-close" aria-label="Close chatbot">✕</button>
                    </div>
                    <div class="chatbot-body">
                        <div class="faq-item">
                            <strong>Q1: K-Taste Route가 무엇인가요?</strong>
                            <p>해외 관광객을 위한 한국 로컬 미식 여행 플랫폼입니다. 지자체 인증과 현지인이 추천하는 진짜 로컬 맛집을 소개합니다.</p>
                        </div>
                        <div class="faq-item">
                            <strong>Q2: 어떤 언어를 지원하나요?</strong>
                            <p>한국어, 영어, 일본어, 중국어, 태국어 5개 언어를 지원합니다.</p>
                        </div>
                        <div class="faq-item">
                            <strong>Q3: 어떤 지역을 다루나요?</strong>
                            <p>수도권, 강원도, 충청도, 전라도, 경상도, 제주도 등 한국 전역 6대 권역을 다룹니다.</p>
                        </div>
                        <div class="faq-item">
                            <strong>Q4: 미식 투어 패키지는 무엇인가요?</strong>
                            <p>3-5일간 한국의 로컬 맛집을 체계적으로 경험하는 여행 상품입니다. 가이드, 교통, 식사, 숙박이 포함되어 있습니다.</p>
                        </div>
                        <div class="faq-item">
                            <strong>Q5: K-Medical Tourism은 무엇인가요?</strong>
                            <p>경산시 기반 건강검진 및 한방 헬스 투어입니다. 1-3일 프로그램으로 서울보다 저렴하며 외국인 전용 패키지를 제공합니다.</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- AI 추천 섹션 (3개 버튼 클릭 시 표시) -->
            <section id="ai-recommendation-section" class="section" style="display: none; background: #FFF9F8; padding: 48px 0;">
                <div class="container">
                    <div class="section-header" style="text-align: center; margin-bottom: 32px;">
                        <h2 id="ai-section-title" class="section-title" style="font-size: 32px; margin-bottom: 12px;">AI 맞춤 추천</h2>
                        <p id="ai-section-subtitle" class="section-subtitle" style="color: #666; font-size: 16px;">당신을 위한 특별한 미식 경험을 준비했습니다</p>
                    </div>
                    
                    <!-- 로딩 상태 -->
                    <div id="ai-loading" style="display: none; text-align: center; padding: 48px 0;">
                        <div style="display: inline-block; width: 48px; height: 48px; border: 4px solid #f3f3f3; border-top: 4px solid #E85C4A; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                        <p style="margin-top: 16px; color: #666;">AI가 맞춤 추천을 준비하고 있습니다...</p>
                    </div>
                    
                    <!-- AI 추천 결과 -->
                    <div id="ai-results" class="grid grid-3" style="gap: 24px;">
                        <!-- AI 결과가 여기에 동적으로 추가됩니다 -->
                    </div>
                </div>
            </section>

            <!-- Featured Restaurants Section -->
            <section class="section">
                <div class="container">
                    <div class="section-header">
                        <h2 class="section-title">추천 로컬 맛집</h2>
                        <p class="section-subtitle">지자체 인증과 현지인이 추천하는 진짜 로컬 맛집을 만나보세요</p>
                    </div>
                    <div class="grid grid-3">
                        ${restaurants.map(r => `
                            <div class="card">
                                <div class="card-image">
                                    <img src="https://placehold.co/800x600/E85C4A/ffffff?text=${encodeURIComponent(r.name_ko)}" alt="${r.name_ko}">
                                    ${r.gov_certified ? '<span class="badge badge-primary">지자체 인증</span>' : ''}
                                </div>
                                <div class="card-content">
                                    <h3 class="card-title">${r.name_ko}</h3>
                                    <div class="card-meta">
                                        <span>📍 ${r.city}</span>
                                        <span>💰 평균 ₩${r.avg_price.toLocaleString()}</span>
                                        <span>⭐ ${r.local_score}/100</span>
                                    </div>
                                    <p class="card-description">${r.description_ko}</p>
                                    <div class="card-tags">
                                        <span class="badge">${r.region}</span>
                                        <span class="badge">${r.sector}</span>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </section>

            <!-- Tour Packages Section -->
            <section class="section section-dark" id="packages">
                <div class="container">
                    <div class="section-header">
                        <h2 class="section-title">미식 투어 패키지</h2>
                        <p class="section-subtitle">3-5일간 한국의 로컬 맛집을 체계적으로 경험하는 여행 상품</p>
                    </div>
                    <div class="grid grid-2">
                        ${packages.map(p => `
                            <div class="card">
                                <div class="card-image">
                                    <img src="https://placehold.co/1200x675/E85C4A/ffffff?text=${encodeURIComponent(p.title_ko)}" alt="${p.title_ko}">
                                </div>
                                <div class="card-content">
                                    <h3 class="card-title">${p.title_ko}</h3>
                                    <div class="card-meta">
                                        <span>📅 ${p.duration}</span>
                                        <span>👥 ${p.min_pax}-${p.max_pax}명</span>
                                    </div>
                                    <p class="card-description">${p.description_ko}</p>
                                    <div class="price-grid">
                                        <div class="price-item">
                                            <span class="price-label">저가형</span>
                                            <span class="price-value">$${p.price_budget}</span>
                                        </div>
                                        <div class="price-item">
                                            <span class="price-label">스탠다드</span>
                                            <span class="price-value">$${p.price_standard}</span>
                                        </div>
                                        <div class="price-item">
                                            <span class="price-label">고급형</span>
                                            <span class="price-value">$${p.price_premium}</span>
                                        </div>
                                    </div>
                                    <a href="/reserve?package_id=${p.id}" class="button button-primary">예약하기</a>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </section>
        </main>

        <!-- Footer -->
        <footer class="footer">
            <div class="footer-content">
                <div class="footer-section">
                    <h3>LOCAL TABLE KOREA</h3>
                    <p data-i18n="footer.description">
                        K-Taste Route는 해외 관광객을 위한 한국 로컬 미식 여행 플랫폼입니다.
                    </p>
                </div>
                
                <div class="footer-section">
                    <h3>지역</h3>
                    <ul class="footer-links">
                        <li><a href="#" data-i18n="region.수도권">수도권</a></li>
                        <li><a href="#" data-i18n="region.강원도">강원도</a></li>
                        <li><a href="#" data-i18n="region.충청도">충청도</a></li>
                        <li><a href="#" data-i18n="region.전라도">전라도</a></li>
                        <li><a href="#" data-i18n="region.경상도">경상도</a></li>
                        <li><a href="#" data-i18n="region.제주도">제주도</a></li>
                    </ul>
                </div>
                
                <div class="footer-section">
                    <h3>서비스</h3>
                    <ul class="footer-links">
                        <li><a href="#regions" data-i18n="nav.regions">지역별 맛집</a></li>
                        <li><a href="#packages" data-i18n="nav.packages">미식 투어</a></li>
                        <li><a href="#admin" data-i18n="nav.admin">관리자</a></li>
                    </ul>
                </div>
                
                <div class="footer-section">
                    <h3>정보</h3>
                    <ul class="footer-links">
                        <li><a href="#" data-i18n="footer.contact">문의하기</a></li>
                        <li><a href="#" data-i18n="footer.terms">이용약관</a></li>
                        <li><a href="#" data-i18n="footer.privacy">개인정보처리방침</a></li>
                    </ul>
                </div>
            </div>
            
            <div class="footer-bottom">
                <p>&copy; 2026 LOCAL TABLE KOREA. All rights reserved.</p>
            </div>
        </footer>

        <!-- FAQ Chatbot (40 items) -->
        <div id="faq-chatbot" style="position: fixed; bottom: 24px; right: 24px; z-index: 1000;">
          <button id="faq-toggle-btn" style="width: 60px; height: 60px; border-radius: 50%; background: #E85C4A; border: none; box-shadow: 0 4px 12px rgba(232, 92, 74, 0.3); cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 28px; color: white;">
            💬
          </button>
          <div id="faq-panel" style="display: none; position: absolute; bottom: 80px; right: 0; width: 360px; max-width: calc(100vw - 48px); height: 500px; background: white; border-radius: 16px; box-shadow: 0 8px 32px rgba(0,0,0,0.12); overflow: hidden; flex-direction: column;">
            <div style="background: #E85C4A; color: white; padding: 16px; display: flex; justify-content: space-between; align-items: center;">
              <h3 style="margin: 0; font-size: 16px; font-weight: 600;">FAQ (40 Q&A)</h3>
              <button id="faq-close-btn" style="background: none; border: none; color: white; font-size: 24px; cursor: pointer; padding: 0; width: 32px; height: 32px;">×</button>
            </div>
            <div id="faq-list" style="flex: 1; overflow-y: auto; padding: 16px;">
              ${lang === 'ko' ? `

                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q1: K-Taste Route가 무엇인가요?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    해외 관광객을 위한 한국 로컬 미식 여행 플랫폼입니다. SNS 맛집이 아닌 지자체 인증과 현지인이 추천하는 로컬 맛집을 소개합니다.
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q2: 어떤 언어를 지원하나요?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    한국어, 영어, 일본어, 중국어, 태국어 (5개 언어)를 지원하며 우측 상단 드롭다운에서 언어를 전환할 수 있습니다.
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q3: 어떤 지역을 다루나요?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    한국 전역 6대 권역(수도권, 강원도, 충청도, 전라도, 경상도, 제주도)을 다룹니다. 목표는 3,600+ 로컬 맛집입니다.
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q4: 미식 투어 패키지 가격은?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    3박4일 $700-2,300, 4박5일 $900-2,800 (저가형/스탠다드/고급형 옵션)
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q5: 예약은 어떻게 하나요?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    패키지 선택 → 예약 양식 작성 → 제출(선결제 없음) → 1-2일 내 담당자 연락 → 상세 조율 후 결제
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q6: 다른 맛집 플랫폼과 차이점은?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    SNS 인플루언서 맛집이 아닌 지자체 인증+현지인 추천 기반. 공항 중심 동선과 외국인 친화적 가격정보 제공.
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q7: 6개 섹터란 무엇인가요?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    공항 접근형, KTX 접근형, 전통시장, 노포(20년+), 향토음식, 산/바다 특화 맛집을 구분합니다.
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q8: 지자체 인증이란?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    지방자치단체가 위생, 맛, 서비스, 전통성을 종합 평가해 인증한 맛집입니다. 맛집 카드에 ✓ 마크로 표시됩니다.
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q9: Local Score는 무엇인가요?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    현지인 추천도를 1-100점으로 평가합니다. 90점 이상은 강력 추천, 70-89점은 단골집입니다.
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q10: 맛집은 총 몇 개인가요?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    6개 권역 × 6개 섹터 × 최소 100개 맛집 = 3,600+ 목표입니다.
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q11: 공항 중심 동선이란?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    인천공항, 김포공항, 김해공항, 제주공항 등 공항 기준으로 30분 이내 접근 가능한 맛집을 우선 표시합니다.
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q12: 패키지에 무엇이 포함되나요?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    3-5일 테마 투어, 전문 가이드, 교통편, 식사(맛집 투어), 숙박, 외국인 맞춤 서비스가 포함됩니다.
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q13: 저가형 패키지 특징은?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    게스트하우스 숙박, 대중교통 이용, 8-10명 그룹, 하루 2-3개 맛집 방문, 기본 가이드 포함.
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q14: 스탠다드 패키지 특징은?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    4성급 호텔, 전용 차량, 6-8명 그룹, 하루 3-4개 맛집, 전문 가이드+통역 포함.
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q15: 고급형 패키지 특징은?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    5성급 호텔, 전담 가이드+통역, 4-6명 소그룹, 하루 4-5개 맛집, VIP 예약 서비스 포함.
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q16: 예약 후 취소 정책은?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    7일 전까지 무료 취소, 3-7일 전 50% 환불, 3일 이내 환불 불가입니다.
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q17: 결제 시스템은?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    현재는 예약 후 담당자 연락 → 상세 조율 → 결제 방식입니다. 향후 Stripe 연동 예정입니다.
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q18: 관리자 페이지 기능은?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    맛집 관리, 후기 관리, 패키지 관리, 예약 관리 4개 탭으로 구성되어 있습니다.
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q19: CSV 대량 업로드는?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    관리자 페이지에서 150개 단위로 맛집 데이터를 CSV로 업로드할 수 있으며, 5개 언어 동시 입력 가능합니다.
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q20: 다국어 전환 방법은?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    우측 상단 언어 드롭다운(KO/EN/JA/ZH/TH)을 클릭하면 즉시 전체 페이지 언어가 전환됩니다.
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q21: API는 제공하나요?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    네. 레스토랑, 패키지, 예약, 번역, 건강 패키지 API를 RESTful 방식으로 제공합니다.
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q22: 데이터베이스는 무엇을 사용하나요?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    Cloudflare D1(엣지 분산 SQLite)를 사용합니다. 무료 플랜: 10만 read/5만 write/day.
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q23: 디자인 컨셉은?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    Eatwith 스타일의 화이트 배경 중심, 여백 강조, 미니멀한 카드 기반 디자인입니다.
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q24: 반응형 기준은?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    Mobile <768px, Tablet 768-1199px, Desktop ≥1200px. 모바일 우선 설계입니다.
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q25: 여행사 제휴는?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    파트너 페이지에서 신청 가능하며, 예약 API 제공. 수수료는 15-25%입니다.
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q26: 지자체 협력은?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    지자체가 맛집 DB 제공, 공동 브랜딩, 통계 리포트를 받습니다.
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q27: API 통합 문의는?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    api@k-taste-route.com으로 문의하세요. API 문서와 샘플 코드를 제공합니다.
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q28: 맛집 등록은 어떻게 하나요?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    지자체는 CSV 일괄 등록, 개별 맛집은 restaurant-apply@k-taste-route.com으로 신청합니다.
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q29: K-Medical Tourism은?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    경산시 기반 건강검진 및 한방 헬스 투어입니다. 1-3일 프로그램, 외국인 전용 패키지 제공.
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q30: K-Medical 가격은?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    서울 대비 30-40% 저렴합니다. 기본 검진 패키지는 $500-1,200입니다.
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q31: 건강검진 후 연계는?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    검진 결과에 따라 한방 치료(침, 한약, 마사지) 프로그램과 연계됩니다.
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q32: 국가별 맞춤 검진이란?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    국가별로 관심 높은 검진 항목(위암, 간암, 유방암 등)을 중심으로 패키지를 구성합니다.
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q33: 예약 테스트는 어디서?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    https://3000-iwal8xk8gmflxvyhhxhol-2e1b9533.sandbox.novita.ai/reserve 에서 테스트 가능합니다.
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q34: 관리자 테스트는?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    https://3000-iwal8xk8gmflxvyhhxhol-2e1b9533.sandbox.novita.ai/admin 에서 테스트 가능합니다.
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q35: K-Medical 페이지는?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    https://3000-iwal8xk8gmflxvyhhxhol-2e1b9533.sandbox.novita.ai/medical 에서 확인 가능합니다.
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q36: 문의 이메일은?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    contact@k-taste-route.com (일반), medical@k-taste-route.com (의료), partners@k-taste-route.com (제휴)
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q37: 정부 협력 문의는?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    gov@k-taste-route.com으로 지자체 협력 및 데이터 제공 문의를 하세요.
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q38: 배포 플랫폼은?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    Cloudflare Pages에 배포되며 전 세계 엣지 네트워크에서 빠르게 서비스됩니다.
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q39: 개발 기술 스택은?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    Hono (백엔드), TypeScript, Cloudflare Workers, D1 Database, Tailwind CSS (프론트엔드)
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q40: 마지막 업데이트는?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    2026-01-19. 최신 기능과 40개 FAQ가 추가되었습니다.
                  </div>
                </div>

              ` : lang === 'en' ? `

                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q1: What is K-Taste Route?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    A local Korean cuisine travel platform for international tourists. We introduce authentic restaurants certified by local governments.
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q2: Which languages are supported?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    5 languages: Korean, English, Japanese, Chinese, Thai. Switch via top-right dropdown.
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q3: Which regions are covered?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    6 major regions: Seoul Metro, Gangwon, Chungcheong, Jeolla, Gyeongsang, Jeju. Target: 3,600+ restaurants.
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q4: Tour package pricing?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    3-4 days: $700-2,300. 4-5 days: $900-2,800 (Budget/Standard/Premium options)
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q5: How to book?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    Select package → Fill form → Submit (no prepayment) → Staff contact within 1-2 days → Finalize and pay
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q6: What makes you different?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    We focus on government-certified and local-recommended restaurants, not social media influencers. Airport-centric routes.
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q7: What are the 6 sectors?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    Airport accessible, KTX accessible, Traditional markets, Legacy restaurants (20+ years), Regional cuisine, Mountain/Sea specialty.
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q8: What is government certification?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    Local governments certify restaurants based on hygiene, taste, service, and tradition. Marked with ✓ on cards.
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q9: What is Local Score?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    Local recommendation score (1-100). 90+: Highly recommended, 70-89: Regular favorite.
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q10: How many restaurants?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    Target: 6 regions × 6 sectors × 100+ restaurants = 3,600+ restaurants.
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q11: Airport-centric routes?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    Restaurants within 30 minutes from major airports (Incheon, Gimpo, Gimhae, Jeju) are prioritized.
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q12: What's included in packages?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    3-5 day themed tours, professional guide, transportation, meals (restaurant tours), accommodation, foreigner-friendly services.
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q13: Budget package features?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    Guesthouse, public transport, 8-10 people group, 2-3 restaurants/day, basic guide.
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q14: Standard package features?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    4-star hotel, private vehicle, 6-8 people, 3-4 restaurants/day, professional guide + interpreter.
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q15: Premium package features?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    5-star hotel, dedicated guide + interpreter, 4-6 people, 4-5 restaurants/day, VIP reservation service.
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q16: Cancellation policy?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    Free cancel 7+ days before, 50% refund 3-7 days, no refund within 3 days.
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q17: Payment system?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    Currently: booking → staff contact → finalize → payment. Future: Stripe integration planned.
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q18: Admin page features?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    4 tabs: Restaurant management, Review management, Package management, Booking management.
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q19: CSV bulk upload?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    Upload up to 150 restaurants at once via admin page. Supports 5 languages simultaneously.
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q20: How to switch languages?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    Click the language dropdown (KO/EN/JA/ZH/TH) at top-right. The entire page switches instantly.
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q21: Do you provide APIs?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    Yes. RESTful APIs for restaurants, packages, bookings, translations, and health packages.
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q22: What database do you use?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    Cloudflare D1 (edge-distributed SQLite). Free tier: 100K reads/50K writes per day.
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q23: Design concept?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    Eatwith-style design with white background, emphasized spacing, minimal card-based layout.
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q24: Responsive breakpoints?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    Mobile <768px, Tablet 768-1199px, Desktop ≥1200px. Mobile-first design.
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q25: Travel agency partnerships?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    Apply via partners page. Booking API provided. Commission: 15-25%.
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q26: Government cooperation?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    Local governments provide restaurant DB, co-branding, and receive statistical reports.
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q27: API integration inquiry?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    Contact api@k-taste-route.com. API docs and sample code provided.
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q28: How to register restaurants?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    Governments: CSV bulk upload. Individual restaurants: apply at restaurant-apply@k-taste-route.com.
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q29: What is K-Medical Tourism?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    Gyeongsan-based health checkup and oriental medicine wellness tours. 1-3 day programs for foreigners.
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q30: K-Medical pricing?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    30-40% cheaper than Seoul. Basic checkup packages: $500-1,200.
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q31: Post-checkup integration?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    Based on results, integrated with oriental medicine treatments (acupuncture, herbal medicine, massage).
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q32: Country-specific checkups?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    Packages tailored to country-specific health concerns (stomach, liver, breast cancer screenings, etc.).
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q33: Where to test booking?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    Test at: https://3000-iwal8xk8gmflxvyhhxhol-2e1b9533.sandbox.novita.ai/reserve
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q34: Where to test admin?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    Test at: https://3000-iwal8xk8gmflxvyhhxhol-2e1b9533.sandbox.novita.ai/admin
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q35: K-Medical page?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    View at: https://3000-iwal8xk8gmflxvyhhxhol-2e1b9533.sandbox.novita.ai/medical
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q36: Contact emails?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    contact@k-taste-route.com (general), medical@k-taste-route.com (medical), partners@k-taste-route.com (partnership)
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q37: Government cooperation inquiry?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    Contact gov@k-taste-route.com for local government cooperation and data provision.
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q38: Deployment platform?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    Deployed on Cloudflare Pages, served globally via edge network.
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q39: Tech stack?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    Hono (backend), TypeScript, Cloudflare Workers, D1 Database, Tailwind CSS (frontend)
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q40: Last update?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    2026-01-19. Latest features and 40 FAQs added.
                  </div>
                </div>

              ` : lang === 'ja' ? `

                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q1: K-Taste Routeとは？
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    海外観光客向けの韓国ローカルグルメ旅行プラットフォームです。自治体認証と地元推薦の本物のレストランを紹介します。
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q2: 対応言語は？
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    韓国語、英語、日本語、中国語、タイ語の5言語対応。右上のドロップダウンで切り替え可能。
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q3: 対応地域は？
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    韓国全域6大圏域（首都圏、江原道、忠清道、全羅道、慶尚道、済州島）。目標は3,600+店舗。
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q4: ツアー料金は？
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    3泊4日: $700-2,300、4泊5日: $900-2,800 (エコノミー/スタンダード/プレミアム)
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q5: 予約方法は？
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    パッケージ選択 → フォーム記入 → 送信(前払い不要) → 1-2日以内に担当者連絡 → 詳細調整後決済
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q6: 他のプラットフォームとの違いは？
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    SNSインフルエンサーではなく自治体認証+地元推薦を重視。空港中心の動線と外国人向け価格情報を提供。
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q7: 6つのセクターとは？
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    空港アクセス型、KTXアクセス型、伝統市場、老舗(20年+)、郷土料理、山/海特化レストランを分類。
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q8: 自治体認証とは？
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    地方自治体が衛生、味、サービス、伝統性を総合評価して認証したレストラン。カードに✓マーク表示。
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q9: Local Scoreとは？
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    地元推薦度を1-100点で評価。90点以上は強力推薦、70-89点は常連店。
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q10: レストラン総数は？
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    目標: 6圏域 × 6セクター × 100+店舗 = 3,600+レストラン。
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q11: 空港中心動線とは？
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    仁川空港、金浦空港、金海空港、済州空港から30分以内アクセス可能なレストランを優先表示。
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q12: パッケージ内容は？
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    3-5日テーマツアー、専門ガイド、交通手段、食事(レストランツアー)、宿泊、外国人向けサービス。
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q13: エコノミーパッケージは？
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    ゲストハウス、公共交通、8-10名グループ、1日2-3店舗、基本ガイド。
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q14: スタンダードパッケージは？
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    4つ星ホテル、専用車両、6-8名、1日3-4店舗、専門ガイド+通訳。
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q15: プレミアムパッケージは？
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    5つ星ホテル、専属ガイド+通訳、4-6名、1日4-5店舗、VIP予約サービス。
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q16: キャンセルポリシーは？
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    7日前まで無料キャンセル、3-7日前50%返金、3日以内返金不可。
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q17: 決済システムは？
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    現在: 予約 → 担当者連絡 → 詳細確定 → 決済。将来: Stripe連携予定。
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q18: 管理者ページ機能は？
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    4つのタブ: レストラン管理、レビュー管理、パッケージ管理、予約管理。
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q19: CSV一括アップロードは？
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    管理者ページから150店舗まで一括アップロード可能。5言語同時入力対応。
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q20: 言語切り替え方法は？
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    右上の言語ドロップダウン(KO/EN/JA/ZH/TH)をクリックでページ全体が即座に切り替わります。
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q21: APIは提供していますか？
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    はい。レストラン、パッケージ、予約、翻訳、健康パッケージのRESTful APIを提供。
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q22: 使用データベースは？
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    Cloudflare D1(エッジ分散SQLite)。無料プラン: 10万read/5万write/日。
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q23: デザインコンセプトは？
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    Eatwithスタイルのホワイト背景、余白強調、ミニマルなカードベースデザイン。
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q24: レスポンシブ基準は？
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    Mobile <768px、Tablet 768-1199px、Desktop ≥1200px。モバイルファースト設計。
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q25: 旅行会社提携は？
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    パートナーページから申請可能。予約API提供。手数料: 15-25%。
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q26: 自治体協力は？
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    自治体がレストランDB提供、共同ブランディング、統計レポート受領。
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q27: API統合お問い合わせは？
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    api@k-taste-route.comまでご連絡ください。APIドキュメントとサンプルコード提供。
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q28: レストラン登録方法は？
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    自治体: CSV一括登録。個別店舗: restaurant-apply@k-taste-route.comへ申請。
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q29: K-Medical Tourismとは？
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    慶山市ベースの健康検診および韓方ウェルネスツアー。1-3日プログラム、外国人専用パッケージ。
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q30: K-Medical料金は？
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    ソウル比30-40%安価。基本検診パッケージ: $500-1,200。
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q31: 検診後の連携は？
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    検診結果に基づき韓方治療(鍼、韓方薬、マッサージ)プログラムと連携。
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q32: 国別カスタム検診とは？
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    国別に関心の高い検診項目(胃がん、肝がん、乳がん等)中心にパッケージ構成。
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q33: 予約テストは？
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    https://3000-iwal8xk8gmflxvyhhxhol-2e1b9533.sandbox.novita.ai/reserve でテスト可能。
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q34: 管理者テストは？
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    https://3000-iwal8xk8gmflxvyhhxhol-2e1b9533.sandbox.novita.ai/admin でテスト可能。
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q35: K-Medicalページは？
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    https://3000-iwal8xk8gmflxvyhhxhol-2e1b9533.sandbox.novita.ai/medical で確認可能。
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q36: お問い合わせメールは？
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    contact@k-taste-route.com (一般)、medical@k-taste-route.com (医療)、partners@k-taste-route.com (提携)
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q37: 政府協力お問い合わせは？
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    gov@k-taste-route.comまで自治体協力およびデータ提供についてお問い合わせください。
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q38: デプロイプラットフォームは？
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    Cloudflare Pagesにデプロイ、グローバルエッジネットワークで高速配信。
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q39: 技術スタックは？
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    Hono (バックエンド)、TypeScript、Cloudflare Workers、D1 Database、Tailwind CSS (フロントエンド)
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q40: 最終更新は？
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    2026-01-19。最新機能と40個のFAQが追加されました。
                  </div>
                </div>

              ` : lang === 'zh' ? `

                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q1: K-Taste Route是什么？
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    为海外游客提供的韩国本地美食旅游平台。介绍经地方政府认证和当地人推荐的正宗餐厅。
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q2: 支持哪些语言？
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    支持5种语言：韩语、英语、日语、中文、泰语。可在右上角下拉菜单切换。
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q3: 覆盖哪些地区？
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    全韩6大地区（首都圈、江原道、忠清道、全罗道、庆尚道、济州岛）。目标：3,600+餐厅。
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q4: 旅游套餐价格？
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    3晚4天: $700-2,300，4晚5天: $900-2,800（经济型/标准型/豪华型）
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q5: 如何预订？
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    选择套餐 → 填写表格 → 提交（无需预付） → 1-2天内工作人员联系 → 确认详情后付款
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q6: 与其他平台有什么不同？
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    不依赖社交媒体网红，而是基于政府认证+当地推荐。提供以机场为中心的路线和外国游客友好的价格信息。
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q7: 6个类别是什么？
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    机场可达型、KTX可达型、传统市场、老字号(20年+)、地方特色菜、山/海特色餐厅分类。
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q8: 政府认证是什么？
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    地方政府对卫生、味道、服务、传统性进行综合评估认证的餐厅。卡片上显示✓标记。
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q9: Local Score是什么？
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    当地推荐度评分(1-100)。90+强烈推荐，70-89常客店。
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q10: 餐厅总数是多少？
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    目标：6个地区 × 6个类别 × 100+餐厅 = 3,600+餐厅。
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q11: 以机场为中心的路线？
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    优先显示距离主要机场(仁川、金浦、金海、济州)30分钟内可达的餐厅。
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q12: 套餐包含什么？
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    3-5天主题游、专业导游、交通、餐食(餐厅游)、住宿、外国游客友好服务。
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q13: 经济型套餐特点？
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    招待所、公共交通、8-10人团、每天2-3家餐厅、基础导游。
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q14: 标准型套餐特点？
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    四星酒店、专车、6-8人、每天3-4家餐厅、专业导游+翻译。
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q15: 豪华型套餐特点？
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    五星酒店、专属导游+翻译、4-6人、每天4-5家餐厅、VIP预订服务。
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q16: 取消政策？
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    提前7天免费取消，3-7天50%退款，3天内不退款。
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q17: 支付系统？
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    目前：预订 → 工作人员联系 → 确认详情 → 付款。未来：计划集成Stripe。
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q18: 管理页面功能？
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    4个标签：餐厅管理、评论管理、套餐管理、预订管理。
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q19: CSV批量上传？
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    管理页面可一次上传150家餐厅。支持5种语言同时输入。
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q20: 如何切换语言？
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    点击右上角语言下拉菜单(KO/EN/JA/ZH/TH)即可立即切换整个页面语言。
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q21: 提供API吗？
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    是的。提供餐厅、套餐、预订、翻译、健康套餐的RESTful API。
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q22: 使用什么数据库？
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    Cloudflare D1(边缘分布式SQLite)。免费套餐：每天10万次读取/5万次写入。
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q23: 设计理念？
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    Eatwith风格设计，白色背景、强调留白、极简卡片布局。
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q24: 响应式断点？
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    Mobile <768px, Tablet 768-1199px, Desktop ≥1200px。移动优先设计。
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q25: 旅行社合作？
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    通过合作伙伴页面申请。提供预订API。佣金：15-25%。
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q26: 政府合作？
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    地方政府提供餐厅数据库、共同品牌推广并获得统计报告。
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q27: API集成咨询？
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    联系api@k-taste-route.com。提供API文档和示例代码。
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q28: 如何注册餐厅？
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    政府：CSV批量上传。单个餐厅：发送申请至restaurant-apply@k-taste-route.com。
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q29: K-Medical Tourism是什么？
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    基于庆山市的健康体检和韩方养生游。1-3天项目，面向外国人的专属套餐。
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q30: K-Medical价格？
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    比首尔便宜30-40%。基础体检套餐：$500-1,200。
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q31: 体检后整合？
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    根据体检结果，整合韩方治疗(针灸、中药、按摩)项目。
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q32: 针对国家的体检？
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    根据各国关注的健康问题(胃癌、肝癌、乳腺癌筛查等)定制套餐。
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q33: 预订测试在哪？
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    测试地址：https://3000-iwal8xk8gmflxvyhhxhol-2e1b9533.sandbox.novita.ai/reserve
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q34: 管理测试在哪？
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    测试地址：https://3000-iwal8xk8gmflxvyhhxhol-2e1b9533.sandbox.novita.ai/admin
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q35: K-Medical页面？
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    查看地址：https://3000-iwal8xk8gmflxvyhhxhol-2e1b9533.sandbox.novita.ai/medical
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q36: 联系邮箱？
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    contact@k-taste-route.com (一般)、medical@k-taste-route.com (医疗)、partners@k-taste-route.com (合作)
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q37: 政府合作咨询？
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    联系gov@k-taste-route.com咨询地方政府合作和数据提供。
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q38: 部署平台？
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    部署在Cloudflare Pages，通过全球边缘网络提供服务。
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q39: 技术栈？
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    Hono (后端)、TypeScript、Cloudflare Workers、D1 Database、Tailwind CSS (前端)
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q40: 最后更新？
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    2026-01-19。添加了最新功能和40个FAQ。
                  </div>
                </div>

              ` : `

                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q1: K-Taste Route คืออะไร?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    แพลตฟอร์มท่องเที่ยวอาหารท้องถิ่นเกาหลีสำหรับนักท่องเที่ยวต่างชาติ แนะนำร้านอาหารแท้ที่ได้รับการรับรองจากรัฐบาลท้องถิ่น
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q2: รองรับภาษาใดบ้าง?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    รองรับ 5 ภาษา: เกาหลี อังกฤษ ญี่ปุ่น จีน ไทย สลับได้ที่ดรอปดาวน์มุมขวาบน
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q3: ครอบคลุมพื้นที่ใดบ้าง?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    ครอบคลุม 6 ภูมิภาคหลักทั่วเกาหลี (เมืองหลวง คังวอน ชุงชอง จอลลา คยองซัง เชจู) เป้าหมาย: 3,600+ ร้านอาหาร
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q4: ราคาแพ็คเกจทัวร์?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    3 คืน 4 วัน: $700-2,300, 4 คืน 5 วัน: $900-2,800 (ประหยัด/มาตรฐาน/พรีเมียม)
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q5: จองอย่างไร?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    เลือกแพ็คเกจ → กรอกแบบฟอร์ม → ส่ง(ไม่ต้องจ่ายล่วงหน้า) → เจ้าหน้าที่ติดต่อภายใน 1-2 วัน → ตกลงรายละเอียดและชำระเงิน
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q6: แตกต่างจากแพลตฟอร์มอื่นอย่างไร?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    ไม่พึ่งพาอินฟลูเอนเซอร์โซเชียลมีเดีย แต่เน้นการรับรองจากรัฐบาล+คำแนะนำจากคนท้องถิ่น เส้นทางที่มีสนามบินเป็นศูนย์กลาง
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q7: 6 หมวดหมู่คืออะไร?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    ประเภท: เข้าถึงได้จากสนามบิน, เข้าถึงได้จาก KTX, ตลาดดั้งเดิม, ร้านเก่าแก่(20 ปี+), อาหารท้องถิ่น, พิเศษภูเขา/ทะเล
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q8: การรับรองจากรัฐบาลคืออะไร?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    รัฐบาลท้องถิ่นรับรองร้านอาหารตามสุขอนามัย รสชาติ การบริการ และประเพณี แสดงด้วยเครื่องหมาย✓บนการ์ด
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q9: Local Score คืออะไร?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    คะแนนแนะนำจากคนท้องถิ่น(1-100) 90+แนะนำอย่างยิ่ง, 70-89ร้านประจำ
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q10: จำนวนร้านอาหารทั้งหมด?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    เป้าหมาย: 6 ภูมิภาค × 6 หมวดหมู่ × 100+ ร้าน = 3,600+ ร้านอาหาร
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q11: เส้นทางที่มีสนามบินเป็นศูนย์กลาง?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    แสดงร้านอาหารที่เข้าถึงได้ภายใน 30 นาทีจากสนามบินหลัก(อินชอน คิมโป คิมแฮ เชจู)เป็นลำดับแรก
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q12: แพ็คเกจรวมอะไรบ้าง?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    ทัวร์ธีม 3-5 วัน, ไกด์มืออาชีพ, การเดินทาง, อาหาร(ทัวร์ร้านอาหาร), ที่พัก, บริการสำหรับชาวต่างชาติ
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q13: ลักษณะแพ็คเกจประหยัด?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    เกสต์เฮาส์, ขนส่งสาธารณะ, กลุ่ม 8-10 คน, 2-3 ร้าน/วัน, ไกด์พื้นฐาน
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q14: ลักษณะแพ็คเกจมาตรฐาน?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    โรงแรม 4 ดาว, รถส่วนตัว, 6-8 คน, 3-4 ร้าน/วัน, ไกด์มืออาชีพ+ล่าม
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q15: ลักษณะแพ็คเกจพรีเมียม?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    โรงแรม 5 ดาว, ไกด์เฉพาะ+ล่าม, 4-6 คน, 4-5 ร้าน/วัน, บริการจองแบบ VIP
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q16: นโยบายการยกเลิก?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    ยกเลิกฟรีก่อน 7+ วัน, คืนเงิน 50% สำหรับ 3-7 วัน, ไม่คืนเงินภายใน 3 วัน
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q17: ระบบการชำระเงิน?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    ปัจจุบัน: จอง → เจ้าหน้าที่ติดต่อ → ยืนยัน → ชำระเงิน อนาคต: วางแผนผสาน Stripe
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q18: ฟีเจอร์หน้าผู้ดูแลระบบ?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    4 แท็บ: จัดการร้านอาหาร, จัดการรีวิว, จัดการแพ็คเกจ, จัดการการจอง
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q19: อัปโหลด CSV จำนวนมาก?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    อัปโหลดร้านอาหารได้สูงสุด 150 ร้านพร้อมกันผ่านหน้าผู้ดูแลระบบ รองรับ 5 ภาษาพร้อมกัน
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q20: สลับภาษาอย่างไร?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    คลิกดรอปดาวน์ภาษา(KO/EN/JA/ZH/TH)ที่มุมขวาบน ทั้งหน้าจะสลับทันที
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q21: มี API ให้หรือไม่?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    มี RESTful API สำหรับร้านอาหาร แพ็คเกจ การจอง การแปล และแพ็คเกจสุขภาพ
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q22: ใช้ฐานข้อมูลอะไร?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    Cloudflare D1 (SQLite แบบกระจายขอบ) ฟรี: อ่าน 10 หมื่น/เขียน 5 หมื่น ต่อวัน
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q23: แนวคิดการออกแบบ?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    ออกแบบสไตล์ Eatwith พื้นหลังขาว เน้นช่องว่าง เลย์เอาต์การ์ดแบบมินิมอล
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q24: จุดเปลี่ยนการตอบสนอง?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    มือถือ <768px, แท็บเล็ต 768-1199px, เดสก์ท็อป ≥1200px การออกแบบมือถือก่อน
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q25: ความร่วมมือกับบริษัททัวร์?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    สมัครผ่านหน้าพาร์ทเนอร์ มี API การจอง ค่าคอมมิชชั่น: 15-25%
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q26: ความร่วมมือกับรัฐบาล?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    รัฐบาลท้องถิ่นให้ฐานข้อมูลร้านอาหาร การสร้างแบรนด์ร่วม และรับรายงานสถิติ
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q27: สอบถามเกี่ยวกับการรวม API?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    ติดต่อ api@k-taste-route.com เอกสาร API และโค้ดตัวอย่างให้
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q28: ลงทะเบียนร้านอาหารอย่างไร?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    รัฐบาล: อัปโหลด CSV จำนวนมาก ร้านอาหารแต่ละแห่ง: สมัครที่ restaurant-apply@k-taste-route.com
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q29: K-Medical Tourism คืออะไร?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    ทัวร์ตรวจสุขภาพและความเป็นอยู่ที่ดีแพทย์แผนตะวันออกที่เมืองคยองซาน โปรแกรม 1-3 วัน สำหรับชาวต่างชาติโดยเฉพาะ
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q30: ราคา K-Medical?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    ถูกกว่าโซลประมาณ 30-40% แพ็คเกจตรวจสุขภาพพื้นฐาน: $500-1,200
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q31: การผสานหลังตรวจสุขภาพ?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    ตามผลตรวจ ผสานกับโปรแกรมการรักษาแพทย์แผนตะวันออก(ฝังเข็ม ยาจีน นวด)
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q32: การตรวจสุขภาพเฉพาะประเทศ?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    แพ็คเกจปรับแต่งตามปัญหาสุขภาพเฉพาะประเทศ(การตรวจมะเร็งกระเพาะอาหาร ตับ เต้านม ฯลฯ)
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q33: ทดสอบการจองที่ไหน?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    ทดสอบที่: https://3000-iwal8xk8gmflxvyhhxhol-2e1b9533.sandbox.novita.ai/reserve
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q34: ทดสอบผู้ดูแลระบบที่ไหน?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    ทดสอบที่: https://3000-iwal8xk8gmflxvyhhxhol-2e1b9533.sandbox.novita.ai/admin
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q35: หน้า K-Medical?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    ดูที่: https://3000-iwal8xk8gmflxvyhhxhol-2e1b9533.sandbox.novita.ai/medical
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q36: อีเมลติดต่อ?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    contact@k-taste-route.com (ทั่วไป), medical@k-taste-route.com (การแพทย์), partners@k-taste-route.com (พาร์ทเนอร์)
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q37: สอบถามความร่วมมือกับรัฐบาล?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    ติดต่อ gov@k-taste-route.com สำหรับความร่วมมือกับรัฐบาลท้องถิ่นและการให้ข้อมูล
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q38: แพลตฟอร์มการเปิดตัว?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    เปิดตัวบน Cloudflare Pages ให้บริการทั่วโลกผ่านเครือข่ายขอบ
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q39: สแต็กเทคโนโลยี?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    Hono (แบ็กเอนด์), TypeScript, Cloudflare Workers, D1 Database, Tailwind CSS (ฟรอนต์เอนด์)
                  </div>
                </div>
                <div class="faq-item" style="margin-bottom: 16px;">
                  <button class="faq-q" style="width: 100%; text-align: left; padding: 12px; background: #F7F7F7; border: 1px solid #EDEDED; border-radius: 8px; cursor: pointer; font-size: 14px; color: #1F1F1F; margin-bottom: 8px; font-weight: 500;">
                    Q40: อัปเดตล่าสุด?
                  </button>
                  <div class="faq-a" style="display: none; padding: 12px; background: #FFF9F8; border-left: 3px solid #E85C4A; margin-bottom: 12px; font-size: 13px; line-height: 1.6; color: #555;">
                    2026-01-19 เพิ่มฟีเจอร์ล่าสุดและ 40 FAQ
                  </div>
                </div>
              `}
            </div>

          </div>
        </div>

        <!-- Scripts -->
        <script>
        // FAQ Chatbot
        document.addEventListener('DOMContentLoaded', () => {
          const faqToggle = document.getElementById('faq-toggle-btn');
          const faqPanel = document.getElementById('faq-panel');
          const faqClose = document.getElementById('faq-close-btn');
          
          if (faqToggle && faqPanel && faqClose) {
            faqToggle.addEventListener('click', () => {
              faqPanel.style.display = faqPanel.style.display === 'none' ? 'flex' : 'none';
            });
            
            faqClose.addEventListener('click', () => {
              faqPanel.style.display = 'none';
            });
            
            // FAQ Q&A toggle
            document.querySelectorAll('.faq-q').forEach(btn => {
              btn.addEventListener('click', (e) => {
                const answer = e.target.nextElementSibling;
                const isVisible = answer.style.display === 'block';
                
                // Close all answers
                document.querySelectorAll('.faq-a').forEach(a => a.style.display = 'none');
                
                // Toggle clicked answer
                if (!isVisible) {
                  answer.style.display = 'block';
                }
              });
            });
          }
          
          // 3개 Hero 버튼 이벤트 리스너
          const startTourBtn = document.getElementById('start-tour-btn');
          const localPicksBtn = document.getElementById('local-picks-btn');
          const tourPackagesBtn = document.getElementById('tour-packages-btn');
          const aiSection = document.getElementById('ai-recommendation-section');
          const aiLoading = document.getElementById('ai-loading');
          const aiResults = document.getElementById('ai-results');
          const aiTitle = document.getElementById('ai-section-title');
          const aiSubtitle = document.getElementById('ai-section-subtitle');
          
          // AI 추천 데이터 (샘플)
          const aiData = {
            startTour: {
              title: ${lang === 'ko' ? '"미식 투어 큐레이션"' : lang === 'en' ? '"Food Tour Curation"' : lang === 'ja' ? '"美食ツアーキュレーション"' : lang === 'zh' ? '"美食之旅策划"' : '"การคัดเลือกทัวร์อาหาร"'},
              subtitle: ${lang === 'ko' ? '"AI가 설계한 당신만의 미식 여행 루트"' : lang === 'en' ? '"Your personalized food journey designed by AI"' : lang === 'ja' ? '"AIが設計したあなただけの美食旅行ルート"' : lang === 'zh' ? '"AI为您设计的专属美食旅程"' : '"เส้นทางการเดินทางอาหารที่ออกแบบโดย AI"'},
              items: [
                {
                  title: ${lang === 'ko' ? '"골목 로컬 미식 반일 투어"' : lang === 'en' ? '"Half-day Local Alley Food Tour"' : lang === 'ja' ? '"路地裏ローカル美食半日ツアー"' : lang === 'zh' ? '"半日胡同本地美食游"' : '"ทัวร์อาหารท้องถิ่นครึ่งวัน"'},
                  time: ${lang === 'ko' ? '"4시간"' : lang === 'en' ? '"4 hours"' : lang === 'ja' ? '"4時間"' : lang === 'zh' ? '"4小时"' : '"4 ชั่วโมง"'},
                  distance: ${lang === 'ko' ? '"도보 2km"' : lang === 'en' ? '"2km walk"' : lang === 'ja' ? '"徒歩2km"' : lang === 'zh' ? '"步行2公里"' : '"เดิน 2 กม."'},
                  desc: ${lang === 'ko' ? '"관광객보다 현지 주민이 주말에 즐기는 동선. 과하지 않은 양과 이동 거리로 구성된 신뢰 가능한 루트입니다."' : lang === 'en' ? '"A route enjoyed by local residents on weekends. Reliable route with moderate portions and distances."' : lang === 'ja' ? '"地元住民が週末に楽しむ動線。適度な量と移動距離で構成された信頼できるルートです。"' : lang === 'zh' ? '"当地居民周末享受的路线。份量和距离适中的可靠路线。"' : '"เส้นทางที่ชาวบ้านท้องถิ่นเพลิดเพลินในวันหยุด เส้นทางที่เชื่อถือได้ด้วยปริมาณและระยะทางที่พอดี"'},
                  tags: [${lang === 'ko' ? '"지자체 인증"' : lang === 'en' ? '"Gov Certified"' : lang === 'ja' ? '"自治体認証"' : lang === 'zh' ? '"政府认证"' : '"รับรองโดยรัฐบาล"'}, ${lang === 'ko' ? '"외국인 친화"' : lang === 'en' ? '"Foreigner Friendly"' : lang === 'ja' ? '"外国人向け"' : lang === 'zh' ? '"适合外国人"' : '"เป็นมิตรกับชาวต่างชาติ"'}]
                },
                {
                  title: ${lang === 'ko' ? '"전통 한식 중심 일일 투어"' : lang === 'en' ? '"Full-day Traditional Korean Cuisine Tour"' : lang === 'ja' ? '"伝統韓食中心一日ツアー"' : lang === 'zh' ? '"传统韩餐一日游"' : '"ทัวร์อาหารเกาหลีดั้งเดิมเต็มวัน"'},
                  time: ${lang === 'ko' ? '"8시간"' : lang === 'en' ? '"8 hours"' : lang === 'ja' ? '"8時間"' : lang === 'zh' ? '"8小时"' : '"8 ชั่วโมง"'},
                  distance: ${lang === 'ko' ? '"전용차량"' : lang === 'en' ? '"Private vehicle"' : lang === 'ja' ? '"専用車両"' : lang === 'zh' ? '"专车"' : '"รถส่วนตัว"'},
                  desc: ${lang === 'ko' ? '"지역 대표 한식을 체계적으로 경험하는 루트. 현지인이 자주 찾는 노포와 전통시장을 포함합니다."' : lang === 'en' ? '"Systematically experience representative Korean cuisine. Includes local favorites and traditional markets."' : lang === 'ja' ? '"地域代表的な韓食を体系的に体験するルート。地元民がよく訪れる老舗と伝統市場を含みます。"' : lang === 'zh' ? '"系统体验地区代表性韩餐的路线。包括当地人常去的老字号和传统市场。"' : '"สัมผัสประสบการณ์อาหารเกาหลีที่เป็นตัวแทนของภูมิภาคอย่างเป็นระบบ รวมถึงร้านเก่าแก่และตลาดดั้งเดิมที่ชาวบ้านชอบไป"'},
                  tags: [${lang === 'ko' ? '"가이드 포함"' : lang === 'en' ? '"Guide Included"' : lang === 'ja' ? '"ガイド付き"' : lang === 'zh' ? '"含导游"' : '"มีไกด์"'}, ${lang === 'ko' ? '"노포 방문"' : lang === 'en' ? '"Legacy Restaurants"' : lang === 'ja' ? '"老舗訪問"' : lang === 'zh' ? '"老字号"' : '"ร้านเก่าแก่"'}]
                },
                {
                  title: ${lang === 'ko' ? '"힐링 건강 미식 투어"' : lang === 'en' ? '"Healing & Wellness Food Tour"' : lang === 'ja' ? '"ヒーリング健康美食ツアー"' : lang === 'zh' ? '"疗愈健康美食游"' : '"ทัวร์อาหารเพื่อสุขภาพ"'},
                  time: ${lang === 'ko' ? '"6시간"' : lang === 'en' ? '"6 hours"' : lang === 'ja' ? '"6時間"' : lang === 'zh' ? '"6小时"' : '"6 ชั่วโมง"'},
                  distance: ${lang === 'ko' ? '"도보+차량"' : lang === 'en' ? '"Walk + Vehicle"' : lang === 'ja' ? '"徒歩+車両"' : lang === 'zh' ? '"步行+车辆"' : '"เดิน+รถ"'},
                  desc: ${lang === 'ko' ? '"의료관광 연계에 적합한 부담 없는 식사 중심. 자극적이지 않은 메뉴와 회복 중 적합한 구성입니다."' : lang === 'en' ? '"Light meals suitable for medical tourism. Non-spicy menus ideal for recovery."' : lang === 'ja' ? '"医療観光連携に適した負担のない食事中心。刺激的でないメニューと回復中に適した構成です。"' : lang === 'zh' ? '"适合医疗旅游的轻松餐食。非辛辣菜单，适合康复期。"' : '"อาหารเบาๆ ที่เหมาะสำหรับการท่องเที่ยวเชิงการแพทย์ เมนูไม่เผ็ดเหมาะสำหรับการฟื้นตัว"'},
                  tags: [${lang === 'ko' ? '"건강식"' : lang === 'en' ? '"Healthy"' : lang === 'ja' ? '"健康食"' : lang === 'zh' ? '"健康餐"' : '"สุขภาพดี"'}, ${lang === 'ko' ? '"의료관광 추천"' : lang === 'en' ? '"Medical Tourism"' : lang === 'ja' ? '"医療観光推奨"' : lang === 'zh' ? '"医疗旅游推荐"' : '"ท่องเที่ยวเชิงการแพทย์"'}]
                }
              ]
            },
            localPicks: {
              title: ${lang === 'ko' ? '"추천 로컬 맛집"' : lang === 'en' ? '"Recommended Local Restaurants"' : lang === 'ja' ? '"おすすめローカル飲食店"' : lang === 'zh' ? '"推荐本地餐厅"' : '"ร้านอาหารท้องถิ่นที่แนะนำ"'},
              subtitle: ${lang === 'ko' ? '"AI가 선별한 지자체 인증 맛집"' : lang === 'en' ? '"AI-selected government certified restaurants"' : lang === 'ja' ? '"AIが選別した自治体認証飲食店"' : lang === 'zh' ? '"AI筛选的政府认证餐厅"' : '"ร้านอาหารที่ได้รับการรับรองจากรัฐบาลที่คัดเลือกโดย AI"'},
              items: [
                {
                  title: ${lang === 'ko' ? '"명동 할매 국밥"' : lang === 'en' ? '"Myeongdong Halme Gukbap"' : lang === 'ja' ? '"明洞ハルメクッパ"' : lang === 'zh' ? '"明洞奶奶汤饭"' : '"ซุปข้าวยายที่เมียงดง"'},
                  region: ${lang === 'ko' ? '"수도권 · 서울역 도보 10분"' : lang === 'en' ? '"Seoul Metro · 10min walk from Seoul Station"' : lang === 'ja' ? '"首都圏·ソウル駅徒歩10分"' : lang === 'zh' ? '"首都圈·首尔站步行10分钟"' : '"เขตกรุงเทพฯ · เดิน 10 นาทีจากสถานีโซล"'},
                  menu: ${lang === 'ko' ? '"돼지국밥, 순대국"' : lang === 'en' ? '"Pork soup with rice, Sundae soup"' : lang === 'ja' ? '"豚クッパ、スンデクク"' : lang === 'zh' ? '"猪肉汤饭、血肠汤"' : '"ซุปหมูกับข้าว ซุปซุนแด"'},
                  desc: ${lang === 'ko' ? '"관광객보다 인근 주민들이 점심시간에 가장 많이 찾는 곳. 자극적이지 않은 국물과 합리적인 가격으로 외국인 재방문율이 높은 로컬 맛집입니다."' : lang === 'en' ? '"Local favorite for lunch. Non-spicy soup with reasonable prices. High return rate among foreigners."' : lang === 'ja' ? '"観光客より近隣住民が昼食時に最もよく訪れる場所。刺激的でないスープと合理的な価格で外国人再訪率が高いローカル飲食店です。"' : lang === 'zh' ? '"当地居民午餐时最常去的地方。非辛辣汤底，价格合理，外国人回访率高的本地餐厅。"' : '"ร้านที่ชาวบ้านท้องถิ่นมาทานมากที่สุดในช่วงเที่ยง น้ำซุปไม่เผ็ด ราคาสมเหตุสมผล อัตราการกลับมาของชาวต่างชาติสูง"'},
                  tags: [${lang === 'ko' ? '"지자체 인증"' : lang === 'en' ? '"Gov Certified"' : lang === 'ja' ? '"自治体認証"' : lang === 'zh' ? '"政府认证"' : '"รับรองโดยรัฐบาล"'}, ${lang === 'ko' ? '"현지인 추천"' : lang === 'en' ? '"Local Recommended"' : lang === 'ja' ? '"地元民推薦"' : lang === 'zh' ? '"本地人推荐"' : '"แนะนำโดยชาวบ้าน"'}]
                },
                {
                  title: ${lang === 'ko' ? '"부산 자갈치 해물탕"' : lang === 'en' ? '"Busan Jagalchi Seafood Soup"' : lang === 'ja' ? '"釜山チャガルチ海鮮鍋"' : lang === 'zh' ? '"釜山扎嘎其海鲜汤"' : '"ซุปซีฟู้ดจากัลชีปูซาน"'},
                  region: ${lang === 'ko' ? '"경상도 · 자갈치시장 내"' : lang === 'en' ? '"Gyeongsang · Inside Jagalchi Market"' : lang === 'ja' ? '"慶尚道·チャガルチ市場内"' : lang === 'zh' ? '"庆尚道·扎嘎其市场内"' : '"คยองซัง · ภายในตลาดจากัลชี"'},
                  menu: ${lang === 'ko' ? '"물회, 해물탕"' : lang === 'en' ? '"Cold raw fish soup, Seafood stew"' : lang === 'ja' ? '"ムルフェ、海鮮鍋"' : lang === 'zh' ? '"冷生鱼汤、海鲜汤"' : '"ซุปปลาดิบเย็น สตูว์ซีฟู้ด"'},
                  desc: ${lang === 'ko' ? '"부산 현지인이 새벽 시장 방문 후 꼭 들르는 곳. 신선한 해산물과 투명한 가격으로 외국인 응대 경험이 풍부합니다."' : lang === 'en' ? '"Local Busan residents post-market spot. Fresh seafood with transparent pricing. Experienced with foreign visitors."' : lang === 'ja' ? '"釜山地元民が早朝市場訪問後に必ず立ち寄る場所。新鮮な海産物と透明な価格で外国人対応経験が豊富です。"' : lang === 'zh' ? '"釜山当地人清晨市场后必去的地方。新鲜海鲜，价格透明，接待外国人经验丰富。"' : '"สถานที่ที่ชาวปูซานมาหลังจากตลาดเช้า อาหารทะเลสด ราคาโปร่งใส มีประสบการณ์ต้อนรับชาวต่างชาติ"'},
                  tags: [${lang === 'ko' ? '"산지 직송"' : lang === 'en' ? '"Direct from Source"' : lang === 'ja' ? '"産地直送"' : lang === 'zh' ? '"产地直送"' : '"ตรงจากแหล่งกำเนิด"'}, ${lang === 'ko' ? '"전통시장"' : lang === 'en' ? '"Traditional Market"' : lang === 'ja' ? '"伝統市場"' : lang === 'zh' ? '"传统市场"' : '"ตลาดดั้งเดิม"'}]
                },
                {
                  title: ${lang === 'ko' ? '"전주 한옥마을 비빔밥"' : lang === 'en' ? '"Jeonju Hanok Village Bibimbap"' : lang === 'ja' ? '"全州韓屋村ビビンバ"' : lang === 'zh' ? '"全州韩屋村拌饭"' : '"บิบิมบับหมู่บ้านฮันอกจอนจู"'},
                  region: ${lang === 'ko' ? '"전라도 · 한옥마을 중심가"' : lang === 'en' ? '"Jeolla · Center of Hanok Village"' : lang === 'ja' ? '"全羅道·韓屋村中心街"' : lang === 'zh' ? '"全罗道·韩屋村中心"' : '"จอลลา · ใจกลางหมู่บ้านฮันอก"'},
                  menu: ${lang === 'ko' ? '"전주비빔밥, 콩나물국밥"' : lang === 'en' ? '"Jeonju Bibimbap, Bean sprout soup"' : lang === 'ja' ? '"全州ビビンバ、豆もやしクッパ"' : lang === 'zh' ? '"全州拌饭、豆芽汤饭"' : '"บิบิมบับจอนจู ซุปถั่วงอก"'},
                  desc: ${lang === 'ko' ? '"전주 비빔밥의 본고장으로 3대째 이어온 가족 경영 맛집. 채식 옵션 가능하며 한국 전통 상차림을 경험할 수 있습니다."' : lang === 'en' ? '"Authentic Jeonju bibimbap, family-run for 3 generations. Vegetarian options available. Experience traditional Korean table setting."' : lang === 'ja' ? '"全州ビビンバの本場で3代目まで続く家族経営の飲食店。菜食オプション可能で韓国伝統の膳立てを体験できます。"' : lang === 'zh' ? '"全州拌饭的发源地，三代家族经营。可提供素食选项，体验韩国传统餐桌布置。"' : '"ต้นตำรับบิบิมบับจอนจู ดำเนินการโดยครอบครัว 3 รุ่น มีตัวเลือกมังสวิรัติ สัมผัสประสบการณ์การจัดโต๊ะแบบดั้งเดิมของเกาหลี"'},
                  tags: [${lang === 'ko' ? '"노포 20년+"' : lang === 'en' ? '"Legacy 20+ years"' : lang === 'ja' ? '"老舗20年+"' : lang === 'zh' ? '"老字号20年+"' : '"ร้านเก่าแก่ 20+ ปี"'}, ${lang === 'ko' ? '"채식 가능"' : lang === 'en' ? '"Vegetarian Option"' : lang === 'ja' ? '"菜食可能"' : lang === 'zh' ? '"素食选项"' : '"มังสวิรัติ"'}]
                }
              ]
            },
            tourPackages: {
              title: ${lang === 'ko' ? '"미식 투어 패키지"' : lang === 'en' ? '"Food Tour Packages"' : lang === 'ja' ? '"美食ツアーパッケージ"' : lang === 'zh' ? '"美食旅游套餐"' : '"แพ็คเกจทัวร์อาหาร"'},
              subtitle: ${lang === 'ko' ? '"가격·구성이 명확한 신뢰 가능한 공식 패키지"' : lang === 'en' ? '"Official packages with clear pricing and composition"' : lang === 'ja' ? '"価格·構成が明確な信頼できる公式パッケージ"' : lang === 'zh' ? '"价格和内容明确的可靠官方套餐"' : '"แพ็คเกจอย่างเป็นทางการที่มีราคาและองค์ประกอบที่ชัดเจน"'},
              items: [
                {
                  title: ${lang === 'ko' ? '"서울 로컬 한식 핵심 3박4일"' : lang === 'en' ? '"Seoul Local Korean Cuisine 3N4D"' : lang === 'ja' ? '"ソウルローカル韓食コア3泊4日"' : lang === 'zh' ? '"首尔本地韩餐核心3晚4天"' : '"อาหารเกาหลีท้องถิ่นกรุงโซล 3 คืน 4 วัน"'},
                  time: ${lang === 'ko' ? '"3박 4일"' : lang === 'en' ? '"3 nights 4 days"' : lang === 'ja' ? '"3泊4日"' : lang === 'zh' ? '"3晚4天"' : '"3 คืน 4 วัน"'},
                  price: ${lang === 'ko' ? '"₩1,200,000 ~"' : lang === 'en' ? '"$900 ~"' : lang === 'ja' ? '"¥150,000 ~"' : lang === 'zh' ? '"¥5,800 ~"' : '"฿32,000 ~"'},
                  included: [${lang === 'ko' ? '"4성급 호텔"' : lang === 'en' ? '"4-star hotel"' : lang === 'ja' ? '"4つ星ホテル"' : lang === 'zh' ? '"四星酒店"' : '"โรงแรม 4 ดาว"'}, ${lang === 'ko' ? '"전용차량"' : lang === 'en' ? '"Private vehicle"' : lang === 'ja' ? '"専用車両"' : lang === 'zh' ? '"专车"' : '"รถส่วนตัว"'}, ${lang === 'ko' ? '"가이드"' : lang === 'en' ? '"Guide"' : lang === 'ja' ? '"ガイド"' : lang === 'zh' ? '"导游"' : '"ไกด์"'}, ${lang === 'ko' ? '"15회 식사"' : lang === 'en' ? '"15 meals"' : lang === 'ja' ? '"15食"' : lang === 'zh' ? '"15餐"' : '"15 มื้อ"'}],
                  desc: ${lang === 'ko' ? '"지자체 추천 식당만으로 구성된 신뢰 가능한 패키지. 이동 거리를 최소화하여 외국인과 의료관광 방문객 모두에게 부담 없는 일정입니다."' : lang === 'en' ? '"Reliable package with only government-recommended restaurants. Minimized travel distance suitable for foreigners and medical tourists."' : lang === 'ja' ? '"自治体推薦飲食店のみで構成された信頼できるパッケージ。移動距離を最小化し外国人と医療観光訪問客すべてに負担のない日程です。"' : lang === 'zh' ? '"仅由政府推荐餐厅组成的可靠套餐。最小化旅行距离，适合外国人和医疗游客。"' : '"แพ็คเกจที่เชื่อถือได้ซึ่งประกอบด้วยเฉพาะร้านอาหารที่รัฐบาลแนะนำ ลดระยะทางการเดินทางให้น้อยที่สุด เหมาะสำหรับชาวต่างชาติและนักท่องเที่ยวเชิงการแพทย์"'},
                  tags: [${lang === 'ko' ? '"지자체 공식"' : lang === 'en' ? '"Official"' : lang === 'ja' ? '"自治体公式"' : lang === 'zh' ? '"官方"' : '"ทางการ"'}, ${lang === 'ko' ? '"의료관광 연계"' : lang === 'en' ? '"Medical Tourism"' : lang === 'ja' ? '"医療観光連携"' : lang === 'zh' ? '"医疗旅游"' : '"ท่องเที่ยวเชิงการแพทย์"'}]
                },
                {
                  title: ${lang === 'ko' ? '"부산 전통시장 골목 미식 2박3일"' : lang === 'en' ? '"Busan Traditional Market Alley 2N3D"' : lang === 'ja' ? '"釜山伝統市場路地裏美食2泊3日"' : lang === 'zh' ? '"釜山传统市场胡同美食2晚3天"' : '"ตลาดดั้งเดิมและซอยปูซาน 2 คืน 3 วัน"'},
                  time: ${lang === 'ko' ? '"2박 3일"' : lang === 'en' ? '"2 nights 3 days"' : lang === 'ja' ? '"2泊3日"' : lang === 'zh' ? '"2晚3天"' : '"2 คืน 3 วัน"'},
                  price: ${lang === 'ko' ? '"₩850,000 ~"' : lang === 'en' ? '"$650 ~"' : lang === 'ja' ? '"¥105,000 ~"' : lang === 'zh' ? '"¥4,200 ~"' : '"฿23,000 ~"'},
                  included: [${lang === 'ko' ? '"게스트하우스"' : lang === 'en' ? '"Guesthouse"' : lang === 'ja' ? '"ゲストハウス"' : lang === 'zh' ? '"民宿"' : '"เกสต์เฮาส์"'}, ${lang === 'ko' ? '"대중교통"' : lang === 'en' ? '"Public transport"' : lang === 'ja' ? '"公共交通"' : lang === 'zh' ? '"公共交通"' : '"ขนส่งสาธารณะ"'}, ${lang === 'ko' ? '"가이드"' : lang === 'en' ? '"Guide"' : lang === 'ja' ? '"ガイド"' : lang === 'zh' ? '"导游"' : '"ไกด์"'}, ${lang === 'ko' ? '"9회 식사"' : lang === 'en' ? '"9 meals"' : lang === 'ja' ? '"9食"' : lang === 'zh' ? '"9餐"' : '"9 มื้อ"'}],
                  desc: ${lang === 'ko' ? '"자갈치시장 중심의 산지 직송 해산물과 전통시장 골목 맛집 투어. 합리적인 가격으로 부산의 진짜 로컬 미식을 경험할 수 있습니다."' : lang === 'en' ? '"Jagalchi Market seafood and traditional market alley tour. Experience authentic Busan local cuisine at reasonable prices."' : lang === 'ja' ? '"チャガルチ市場中心の産地直送海産物と伝統市場路地裏飲食店ツアー。合理的な価格で釜山の本当のローカル美食を体験できます。"' : lang === 'zh' ? '"以扎嘎其市场为中心的产地直送海鲜和传统市场胡同餐厅游。以合理的价格体验真正的釜山本地美食。"' : '"ทัวร์อาหารทะเลตรงจากแหล่งกำเนิดที่ตลาดจากัลชีและร้านอาหารในซอยตลาดดั้งเดิม สัมผัสประสบการณ์อาหารท้องถิ่นปูซานที่แท้จริงในราคาสมเหตุสมผล"'},
                  tags: [${lang === 'ko' ? '"전통시장"' : lang === 'en' ? '"Traditional Market"' : lang === 'ja' ? '"伝統市場"' : lang === 'zh' ? '"传统市场"' : '"ตลาดดั้งเดิม"'}, ${lang === 'ko' ? '"저가형"' : lang === 'en' ? '"Budget"' : lang === 'ja' ? '"エコノミー"' : lang === 'zh' ? '"经济型"' : '"ประหยัด"'}]
                },
                {
                  title: ${lang === 'ko' ? '"전주·경주 힐링 건강 미식 4박5일"' : lang === 'en' ? '"Jeonju·Gyeongju Healing Wellness 4N5D"' : lang === 'ja' ? '"全州·慶州ヒーリング健康美食4泊5日"' : lang === 'zh' ? '"全州·庆州疗愈健康美食4晚5天"' : '"จอนจู·คยองจู ฮีลลิ่งเวลเนส 4 คืน 5 วัน"'},
                  time: ${lang === 'ko' ? '"4박 5일"' : lang === 'en' ? '"4 nights 5 days"' : lang === 'ja' ? '"4泊5日"' : lang === 'zh' ? '"4晚5天"' : '"4 คืน 5 วัน"'},
                  price: ${lang === 'ko' ? '"₩1,800,000 ~"' : lang === 'en' ? '"$1,400 ~"' : lang === 'ja' ? '"¥230,000 ~"' : lang === 'zh' ? '"¥8,800 ~"' : '"฿50,000 ~"'},
                  included: [${lang === 'ko' ? '"한옥 숙소"' : lang === 'en' ? '"Hanok stay"' : lang === 'ja' ? '"韓屋宿泊"' : lang === 'zh' ? '"韩屋住宿"' : '"พักฮันอก"'}, ${lang === 'ko' ? '"전용차량"' : lang === 'en' ? '"Private vehicle"' : lang === 'ja' ? '"専用車両"' : lang === 'zh' ? '"专车"' : '"รถส่วนตัว"'}, ${lang === 'ko' ? '"전담가이드"' : lang === 'en' ? '"Dedicated guide"' : lang === 'ja' ? '"専属ガイド"' : lang === 'zh' ? '"专属导游"' : '"ไกด์เฉพาะ"'}, ${lang === 'ko' ? '"15회 건강식"' : lang === 'en' ? '"15 healthy meals"' : lang === 'ja' ? '"15食健康食"' : lang === 'zh' ? '"15餐健康餐"' : '"15 มื้ออาหารเพื่อสุขภาพ"'}, ${lang === 'ko' ? '"한방차"' : lang === 'en' ? '"Herbal tea"' : lang === 'ja' ? '"韓方茶"' : lang === 'zh' ? '"韩方茶"' : '"ชาสมุนไพร"'}],
                  desc: ${lang === 'ko' ? '"의료관광 검진 후 회복에 적합한 힐링 중심 패키지. 자극적이지 않은 전통 한식과 한방 웰니스가 결합된 프리미엄 코스입니다."' : lang === 'en' ? '"Healing-focused package suitable for post-medical checkup recovery. Premium course combining non-spicy traditional Korean cuisine and oriental wellness."' : lang === 'ja' ? '"医療観光検診後の回復に適したヒーリング中心パッケージ。刺激的でない伝統韓食と韓方ウェルネスが結合したプレミアムコースです。"' : lang === 'zh' ? '"适合医疗旅游体检后康复的疗愈套餐。结合非辛辣传统韩餐和韩方养生的高端课程。"' : '"แพ็คเกจที่เน้นการบำบัดที่เหมาะสำหรับการฟื้นตัวหลังการตรวจสุขภาพทางการแพทย์ คอร์สพรีเมียมที่ผสมผสานอาหารเกาหลีดั้งเดิมที่ไม่เผ็ดและการดูแลสุขภาพแบบตะวันออก"'},
                  tags: [${lang === 'ko' ? '"의료관광 특화"' : lang === 'en' ? '"Medical Tourism"' : lang === 'ja' ? '"医療観光特化"' : lang === 'zh' ? '"医疗旅游专属"' : '"ท่องเที่ยวเชิงการแพทย์พิเศษ"'}, ${lang === 'ko' ? '"프리미엄"' : lang === 'en' ? '"Premium"' : lang === 'ja' ? '"プレミアム"' : lang === 'zh' ? '"高端"' : '"พรีเมียม"'}]
                }
              ]
            }
          };
          
          // 버튼 클릭 핸들러
          function showAIRecommendation(type) {
            const data = aiData[type];
            if (!data) return;
            
            // 섹션 표시
            aiSection.style.display = 'block';
            aiLoading.style.display = 'block';
            aiResults.innerHTML = '';
            
            // 제목 업데이트
            aiTitle.textContent = data.title;
            aiSubtitle.textContent = data.subtitle;
            
            // 스크롤
            aiSection.scrollIntoView({ behavior: 'smooth' });
            
            // AI 로딩 시뮬레이션 (1.5초)
            setTimeout(() => {
              aiLoading.style.display = 'none';
              
              // 결과 렌더링
              data.items.forEach((item, index) => {
                const card = document.createElement('div');
                card.style.cssText = 'background: white; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); opacity: 0; transform: translateY(20px); transition: all 0.3s;';
                
                card.innerHTML = \`
                  <h3 style="font-size: 20px; font-weight: 600; margin-bottom: 12px; color: #1F1F1F;">\${item.title}</h3>
                  \${item.time ? \`<p style="color: #666; font-size: 14px; margin-bottom: 8px;">⏱️ \${item.time} | 📍 \${item.distance || item.region}</p>\` : ''}
                  \${item.menu ? \`<p style="color: #E85C4A; font-size: 14px; margin-bottom: 12px; font-weight: 500;">🍽️ \${item.menu}</p>\` : ''}
                  \${item.price ? \`<p style="color: #2C5F2D; font-size: 18px; font-weight: 600; margin-bottom: 12px;">\${item.price}</p>\` : ''}
                  \${item.included ? \`<div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px;">\${item.included.map(i => \`<span style="padding: 4px 12px; background: #F0F0F0; border-radius: 12px; font-size: 12px;">✓ \${i}</span>\`).join('')}</div>\` : ''}
                  <p style="color: #555; font-size: 14px; line-height: 1.6; margin-bottom: 16px;">\${item.desc}</p>
                  <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                    \${item.tags.map(tag => \`<span style="padding: 6px 12px; background: #FFF3F0; color: #E85C4A; border-radius: 16px; font-size: 12px; font-weight: 500;">\${tag}</span>\`).join('')}
                  </div>
                  <div style="display: flex; gap: 12px; margin-top: 16px;">
                    <button style="flex: 1; padding: 12px; background: #E85C4A; color: white; border: none; border-radius: 8px; font-weight: 500; cursor: pointer;">${lang === 'ko' ? '상세보기' : lang === 'en' ? 'View Details' : lang === 'ja' ? '詳細を見る' : lang === 'zh' ? '查看详情' : 'ดูรายละเอียด'}</button>
                    <button style="flex: 1; padding: 12px; background: white; color: #E85C4A; border: 2px solid #E85C4A; border-radius: 8px; font-weight: 500; cursor: pointer;">${lang === 'ko' ? '투어에 담기' : lang === 'en' ? 'Add to Tour' : lang === 'ja' ? 'ツアーに追加' : lang === 'zh' ? '添加到行程' : 'เพิ่มในทัวร์'}</button>
                  </div>
                \`;
                
                aiResults.appendChild(card);
                
                // 애니메이션
                setTimeout(() => {
                  card.style.opacity = '1';
                  card.style.transform = 'translateY(0)';
                }, 100 * index);
              });
            }, 1500);
          }
          
          // 버튼 이벤트 연결
          if (startTourBtn) {
            startTourBtn.addEventListener('click', () => showAIRecommendation('startTour'));
          }
          if (localPicksBtn) {
            localPicksBtn.addEventListener('click', () => showAIRecommendation('localPicks'));
          }
          if (tourPackagesBtn) {
            tourPackagesBtn.addEventListener('click', () => showAIRecommendation('tourPackages'));
          }
          
          // Language dropdown
          const langToggle = document.querySelector('.lang-selector-toggle');
          const langDropdown = document.querySelector('.lang-dropdown');
          const langBtns = document.querySelectorAll('.lang-btn');
          
          if (langToggle && langDropdown) {
            langToggle.addEventListener('click', (e) => {
              e.stopPropagation();
              langToggle.classList.toggle('active');
              langDropdown.classList.toggle('active');
            });
            
            langBtns.forEach(btn => {
              btn.addEventListener('click', () => {
                const lang = btn.dataset.lang;
                const langNames = { ko: '한국어', en: 'English', ja: '日本語', zh: '中文', th: 'ไทย' };
                
                // Update active state
                langBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Update toggle button text
                langToggle.querySelector('span').textContent = langNames[lang];
                
                // Close dropdown
                langToggle.classList.remove('active');
                langDropdown.classList.remove('active');
                
                // Reload with language parameter
                window.location.href = '/?lang=' + lang;
              });
            });
            
            document.addEventListener('click', (e) => {
              if (!e.target.closest('.lang-selector')) {
                langToggle.classList.remove('active');
                langDropdown.classList.remove('active');
              }
            });
          }
          
          // Mobile menu toggle
          const mobileToggle = document.querySelector('.mobile-menu-toggle');
          const navMenu = document.querySelector('.navbar-menu');
          if (mobileToggle && navMenu) {
            mobileToggle.addEventListener('click', () => {
              navMenu.classList.toggle('active');
            });
          }
        });
        </script>
    </body>
    </html>
  `)
})

export default app
