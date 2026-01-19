# K-Taste Route & K-Medical Tourism 챗봇 Q&A 세트

## 플랫폼 개요 (Platform Overview)

### Q1: K-Taste Route가 무엇인가요?
**A:** K-Taste Route (LOCAL TABLE KOREA)는 해외 관광객을 위한 한국 로컬 미식 여행 플랫폼입니다. SNS 맛집이 아닌, 지자체 인증과 현지인이 추천하는 진짜 로컬 맛집을 소개합니다. 100년 전통 노포부터 숨은 향토음식까지, 한국의 진정한 미식 문화를 경험할 수 있습니다.

### Q2: What is K-Taste Route?
**A:** K-Taste Route (LOCAL TABLE KOREA) is a local Korean cuisine travel platform for international tourists. We introduce authentic local restaurants certified by municipalities and recommended by locals, not social media influencers. Experience genuine Korean culinary culture from 100-year-old traditional shops to hidden local specialties.

### Q3: 어떤 언어를 지원하나요?
**A:** 5개 언어를 완벽 지원합니다:
- 🇰🇷 한국어 (Korean)
- 🇺🇸 영어 (English)
- 🇯🇵 일본어 (日本語)
- 🇨🇳 중국어 간체 (中文)
- 🇹🇭 태국어 (ไทย)

우측 상단 언어 드롭다운에서 실시간으로 전환할 수 있습니다.

### Q4: 다른 맛집 플랫폼과 어떻게 다른가요?
**A:** K-Taste Route는 3가지 차별점이 있습니다:
1. **SNS 맛집 배제**: 인플루언서가 아닌 현지인과 지자체가 인증한 진짜 맛집만
2. **공항 중심 동선**: 입국 즉시 시작할 수 있는 최적화된 동선
3. **해외 관광객 특화**: 5개 언어 지원, 외국인 친화적 가격 정보

## 지역 & 맛집 (Regions & Restaurants)

### Q5: 어떤 지역을 다루나요?
**A:** 한국 전역 6대 권역을 다룹니다:
- 🏙️ **수도권** (Seoul Metro): 서울, 인천, 경기
- ⛰️ **강원도** (Gangwon): 춘천, 강릉, 속초
- 🌾 **충청도** (Chungcheong): 대전, 청주, 세종
- 🍚 **전라도** (Jeolla): 전주, 광주, 목포
- 🌊 **경상도** (Gyeongsang): 부산, 대구, 경주
- 🏝️ **제주도** (Jeju): 제주시, 서귀포

### Q6: 맛집 섹터 분류는 어떻게 되나요?
**A:** 6개 섹터로 분류합니다:
- ✈️ **공항 접근형**: 인천공항, 김포공항, 김해공항 인근
- 🚄 **KTX 접근형**: KTX역 도보 10분 이내
- 🛒 **전통시장**: 광장시장, 자갈치시장 등
- 🏛️ **노포 (20년+)**: 100년 전통 설렁탕, 갈비집 등
- 🍜 **향토음식**: 지역 특화 음식 (전주비빔밥, 부산밀면 등)
- 🏔️ **산/바다 특화**: 자연 속 맛집 (정동진, 태안 등)

### Q7: 지자체 인증이란 무엇인가요?
**A:** 지자체 인증은 해당 지역 정부나 관광공사가 공식 인증한 맛집을 의미합니다. 위생, 맛, 서비스, 전통성 등을 종합 평가하여 외국인 관광객에게 추천할 수 있는 음식점만 선정합니다. 맛집 카드에 ✓ 표시로 확인할 수 있습니다.

### Q8: How many restaurants are available?
**A:** We aim to provide 3,600+ authentic local restaurants across Korea:
- 6 major regions × 6 sectors × at least 100 restaurants per sector
- Currently growing our database with government-certified establishments
- CSV bulk upload system for efficient content management

### Q9: 맛집 검색은 어떻게 하나요?
**A:** 3가지 방법으로 검색할 수 있습니다:
1. **지역별**: 상단 메뉴 "지역별 맛집" 클릭 → 6대 권역 선택
2. **섹터별**: 공항권, 노포, 전통시장 등 관심 섹터 필터
3. **공항 우선순위**: 공항에서 가까운 순으로 자동 정렬

API: `GET /api/restaurants?region=수도권&sector=노포&lang=en`

### Q10: 로컬 점수(Local Score)란?
**A:** 로컬 점수는 현지인 추천도를 나타내는 지표입니다 (1-100점):
- **90점 이상**: 현지인 강력 추천, 관광객에게도 호평
- **70-89점**: 현지인이 자주 방문하는 단골집
- **50-69점**: 현지에서 알려진 맛집
- **50점 미만**: 신규 또는 평가 대기 중

## 미식 투어 패키지 (Culinary Tour Packages)

### Q11: 미식 투어 패키지가 무엇인가요?
**A:** 미식 투어 패키지는 3-5일간 한국의 로컬 맛집을 체계적으로 경험하는 여행 상품입니다. 공항 중심 최적화 동선으로 설계되어 입국 즉시 미식 여행을 시작할 수 있습니다.

**특징**:
- 지역별 테마 투어 (수도권 노포, 부산 해안 등)
- 전문 가이드 동행
- 교통, 식사, 숙박 포함
- 외국인 맞춤 서비스

### Q12: 패키지 종류와 가격은?
**A:** 3가지 가격대와 2가지 기간을 제공합니다:

**3박 4일**:
- 💰 저가형 (Budget): $700-$900
- 🥈 스탠다드 (Standard): $1,100-$1,400
- 🥇 고급형 (Premium): $1,800-$2,300

**4박 5일**:
- 💰 저가형: $900-$1,100
- 🥈 스탠다드: $1,400-$1,700
- 🥇 고급형: $2,300-$2,800

가격은 인원 수에 따라 조정됩니다.

### Q13: 패키지별 차이점은?
**A:** 
**저가형 (Budget)**:
- 게스트하우스/3성급 호텔
- 대중교통 이용
- 5-8개 맛집 방문
- 그룹 투어 (10-15명)

**스탠다드 (Standard)**:
- 4성급 호텔
- 전용 차량
- 8-12개 맛집 방문
- 중형 그룹 (6-10명)

**고급형 (Premium)**:
- 5성급 호텔/한옥 스테이
- 프라이빗 차량 + 전담 가이드
- 12-18개 맛집 + VIP 체험
- 소그룹 (2-6명)

### Q14: How do I book a culinary tour?
**A:** Booking process:
1. Browse packages at main page or click "Culinary Tours" menu
2. Select your preferred package and click "Book Now"
3. Fill in reservation form (email, phone, country, travel date, number of people, package type)
4. Submit request (no advance payment required)
5. Our team will contact you within 1-2 business days
6. Confirm details and arrange payment

API: `POST /api/bookings`

### Q15: 패키지 예약은 어떻게 하나요?
**A:** 예약 절차:
1. 홈페이지 또는 "미식 투어" 메뉴에서 패키지 둘러보기
2. 원하는 패키지 선택 → "예약하기" 클릭
3. 예약 정보 입력 (이메일, 전화, 국가, 여행 날짜, 인원, 패키지 유형)
4. 요청 제출 (**선결제 없음**)
5. 1-2일 내 담당자가 연락드립니다
6. 상세 조율 후 결제 진행

URL: https://3000-iwal8xk8gmflxvyhhxhol-2e1b9533.sandbox.novita.ai/reserve

## K-Medical Tourism (의료관광)

### Q16: K-Medical Tourism이 무엇인가요?
**A:** K-Medical Tourism은 경산시 기반 의료관광 플랫폼입니다. 저렴한 비용으로 고품질 건강검진과 한방 치료를 외국인 관광객에게 제공합니다.

**특징**:
- 서울 대비 30-40% 저렴한 가격
- 외국인 전용 예약 시스템으로 대기시간 최소화
- 건강검진 후 즉시 한방 치료 연계
- 국가별 맞춤 검진 (중국-위·대장, 중동-심혈관)
- 1-3일 완결형 프로그램

### Q17: 어떤 병원과 협력하나요?
**A:** 경산시 인증 3개 의료기관과 협력합니다:
1. **경산중앙병원** (종합병원): 기본검진, 정밀검진, 암검진
2. **세명병원** (종합병원): VIP 검진, 맞춤 검진
3. **경산S한의원** (한의원): 침·뜸, 추나, 사상체질, 한방테라피

모든 기관은 외국인 의료관광객 전용 예약 시스템을 운영합니다.

### Q18: 건강검진 패키지 종류는?
**A:** 5가지 검진 패키지를 제공합니다:

1. **기본검진** (Basic): 2-3시간, ₩150,000-200,000
   - 신체계측, 혈액검사, 소변검사, 흉부X-ray, 심전도

2. **정밀검진** (Comprehensive): 4-5시간, ₩300,000-500,000
   - 기본검진 + 초음파, 내시경, CT/MRI

3. **암검진** (Cancer Screening): 5-6시간, ₩500,000-800,000
   - 정밀검진 + 종양표지자, PET-CT, 조직검사

4. **VIP검진** (VIP): 6-8시간, ₩1,000,000-1,500,000
   - 암검진 + 1:1 전담 코디네이터, 럭셔리 대기실

5. **맞춤검진** (Customized): 시간/가격 상담
   - 국가별·연령별·성별 맞춤 설계

### Q19: What is Korean Medicine (Hanbanɡ) healing program?
**A:** Korean Medicine (한방, Hanbang) healing programs combine traditional Korean medical practices with modern wellness:

**Program Types**:
- 🔥 **침·뜸 (Acupuncture & Moxibustion)**: Digestive issues, chronic pain
- 💆 **추나 (Chuna Therapy)**: Musculoskeletal pain, spine correction
- 💉 **약침 (Herbal Acupuncture)**: Localized treatment with herbal extracts
- 🌿 **한방테라피 (Herbal Therapy)**: Stress relief, detox, immune boost
- 🧘 **사상체질 (Sasang Constitution)**: Personalized treatment based on body type

**Duration**: 1-2 hours per session, 3-10 sessions recommended
**Price**: ₩50,000-200,000 per session

### Q20: 의료관광 예약은 어떻게 하나요?
**A:** 예약 절차:
1. K-Medical Tourism 페이지 방문: `/medical`
2. 건강검진 패키지 또는 한방 프로그램 선택
3. "예약하기" 클릭 → 예약 양식 작성
4. **중요 정보 입력**:
   - 기본 정보: 이름, 이메일, 국가, 성별, 나이
   - 건강 정보: 병력, 가족력, 알레르기, 현재 복용 약물
   - 부가 서비스: 통역, 교통, 숙박 필요 여부
5. 제출 후 1-2일 내 담당자 연락
6. 예약 확정 및 사전 문진

URL: https://3000-iwal8xk8gmflxvyhhxhol-2e1b9533.sandbox.novita.ai/medical/reserve

### Q21: 타깃 국가는 어디인가요?
**A:** 5개 주요 국가를 타깃으로 합니다:
- 🇨🇳 **중국**: 위·대장 정밀 검진, 소화기 한방 치료
- 🇹🇼 **대만**: 암 조기 검진, 예방 중심
- 🇻🇳 **베트남**: 기본 건강검진, 한방 체험
- 🇲🇳 **몽골**: 근골격 추나 치료, 사상체질
- 🇸🇦 **중동**: 심혈관 정밀 검진, 당뇨 관리

각 국가별 맞춤 검진 패키지와 언어 지원을 제공합니다.

### Q22: 국가별 맞춤 검진이란?
**A:** 국가별 질병 발생률과 생활습관을 고려한 맞춤 검진입니다:

**중국·대만**:
- 위암, 대장암 집중 검진 (내시경, 조직검사)
- 간 기능 정밀 평가 (B형 간염 유병률 고려)

**중동 (사우디, UAE)**:
- 심혈관 질환 집중 (심장초음파, 관상동맥 CT)
- 당뇨 관리 (당화혈색소, 인슐린 저항성)

**베트남·몽골**:
- 기본 건강 스크리닝
- 결핵 검사 추가

API: `GET /api/health-packages?country=CN`

### Q23: 통역 서비스가 제공되나요?
**A:** 네, 전 과정에서 통역 서비스를 제공합니다:
- **의료 통역사**: 검진 중 동행, 의사 소견 설명
- **지원 언어**: 영어, 중국어, 베트남어, 러시아어
- **추가 비용**: ₩50,000-100,000/일
- **예약 시 신청**: 예약 양식에서 "통역 필요" 체크

교통 픽업(공항 ↔ 병원)과 숙박 연계 서비스도 함께 신청 가능합니다.

## 기술 & 기능 (Technical Features)

### Q24: 모바일에서도 사용할 수 있나요?
**A:** 네, 완벽한 반응형 디자인으로 모바일 최적화되어 있습니다:

**모바일 특징** (< 768px):
- 1열 카드 레이아웃
- 버튼 전체 폭 (width: 100%)
- 햄버거 메뉴 네비게이션
- 터치 친화적 버튼 (높이 52px)
- 16px 이상 글꼴 (확대 방지)

**데스크탑 특징** (≥ 1200px):
- 3-4열 그리드 레이아웃
- Hover 효과
- 넓은 여백과 가독성

**테스트 URL**: 모바일 브라우저에서 https://3000-iwal8xk8gmflxvyhhxhol-2e1b9533.sandbox.novita.ai 접속

### Q25: 다국어는 어떻게 전환하나요?
**A:** 우측 상단 언어 드롭다운에서 전환합니다:
1. 현재 언어 버튼 클릭 (예: "한국어 ▼")
2. 드롭다운 메뉴 열림
3. 원하는 언어 선택 (한국어, English, 日本語, 中文, ไทย)
4. 즉시 페이지 전체 언어 전환 (새로고침 없음)

**특징**:
- 실시간 전환 (AJAX)
- 선택 언어에 ✓ 표시
- 외부 클릭 시 자동 닫힘
- 부드러운 애니메이션

### Q26: CSV 대량 업로드 기능이 뭔가요?
**A:** 관리자가 150개 단위로 맛집 데이터를 일괄 업로드할 수 있는 기능입니다:

**특징**:
- 다국어 5개 언어 동시 입력 (name_ko, name_en, name_ja, name_zh, name_th)
- 지역, 섹터, 가격, 지자체 인증 등 검증
- CSV 파일 업로드 (Excel → CSV 저장)
- 중복 검사 및 오류 알림

**사용 대상**: 지자체 담당자, 플랫폼 관리자
**가이드 문서**: `UPLOAD_GUIDE.md`

URL: https://3000-iwal8xk8gmflxvyhhxhol-2e1b9533.sandbox.novita.ai/admin (맛집 관리 탭)

### Q27: 관리자 페이지는 어떻게 접근하나요?
**A:** `/admin` URL로 직접 접근합니다 (메인 네비게이션에는 노출되지 않음):

**URL**: https://3000-iwal8xk8gmflxvyhhxhol-2e1b9533.sandbox.novita.ai/admin

**4개 관리 탭**:
1. **맛집 관리**: 맛집 조회, 수정, CSV 업로드
2. **후기 관리**: 리뷰 승인/거절
3. **패키지 관리**: 투어 상품 등록/수정
4. **예약 관리**: 예약 현황 및 상태 관리

**접근 권한**: 현재 인증 없음 (추후 로그인 추가 예정)

### Q28: What APIs are available?
**A:** RESTful APIs for developers and partners:

**Culinary Tour APIs**:
- `GET /api/translations` - i18n translation data
- `GET /api/restaurants?region=수도권&sector=노포&lang=en` - Restaurant search
- `GET /api/restaurants/featured` - Featured restaurants
- `GET /api/packages?lang=ja` - Tour packages
- `POST /api/bookings` - Create booking

**K-Medical Tourism APIs**:
- `GET /api/hospitals?type=종합병원&city=경산시` - Hospital list
- `GET /api/health-packages?country=CN` - Health packages (filter by country)
- `GET /api/wellness-programs?program_type=침·뜸` - Wellness programs
- `POST /api/medical-bookings` - Create medical booking

**Admin APIs**: `/api/admin/*` (requires authentication)

### Q29: 데이터베이스는 어떤 걸 사용하나요?
**A:** Cloudflare D1 (SQLite 기반 글로벌 분산 데이터베이스)를 사용합니다:

**장점**:
- 엣지 네트워크 배포로 전 세계 빠른 응답
- 무료 티어: 100,000 read/일, 50,000 write/일
- SQL 표준 지원
- 자동 백업 및 복제

**테이블 구조**:
- 미식 투어: restaurants, reviews, packages, bookings
- K-Medical: hospitals, health_packages, wellness_programs, medical_bookings

**로컬 개발**: `--local` 플래그로 로컬 SQLite 자동 생성

### Q30: 결제 시스템은 어떻게 되나요?
**A:** 현재는 **예약 요청 기반 시스템**입니다 (선결제 없음):

**현재 프로세스**:
1. 고객이 예약 양식 작성 및 제출
2. 담당자가 1-2일 내 연락
3. 상세 조율 후 결제 안내 (계좌이체/카드 등)

**향후 계획**:
- 🔄 Stripe API 연동 (카드 결제)
- 💳 다국가 통화 지원 (USD, CNY, JPY 등)
- 🔒 PCI DSS 준수 보안

문의: contact@k-taste-route.com

## 디자인 & 사진 가이드 (Design & Image Guide)

### Q31: 디자인 컨셉은 무엇인가요?
**A:** **Eatwith 스타일 반영** - 깨끗하고 여백 중심의 디자인:

**핵심 원칙**:
- 화이트 배경 중심 (#FFFFFF, #F7F7F7)
- 강한 대비 금지 (부드러운 그림자)
- 카드 + 사진 + 짧은 문장 구성
- 예약 압박 최소화 (Calm & Inviting)

**컬러 팔레트**:
- Primary: #E85C4A (따뜻한 코랄)
- Text: #1F1F1F (메인), #6B6B6B (서브), #9A9A9A (뮤트)
- Background: #FFFFFF (화이트), #F7F7F7 (소프트)
- Border: #EDEDED (라이트 그레이)

**폰트**: Noto Sans KR, Inter, system fonts

### Q32: 어떤 사진을 사용해야 하나요?
**A:** **현지에서 함께 먹는 느낌**을 강조하는 사진:

**추천 콘셉트**:
- ✅ 사람 + 식탁 (현지인이 함께 먹는 모습)
- ✅ 자연광 (낮 햇살, 따뜻한 조명)
- ✅ 일상적인 순간 (웃음, 대화, 식사 중)
- ✅ 로컬 공간 (작은 식당, 시장, 거리)

**피해야 할 사진**:
- ❌ 스튜디오 촬영 (과도한 조명, 세팅)
- ❌ 과다 색보정 (비현실적 색감)
- ❌ 백화점/프랜차이즈 느낌
- ❌ 음식만 클로즈업 (사람 없음)

**가이드 문서**: `IMAGE_GUIDE.md`

### Q33: 반응형 디자인 기준은?
**A:** 3가지 브레이크포인트:

**Mobile** (< 768px):
- 1열 카드 레이아웃
- 버튼 width 100%, height 52px
- 햄버거 메뉴
- Hero Title: 28px, Body: 15px
- 터치 기반 (hover 비활성)

**Tablet** (768px - 1199px):
- 2-3열 그리드
- 가로 메뉴 네비게이션
- Hero Title: 36px, Body: 16px

**Desktop** (≥ 1200px):
- 3-4열 그리드
- Hover 효과 활성
- Hero Title: 48px, Body: 17px
- 넓은 여백

**가이드 문서**: `IMAGE_GUIDE.md` (디바이스별 레이아웃 상세)

### Q34: 모바일 우선 설계란?
**A:** **Mobile First, Desktop Expansion** - 모바일을 기본으로 설계하고 PC로 확장:

**모바일 우선 원칙**:
- 1열 고정 레이아웃
- 좌우 여백 최소화 (16px)
- 카드 간 간격 충분 (24px)
- CTA 버튼 화면 내부에 항상 배치
- 16px 미만 글꼴 금지 (확대 방지)

**PC 확장 원칙**:
- 여유로운 여백 (32px+)
- 3-4열 그리드
- Hover 인터랙션 추가

**중요**: PC와 모바일은 단순히 화면을 줄이는 것이 아니라, 정보의 우선순위와 시선 흐름을 다르게 설계합니다.

## 파트너십 & B2B (Partnership & B2B)

### Q35: 여행사 제휴는 어떻게 하나요?
**A:** B2B 여행사 파트너십 프로그램:

**제공 서비스**:
- 🤝 전용 파트너 페이지 (화이트 라벨링)
- 📊 예약 API 또는 엑셀 업로드
- 💰 수수료 구조: 15-25% (볼륨 기반)
- 📈 국가별 방문자 통계 리포트

**타깃 파트너**:
- 중국, 대만, 일본, 태국 현지 여행사
- 의료관광 전문 에이전시
- 항공사 제휴 투어 상품

**문의**: partners@k-taste-route.com

### Q36: 지자체 협력은 어떻게 진행되나요?
**A:** 지자체 공동 브랜딩 및 데이터 제공:

**협력 모델**:
1. **맛집 DB 제공**: 지자체 인증 음식점 목록
2. **공동 브랜딩 페이지**: "경주시 인증 맛집" 등
3. **통계 리포트**: 국가별, 월별 방문 데이터
4. **마케팅 협력**: 공동 SNS 캠페인, 관광박람회

**현재 협력 지자체**:
- 경산시 (K-Medical Tourism)
- 추후 확대 예정

**문의**: gov@k-taste-route.com

### Q37: Can I integrate K-Taste Route API into my travel app?
**A:** Yes, we provide RESTful APIs for integration:

**API Features**:
- Restaurant search with filters (region, sector, price)
- Tour package listing with multi-currency pricing
- Booking creation endpoint
- Real-time availability check (planned)

**Integration Steps**:
1. Contact us: api@k-taste-route.com
2. Receive API key and documentation
3. Test in sandbox environment
4. Launch with production credentials

**API Docs**: Available upon partnership agreement

### Q38: 맛집 등록은 어떻게 하나요?
**A:** 2가지 방법으로 등록 가능합니다:

**방법 1: 지자체 일괄 등록** (권장):
- 지자체가 CSV 파일로 150개씩 업로드
- 인증 절차 간소화
- `UPLOAD_GUIDE.md` 참조

**방법 2: 개별 음식점 신청**:
1. 신청서 작성: restaurant-apply@k-taste-route.com
2. 필수 정보: 음식점명, 주소, 대표 메뉴, 가격대
3. 지자체 인증 여부 확인
4. 사진 제공 (IMAGE_GUIDE.md 참조)
5. 검토 후 1-2주 내 등록

**등록 기준**: 20년+ 노포, 지자체 인증, 로컬 추천도 70점+

## 기타 정보 (Additional Information)

### Q39: 고객 지원은 어떻게 받나요?
**A:** 다양한 채널로 지원합니다:

**이메일**:
- 미식 투어: contact@k-taste-route.com
- K-Medical Tourism: medical@k-taste-route.com
- 파트너십: partners@k-taste-route.com
- API 문의: api@k-taste-route.com

**응답 시간**: 영업일 기준 1-2일 내

**언어 지원**: 한국어, 영어, 일본어, 중국어

**챗봇 (계획 중)**: 24/7 자동 응답 (FAQ 기반)

### Q40: 프로젝트 오픈소스인가요?
**A:** 현재는 비공개이지만, 일부 컴포넌트는 오픈소스로 공개 계획:

**공개 예정**:
- 다국어 i18n 시스템
- CSV 대량 업로드 컴포넌트
- 반응형 디자인 시스템

**기술 스택**:
- Hono (Edge-first framework)
- Cloudflare Workers + D1
- TypeScript
- Vanilla JS (프레임워크 없음)

**개발 문서**:
- README.md: 프로젝트 개요
- TESTING.md: 테스트 가이드
- UPLOAD_GUIDE.md: CSV 업로드 가이드
- IMAGE_GUIDE.md: 사진 및 디자인 가이드

**GitHub**: (저장소 URL 추후 공개)

---

## 추가 질문 (Quick FAQs)

**Q: 예약 취소는 어떻게 하나요?**
A: 담당자에게 이메일 또는 전화로 연락 주시면 취소 정책에 따라 처리됩니다. (일반적으로 7일 전: 무료 취소, 3-7일 전: 50% 환불, 3일 이내: 환불 불가)

**Q: 단체 예약 할인이 있나요?**
A: 10명 이상 단체 예약 시 10-20% 할인 제공. partners@k-taste-route.com으로 문의 주세요.

**Q: 채식주의자를 위한 옵션이 있나요?**
A: 네, 예약 시 "특별 요청"란에 채식 필요 여부를 기재해 주시면 맞춤 일정을 제공합니다.

**Q: 건강검진 결과는 언제 받을 수 있나요?**
A: 기본 결과는 당일, 정밀 결과(조직검사, CT 등)는 3-7일 소요. 다국어 번역 리포트 제공.

**Q: 프로덕션 배포는 언제 되나요?**
A: Cloudflare API 키 설정 후 즉시 배포 가능. 현재 샌드박스 환경에서 모든 기능 테스트 완료 상태.

---

**플랫폼 URL**: https://3000-iwal8xk8gmflxvyhhxhol-2e1b9533.sandbox.novita.ai
**관리자 URL**: https://3000-iwal8xk8gmflxvyhhxhol-2e1b9533.sandbox.novita.ai/admin
**K-Medical URL**: https://3000-iwal8xk8gmflxvyhhxhol-2e1b9533.sandbox.novita.ai/medical

**최종 업데이트**: 2026-01-19
