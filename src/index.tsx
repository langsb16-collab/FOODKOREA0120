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
app.get('/', (c) => {
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
                    <li><a href="/" class="navbar-link" data-page="regions" data-i18n="nav.regions">지역별 맛집</a></li>
                    <li><a href="/" class="navbar-link" data-page="packages" data-i18n="nav.packages">미식 투어</a></li>
                    
                    <div class="lang-selector">
                        <button class="lang-btn active" data-lang="ko">한국어</button>
                        <button class="lang-btn" data-lang="en">EN</button>
                        <button class="lang-btn" data-lang="ja">日本</button>
                        <button class="lang-btn" data-lang="zh">中文</button>
                        <button class="lang-btn" data-lang="th">ไทย</button>
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
            <div class="loading">
                <div class="spinner"></div>
                <p>Loading amazing local restaurants...</p>
            </div>
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
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/app.js"></script>
    </body>
    </html>
  `)
})

export default app
