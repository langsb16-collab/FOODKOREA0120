# K-Taste Route (LOCAL TABLE KOREA)

## 프로젝트 개요

해외 관광객을 위한 한국 로컬 미식 여행 플랫폼입니다. SNS 맛집이 아닌, 지자체 인증과 현지인 추천 기반의 진짜 로컬 맛집을 소개합니다.

## 주요 기능

### ✅ 완료된 기능

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

4. **관리자 페이지**
   - 맛집 관리 (CRUD)
   - 후기 관리 및 승인
   - 패키지 관리
   - 예약 관리

5. **반응형 디자인**
   - PC 및 모바일 최적화
   - 고급스럽고 세련된 UI/UX
   - 프리미엄 골드 & 블랙 컬러 스킴

### 🚧 권장 다음 단계

1. **결제 시스템 통합** - Stripe API 연동
2. **이메일 알림** - SendGrid 연동
3. **지도 통합** - Google Maps/Kakao Maps API
4. **이미지 업로드** - Cloudflare R2 연동
5. **AI 번역** - 자동 콘텐츠 번역 시스템

## 데이터 구조

### 테이블

1. **restaurants** - 맛집 정보
   - 다국어 이름/설명
   - 지역, 섹터, 위치 정보
   - 평균 가격, 로컬 점수
   - 지자체 인증 여부

2. **reviews** - 후기
   - 다국어 콘텐츠
   - 평점, 재방문 언급
   - 관리자 승인

3. **packages** - 여행상품
   - 다국어 제목/설명
   - 3가지 가격대
   - 포함 맛집 목록

4. **bookings** - 예약
   - 고객 정보
   - 여행 일정 및 인원
   - 결제 정보

## URLs

- **로컬 개발**: http://localhost:3000
- **프로덕션**: (Cloudflare Pages 배포 후)

## 기술 스택

- **프레임워크**: Hono (Edge-first)
- **런타임**: Cloudflare Workers
- **데이터베이스**: Cloudflare D1 (SQLite)
- **언어**: TypeScript
- **프론트엔드**: Vanilla JS, Axios
- **스타일**: Custom CSS (반응형)

## 개발 가이드

### 로컬 개발

```bash
# 데이터베이스 마이그레이션
npm run db:migrate:local

# 샘플 데이터 시드
npm run db:seed

# 프로젝트 빌드
npm run build

# 개발 서버 시작 (PM2)
pm2 start ecosystem.config.cjs

# 테스트
npm test
```

### 배포

```bash
# Cloudflare Pages에 배포
npm run deploy:prod

# 프로덕션 DB 마이그레이션
npm run db:migrate:prod
```

## 샘플 데이터

- **맛집**: 10개 (각 권역별 대표 맛집)
- **후기**: 3개
- **패키지**: 4개 (권역별 미식 투어)

## 프로젝트 특징

1. **SNS 맛집 배제**: 인플루언서 중심이 아닌 진짜 로컬 맛집
2. **지자체 인증**: 정부/지자체 인증 음식점 위주
3. **공항 중심 동선**: 입국 즉시 미식 여행 시작
4. **다국어 완벽 지원**: 5개 언어 실시간 전환
5. **고급 디자인**: 프리미엄 미식 플랫폼 이미지

## 배포 상태

- **플랫폼**: Cloudflare Pages
- **상태**: ✅ 로컬 개발 완료 / ⏳ 프로덕션 배포 대기
- **최종 업데이트**: 2026-01-15

## 문의

- 이메일: contact@k-taste-route.com
- GitHub: (저장소 URL)

---

**K-Taste Route** - Discover Authentic Korean Cuisine Beyond Social Media Hype
