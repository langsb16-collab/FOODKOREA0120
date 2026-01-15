// K-Taste Route Admin Dashboard
// Restaurant, Review, Package, and Booking Management

class AdminDashboard {
  constructor() {
    this.currentTab = 'restaurants';
    this.init();
  }

  async init() {
    this.setupEventListeners();
    await this.loadTab('restaurants');
  }

  setupEventListeners() {
    // Tab switching
    document.querySelectorAll('.admin-tab').forEach(tab => {
      tab.addEventListener('click', async (e) => {
        const tabName = e.target.dataset.tab;
        
        // Update active tab
        document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
        e.target.classList.add('active');
        
        // Load tab content
        await this.loadTab(tabName);
      });
    });
  }

  async loadTab(tabName) {
    this.currentTab = tabName;
    const content = document.getElementById('admin-content');
    
    content.innerHTML = '<div class="loading"><div class="spinner"></div><p>Loading...</p></div>';

    switch(tabName) {
      case 'restaurants':
        await this.loadRestaurants();
        break;
      case 'reviews':
        await this.loadReviews();
        break;
      case 'packages':
        await this.loadPackages();
        break;
      case 'bookings':
        await this.loadBookings();
        break;
    }
  }

  async loadRestaurants() {
    const content = document.getElementById('admin-content');
    
    try {
      const response = await axios.get('/api/admin/restaurants');
      const restaurants = response.data;

      content.innerHTML = `
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
                <th>로컬점수</th>
                <th>상태</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              ${restaurants.map(r => `
                <tr>
                  <td><strong>${r.name_ko}</strong><br><small style="color: var(--text-secondary);">${r.name_en || ''}</small></td>
                  <td>${r.region}</td>
                  <td>${r.sector}</td>
                  <td>${r.city}</td>
                  <td>₩${r.avg_price?.toLocaleString() || 'N/A'}</td>
                  <td>${r.gov_certified ? '✓ 인증' : '-'}</td>
                  <td><strong style="color: var(--accent);">${r.local_score}</strong></td>
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
      content.innerHTML = '<p style="padding: 2rem; color: red;">데이터를 불러올 수 없습니다.</p>';
    }
  }

  async loadReviews() {
    const content = document.getElementById('admin-content');
    
    try {
      const response = await axios.get('/api/admin/reviews');
      const reviews = response.data;

      content.innerHTML = `
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
                <th>등록일</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              ${reviews.map(r => `
                <tr>
                  <td style="max-width: 300px;">${r.content_original?.substring(0, 80)}...</td>
                  <td><strong>${r.restaurant_name || 'N/A'}</strong></td>
                  <td>${r.user_country}</td>
                  <td>${'⭐'.repeat(r.rating || 0)}</td>
                  <td>${r.visit_date || '-'}</td>
                  <td>${r.approved ? '<span class="badge">승인됨</span>' : '<span class="badge badge-secondary">대기중</span>'}</td>
                  <td>${new Date(r.created_at).toLocaleDateString('ko-KR')}</td>
                  <td>
                    ${r.approved ? 
                      '<button class="btn btn-secondary" style="padding: 0.5rem 1rem; font-size: 0.875rem;">취소</button>' :
                      '<button class="btn btn-primary" style="padding: 0.5rem 1rem; font-size: 0.875rem;">승인</button>'
                    }
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    } catch (error) {
      content.innerHTML = '<p style="padding: 2rem; color: red;">데이터를 불러올 수 없습니다.</p>';
    }
  }

  async loadPackages() {
    const content = document.getElementById('admin-content');
    
    try {
      const response = await axios.get('/api/admin/packages');
      const packages = response.data;

      content.innerHTML = `
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
                <th>등록일</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              ${packages.map(p => `
                <tr>
                  <td><strong>${p.title_ko}</strong><br><small style="color: var(--text-secondary);">${p.title_en || ''}</small></td>
                  <td>${p.duration}</td>
                  <td>${JSON.parse(p.regions || '[]').join(', ')}</td>
                  <td><strong style="color: var(--accent);">$${p.price_budget}</strong></td>
                  <td><strong style="color: var(--accent);">$${p.price_standard}</strong></td>
                  <td><strong style="color: var(--accent);">$${p.price_premium}</strong></td>
                  <td><span class="badge">${p.status}</span></td>
                  <td>${new Date(p.created_at).toLocaleDateString('ko-KR')}</td>
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
      content.innerHTML = '<p style="padding: 2rem; color: red;">데이터를 불러올 수 없습니다.</p>';
    }
  }

  async loadBookings() {
    const content = document.getElementById('admin-content');
    
    try {
      const response = await axios.get('/api/admin/bookings');
      const bookings = response.data;

      if (bookings.length === 0) {
        content.innerHTML = `
          <div style="padding: 4rem; text-align: center;">
            <h3 style="color: var(--text-secondary);">아직 예약이 없습니다</h3>
            <p style="color: var(--text-light);">고객이 예약을 하면 여기에 표시됩니다.</p>
          </div>
        `;
        return;
      }

      content.innerHTML = `
        <div class="admin-table">
          <table>
            <thead>
              <tr>
                <th>예약번호</th>
                <th>패키지</th>
                <th>고객명</th>
                <th>이메일</th>
                <th>여행일</th>
                <th>인원</th>
                <th>타입</th>
                <th>금액</th>
                <th>상태</th>
                <th>예약일</th>
              </tr>
            </thead>
            <tbody>
              ${bookings.map(b => `
                <tr>
                  <td><code>${b.id.substring(0, 8)}</code></td>
                  <td><strong>${b.package_title || 'N/A'}</strong></td>
                  <td>${b.customer_name}</td>
                  <td>${b.customer_email}</td>
                  <td>${b.travel_date}</td>
                  <td>${b.num_people}명</td>
                  <td>${b.package_type}</td>
                  <td><strong style="color: var(--accent);">$${b.total_price}</strong></td>
                  <td><span class="badge">${b.status}</span></td>
                  <td>${new Date(b.created_at).toLocaleDateString('ko-KR')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    } catch (error) {
      content.innerHTML = '<p style="padding: 2rem; color: red;">데이터를 불러올 수 없습니다.</p>';
    }
  }
}

// Initialize admin dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.adminDashboard = new AdminDashboard();
});
