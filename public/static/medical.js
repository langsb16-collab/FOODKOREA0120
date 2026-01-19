// K-Medical Tourism Frontend JavaScript

class KMedicalApp {
  constructor() {
    this.currentLang = 'ko'
    this.init()
  }

  async init() {
    console.log('K-Medical Tourism App initialized')
    
    // Load initial data
    await this.loadHealthPackages()
    await this.loadWellnessPrograms()
    await this.loadHospitals()
    
    // Setup event listeners
    this.setupEventListeners()
  }

  setupEventListeners() {
    // Language selector
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.changeLan guage(e.target.dataset.lang)
      })
    })

    // Mobile menu toggle
    const mobileToggle = document.querySelector('.mobile-menu-toggle')
    const navbarMenu = document.querySelector('.navbar-menu')
    
    if (mobileToggle && navbarMenu) {
      mobileToggle.addEventListener('click', () => {
        navbarMenu.classList.toggle('active')
      })
    }

    // Smooth scroll for CTA buttons
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault()
        const target = document.querySelector(this.getAttribute('href'))
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          })
        }
      })
    })
  }

  changeLanguage(lang) {
    this.currentLang = lang
    
    // Update active language button
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.remove('active')
      if (btn.dataset.lang === lang) {
        btn.classList.add('active')
      }
    })

    // Reload content with new language
    this.loadHealthPackages()
    this.loadWellnessPrograms()
    this.loadHospitals()
  }

  async loadHealthPackages() {
    const container = document.getElementById('health-packages-list')
    if (!container) return

    try {
      container.innerHTML = '<div class="loading"><div class="spinner"></div><p>Loading...</p></div>'
      
      const response = await axios.get('/api/health-packages')
      const packages = response.data

      if (packages.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">건강검진 패키지가 없습니다.</p>'
        return
      }

      container.innerHTML = packages.map(pkg => this.createHealthPackageCard(pkg)).join('')
    } catch (error) {
      console.error('Failed to load health packages:', error)
      container.innerHTML = '<p style="text-align: center; color: red;">데이터를 불러오는데 실패했습니다.</p>'
    }
  }

  createHealthPackageCard(pkg) {
    const lang = this.currentLang
    const name = pkg[`name_${lang}`] || pkg.name_ko
    const description = pkg[`description_${lang}`] || pkg.description_ko

    return `
      <div class="card">
        <div class="card-content">
          <span class="badge">${pkg.package_type}</span>
          <h3 style="margin: 1rem 0 0.5rem;">${name}</h3>
          <p style="color: var(--text-secondary); font-size: 0.875rem; margin-bottom: 1rem;">${pkg.hospital_name}</p>
          
          <div style="margin-bottom: 1rem;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
              <span style="color: var(--text-secondary); font-size: 0.875rem;">소요시간:</span>
              <strong>${pkg.duration_hours}시간</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
              <span style="color: var(--text-secondary); font-size: 0.875rem;">가격 (KRW):</span>
              <strong style="color: var(--accent);">₩${pkg.price_krw.toLocaleString()}</strong>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: var(--text-secondary); font-size: 0.875rem;">가격 (USD):</span>
              <strong style="color: var(--accent);">$${pkg.price_usd}</strong>
            </div>
          </div>

          <p style="color: var(--text-secondary); font-size: 0.875rem; line-height: 1.6; margin-bottom: 1.5rem;">
            ${description ? description.substring(0, 100) + (description.length > 100 ? '...' : '') : ''}
          </p>

          <a href="/medical/reserve?package_id=${pkg.id}" class="btn btn-primary" style="width: 100%; text-align: center;">
            예약하기
          </a>
        </div>
      </div>
    `
  }

  async loadWellnessPrograms() {
    const container = document.getElementById('wellness-programs-list')
    if (!container) return

    try {
      container.innerHTML = '<div class="loading"><div class="spinner"></div><p>Loading...</p></div>'
      
      const response = await axios.get('/api/wellness-programs')
      const programs = response.data

      if (programs.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">한방 프로그램이 없습니다.</p>'
        return
      }

      container.innerHTML = programs.map(program => this.createWellnessProgramCard(program)).join('')
    } catch (error) {
      console.error('Failed to load wellness programs:', error)
      container.innerHTML = '<p style="text-align: center; color: red;">데이터를 불러오는데 실패했습니다.</p>'
    }
  }

  createWellnessProgramCard(program) {
    const lang = this.currentLang
    const name = program[`name_${lang}`] || program.name_ko
    const description = program[`description_${lang}`] || program.description_ko

    return `
      <div class="card">
        <div class="card-content">
          <span class="badge" style="background: #2E7D32;">${program.program_type}</span>
          <h3 style="margin: 1rem 0 0.5rem;">${name}</h3>
          <p style="color: var(--text-secondary); font-size: 0.875rem; margin-bottom: 1rem;">${program.hospital_name}</p>
          
          <div style="margin-bottom: 1rem;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
              <span style="color: var(--text-secondary); font-size: 0.875rem;">소요시간:</span>
              <strong>${program.duration_minutes}분 x ${program.sessions}회</strong>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: var(--text-secondary); font-size: 0.875rem;">가격 (KRW):</span>
              <strong style="color: var(--accent);">₩${program.price_krw.toLocaleString()}</strong>
            </div>
          </div>

          <p style="color: var(--text-secondary); font-size: 0.875rem; line-height: 1.6; margin-bottom: 1.5rem;">
            ${description ? description.substring(0, 100) + (description.length > 100 ? '...' : '') : ''}
          </p>

          <a href="/medical/reserve?program_id=${program.id}" class="btn btn-primary" style="width: 100%; text-align: center;">
            예약하기
          </a>
        </div>
      </div>
    `
  }

  async loadHospitals() {
    const container = document.getElementById('hospitals-list')
    if (!container) return

    try {
      container.innerHTML = '<div class="loading"><div class="spinner"></div><p>Loading...</p></div>'
      
      const response = await axios.get('/api/hospitals')
      const hospitals = response.data

      if (hospitals.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">연계 병원이 없습니다.</p>'
        return
      }

      container.innerHTML = hospitals.map(hospital => this.createHospitalCard(hospital)).join('')
    } catch (error) {
      console.error('Failed to load hospitals:', error)
      container.innerHTML = '<p style="text-align: center; color: red;">데이터를 불러오는데 실패했습니다.</p>'
    }
  }

  createHospitalCard(hospital) {
    const lang = this.currentLang
    const name = hospital[`name_${lang}`] || hospital.name_ko
    const description = hospital[`description_${lang}`] || hospital.description_ko

    return `
      <div class="card">
        <div class="card-content">
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
            <h3 style="margin: 0;">${name}</h3>
            ${hospital.certified ? '<span class="badge" style="background: var(--success);">인증</span>' : ''}
          </div>
          <p style="color: var(--text-secondary); font-size: 0.875rem; margin-bottom: 0.5rem;">
            <strong>${hospital.type}</strong>
          </p>
          <p style="color: var(--text-secondary); font-size: 0.875rem; margin-bottom: 1rem;">
            📍 ${hospital.address}<br>
            📞 ${hospital.phone || 'N/A'}
          </p>
          <p style="color: var(--text-secondary); font-size: 0.875rem; line-height: 1.6;">
            ${description ? description.substring(0, 150) + (description.length > 150 ? '...' : '') : ''}
          </p>
        </div>
      </div>
    `
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new KMedicalApp()
})
