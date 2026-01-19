import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
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
                    <li><a href="/" class="navbar-link" data-i18n="nav.home">홈</a></li>
                    <li><a href="/medical" class="navbar-link">K-Medical</a></li>
                    <li><a href="/" class="navbar-link" data-page="regions" data-i18n="nav.regions">지역별 맛집</a></li>
                    <li><a href="/" class="navbar-link" data-page="packages" data-i18n="nav.packages">미식 투어</a></li>
                    
                    <div class="lang-selector">
                        <button class="lang-selector-toggle">
                            <span>한국어</span>
                        </button>
                        <div class="lang-dropdown">
                            <button class="lang-btn active" data-lang="ko">한국어 (Korean)</button>
                            <button class="lang-btn" data-lang="en">English</button>
                            <button class="lang-btn" data-lang="ja">日本語 (Japanese)</button>
                            <button class="lang-btn" data-lang="zh">中文 (Chinese)</button>
                            <button class="lang-btn" data-lang="th">ไทย (Thai)</button>
                        </div>
                    </div>
                </ul>
            </div>
        </nav>

        <!-- Hero Section -->
        <section class="hero">
            <div class="hero-content">
                <h1 class="hero-title" data-i18n="hero.title">LOCAL TABLE KOREA</h1>
                <p class="hero-subtitle" data-i18n="hero.subtitle">숨은 진짜 맛을 찾아 떠나는 한국 미식 여행</p>
                <p class="hero-description" data-i18n="hero.description">
                    SNS 맛집이 아닌, 지자체 인증과 현지인이 추천하는 진짜 로컬 맛집을 만나보세요.
                    100년 전통 노포부터 숨은 향토음식까지, 한국의 진정한 미식 문화를 경험하세요.
                </p>
                <a href="#packages" class="cta-button" data-i18n="hero.cta">미식 투어 시작하기</a>
            </div>
        </section>

        <!-- Main Content -->
        <main id="main-content">
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

        <!-- Scripts -->
        <script>
        // Simple language switcher - no dynamic content loading
        document.addEventListener('DOMContentLoaded', () => {
          const langButtons = document.querySelectorAll('.lang-btn');
          langButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
              const lang = e.target.dataset.lang;
              // Redirect to language-specific page (future implementation)
              console.log('Language switch:', lang);
            });
          });
          
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
