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

// Create booking
app.post('/api/bookings', async (c) => {
  const { DB } = c.env

  try {
    const body = await c.req.json()
    
    const { results } = await DB.prepare(`
      INSERT INTO bookings (
        package_id, customer_name, customer_email, customer_phone, 
        customer_country, travel_date, num_people, package_type, 
        total_price, special_requests
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      body.package_id,
      body.customer_name,
      body.customer_email,
      body.customer_phone || null,
      body.customer_country || null,
      body.travel_date,
      body.num_people,
      body.package_type,
      body.total_price,
      body.special_requests || null
    ).run()

    return c.json({ success: true, id: results[0]?.id })
  } catch (error) {
    console.error('Booking error:', error)
    return c.json({ error: 'Failed to create booking' }, 500)
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
                    <li><a href="#home" class="navbar-link" data-i18n="nav.home">홈</a></li>
                    <li><a href="#regions" class="navbar-link" data-i18n="nav.regions">지역별 맛집</a></li>
                    <li><a href="#packages" class="navbar-link" data-i18n="nav.packages">미식 투어</a></li>
                    <li><a href="#admin" class="navbar-link" data-i18n="nav.admin">관리자</a></li>
                    
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
