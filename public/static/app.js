// K-Taste Route Frontend Application
// Multi-language support and dynamic content loading

class KTasteRoute {
  constructor() {
    this.currentLang = 'ko';
    this.translations = {};
    this.init();
  }

  async init() {
    await this.loadTranslations();
    this.setupEventListeners();
    this.updateLanguage(this.currentLang);
    this.loadHomePage();
  }

  async loadTranslations() {
    try {
      const response = await axios.get('/api/translations');
      this.translations = response.data;
    } catch (error) {
      console.error('Failed to load translations:', error);
      // Fallback translations
      this.translations = {
        ko: { 'nav.home': '홈', 'nav.regions': '지역별 맛집', 'nav.packages': '미식 투어' },
        en: { 'nav.home': 'Home', 'nav.regions': 'Restaurants', 'nav.packages': 'Tours' }
      };
    }
  }

  t(key) {
    return this.translations[this.currentLang]?.[key] || key;
  }

  setupEventListeners() {
    // Language selector dropdown
    const langToggle = document.querySelector('.lang-selector-toggle');
    const langDropdown = document.querySelector('.lang-dropdown');
    
    if (langToggle && langDropdown) {
      langToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        langToggle.classList.toggle('active');
        langDropdown.classList.toggle('active');
      });

      // Close dropdown when clicking outside
      document.addEventListener('click', (e) => {
        if (!e.target.closest('.lang-selector')) {
          langToggle.classList.remove('active');
          langDropdown.classList.remove('active');
        }
      });

      // Language selection
      document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const lang = e.currentTarget.dataset.lang;
          const langName = e.currentTarget.textContent.split(' ')[0]; // Get language name before checkmark
          
          // Update toggle text
          langToggle.childNodes[0].textContent = langName;
          
          // Close dropdown
          langToggle.classList.remove('active');
          langDropdown.classList.remove('active');
          
          // Update language
          this.updateLanguage(lang);
        });
      });
    }

    // Navigation links - delegate to handle dynamic content
    document.addEventListener('click', (e) => {
      const link = e.target.closest('.navbar-link');
      if (link) {
        e.preventDefault();
        const page = link.dataset.page || 'home';
        console.log('Navigation clicked:', page);
        this.loadPage(page);
        
        // Close mobile menu if open
        const navMenu = document.querySelector('.navbar-menu');
        if (navMenu && navMenu.classList.contains('active')) {
          navMenu.classList.remove('active');
        }
      }
    });

    // CTA button - delegate to handle dynamic content
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.cta-button');
      if (btn) {
        e.preventDefault();
        console.log('CTA button clicked');
        this.loadPage('packages');
        // Scroll to content
        setTimeout(() => {
          document.querySelector('#main-content')?.scrollIntoView({ behavior: 'smooth' });
        }, 300);
      }
    });

    // Mobile menu toggle
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.navbar-menu');
    if (mobileToggle && navMenu) {
      mobileToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
      });
    }

    // Smooth scroll for navbar
    window.addEventListener('scroll', () => {
      const navbar = document.querySelector('.navbar');
      if (navbar) {
        if (window.scrollY > 50) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }
      }
    });
  }

  updateLanguage(lang) {
    this.currentLang = lang;
    
    // Update language buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    // Update all translatable elements
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      el.textContent = this.t(key);
    });

    // Reload current page content
    const currentPage = window.location.hash.slice(1) || 'home';
    this.loadPage(currentPage);
  }

  async loadPage(page) {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;

    switch(page) {
      case 'regions':
        await this.loadRegionsPage();
        break;
      case 'packages':
        await this.loadPackagesPage();
        break;
      case 'admin':
        await this.loadAdminPage();
        break;
      default:
        await this.loadHomePage();
    }
  }

  async loadHomePage() {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;

    // Load featured restaurants
    try {
      const response = await axios.get('/api/restaurants/featured');
      const restaurants = response.data;

      const html = `
        <section class="section">
          <div class="container">
            <div class="section-header">
              <h2 class="section-title">${this.t('hero.title')}</h2>
              <p class="section-subtitle">${this.t('hero.description')}</p>
            </div>
            <div class="grid grid-3">
              ${restaurants.map(r => this.createRestaurantCard(r)).join('')}
            </div>
          </div>
        </section>

        <section class="section section-dark">
          <div class="container">
            <div class="section-header">
              <h2 class="section-title">${this.t('package.title')}</h2>
            </div>
            <div class="grid grid-2">
              ${await this.loadFeaturedPackages()}
            </div>
          </div>
        </section>
      `;

      mainContent.innerHTML = html;
    } catch (error) {
      console.error('Failed to load home page:', error);
      mainContent.innerHTML = '<div class="loading"><div class="spinner"></div><p>Loading...</p></div>';
    }
  }

  async loadRegionsPage() {
    const mainContent = document.getElementById('main-content');
    
    try {
      const response = await axios.get(`/api/restaurants?lang=${this.currentLang}`);
      const restaurants = response.data;

      // Group by region
      const byRegion = restaurants.reduce((acc, r) => {
        if (!acc[r.region]) acc[r.region] = [];
        acc[r.region].push(r);
        return acc;
      }, {});

      const html = `
        <section class="section" style="padding-top: 8rem;">
          <div class="container">
            <div class="section-header">
              <h2 class="section-title">${this.t('nav.regions')}</h2>
            </div>
            ${Object.entries(byRegion).map(([region, items]) => `
              <div style="margin-bottom: 4rem;">
                <h3 style="margin-bottom: 2rem; color: var(--accent);">${this.t('region.' + region)}</h3>
                <div class="grid grid-3">
                  ${items.map(r => this.createRestaurantCard(r)).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        </section>
      `;

      mainContent.innerHTML = html;
    } catch (error) {
      console.error('Failed to load regions:', error);
    }
  }

  async loadPackagesPage() {
    const mainContent = document.getElementById('main-content');
    
    try {
      const response = await axios.get(`/api/packages?lang=${this.currentLang}`);
      const packages = response.data;

      const html = `
        <section class="section" style="padding-top: 8rem;">
          <div class="container">
            <div class="section-header">
              <h2 class="section-title">${this.t('package.title')}</h2>
              <p class="section-subtitle">3박 4일 ~ 4박 5일 미식 투어</p>
            </div>
            <div class="grid grid-2">
              ${packages.map(p => this.createPackageCard(p)).join('')}
            </div>
          </div>
        </section>
      `;

      mainContent.innerHTML = html;
    } catch (error) {
      console.error('Failed to load packages:', error);
    }
  }

  async loadAdminPage() {
    const mainContent = document.getElementById('main-content');
    
    const html = `
      <div class="admin-container">
        <div class="admin-header">
          <h1>관리자 대시보드</h1>
        </div>

        <div class="admin-tabs">
          <button class="admin-tab active" data-tab="restaurants">맛집 관리</button>
          <button class="admin-tab" data-tab="reviews">후기 관리</button>
          <button class="admin-tab" data-tab="packages">패키지 관리</button>
          <button class="admin-tab" data-tab="bookings">예약 관리</button>
        </div>

        <div id="admin-content">
          ${await this.loadAdminRestaurants()}
        </div>
      </div>
    `;

    mainContent.innerHTML = html;

    // Setup admin tabs
    document.querySelectorAll('.admin-tab').forEach(tab => {
      tab.addEventListener('click', async (e) => {
        document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
        e.target.classList.add('active');
        
        const tabName = e.target.dataset.tab;
        const adminContent = document.getElementById('admin-content');
        
        switch(tabName) {
          case 'restaurants':
            adminContent.innerHTML = await this.loadAdminRestaurants();
            break;
          case 'reviews':
            adminContent.innerHTML = await this.loadAdminReviews();
            break;
          case 'packages':
            adminContent.innerHTML = await this.loadAdminPackages();
            break;
          case 'bookings':
            adminContent.innerHTML = await this.loadAdminBookings();
            break;
        }
      });
    });
  }

  async loadAdminRestaurants() {
    try {
      const response = await axios.get('/api/admin/restaurants');
      const restaurants = response.data;

      return `
        <div class="admin-table">
          <table>
            <thead>
              <tr>
                <th>맛집명</th>
                <th>지역</th>
                <th>섹터</th>
                <th>도시</th>
                <th>평균가격</th>
                <th>인증</th>
                <th>상태</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              ${restaurants.map(r => `
                <tr>
                  <td><strong>${r.name_ko}</strong></td>
                  <td>${r.region}</td>
                  <td>${r.sector}</td>
                  <td>${r.city}</td>
                  <td>₩${r.avg_price?.toLocaleString() || 'N/A'}</td>
                  <td>${r.gov_certified ? '✓' : '-'}</td>
                  <td><span class="badge ${r.status === '운영' ? '' : 'badge-secondary'}">${r.status}</span></td>
                  <td>
                    <button class="btn btn-secondary" style="padding: 0.5rem 1rem; font-size: 0.875rem;">수정</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    } catch (error) {
      return '<p>데이터를 불러올 수 없습니다.</p>';
    }
  }

  async loadAdminReviews() {
    try {
      const response = await axios.get('/api/admin/reviews');
      const reviews = response.data;

      return `
        <div class="admin-table">
          <table>
            <thead>
              <tr>
                <th>후기 내용</th>
                <th>맛집</th>
                <th>국가</th>
                <th>평점</th>
                <th>방문일</th>
                <th>승인</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              ${reviews.map(r => `
                <tr>
                  <td style="max-width: 300px;">${r.content_original?.substring(0, 50)}...</td>
                  <td>${r.restaurant_name}</td>
                  <td>${r.user_country}</td>
                  <td>${'⭐'.repeat(r.rating)}</td>
                  <td>${r.visit_date || '-'}</td>
                  <td>${r.approved ? '✓ 승인됨' : '❌ 대기중'}</td>
                  <td>
                    <button class="btn btn-primary" style="padding: 0.5rem 1rem; font-size: 0.875rem;">승인</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    } catch (error) {
      return '<p>데이터를 불러올 수 없습니다.</p>';
    }
  }

  async loadAdminPackages() {
    try {
      const response = await axios.get('/api/admin/packages');
      const packages = response.data;

      return `
        <div class="admin-table">
          <table>
            <thead>
              <tr>
                <th>패키지명</th>
                <th>기간</th>
                <th>지역</th>
                <th>저가형</th>
                <th>스탠다드</th>
                <th>고급형</th>
                <th>상태</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              ${packages.map(p => `
                <tr>
                  <td><strong>${p.title_ko}</strong></td>
                  <td>${p.duration}</td>
                  <td>${JSON.parse(p.regions || '[]').join(', ')}</td>
                  <td>$${p.price_budget}</td>
                  <td>$${p.price_standard}</td>
                  <td>$${p.price_premium}</td>
                  <td><span class="badge">${p.status}</span></td>
                  <td>
                    <button class="btn btn-secondary" style="padding: 0.5rem 1rem; font-size: 0.875rem;">수정</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    } catch (error) {
      return '<p>데이터를 불러올 수 없습니다.</p>';
    }
  }

  async loadAdminBookings() {
    return `
      <div class="admin-table">
        <p style="padding: 2rem; text-align: center; color: var(--text-secondary);">
          예약 관리 기능은 곧 제공될 예정입니다.
        </p>
      </div>
    `;
  }

  createRestaurantCard(restaurant) {
    const name = restaurant[`name_${this.currentLang}`] || restaurant.name_ko;
    const description = restaurant[`description_${this.currentLang}`] || restaurant.description_ko || '';

    return `
      <div class="card">
        <div class="card-image" loading="lazy"></div>
        <div class="card-content">
          <h3 class="card-title">${name}</h3>
          <p class="card-subtitle">${restaurant.cuisine_type || ''} · ${restaurant.city}</p>
          <p class="card-description">${description.substring(0, 100)}...</p>
          <div class="card-meta">
            <span class="meta-item">📍 ${restaurant.region}</span>
            <span class="meta-item">💰 ₩${restaurant.avg_price?.toLocaleString()}</span>
            ${restaurant.gov_certified ? '<span class="badge">인증</span>' : ''}
          </div>
        </div>
      </div>
    `;
  }

  createPackageCard(pkg) {
    const title = pkg[`title_${this.currentLang}`] || pkg.title_ko;
    const description = pkg[`description_${this.currentLang}`] || pkg.description_ko || '';

    return `
      <div class="card">
        <div class="card-image"></div>
        <div class="card-content">
          <h3 class="card-title">${title}</h3>
          <p class="card-subtitle">📅 ${pkg.duration}</p>
          <p class="card-description">${description.substring(0, 150)}...</p>
          <div class="card-meta">
            <div style="width: 100%; margin-top: 1rem; display: flex; justify-content: space-between; gap: 1rem;">
              <div style="flex: 1;">
                <div style="font-size: 0.875rem; color: var(--text-secondary);">저가형</div>
                <div style="font-weight: 700; color: var(--accent);">$${pkg.price_budget}</div>
              </div>
              <div style="flex: 1;">
                <div style="font-size: 0.875rem; color: var(--text-secondary);">스탠다드</div>
                <div style="font-weight: 700; color: var(--accent);">$${pkg.price_standard}</div>
              </div>
              <div style="flex: 1;">
                <div style="font-size: 0.875rem; color: var(--text-secondary);">고급형</div>
                <div style="font-weight: 700; color: var(--accent);">$${pkg.price_premium}</div>
              </div>
            </div>
          </div>
          <a href="/reserve?id=${pkg.id}" class="btn btn-primary" style="width: 100%; margin-top: 1rem; display: block; text-align: center; text-decoration: none;">${this.t('package.book')}</a>
        </div>
      </div>
    `;
  }

  async loadFeaturedPackages() {
    try {
      const response = await axios.get(`/api/packages?lang=${this.currentLang}&limit=2`);
      const packages = response.data;
      return packages.map(p => this.createPackageCard(p)).join('');
    } catch (error) {
      return '';
    }
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new KTasteRoute();
});
