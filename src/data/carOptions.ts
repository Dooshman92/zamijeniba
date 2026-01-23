export const carBrands = [
  'Audi',
  'BMW',
  'Mercedes-Benz',
  'Volkswagen',
  'Opel',
  'Ford',
  'Renault',
  'Peugeot',
  'Citroën',
  'Fiat',
  'Alfa Romeo',
  'Toyota',
  'Honda',
  'Mazda',
  'Nissan',
  'Hyundai',
  'Kia',
  'Škoda',
  'SEAT',
  'Volvo',
  'Porsche',
  'Chevrolet',
  'Dacia',
  'Suzuki',
  'Subaru',
  'Mitsubishi',
  'Lexus',
  'Jeep',
  'Land Rover',
  'Jaguar',
  'Tesla',
  'Mini',
  'Smart',
  'Lancia',
  'Saab',
  'Ostalo'
];

export const carModels: Record<string, string[]> = {
  'Audi': ['A1', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'Q2', 'Q3', 'Q5', 'Q7', 'Q8', 'TT', 'R8', 'e-tron', 'RS3', 'RS4', 'RS5', 'RS6', 'RS7', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'SQ5', 'SQ7', 'Ostalo'],
  'BMW': ['Serija 1', 'Serija 2', 'Serija 3', 'Serija 4', 'Serija 5', 'Serija 6', 'Serija 7', 'Serija 8', 'X1', 'X2', 'X3', 'X4', 'X5', 'X6', 'X7', 'Z4', 'i3', 'i4', 'iX', 'M2', 'M3', 'M4', 'M5', 'M6', 'M8', 'X5 M', 'X6 M', 'Ostalo'],
  'Mercedes-Benz': ['A klasa', 'B klasa', 'C klasa', 'E klasa', 'S klasa', 'CLA', 'CLS', 'GLA', 'GLB', 'GLC', 'GLE', 'GLS', 'G klasa', 'V klasa', 'Vito', 'Sprinter', 'EQA', 'EQB', 'EQC', 'EQE', 'EQS', 'AMG GT', 'SL', 'SLC', 'Ostalo'],
  'Volkswagen': ['Golf', 'Polo', 'Passat', 'Tiguan', 'Touareg', 'T-Roc', 'T-Cross', 'Arteon', 'Jetta', 'Touran', 'Sharan', 'Caddy', 'Transporter', 'Up!', 'ID.3', 'ID.4', 'ID.5', 'Scirocco', 'Beetle', 'CC', 'Ostalo'],
  'Opel': ['Corsa', 'Astra', 'Insignia', 'Mokka', 'Crossland', 'Grandland', 'Zafira', 'Combo', 'Vivaro', 'Movano', 'Adam', 'Karl', 'Meriva', 'Antara', 'Vectra', 'Omega', 'Ostalo'],
  'Ford': ['Fiesta', 'Focus', 'Mondeo', 'Kuga', 'Puma', 'EcoSport', 'Edge', 'Explorer', 'Mustang', 'Transit', 'Transit Connect', 'Ranger', 'Galaxy', 'S-MAX', 'Ka+', 'B-MAX', 'C-MAX', 'Ostalo'],
  'Renault': ['Clio', 'Captur', 'Megane', 'Kadjar', 'Koleos', 'Scenic', 'Grand Scenic', 'Talisman', 'Twingo', 'Zoe', 'Kangoo', 'Trafic', 'Master', 'Espace', 'Laguna', 'Fluence', 'Ostalo'],
  'Peugeot': ['108', '208', '308', '508', '2008', '3008', '5008', 'Rifter', 'Partner', 'Expert', 'Boxer', 'e-208', 'e-2008', 'Traveller', '207', '307', '407', 'Ostalo'],
  'Citroën': ['C1', 'C3', 'C3 Aircross', 'C4', 'C4 Cactus', 'C5', 'C5 Aircross', 'Berlingo', 'SpaceTourer', 'Jumpy', 'Jumper', 'ë-C4', 'DS3', 'DS4', 'DS5', 'Ostalo'],
  'Fiat': ['500', '500X', '500L', 'Panda', 'Tipo', 'Punto', 'Uno', 'Doblo', 'Ducato', 'Fiorino', 'Bravo', 'Stilo', 'Croma', 'Multipla', 'Ostalo'],
  'Alfa Romeo': ['Giulia', 'Giulietta', 'Stelvio', 'Tonale', 'MiTo', '159', '156', '147', 'GT', 'Spider', 'Brera', 'Ostalo'],
  'Toyota': ['Yaris', 'Corolla', 'Camry', 'Avensis', 'Auris', 'RAV4', 'C-HR', 'Highlander', 'Land Cruiser', 'Prius', 'Aygo', 'Verso', 'Proace', 'Hilux', 'GT86', 'Supra', 'bZ4X', 'Ostalo'],
  'Honda': ['Civic', 'Accord', 'Jazz', 'CR-V', 'HR-V', 'e', 'Insight', 'City', 'FR-V', 'Legend', 'Pilot', 'Ridgeline', 'Ostalo'],
  'Mazda': ['2', '3', '6', 'CX-3', 'CX-30', 'CX-5', 'CX-60', 'MX-5', 'MX-30', 'RX-8', 'Premacy', 'Ostalo'],
  'Nissan': ['Micra', 'Juke', 'Qashqai', 'X-Trail', 'Leaf', 'Ariya', 'Note', 'Pulsar', 'Navara', 'Pathfinder', 'GT-R', '370Z', 'Primera', 'Almera', 'Ostalo'],
  'Hyundai': ['i10', 'i20', 'i30', 'i40', 'Tucson', 'Kona', 'Santa Fe', 'Ioniq', 'Ioniq 5', 'Ioniq 6', 'Bayon', 'Palisade', 'Elantra', 'Sonata', 'Genesis', 'Ostalo'],
  'Kia': ['Picanto', 'Rio', 'Ceed', 'Stonic', 'XCeed', 'Sportage', 'Sorento', 'Niro', 'EV6', 'Soul', 'Proceed', 'Optima', 'Stinger', 'Carnival', 'Ostalo'],
  'Škoda': ['Fabia', 'Scala', 'Octavia', 'Superb', 'Kamiq', 'Karoq', 'Kodiaq', 'Enyaq', 'Rapid', 'Citigo', 'Yeti', 'Roomster', 'Ostalo'],
  'SEAT': ['Ibiza', 'Leon', 'Arona', 'Ateca', 'Tarraco', 'Mii', 'Toledo', 'Alhambra', 'Exeo', 'Altea', 'Cupra Formentor', 'Cupra Leon', 'Ostalo'],
  'Volvo': ['V40', 'V60', 'V90', 'S60', 'S90', 'XC40', 'XC60', 'XC90', 'C40', 'EX30', 'EX90', 'C30', 'C70', 'S40', 'Ostalo'],
  'Porsche': ['911', 'Boxster', 'Cayman', 'Panamera', 'Macan', 'Cayenne', 'Taycan', '718', 'Ostalo'],
  'Chevrolet': ['Spark', 'Aveo', 'Cruze', 'Malibu', 'Camaro', 'Corvette', 'Trax', 'Captiva', 'Tahoe', 'Silverado', 'Suburban', 'Equinox', 'Blazer', 'Ostalo'],
  'Dacia': ['Sandero', 'Logan', 'Duster', 'Lodgy', 'Dokker', 'Spring', 'Jogger', 'Ostalo'],
  'Suzuki': ['Swift', 'Vitara', 'S-Cross', 'Ignis', 'Baleno', 'Jimny', 'Celerio', 'Alto', 'SX4', 'Grand Vitara', 'Ostalo'],
  'Subaru': ['Impreza', 'Legacy', 'Outback', 'Forester', 'XV', 'BRZ', 'Levorg', 'WRX', 'Ostalo'],
  'Mitsubishi': ['Colt', 'Lancer', 'ASX', 'Eclipse Cross', 'Outlander', 'Pajero', 'L200', 'Space Star', 'Grandis', 'Ostalo'],
  'Lexus': ['IS', 'ES', 'GS', 'LS', 'UX', 'NX', 'RX', 'LX', 'LC', 'RC', 'CT', 'Ostalo'],
  'Jeep': ['Renegade', 'Compass', 'Cherokee', 'Grand Cherokee', 'Wrangler', 'Gladiator', 'Wagoneer', 'Avenger', 'Ostalo'],
  'Land Rover': ['Defender', 'Discovery', 'Discovery Sport', 'Range Rover', 'Range Rover Sport', 'Range Rover Evoque', 'Range Rover Velar', 'Freelander', 'Ostalo'],
  'Jaguar': ['XE', 'XF', 'XJ', 'F-Pace', 'E-Pace', 'I-Pace', 'F-Type', 'X-Type', 'S-Type', 'Ostalo'],
  'Tesla': ['Model 3', 'Model S', 'Model X', 'Model Y', 'Roadster', 'Cybertruck', 'Ostalo'],
  'Mini': ['Cooper', 'Cooper S', 'One', 'Countryman', 'Clubman', 'Paceman', 'Convertible', 'Electric', 'Ostalo'],
  'Smart': ['Fortwo', 'Forfour', 'Roadster', 'EQ Fortwo', 'EQ Forfour', 'Ostalo'],
  'Lancia': ['Ypsilon', 'Delta', 'Musa', 'Thema', 'Voyager', 'Phedra', 'Ostalo'],
  'Saab': ['9-3', '9-5', '900', '9000', '9-4X', '9-7X', 'Ostalo'],
  'Ostalo': ['Ostalo']
};

export const carColors = [
  'Bijela',
  'Crna',
  'Siva',
  'Srebrna',
  'Plava',
  'Crvena',
  'Zelena',
  'Žuta',
  'Narančasta',
  'Smeđa',
  'Bež',
  'Zlatna',
  'Ljubičasta',
  'Bordo',
  'Tirkizna',
  'Tamno plava',
  'Tamno siva',
  'Bijeli biser',
  'Metalna',
  'Mat crna',
  'Ostalo'
];

export const fuelTypes = [
  'Benzin',
  'Dizel',
  'Električni',
  'Hibrid',
  'Plug-in hibrid',
  'Benzin + LPG',
  'Benzin + CNG',
  'Vodik'
];

export const transmissionTypes = [
  'Manuelni',
  'Automatski',
  'Poluautomatski',
  'CVT'
];

export const driveTypes = [
  'Prednji',
  'Zadnji',
  '4x4',
  'AWD'
];

export const yearOptions = Array.from(
  { length: new Date().getFullYear() - 1989 },
  (_, i) => new Date().getFullYear() - i
);
