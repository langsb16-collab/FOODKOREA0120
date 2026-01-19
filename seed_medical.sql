-- K-Medical Tourism Sample Data for Gyeongsan City
-- 경산시 의료·한방 관광 샘플 데이터

-- 1. 병원 데이터
INSERT INTO hospitals (id, name_ko, name_en, name_zh, name_ja, name_vi, type, city, address, phone, features, specialties, certified, description_ko, description_en, description_zh) VALUES
('GS-HOSP-001', '경산중앙병원', 'Gyeongsan Jungang Hospital', '庆山中央医院', '慶山中央病院', 'Bệnh viện Trung tâm Gyeongsan', '종합병원', '경산시', '경북 경산시 중앙로 123', '053-810-1234', '["종합건강증진센터", "5대암 검진", "외국인 전용 라운지"]', '["건강검진", "소화기내과", "순환기내과"]', 1, '경산시 대표 종합병원으로 체계적인 건강검진 시스템을 갖추고 있습니다.', 'Leading general hospital in Gyeongsan with comprehensive health checkup system.', '庆山市代表性综合医院，具备完善的健康体检系统。'),
('GS-HOSP-002', '세명병원', 'Semyung Hospital', '世明医院', 'セミョン病院', 'Bệnh viện Semyung', '종합병원', '경산시', '경북 경산시 압량읍 중앙로 456', '053-810-5678', '["기업 건강검진", "정기 건강검진", "주말 검진 가능"]', '["건강검진", "내과", "영상의학과"]', 1, '기업 및 정기 건강검진에 특화된 병원입니다.', 'Specialized in corporate and regular health checkups.', '专注于企业和定期健康体检的医院。'),
('GS-HAN-001', '경산S한의원', 'Gyeongsan S Korean Medicine Clinic', '庆山S韩医院', '慶山S韓医院', 'Phòng khám Y học Hàn Quốc S Gyeongsan', '한의원', '경산시', '경북 경산시 옥산로 789', '053-810-9012', '["365일 진료", "외국인 진료 가능", "영어 소통 가능"]', '["침·뜸", "한방테라피", "사상체질"]', 1, '365일 진료하는 한의원으로 외국인 환자 대응에 특화되어 있습니다.', 'Operating 365 days, specialized in treating international patients.', '全年无休的韩医院，专门接待外国患者。'),
('GS-HAN-002', '청추나한의원 경산점', 'Cheong Chuna Korean Medicine Clinic Gyeongsan', '清推拿韩医院庆山店', 'チョン推拿韓医院慶山店', 'Phòng khám Cheong Chuna Gyeongsan', '한의원', '경산시', '경북 경산시 하양읍 대학로 101', '053-810-3456', '["추나치료 특화", "통증 치료", "근골격계 질환"]', '["추나", "침·뜸", "약침"]', 1, '추나 및 통증 치료에 특화된 한의원입니다.', 'Specialized in Chuna therapy and pain management.', '专注于推拿和疼痛治疗的韩医院。');

-- 2. 건강검진 패키지
INSERT INTO health_packages (id, hospital_id, name_ko, name_en, name_zh, name_ja, name_vi, package_type, target_country, target_gender, target_age_min, target_age_max, checkup_items, duration_hours, price_krw, price_usd, price_cny, recommended_for, includes, description_ko, description_en, description_zh, popular_rank) VALUES
-- 기본검진
('PKG-BASIC-001', 'GS-HOSP-001', '외국인 기본 건강검진', 'Basic Health Checkup for Foreigners', '外国人基础健康体检', '外国人基本健康検診', 'Khám sức khỏe cơ bản cho người nước ngoài', '기본검진', '["CN", "TW", "VN", "MN"]', '공통', 20, 70, '["신체계측", "혈압측정", "혈액검사", "소변검사", "흉부X-ray", "심전도"]', 2, 180000, 150, 1080, '["기본 건강 상태 확인", "질병 조기 발견"]', '["식사 제공", "영문 리포트", "의료진 상담"]', '외국인을 위한 기본적인 건강 상태 확인 프로그램입니다.', 'Basic health screening program for international visitors.', '为外国人提供的基本健康检查项目。', 1),

-- 정밀검진 (중국인 선호)
('PKG-FULL-001', 'GS-HOSP-001', '중국인 맞춤 정밀검진', 'Comprehensive Checkup for Chinese', '中国人专属精密体检', '中国人向け精密検診', 'Khám sức khỏe toàn diện cho người Trung Quốc', '정밀검진', '["CN"]', '공통', 30, 65, '["기본검진 항목", "위내시경", "복부초음파", "간기능검사", "신장기능검사", "갑상선검사"]', 4, 480000, 400, 2880, '["위·대장 질환", "간 질환", "소화기 질환"]', '["식사 제공", "중문 리포트", "전문 통역", "픽업 서비스"]', '중국인에게 흔한 소화기 질환에 특화된 정밀 검진 패키지입니다.', 'Specialized comprehensive checkup focusing on digestive system for Chinese patients.', '专注于消化系统的中国人专属精密体检套餐。', 2),

-- 암검진
('PKG-CANCER-001', 'GS-HOSP-001', '5대 암 검진 패키지', '5 Major Cancers Screening', '五大癌症筛查套餐', '5大がん検診パッケージ', 'Gói tầm soát 5 loại ung thư chính', '암검진', '["CN", "TW", "JP", "KR"]', '공통', 40, 75, '["위내시경", "대장내시경", "폐CT", "유방촬영(여)", "자궁경부암검사(여)", "전립선검사(남)"]', 5, 850000, 710, 5110, '["5대 암 조기 발견", "가족력 있는 경우"]', '["식사 제공", "다국어 리포트", "전문 통역", "픽업·호텔 서비스"]', '한국인 5대 암(위·대장·폐·유방·자궁경부암)을 조기에 발견하는 검진입니다.', 'Early detection screening for 5 major cancers common in Korea.', '早期发现韩国五大癌症（胃癌、大肠癌、肺癌、乳腺癌、宫颈癌）的体检。', 3),

-- VIP 패키지
('PKG-VIP-001', 'GS-HOSP-001', 'VIP 프리미엄 건강검진', 'VIP Premium Health Checkup', 'VIP高级健康体检', 'VIPプレミアム健康検診', 'Khám sức khỏe VIP cao cấp', 'VIP패키지', '["CN", "AE", "MN"]', '공통', 35, 80, '["전 항목 정밀검진", "뇌MRI", "심장CT", "전신PET-CT", "유전자검사", "개인 전담 코디네이터"]', 8, 2500000, 2100, 15120, '["심혈관 질환", "뇌질환", "암 정밀 검진"]', '["호텔급 식사", "다국어 리포트", "전담 통역사", "프리미엄 차량", "5성급 호텔 2박"]', '최고급 의료 서비스와 프리미엄 케어를 제공하는 VIP 검진입니다.', 'Top-tier medical service with premium care for VIP guests.', '提供顶级医疗服务和高端护理的VIP体检。', 4),

-- 기업 임원 패키지
('PKG-EXEC-001', 'GS-HOSP-002', '기업 임원 건강검진', 'Executive Health Checkup', '企业高管健康体检', '企業役員健康検診', 'Khám sức khỏe cho giám đốc doanh nghiệp', 'VIP패키지', '["CN", "TW", "VN"]', '공통', 40, 70, '["정밀검진 항목", "심혈관 정밀검사", "스트레스 호르몬 검사", "영양상태 분석"]', 5, 980000, 820, 5900, '["심혈관 질환", "스트레스 관리", "영양 불균형"]', '["식사 제공", "다국어 리포트", "통역 서비스", "건강관리 가이드"]', '바쁜 기업 임원을 위한 맞춤형 건강검진 프로그램입니다.', 'Customized health checkup program for busy executives.', '为忙碌的企业高管量身定制的健康体检项目。', 5);

-- 3. 한방 힐링 프로그램
INSERT INTO wellness_programs (id, hospital_id, name_ko, name_en, name_zh, name_ja, name_vi, program_type, target_symptom, duration_minutes, sessions, price_krw, price_usd, includes, benefits_ko, benefits_en, benefits_zh, description_ko, description_en, description_zh, popular_rank) VALUES
-- 침·뜸 프로그램
('WP-ACUP-001', 'GS-HAN-001', '소화기 집중 침·뜸 치료', 'Digestive System Acupuncture & Moxibustion', '消化系统针灸治疗', '消化器集中針灸治療', 'Châm cứu tập trung hệ tiêu hóa', '침·뜸', '["소화기 질환", "위장 불편", "식욕부진"]', 60, 3, 180000, 150, '["체질 진단", "생활 가이드 PDF", "한방차"]', '소화 기능 개선, 위장 불편 완화, 식욕 증진', 'Improve digestion, relieve stomach discomfort, increase appetite', '改善消化功能，缓解胃部不适，增进食欲', '검진 결과 소화기 문제가 발견된 경우 추천하는 침·뜸 치료입니다.', 'Recommended acupuncture therapy for digestive issues found in checkup.', '针对体检中发现的消化系统问题推荐的针灸治疗。', 1),

-- 추나 프로그램
('WP-CHUNA-001', 'GS-HAN-002', '근골격 통증 추나 치료', 'Musculoskeletal Pain Chuna Therapy', '肌肉骨骼疼痛推拿治疗', '筋骨格痛症推拿治療', 'Điều trị đau cơ xương khớp bằng Chuna', '추나', '["근골격 통증", "허리 통증", "목·어깨 통증"]', 45, 5, 250000, 210, '["체형 분석", "운동 가이드", "자세 교정 지도"]', '통증 완화, 체형 교정, 혈액순환 개선', 'Pain relief, posture correction, improved blood circulation', '缓解疼痛，矫正体型，改善血液循环', '장시간 비행과 여행으로 인한 근골격 통증을 완화하는 추나 치료입니다.', 'Chuna therapy to relieve musculoskeletal pain from long flights and travel.', '缓解长途飞行和旅行导致的肌肉骨骼疼痛的推拿治疗。', 2),

-- 약침 프로그램
('WP-HERBAL-001', 'GS-HAN-002', '스트레스 완화 약침 치료', 'Stress Relief Herbal Acupuncture', '缓解压力草药针灸', 'ストレス緩和薬針治療', 'Châm cứu thảo dược giảm stress', '약침', '["스트레스", "불면증", "피로 누적"]', 40, 3, 200000, 170, '["스트레스 진단", "수면 가이드", "명상 음원"]', '스트레스 감소, 수면 질 향상, 피로 회복', 'Reduce stress, improve sleep quality, recover from fatigue', '减少压力，提高睡眠质量，恢复疲劳', '현대인의 스트레스와 피로를 풀어주는 약침 치료 프로그램입니다.', 'Herbal acupuncture program to relieve modern stress and fatigue.', '缓解现代人压力和疲劳的草药针灸项目。', 3),

-- 사상체질 프로그램
('WP-SASANG-001', 'GS-HAN-001', '사상체질 맞춤 힐링', 'Personalized Sasang Constitution Healing', '四象体质个性化疗愈', '四象体質オーダーメイドヒーリング', 'Điều trị cá nhân hóa theo thể chất Tứ tượng', '사상체질', '["체질 개선", "건강 관리"]', 90, 1, 150000, 125, '["체질 분석서", "맞춤 식단표", "생활습관 가이드"]', '체질 이해, 맞춤 건강관리, 질병 예방', 'Understand your constitution, personalized health care, disease prevention', '了解体质，个性化健康管理，预防疾病', 'K-한방의 핵심인 사상체질을 분석하고 맞춤 건강법을 제공합니다.', 'Analyze Sasang constitution (core of K-medicine) and provide personalized health methods.', '分析四象体质（韩医学核心）并提供个性化健康方法。', 4),

-- 복합 웰니스 패키지
('WP-COMBO-001', 'GS-HAN-001', '검진 후 종합 한방 케어', 'Post-Checkup Comprehensive Korean Medicine Care', '体检后综合韩医护理', '検診後総合韓方ケア', 'Chăm sóc Y học Hàn Quốc toàn diện sau khám', '한방테라피', '["검진 후 케어", "종합 건강관리"]', 120, 3, 450000, 380, '["침·뜸·추나 복합", "체질 분석", "맞춤 한약재", "생활 가이드"]', '검진 결과 기반 맞춤 치료, 질병 예방, 건강 증진', 'Customized treatment based on checkup results, disease prevention, health promotion', '基于体检结果的定制治疗，疾病预防，健康促进', '건강검진 결과에 따라 침·뜸·추나를 조합한 종합 한방 케어 프로그램입니다.', 'Comprehensive Korean medicine care combining acupuncture, moxibustion, and Chuna based on checkup results.', '根据健康体检结果组合针灸、艾灸、推拿的综合韩医护理项目。', 5);

-- 4. 샘플 예약 데이터 (테스트용)
INSERT INTO medical_bookings (id, customer_name, customer_email, customer_phone, customer_country, customer_gender, customer_age, health_package_id, checkup_date, checkup_time, wellness_program_id, needs_interpreter, interpreter_language, needs_transportation, needs_accommodation, hotel_nights, total_price_krw, total_price_usd, booking_status) VALUES
('MB-001', '王小明', 'wang@example.com', '+86-138-1234-5678', 'CN', '남성', 45, 'PKG-FULL-001', '2026-02-15', '09:00', 'WP-ACUP-001', 1, '중국어', 1, 1, 2, 660000, 550, '확인'),
('MB-002', 'Nguyen Van A', 'nguyen@example.com', '+84-90-123-4567', 'VN', '여성', 38, 'PKG-BASIC-001', '2026-02-20', '10:00', 'WP-CHUNA-001', 1, '베트남어', 1, 1, 1, 430000, 360, '신청'),
('MB-003', '陳美玲', 'chen@example.com', '+886-912-345-678', 'TW', '여성', 52, 'PKG-CANCER-001', '2026-03-01', '09:00', 'WP-COMBO-001', 1, '중국어', 1, 1, 3, 1300000, 1090, '신청');
