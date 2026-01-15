-- K-Taste Route Seed Data
-- Sample Data for Development and Testing

-- Sample Restaurants (맛집 샘플 데이터)

-- 수도권 - 서울 노포
INSERT INTO restaurants (name_ko, name_en, name_ja, name_zh, region, sector, city, address, cuisine_type, avg_price, local_score, gov_certified, airport_priority, description_ko, description_en, description_ja, description_zh, status)
VALUES 
('이문설농탕', 'Imun Seolleongtang', '李門雪濃湯', '李门雪浓汤', '수도권', '노포', '서울시 종로구', '서울특별시 종로구 돈화문로 152', '설렁탕', 15000, 95, 1, '1순위', '1904년부터 100년 이상 이어온 전통 설렁탕 노포입니다. 진한 사골 육수와 부드러운 고기가 일품입니다.', 'Traditional seolleongtang (ox bone soup) restaurant established in 1904. Famous for rich bone broth and tender meat.', '1904年創業の伝統的なソルロンタン（牛骨スープ）の老舗です。', '1904年创业的传统雪浓汤老店。', '운영'),

('광장시장 육회', 'Gwangjang Market Yukhoe', '広蔵市場ユッケ', '广藏市场生拌牛肉', '수도권', '전통시장', '서울시 종로구', '서울특별시 종로구 창경궁로 88 광장시장', '육회', 20000, 90, 1, '1순위', '서울에서 가장 오래된 전통시장 광장시장의 명물 육회입니다. 신선한 생고기에 배와 참기름으로 버무립니다.', 'Famous yukhoe (Korean beef tartare) at Seoul''s oldest traditional market. Fresh raw beef mixed with pear and sesame oil.', 'ソウルで最も古い伝統市場、広蔵市場の名物ユッケです。', '首尔最古老传统市场广藏市场的著名生拌牛肉。', '운영'),

-- 경상권 - 부산
('삼진어묵 본점', 'Samjin Eomuk Main Store', '三進おでん本店', '三进鱼糕总店', '경상도', '공항권', '부산시 영도구', '부산광역시 영도구 태종로 99', '어묵', 8000, 88, 1, '1순위', '1953년 창업한 부산 대표 어묵 전문점입니다. 신선한 생선 살로 만든 수제 어묵이 유명합니다.', 'Busan''s representative fish cake specialty store established in 1953. Famous for handmade fish cakes.', '1953年創業の釜山を代表する練り物専門店です。', '1953年创立的釜山代表性鱼糕专门店。', '운영'),

('범일동 돼지국밥', 'Beomil-dong Dwaeji Gukbap', '凡一洞豚クッパ', '凡一洞猪肉汤饭', '경상도', '노포', '부산시 동구', '부산광역시 동구 중앙대로 243', '돼지국밥', 9000, 92, 1, '1순위', '1946년부터 이어온 부산 원조 돼지국밥집입니다. 진한 돼지뼈 육수에 수육이 듬뿍 들어갑니다.', 'Original Busan pork soup rice restaurant since 1946. Rich pork bone broth with tender meat.', '1946年から続く釜山元祖豚クッパ店です。', '1946年起的釜山原祖猪肉汤饭店。', '운영'),

-- 전라권 - 전주
('전주 한옥마을 콩나물국밥', 'Jeonju Hanok Village Kongnamul Gukbap', '全州韓屋村もやしクッパ', '全州韩屋村豆芽汤饭', '전라도', '향토음식', '전주시 완산구', '전라북도 전주시 완산구 은행로 64', '콩나물국밥', 7000, 94, 1, '2순위', '전주를 대표하는 해장 음식 콩나물국밥입니다. 시원한 콩나물국에 밥을 말아먹는 토렴식이 특징입니다.', 'Representative Jeonju hangover soup with bean sprouts. Features unique ''toryeom'' style of serving rice in broth.', '全州を代表する二日酔い料理、もやしクッパです。', '全州代表性的解酒汤豆芽汤饭。', '운영'),

('남부시장 야시장', 'Nambu Night Market', '南部市場夜市', '南部市场夜市', '전라도', '전통시장', '전주시 완산구', '전라북도 전주시 완산구 풍남문2길 63', '야시장', 15000, 89, 1, '2순위', '전주 남부시장의 먹거리 야시장입니다. 전주 비빔밥, 막걸리, 전통 주전부리를 즐길 수 있습니다.', 'Jeonju Nambu Market food night market. Enjoy Jeonju bibimbap, makgeolli and traditional snacks.', '全州南部市場の食べ物夜市です。', '全州南部市场美食夜市。', '운영'),

-- 강원권
('속초 아바이마을 순대', 'Sokcho Abai Village Sundae', '束草アバイ村スンデ', '束草阿爸村血肠', '강원도', '향토음식', '속초시', '강원도 속초시 청호로 122', '오징어순대', 12000, 91, 1, '2순위', '속초의 실향민 마을 아바이마을의 명물 오징어순대입니다. 신선한 오징어에 야채와 당면을 넣어 쪘습니다.', 'Famous squid sundae from Sokcho''s Abai Village. Fresh squid stuffed with vegetables and glass noodles.', '束草の離散家族村、アバイ村の名物イカスンデです。', '束草失乡民村阿爸村的著名鱿鱼血肠。', '운영'),

('강릉 초당순두부마을', 'Gangneung Chodang Sundubu Village', '江陵草堂純豆腐村', '江陵草堂嫩豆腐村', '강원도', '자연권', '강릉시', '강원도 강릉시 초당순두부길 77', '순두부', 10000, 93, 1, '2순위', '강릉 초당동의 바닷물로 만든 순두부 마을입니다. 고소하고 부드러운 순두부가 일품입니다.', 'Soft tofu village in Gangneung made with seawater. Famous for savory and smooth tofu.', '江陵草堂洞の海水で作った純豆腐村です。', '江陵草堂洞用海水制作的嫩豆腐村。', '운영'),

-- 충청권
('공주 밤국수', 'Gongju Bam Guksu', '公州栗麺', '公州栗子面', '충청도', '향토음식', '공주시', '충청남도 공주시 백제큰길 19', '밤국수', 8000, 87, 1, '2순위', '공주의 특산물인 알밤으로 만든 국수입니다. 구수한 밤 육수가 특징입니다.', 'Noodle soup made with Gongju''s specialty chestnuts. Features savory chestnut broth.', '公州の特産物である栗で作った麺です。', '用公州特产栗子制作的面条。', '운영'),

-- 제주도
('제주 올레시장 몸국', 'Jeju Olle Market Mom-guk', '済州オレ市場モムグク', '济州偶来市场妈妈汤', '제주도', '전통시장', '제주시', '제주특별자치도 제주시 관덕로14길 20', '몸국', 11000, 90, 1, '1순위', '제주 전통 해장국 몸국입니다. 돼지 내장을 깨끗이 손질하여 구수한 국물로 끓입니다.', 'Traditional Jeju hangover soup with pork offal. Clean preparation with savory broth.', '済州伝統の二日酔いスープ、モムグクです。', '济州传统解酒汤妈妈汤。', '운영');

-- Sample Reviews (후기 샘플)
INSERT INTO reviews (restaurant_id, user_country, visit_date, content_original, content_ko, rating, approved)
SELECT id, 'JP', '2026-01-10', '정말 맛있었어요! 서울에 오면 꼭 다시 방문하고 싶습니다.', '정말 맛있었어요! 서울에 오면 꼭 다시 방문하고 싶습니다.', 5, 1
FROM restaurants WHERE name_ko = '이문설농탕';

INSERT INTO reviews (restaurant_id, user_country, visit_date, content_original, content_ko, rating, approved)
SELECT id, 'CN', '2026-01-08', '육회가 너무 신선하고 맛있었습니다. 한국의 전통시장 분위기도 좋았어요.', '육회가 너무 신선하고 맛있었습니다. 한국의 전통시장 분위기도 좋았어요.', 5, 1
FROM restaurants WHERE name_ko = '광장시장 육회';

INSERT INTO reviews (restaurant_id, user_country, visit_date, content_original, content_ko, rating, approved)
SELECT id, 'TW', '2026-01-05', '부산 여행 중 최고의 식사였습니다. 어묵이 정말 쫄깃하고 맛있어요!', '부산 여행 중 최고의 식사였습니다. 어묵이 정말 쫄깃하고 맛있어요!', 5, 1
FROM restaurants WHERE name_ko = '삼진어묵 본점';

-- Sample Travel Packages (여행상품 샘플)
INSERT INTO packages (title_ko, title_en, title_ja, title_zh, duration, regions, price_budget, price_standard, price_premium, hotel_grade, description_ko, description_en, status)
VALUES 
('수도권 노포 미식 투어 3박4일', 'Seoul Old Restaurant Tour 3N4D', 'ソウル老舗グルメツアー3泊4日', '首尔老店美食之旅3晚4天', '3박4일', '["수도권"]', 700, 1100, 1800, '3성급', '서울의 100년 전통 노포를 중심으로 한 미식 투어입니다. 설렁탕, 냉면, 육회 등 전통 음식을 맛볼 수 있습니다.', 'Culinary tour centered on Seoul''s 100-year-old traditional restaurants. Taste seolleongtang, naengmyeon, yukhoe.', '판매중'),

('부산 경상도 해안 미식 투어 4박5일', 'Busan Gyeongsang Coastal Cuisine Tour 4N5D', '釜山慶尚道海岸グルメツアー4泊5日', '釜山庆尚道海岸美食之旅4晚5天', '4박5일', '["경상도"]', 800, 1300, 2100, '4성급', '부산과 경상도 해안을 따라 신선한 해산물과 돼지국밥을 즐기는 투어입니다.', 'Tour along Busan and Gyeongsang coast enjoying fresh seafood and pork soup rice.', '판매중'),

('전라도 남도 한정식 투어 4박5일', 'Jeolla Province Korean Table d''Hote Tour 4N5D', '全羅道韓定食ツアー4泊5日', '全罗道韩定食之旅4晚5天', '4박5일', '["전라도"]', 750, 1250, 2000, '한옥스테이', '전라도의 풍성한 한정식과 전통 음식을 맛보는 미식 여행입니다.', 'Culinary journey tasting Jeolla''s abundant Korean table d''hote and traditional foods.', '판매중'),

('강원도 산과 바다 미식 투어 3박4일', 'Gangwon Mountain & Sea Cuisine Tour 3N4D', '江原道山と海グルメツアー3泊4日', '江原道山海美食之旅3晚4天', '3박4일', '["강원도"]', 650, 1050, 1700, '리조트', '강원도의 청정 자연에서 나는 산나물과 신선한 해산물을 즐기는 투어입니다.', 'Tour enjoying wild vegetables and fresh seafood from Gangwon''s pristine nature.', '판매중');
