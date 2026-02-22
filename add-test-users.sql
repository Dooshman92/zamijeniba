-- Skripta za dodavanje 20 test korisnika sa raznovrsnim oglasima
-- Koristimo postojećeg korisnika i dodajemo raznovrsne oglase

-- Korisnici koji postoje:
-- e381320a-d720-41a3-8d19-592ae67873db - marko_petrovic
-- 5838c73a-c828-40a0-8ecd-69e902041a06 - medina
-- b07416f1-102a-485f-a5dd-38f16fb559dd - Dooshman

-- AUTOMOBILI
INSERT INTO cars (user_id, vehicle_type, make, model, year, price, mileage, fuel_type, transmission, power_kw, power_hp, doors, body_type, color, description, location, city, status, is_featured, featured_until, images, equipment_features) VALUES

-- BMW 5 Series
('e381320a-d720-41a3-8d19-592ae67873db', 'automobile', 'BMW', '520d', 2019, 32000, 85000, 'diesel', 'automatic', 140, 190, '4', 'sedan', 'Crna', 'BMW 520d xDrive, full oprema, panorama krov, Harman Kardon, Head-Up Display, kožna sjedišta, LED farovi, parking senzori naprijed i nazad, keyless entry.', 'Sarajevo', 'Sarajevo', 'active', true, NOW() + INTERVAL '15 days',
ARRAY['https://images.pexels.com/photos/164634/pexels-photo-164634.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/210019/pexels-photo-210019.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/3752169/pexels-photo-3752169.jpeg?auto=compress&cs=tinysrgb&w=800'],
'{"klimatizacija": true, "grijanje_sjedista": true, "parking_senzori": true, "tempomat": true, "start_stop": true, "bluetooth": true, "multimedija_ekran": true, "dvozonska_klima": true, "navigacija": true, "kozna_sjedista": true, "xenon_led": true, "el_podizaci": true}'),

-- Mercedes-Benz C-Class
('5838c73a-c828-40a0-8ecd-69e902041a06', 'automobile', 'Mercedes-Benz', 'C220d', 2020, 38000, 65000, 'diesel', 'automatic', 143, 194, '4', 'sedan', 'Srebrna', 'Mercedes C220d Avantgarde, MBUX sistem, digitalna komandna tabla, ambijentalno osvjetljenje, Burmester audio, kamera 360°, parking asistent.', 'Beograd', 'Beograd', 'active', true, NOW() + INTERVAL '20 days',
ARRAY['https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1035108/pexels-photo-1035108.jpeg?auto=compress&cs=tinysrgb&w=800'],
'{"klimatizacija": true, "grijanje_sjedista": true, "parking_senzori": true, "tempomat": true, "start_stop": true, "bluetooth": true, "multimedija_ekran": true, "dvozonska_klima": true, "navigacija": true, "kozna_sjedista": true, "xenon_led": true, "el_podizaci": true, "panorama_krov": true}'),

-- Audi A4
('b07416f1-102a-485f-a5dd-38f16fb559dd', 'automobile', 'Audi', 'A4 Quattro', 2018, 28000, 95000, 'diesel', 'automatic', 140, 190, '4', 'sedan', 'Plava', 'Audi A4 2.0 TDI Quattro S-Line, MMI navigacija, Virtual Cockpit, Matrix LED, alcantara sjedišta, sportska sjedišta.', 'Mostar', 'Mostar', 'active', false, NULL,
ARRAY['https://images.pexels.com/photos/2526128/pexels-photo-2526128.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/244206/pexels-photo-244206.jpeg?auto=compress&cs=tinysrgb&w=800'],
'{"klimatizacija": true, "grijanje_sjedista": true, "parking_senzori": true, "tempomat": true, "start_stop": true, "bluetooth": true, "multimedija_ekran": true, "dvozonska_klima": true, "navigacija": true, "kozna_sjedista": true, "xenon_led": true, "el_podizaci": true}'),

-- MOTOCIKLI
-- Yamaha MT-07
('e381320a-d720-41a3-8d19-592ae67873db', 'motorcycle', 'Yamaha', 'MT-07', 2021, 7500, 8500, 'petrol', 'manual', 54, 73, NULL, NULL, 'Plava', 'Yamaha MT-07 u odličnom stanju, redovno održavan, ABS, novi Michelin gume, garažiran.', 'Sarajevo', 'Sarajevo', 'active', true, NOW() + INTERVAL '10 days',
ARRAY['https://images.pexels.com/photos/1413412/pexels-photo-1413412.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/2116721/pexels-photo-2116721.jpeg?auto=compress&cs=tinysrgb&w=800'],
'{"abs": true}'),

-- Honda CBR650R
('5838c73a-c828-40a0-8ecd-69e902041a06', 'motorcycle', 'Honda', 'CBR650R', 2020, 9200, 12000, 'petrol', 'manual', 70, 95, NULL, NULL, 'Crvena', 'Honda CBR650R sportski motor, odlično očuvan, ABS, full LED rasvjeta, brza mjenjač, Akrapovic auspuh.', 'Beograd', 'Beograd', 'active', false, NULL,
ARRAY['https://images.pexels.com/photos/2393816/pexels-photo-2393816.jpeg?auto=compress&cs=tinysrgb&w=800'],
'{"abs": true}'),

-- Kawasaki Z900
('b07416f1-102a-485f-a5dd-38f16fb559dd', 'motorcycle', 'Kawasaki', 'Z900', 2019, 8500, 15000, 'petrol', 'manual', 92, 125, NULL, NULL, 'Zelena', 'Kawasaki Z900 naked bike, full oprema, ABS, kontrola trakcije, grijači ručki, Yoshimura auspuh.', 'Mostar', 'Mostar', 'active', true, NOW() + INTERVAL '12 days',
ARRAY['https://images.pexels.com/photos/159192/vespa-rolled-roller-vintage-159192.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/2519370/pexels-photo-2519370.jpeg?auto=compress&cs=tinysrgb&w=800'],
'{"abs": true}'),

-- Ducati Monster 821
('e381320a-d720-41a3-8d19-592ae67873db', 'motorcycle', 'Ducati', 'Monster 821', 2018, 10500, 18000, 'petrol', 'manual', 80, 109, NULL, NULL, 'Crvena', 'Ducati Monster 821, testastretta motor, ABS, kontrola trakcije, quick shifter, carbon dijelovi, kompletna servisna istorija.', 'Sarajevo', 'Sarajevo', 'active', false, NULL,
ARRAY['https://images.pexels.com/photos/157675/motorcycle-tour-tyrol-machine-157675.jpeg?auto=compress&cs=tinysrgb&w=800'],
'{"abs": true}'),

-- JET SKI
-- Yamaha VX Cruiser
('5838c73a-c828-40a0-8ecd-69e902041a06', 'jetski', 'Yamaha', 'VX Cruiser', 2020, 12000, 65, 'petrol', 'automatic', 80, 110, NULL, NULL, 'Plava', 'Yamaha VX Cruiser jet ski u perfektnom stanju, 3 sjedišta, cruise control, GPS, prikolica uključena, vrlo malo korišten.', 'Novi Sad', 'Novi Sad', 'active', true, NOW() + INTERVAL '25 days',
ARRAY['https://images.pexels.com/photos/1666021/pexels-photo-1666021.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/163236/luxury-yacht-boat-speed-water-163236.jpeg?auto=compress&cs=tinysrgb&w=800'],
'{}'),

-- Sea-Doo GTI SE
('b07416f1-102a-485f-a5dd-38f16fb559dd', 'jetski', 'Sea-Doo', 'GTI SE 170', 2021, 14500, 45, 'petrol', 'automatic', 125, 170, NULL, NULL, 'Žuta', 'Sea-Doo GTI SE 170, top stanje, IBR kočioni sistem, Bluetooth audio, Step sistem za lake ulazak, LCD ekran.', 'Banja Luka', 'Banja Luka', 'active', true, NOW() + INTERVAL '18 days',
ARRAY['https://images.pexels.com/photos/2166927/pexels-photo-2166927.jpeg?auto=compress&cs=tinysrgb&w=800'],
'{}'),

-- Kawasaki Ultra 310LX
('e381320a-d720-41a3-8d19-592ae67873db', 'jetski', 'Kawasaki', 'Ultra 310LX', 2019, 16000, 120, 'petrol', 'automatic', 228, 310, NULL, NULL, 'Zelena', 'Kawasaki Ultra 310LX najsnažniji jet ski, cruise control, elektronska kontrola stabilnosti, GPS, audio sistem, kompletna oprema.', 'Sarajevo', 'Sarajevo', 'active', false, NULL,
ARRAY['https://images.pexels.com/photos/1430676/pexels-photo-1430676.jpeg?auto=compress&cs=tinysrgb&w=800'],
'{}'),

-- QUADOVI (ATV)
-- Can-Am Outlander 650
('5838c73a-c828-40a0-8ecd-69e902041a06', 'quad', 'Can-Am', 'Outlander 650 XT', 2020, 11000, 2800, 'petrol', 'automatic', 48, 65, NULL, NULL, 'Crvena', 'Can-Am Outlander 650 XT, 4x4, vitlo, LED farovi, digital display, podgrijani rukohvati, deflock, odličan za teren.', 'Beograd', 'Beograd', 'active', true, NOW() + INTERVAL '14 days',
ARRAY['https://images.pexels.com/photos/163210/motorcycles-race-helmets-pilots-163210.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1149137/pexels-photo-1149137.jpeg?auto=compress&cs=tinysrgb&w=800'],
'{}'),

-- Yamaha Grizzly 700
('b07416f1-102a-485f-a5dd-38f16fb559dd', 'quad', 'Yamaha', 'Grizzly 700', 2019, 9500, 4200, 'petrol', 'automatic', 52, 70, NULL, NULL, 'Zelena', 'Yamaha Grizzly 700 EPS 4x4, power steering, elektronska mjena brzina, novi gume, vitlo, zaštitni okvir.', 'Mostar', 'Mostar', 'active', false, NULL,
ARRAY['https://images.pexels.com/photos/1149831/pexels-photo-1149831.jpeg?auto=compress&cs=tinysrgb&w=800'],
'{}'),

-- Polaris Sportsman 850
('e381320a-d720-41a3-8d19-592ae67873db', 'quad', 'Polaris', 'Sportsman 850', 2021, 12500, 1500, 'petrol', 'automatic', 63, 85, NULL, NULL, 'Plava', 'Polaris Sportsman 850 kao nov, elektronski servo volan, Active Descent Control, deflock, LED rasvjeta, produžena garancija.', 'Sarajevo', 'Sarajevo', 'active', true, NOW() + INTERVAL '22 days',
ARRAY['https://images.pexels.com/photos/39663/motorcycle-racer-racing-race-39663.jpeg?auto=compress&cs=tinysrgb&w=800'],
'{}'),

-- Honda TRX 500
('5838c73a-c828-40a0-8ecd-69e902041a06', 'quad', 'Honda', 'TRX 500 Foreman', 2018, 7800, 6500, 'petrol', 'manual', 37, 50, NULL, NULL, 'Crvena', 'Honda TRX 500 Foreman robustan quad za rad i rekreaciju, 4x4, vitlo, zadnji diferencial, idealan za farmu.', 'Beograd', 'Beograd', 'active', false, NULL,
ARRAY['https://images.pexels.com/photos/104842/bmw-vehicle-ride-bike-104842.jpeg?auto=compress&cs=tinysrgb&w=800'],
'{}'),

-- MOTORNE SANKE (SNOWMOBILE)
-- Ski-Doo Summit X 850
('b07416f1-102a-485f-a5dd-38f16fb559dd', 'snowmobile', 'Ski-Doo', 'Summit X 850', 2021, 15000, 850, 'petrol', 'automatic', 119, 162, NULL, NULL, 'Bijela', 'Ski-Doo Summit X 850 E-TEC Turbo, Mountain Edition, REV Gen4 šasija, RAS X prednji sistem, podgrijani rukohvati i sjedalo.', 'Pale', 'Pale', 'active', true, NOW() + INTERVAL '30 days',
ARRAY['https://images.pexels.com/photos/8327840/pexels-photo-8327840.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/8327849/pexels-photo-8327849.jpeg?auto=compress&cs=tinysrgb&w=800'],
'{}'),

-- Polaris 850 Switchback
('e381320a-d720-41a3-8d19-592ae67873db', 'snowmobile', 'Polaris', '850 Switchback Assault', 2020, 13500, 1200, 'petrol', 'automatic', 119, 162, NULL, NULL, 'Crna', 'Polaris 850 Switchback Assault, AXYS šasija, Walker Evans amortizeri, elektronska kontrola, LED rasvjeta, kao nova.', 'Sarajevo', 'Sarajevo', 'active', true, NOW() + INTERVAL '28 days',
ARRAY['https://images.pexels.com/photos/8327857/pexels-photo-8327857.jpeg?auto=compress&cs=tinysrgb&w=800'],
'{}'),

-- Yamaha Sidewinder L-TX GT
('5838c73a-c828-40a0-8ecd-69e902041a06', 'snowmobile', 'Yamaha', 'Sidewinder L-TX GT', 2019, 14000, 1800, 'petrol', 'automatic', 134, 180, NULL, NULL, 'Plava', 'Yamaha Sidewinder L-TX GT turbo, najbrža serijska motorna sanka, Fox Float 3 amortizeri, grijano vjetrobransko staklo.', 'Kopaonik', 'Kopaonik', 'active', false, NULL,
ARRAY['https://images.pexels.com/photos/8327837/pexels-photo-8327837.jpeg?auto=compress&cs=tinysrgb&w=800'],
'{}'),

-- Arctic Cat ZR 8000
('b07416f1-102a-485f-a5dd-38f16fb559dd', 'snowmobile', 'Arctic Cat', 'ZR 8000 RR', 2020, 12800, 1500, 'petrol', 'automatic', 134, 180, NULL, NULL, 'Zelena', 'Arctic Cat ZR 8000 RR racing sanka, odlična za stazu, FOX QS3 amortizeri, PowerClaw gusenica, elektronski startovan.', 'Jahorina', 'Jahorina', 'active', true, NOW() + INTERVAL '25 days',
ARRAY['https://images.pexels.com/photos/8327842/pexels-photo-8327842.jpeg?auto=compress&cs=tinysrgb&w=800'],
'{}'),

-- DODATNI AUTOMOBILI
-- Volkswagen Golf GTI
('e381320a-d720-41a3-8d19-592ae67873db', 'automobile', 'Volkswagen', 'Golf GTI', 2020, 28000, 45000, 'petrol', 'manual', 180, 245, '5', 'hatchback', 'Crvena', 'VW Golf 8 GTI Performance, DCC adaptivni podvozak, digitalna komandna tabla, adaptive cruise, Harman Kardon.', 'Sarajevo', 'Sarajevo', 'active', false, NULL,
ARRAY['https://images.pexels.com/photos/3802508/pexels-photo-3802508.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1592384/pexels-photo-1592384.jpeg?auto=compress&cs=tinysrgb&w=800'],
'{"klimatizacija": true, "parking_senzori": true, "tempomat": true, "start_stop": true, "bluetooth": true, "multimedija_ekran": true, "navigacija": true, "xenon_led": true, "el_podizaci": true}'),

-- Porsche Cayenne
('5838c73a-c828-40a0-8ecd-69e902041a06', 'automobile', 'Porsche', 'Cayenne S', 2019, 72000, 58000, 'petrol', 'automatic', 324, 440, '5', 'suv', 'Siva', 'Porsche Cayenne S V6 Turbo, Air Suspension, Sport Chrono paket, panorama krov, BOSE audio, 21 inch Turbo felge.', 'Beograd', 'Beograd', 'active', true, NOW() + INTERVAL '35 days',
ARRAY['https://images.pexels.com/photos/164634/pexels-photo-164634.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1545743/pexels-photo-1545743.jpeg?auto=compress&cs=tinysrgb&w=800'],
'{"klimatizacija": true, "grijanje_sjedista": true, "parking_senzori": true, "tempomat": true, "start_stop": true, "bluetooth": true, "multimedija_ekran": true, "dvozonska_klima": true, "navigacija": true, "kozna_sjedista": true, "xenon_led": true, "el_podizaci": true, "panorama_krov": true}'),

-- Range Rover Sport
('b07416f1-102a-485f-a5dd-38f16fb559dd', 'automobile', 'Land Rover', 'Range Rover Sport', 2018, 58000, 72000, 'diesel', 'automatic', 225, 306, '5', 'suv', 'Crna', 'Range Rover Sport HSE Dynamic, Meridian audio, adaptive dynamics, panorama, massage sjedišta, head-up display.', 'Mostar', 'Mostar', 'active', true, NOW() + INTERVAL '40 days',
ARRAY['https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?auto=compress&cs=tinysrgb&w=800'],
'{"klimatizacija": true, "grijanje_sjedista": true, "parking_senzori": true, "tempomat": true, "start_stop": true, "bluetooth": true, "multimedija_ekran": true, "dvozonska_klima": true, "navigacija": true, "kozna_sjedista": true, "xenon_led": true, "el_podizaci": true, "panorama_krov": true}');
