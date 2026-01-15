# K-Taste Route - CSV 맛집 업로드 가이드

## 📋 CSV 파일 형식

### 헤더 (첫 줄)
```csv
restaurant_id,name_ko,name_en,name_ja,name_zh,name_th,region,sector,city,address,cuisine,avg_price,gov_certified,airport_priority,description,status
```

### 샘플 데이터
```csv
restaurant_id,name_ko,name_en,name_ja,name_zh,name_th,region,sector,city,address,cuisine,avg_price,gov_certified,airport_priority,description,status
KR-CAP-001,이문설농탕,Imun Seolleongtang,イムンソルロンタン,以门雪浓汤餐厅,อีมุน ซอลลองทัง,수도권,노포,서울,서울 중구 을지로,한식,15000,Y,1순위,100년 전통 설렁탕 노포,ACTIVE
KR-CAP-002,광장시장 빈대떡,Gwangjang Market Bindaetteok,光市場ビンデトック,广场市场煎饼,ตลาดกวางจัง บินแดต๊อก,수도권,전통시장,서울,서울 종로구 창경궁로,전통시장,8000,Y,1순위,광장시장 대표 빈대떡,ACTIVE
KR-GW-001,춘천 닭갈비 골목,Chuncheon Dakgalbi Alley,春川タッカルビ通り,春川辣炒鸡胗街,ถนนดักกัลบี ชุนชอน,강원도,향토음식,춘천,강원도 춘천시 명동길,향토음식,12000,Y,2순위,춘천 대표 닭갈비 거리,ACTIVE
```

## 📝 필드 설명

| 필드명 | 설명 | 예시 | 필수 |
|--------|------|------|------|
| restaurant_id | 고유 ID (지역코드-번호) | KR-CAP-001 | ✅ |
| name_ko | 한국어 이름 | 이문설농탕 | ✅ |
| name_en | 영어 이름 | Imun Seolleongtang | ✅ |
| name_ja | 일본어 이름 | イムンソルロンタン | ✅ |
| name_zh | 중국어 이름 | 以门雪浓汤餐厅 | ✅ |
| name_th | 태국어 이름 | อีมุน ซอลลองทัง | ✅ |
| region | 권역 | 수도권/강원도/충청도/전라도/경상도/제주도 | ✅ |
| sector | 섹터 | 노포/전통시장/향토음식/공항권/기차권/자연권 | ✅ |
| city | 도시 | 서울 | ✅ |
| address | 주소 | 서울 중구 을지로 | ✅ |
| cuisine | 음식 종류 | 한식/일식/중식 등 | ✅ |
| avg_price | 평균 가격 (₩) | 15000 | ✅ |
| gov_certified | 지자체 인증 | Y / N | ✅ |
| airport_priority | 공항 우선순위 | 1순위/2순위/기타 | ✅ |
| description | 설명 (한국어) | 100년 전통 설렁탕 노포 | ✅ |
| status | 상태 | ACTIVE / HOLD / CLOSED | ✅ |

## 🎯 입력 규칙

### region (권역)
- 수도권
- 강원도
- 충청도
- 전라도
- 경상도
- 제주도

### sector (섹터)
- 노포
- 전통시장
- 향토음식
- 공항권
- 기차권
- 자연권

### gov_certified (지자체 인증)
- Y: 인증됨
- N: 인증 안 됨

### airport_priority (공항 우선순위)
- 1순위: 공항에서 1-2시간 내 접근 가능
- 2순위: 공항에서 2-3시간 접근 가능
- 기타: 그 외 지역

### status (운영 상태)
- ACTIVE: 운영 중
- HOLD: 휴업
- CLOSED: 폐업

## 📦 대량 업로드 절차

### 1. 엑셀로 데이터 작성
1. Microsoft Excel 또는 Google Sheets 사용
2. 위의 헤더 형식으로 첫 줄 작성
3. 각 행에 맛집 데이터 입력
4. **150개씩 작성 권장** (권역별 또는 섹터별)

### 2. CSV 파일로 저장
1. **파일** → **다른 이름으로 저장**
2. 파일 형식: **CSV (쉼표로 분리) (*.csv)**
3. 인코딩: **UTF-8** (한글 깨짐 방지)
4. 파일명 예시: `capital_nopo_150.csv`

### 3. 관리자 페이지에서 업로드
1. 관리자 페이지 접속: `https://your-domain.com/admin`
2. **맛집 관리** 탭 클릭
3. **CSV 일괄 업로드** 섹션에서 파일 선택
4. **업로드** 버튼 클릭
5. 성공/실패 메시지 확인

## 🔄 업로드 후 자동 처리

CSV 업로드 시 다음 작업이 자동으로 처리됩니다:

- ✅ **다국어 데이터 저장**: 5개 언어 (한국어/영어/일본어/중국어/태국어)
- ✅ **지역/섹터 자동 분류**: 검색 및 필터링 최적화
- ✅ **인증 태그 부여**: 지자체 인증 맛집 표시
- ✅ **공항 우선순위 설정**: 1순위/2순위 자동 구분
- ✅ **상태 관리**: 운영/휴업/폐업 상태 자동 반영

## 📊 권장 데이터 구조

### 목표: 총 900개 맛집
- 6개 권역 × 150개 = 900개
- 또는 6개 섹터 × 150개 = 900개

### 예시 파일 구조
```
/csv_data/
  ├── capital_nopo_150.csv          # 수도권 노포 150개
  ├── capital_market_150.csv        # 수도권 전통시장 150개
  ├── gangwon_local_150.csv         # 강원도 향토음식 150개
  ├── chungcheong_airport_150.csv   # 충청도 공항권 150개
  ├── jeolla_local_150.csv          # 전라도 향토음식 150개
  └── gyeongsang_seafood_150.csv    # 경상도 해산물 150개
```

## ⚠️ 주의사항

### CSV 파일 작성 시
- ❌ **쉼표(,) 사용 금지**: 데이터 내에 쉼표가 있으면 오류 발생
- ❌ **줄바꿈 금지**: description 필드에 줄바꿈 넣지 않기
- ✅ **따옴표 사용**: 특수문자가 있으면 따옴표로 감싸기 (예: "한옥, 전통")
- ✅ **UTF-8 인코딩**: 한글이 깨지지 않도록 UTF-8로 저장

### 업로드 시
- ❌ **중복 ID 금지**: restaurant_id가 중복되면 오류 발생
- ❌ **빈 필드 금지**: 모든 필수 필드는 입력 필요
- ✅ **150개 단위**: 한 번에 150개씩 업로드 권장
- ✅ **백업**: 업로드 전 원본 엑셀 파일 백업

## 🛠️ 문제 해결

### Q: CSV 업로드 실패
**A**: 다음을 확인하세요:
- UTF-8 인코딩으로 저장했는지
- 헤더 형식이 정확한지
- 필수 필드가 모두 입력되었는지
- restaurant_id가 중복되지 않는지

### Q: 한글이 깨짐
**A**: CSV 저장 시 인코딩을 **UTF-8**로 선택하세요.

### Q: 일부 데이터만 업로드됨
**A**: 오류가 발생한 행이 있을 수 있습니다. 로그를 확인하고 해당 행을 수정 후 재업로드하세요.

## 📞 지원

- 관리자 페이지: `/admin`
- 문의: contact@k-taste-route.com

---

**마지막 업데이트**: 2026-01-15
