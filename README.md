# K-Taste Route (LOCAL TABLE KOREA)

## 프로젝트 개요

해외 관광객을 위한 한국 로컬 미식 여행 플랫폼입니다. SNS 맛집이 아닌, 지자체 인증과 현지인 추천 기반의 진짜 로컬 맛집을 소개합니다.

**NEW: K-Medical Tourism 모듈 추가** - 경산시 건강검진 & 한방 헬스 투어 플랫폼

## 주요 기능

### ✅ 완료된 기능

#### 1. LOCAL TABLE KOREA (미식 투어)

1. **다국어 지원 시스템**
   - 한국어, 영어, 일본어, 중국어(간체), 태국어 지원
   - 실시간 언어 전환
   - UI 텍스트 및 콘텐츠 번역

2. **지역별 맛집 탐색**
   - 6개 대권역: 수도권, 강원도, 충청도, 전라도, 경상도, 제주도
   - 6개 섹터: 공항권, 기차권, 전통시장, 노포, 향토음식, 자연권
   - 지자체 인증 맛집 DB
   - 로컬 점수 시스템

3. **미식 투어 패키지**
   - 3박4일 / 4박5일 패키지
   - 3가지 가격대: 저가형, 스탠다드, 고급형
   - 공항 중심 최적화 동선

#### 2. K-MEDICAL TOURISM (NEW)

1. **건강검진 패키지** ✅
   - 기본검진, 정밀검진, 암검진, VIP패키지
   - 국가별 맞춤 추천 (중국-위·대장, 중동-심혈관)
   - 소요시간, 가격 (KRW/USD/CNY) 표기
   - 병원 연계: 경산중앙병원, 세명병원

2. **한방 힐링 프로그램** ✅
   - 침·뜸, 추나, 약침, 한방테라피, 사상체질
   - 검진 후 연계 치료 시스템
   - 소화기 질환, 근골격 통증, 스트레스 치료
   - 한의원 연계: 경산S한의원

3. **의료관광 예약 시스템** ✅
   - 건강검진 + 한방 통합 예약
   - 병력, 가족력, 알레르기 사전 문진
   - 통역, 교통, 숙박 부가 서비스
   - 타깃 국가: 중국, 대만, 베트남, 몽골, 중동

4. **관리자 페이지** ✅
   - 병원 관리
   - 건강검진 패키지 관리
   - 한방 프로그램 관리
   - 의료관광 예약 관리

### 🚧 권장 다음 단계

#### K-Medical Tourism 확장

1. **AI 사전 문진** - 입국 전 모바일 문진 (언어별)
2. **검진 결과 다국어 리포트** - 자동 번역 시스템
3. **의료 통역 매칭** - 실시간 통역사 연결
4. **의료관광 대시보드** - 국가별 방문자 통계
5. **사후 관리 시스템** - 귀국 후 온라인 상담

#### 공통 시스템

1. **결제 시스템 통합** - Stripe API 연동
2. **이메일 알림** - SendGrid 연동
3. **지도 통합** - Google Maps/Kakao Maps API
4. **이미지 업로드** - Cloudflare R2 연동

## 데이터 구조

### 미식 투어 테이블

1. **restaurants** - 맛집 정보
2. **reviews** - 후기
3. **packages** - 여행상품
4. **bookings** - 예약

### K-Medical Tourism 테이블 (NEW)

1. **hospitals** - 병원/한의원 정보
   - 다국어 이름/설명 (한/영/중/일/베트남어)
   - 병원 타입, 위치, 연락처
   - 특화 서비스, 인증 여부

2. **health_packages** - 건강검진 패키지
   - 다국어 이름/설명
   - 패키지 타입 (기본/정밀/암/VIP/맞춤)
   - 타깃 국가, 성별, 연령
   - 검진 항목, 소요시간, 가격

3. **wellness_programs** - 한방 힐링 프로그램
   - 다국어 이름/설명
   - 프로그램 타입 (침·뜸/추나/약침/한방테라피/사상체질)
   - 타깃 증상, 소요시간, 회차, 가격

4. **medical_bookings** - 의료관광 예약
   - 고객 정보 (이름, 이메일, 국가, 성별, 나이)
   - 건강검진 정보 (패키지, 일시, 병력, 가족력, 알레르기, 약물)
   - 한방 프로그램 정보
   - 부가 서비스 (통역, 교통, 숙박)
   - 결제 정보

## URLs

### 공개 테스트 URL (Sandbox)

- **메인 홈**: https://3000-iwal8xk8gmflxvyhhxhol-2e1b9533.sandbox.novita.ai
- **K-Medical Tourism**: https://3000-iwal8xk8gmflxvyhhxhol-2e1b9533.sandbox.novita.ai/medical
- **의료관광 예약**: https://3000-iwal8xk8gmflxvyhhxhol-2e1b9533.sandbox.novita.ai/medical/reserve
- **미식 투어 예약**: https://3000-iwal8xk8gmflxvyhhxhol-2e1b9533.sandbox.novita.ai/reserve
- **관리자 페이지**: https://3000-iwal8xk8gmflxvyhhxhol-2e1b9533.sandbox.novita.ai/admin

### 로컬 개발

- **로컬 서버**: http://localhost:3000
- **K-Medical**: http://localhost:3000/medical
- **관리자**: http://localhost:3000/admin

## 기술 스택

- **프레임워크**: Hono (Edge-first)
- **런타임**: Cloudflare Workers
- **데이터베이스**: Cloudflare D1 (SQLite)
- **언어**: TypeScript
- **프론트엔드**: Vanilla JS, Axios
- **스타일**: Custom CSS (반응형)

## 주요 API 엔드포인트

### 미식 투어 API

- `GET /api/translations` - 다국어 번역 데이터
- `GET /api/restaurants/featured` - 추천 맛집
- `GET /api/restaurants?region=수도권&lang=en` - 맛집 검색
- `GET /api/packages?lang=ja` - 여행 패키지 목록
- `POST /api/bookings` - 예약 생성

### K-Medical Tourism API (NEW)

#### 공개 API

- `GET /api/hospitals?type=종합병원&city=경산시` - 병원 목록
- `GET /api/hospitals/:id` - 병원 상세
- `GET /api/health-packages?country=CN` - 건강검진 패키지 (국가별 필터)
- `GET /api/health-packages/:id` - 건강검진 패키지 상세
- `GET /api/wellness-programs?program_type=침·뜸` - 한방 프로그램 목록
- `GET /api/wellness-programs/:id` - 한방 프로그램 상세
- `POST /api/medical-bookings` - 의료관광 예약 생성

#### 관리자 API

- `GET /api/admin/hospitals` - 병원 관리
- `GET /api/admin/health-packages` - 건강검진 패키지 관리
- `GET /api/admin/wellness-programs` - 한방 프로그램 관리
- `GET /api/admin/medical-bookings` - 의료관광 예약 관리

### 관리자 API (공통)

- `POST /api/init-db` - 데이터베이스 초기화 (개발용)
- `GET /api/admin/restaurants` - 맛집 관리
- `GET /api/admin/reviews` - 후기 관리
- `GET /api/admin/packages` - 패키지 관리
- `GET /api/admin/bookings` - 예약 관리

## 샘플 데이터

### 미식 투어

- **맛집**: 3개 (이문설농탕, 광장시장 육회, 삼진어묵)
- **패키지**: 2개 (수도권 노포 투어, 부산 해안 투어)

### K-Medical Tourism (NEW)

- **병원**: 3곳 (경산중앙병원, 세명병원, 경산S한의원)
- **건강검진 패키지**: 3개 (기본, 정밀-중국인, 심혈관-중동인)
- **한방 프로그램**: 2개 (소화기 침·뜸, 근골격 추나)

## 프로젝트 특징

### LOCAL TABLE KOREA

1. **SNS 맛집 배제**: 인플루언서 중심이 아닌 진짜 로컬 맛집
2. **지자체 인증**: 정부/지자체 인증 음식점 위주
3. **공항 중심 동선**: 입국 즉시 미식 여행 시작
4. **다국어 완벽 지원**: 5개 언어 실시간 전환

### K-Medical Tourism (NEW)

1. **저렴한 비용**: 서울 대비 30-40% 저렴
2. **대기시간 최소화**: 외국인 전용 예약 시스템
3. **한방 결합**: 검진 후 즉시 한방 치료
4. **국가별 맞춤**: 중국-위·대장, 중동-심혈관
5. **1-3일 완결형**: 짧은 체류 기간에 최적화

## 개발 가이드

### 로컬 개발

```bash
# 프로젝트 빌드
npm run build

# 개발 서버 시작 (PM2)
pm2 start ecosystem.config.cjs

# 데이터베이스 초기화 (첫 실행 시)
curl -X POST http://localhost:3000/api/init-db

# 테스트
curl http://localhost:3000
curl http://localhost:3000/medical
curl http://localhost:3000/api/health-packages

# 서버 재시작
pm2 restart k-taste-route

# 로그 확인
pm2 logs k-taste-route --nostream
```

### 배포

```bash
# Cloudflare Pages에 배포
npm run deploy:prod

# 프로덕션 DB 마이그레이션
npm run db:migrate:prod
```

## 배포 상태

- **플랫폼**: Cloudflare Pages
- **로컬 개발**: ✅ 완료 및 테스트 성공
- **K-Medical Tourism**: ✅ 구현 및 테스트 완료
- **공개 URL**: ✅ 사용 가능 (Sandbox)
- **프로덕션 배포**: ⏳ 대기 (Cloudflare API 키 필요)
- **최종 업데이트**: 2026-01-19

## 문의

- **미식 투어**: contact@k-taste-route.com
- **K-Medical Tourism**: medical@k-taste-route.com
- **GitHub**: (저장소 URL)

---

**K-Taste Route** - Discover Authentic Korean Cuisine & Medical Wellness Beyond Social Media Hype
