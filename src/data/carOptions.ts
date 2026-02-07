export const vehicleTypes = [
  { value: 'automobil', label: 'Automobil' },
  { value: 'motocikl', label: 'Motocikl' },
  { value: 'quad', label: 'Quad/ATV' },
  { value: 'motorne_sanke', label: 'Motorne sanke' },
  { value: 'jetski', label: 'Jet Ski' }
];

export const motorcycleBrands = [
  'Honda',
  'Yamaha',
  'Suzuki',
  'Kawasaki',
  'Harley-Davidson',
  'BMW',
  'Ducati',
  'KTM',
  'Aprilia',
  'Triumph',
  'Royal Enfield',
  'Husqvarna',
  'Indian',
  'Moto Guzzi',
  'MV Agusta',
  'Benelli',
  'Vespa',
  'Piaggio',
  'Kymco',
  'SYM',
  'Ostalo'
];

export const quadBrands = [
  'Yamaha',
  'Honda',
  'Can-Am',
  'Polaris',
  'Kawasaki',
  'Suzuki',
  'Arctic Cat',
  'Kymco',
  'CF Moto',
  'Linhai',
  'Ostalo'
];

export const snowmobileBrands = [
  'Ski-Doo',
  'Polaris',
  'Arctic Cat',
  'Yamaha',
  'Lynx',
  'Ostalo'
];

export const jetskiBrands = [
  'Sea-Doo',
  'Yamaha',
  'Kawasaki',
  'Honda',
  'Polaris',
  'Ostalo'
];

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

export const motorcycleModels: Record<string, string[]> = {
  'Honda': ['CBR600RR', 'CBR1000RR', 'CB650R', 'CB500F', 'CB300R', 'CRF450R', 'CRF250R', 'Africa Twin', 'Gold Wing', 'Shadow', 'Rebel', 'Forza', 'PCX', 'SH', 'Ostalo'],
  'Yamaha': ['YZF-R1', 'YZF-R6', 'YZF-R7', 'MT-07', 'MT-09', 'MT-10', 'Tenere 700', 'Tracer', 'XSR', 'V-Max', 'YZ450F', 'YZ250F', 'NMAX', 'XMAX', 'Ostalo'],
  'Suzuki': ['GSX-R1000', 'GSX-R750', 'GSX-R600', 'GSX-S1000', 'GSX-S750', 'V-Strom', 'Hayabusa', 'Boulevard', 'RM-Z450', 'RM-Z250', 'Burgman', 'Ostalo'],
  'Kawasaki': ['Ninja ZX-10R', 'Ninja ZX-6R', 'Ninja 650', 'Ninja 400', 'Z900', 'Z650', 'Z400', 'Versys', 'Vulcan', 'KX450', 'KX250', 'J300', 'Ostalo'],
  'Harley-Davidson': ['Street Glide', 'Road Glide', 'Electra Glide', 'Fat Boy', 'Softail', 'Sportster', 'Iron 883', 'Street Bob', 'Road King', 'LiveWire', 'Ostalo'],
  'BMW': ['S1000RR', 'S1000R', 'F850GS', 'F750GS', 'R1250GS', 'R1250RT', 'R nineT', 'G310R', 'G310GS', 'C400X', 'C650GT', 'Ostalo'],
  'Ducati': ['Panigale V4', 'Panigale V2', 'Streetfighter', 'Monster', 'Multistrada', 'Diavel', 'Scrambler', 'SuperSport', 'Hypermotard', 'Ostalo'],
  'KTM': ['1290 Super Duke', '890 Duke', '790 Duke', '390 Duke', '250 Duke', '1290 Super Adventure', '890 Adventure', 'RC', 'SX-F', 'EXC', 'Ostalo'],
  'Aprilia': ['RSV4', 'Tuono V4', 'RS660', 'Tuono 660', 'Shiver', 'Dorsoduro', 'SX', 'RX', 'SR', 'Ostalo'],
  'Triumph': ['Street Triple', 'Speed Triple', 'Bonneville', 'Scrambler', 'Rocket', 'Tiger', 'Daytona', 'Trident', 'Thruxton', 'Ostalo'],
  'Royal Enfield': ['Classic', 'Bullet', 'Himalayan', 'Interceptor', 'Continental GT', 'Meteor', 'Hunter', 'Scram', 'Ostalo'],
  'Husqvarna': ['Vitpilen', 'Svartpilen', 'Norden', 'FC', 'FE', 'TC', 'TE', 'Ostalo'],
  'Indian': ['Chief', 'Scout', 'Chieftain', 'Roadmaster', 'Springfield', 'FTR', 'Challenger', 'Ostalo'],
  'Moto Guzzi': ['V7', 'V9', 'V85 TT', 'V100 Mandello', 'Audace', 'California', 'Ostalo'],
  'MV Agusta': ['F3', 'F4', 'Brutale', 'Dragster', 'Turismo Veloce', 'Superveloce', 'Rush', 'Ostalo'],
  'Benelli': ['TRK', 'Leoncino', '502C', '302S', 'TNT', 'Imperiale', 'Ostalo'],
  'Vespa': ['Primavera', 'Sprint', 'GTS', 'GTV', 'Elettrica', 'Ostalo'],
  'Piaggio': ['Liberty', 'Medley', 'Beverly', 'MP3', 'Ostalo'],
  'Kymco': ['AK', 'Downtown', 'Xciting', 'People', 'Agility', 'Ostalo'],
  'SYM': ['Cruisym', 'Joymax', 'Citycom', 'Fiddle', 'Orbit', 'Ostalo'],
  'Ostalo': ['Ostalo']
};

export const quadModels: Record<string, string[]> = {
  'Yamaha': ['Raptor 700', 'Raptor 350', 'YFZ450R', 'Grizzly 700', 'Grizzly 550', 'Kodiak 700', 'Kodiak 450', 'Banshee', 'Ostalo'],
  'Honda': ['TRX450R', 'TRX400EX', 'TRX250X', 'Rancher 420', 'Foreman 520', 'Rubicon 520', 'Rincon 680', 'Ostalo'],
  'Can-Am': ['Outlander', 'Renegade', 'Maverick', 'Commander', 'Defender', 'DS 450', 'DS 250', 'Ostalo'],
  'Polaris': ['Sportsman', 'Scrambler', 'Outlaw', 'Predator', 'Trail Boss', 'Ranger', 'RZR', 'Ostalo'],
  'Kawasaki': ['KFX700', 'KFX450R', 'KFX400', 'KFX250', 'Brute Force', 'Prairie', 'Bayou', 'Ostalo'],
  'Suzuki': ['LT-Z400', 'LT-R450', 'QuadSport Z400', 'QuadRacer', 'KingQuad', 'Ozark', 'Ostalo'],
  'Arctic Cat': ['Wildcat', 'Prowler', 'Alterra', 'DVX', 'Thundercat', 'Ostalo'],
  'Kymco': ['MXU 700', 'MXU 550', 'MXU 450', 'MXU 300', 'Maxxer', 'Ostalo'],
  'CF Moto': ['CForce', 'ZForce', 'UForce', 'Ostalo'],
  'Linhai': ['LH300', 'LH400', 'LH500', 'Ostalo'],
  'Ostalo': ['Ostalo']
};

export const snowmobileModels: Record<string, string[]> = {
  'Ski-Doo': ['MXZ', 'Renegade', 'Summit', 'Expedition', 'Grand Touring', 'Skandic', 'Tundra', 'Freeride', 'Ostalo'],
  'Polaris': ['Indy', 'RMK', 'Switchback', 'Rush', 'Voyageur', 'Titan', 'Widetrak', 'Ostalo'],
  'Arctic Cat': ['ZR', 'M', 'Bearcat', 'Pantera', 'Blast', 'Norseman', 'Ostalo'],
  'Yamaha': ['Sidewinder', 'SR Viper', 'Phazer', 'VK', 'RS Venture', 'Ostalo'],
  'Lynx': ['Rave', 'Xterrain', 'Commander', '49 Ranger', 'Adventure', 'Ostalo'],
  'Ostalo': ['Ostalo']
};

export const jetskiModels: Record<string, string[]> = {
  'Sea-Doo': ['Spark', 'GTI', 'GTR', 'RXT', 'RXP', 'Wake', 'Fish Pro', 'Explorer', 'Switch', 'Ostalo'],
  'Yamaha': ['EX', 'VX', 'FX', 'GP', 'SuperJet', 'WaveRunner', 'Ostalo'],
  'Kawasaki': ['STX', 'Ultra', 'SX-R', 'X-2', 'Ostalo'],
  'Honda': ['AquaTrax', 'F-12', 'F-15', 'Ostalo'],
  'Polaris': ['SL', 'SLX', 'Genesis', 'Ostalo'],
  'Ostalo': ['Ostalo']
};

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

export function getBrandsByVehicleType(vehicleType: string): string[] {
  switch (vehicleType) {
    case 'motocikl':
      return motorcycleBrands;
    case 'quad':
      return quadBrands;
    case 'motorne_sanke':
      return snowmobileBrands;
    case 'jetski':
      return jetskiBrands;
    case 'automobil':
    default:
      return carBrands;
  }
}

export function getFuelTypesByVehicleType(vehicleType: string): string[] {
  switch (vehicleType) {
    case 'motocikl':
    case 'quad':
      return ['Benzin', 'Električni'];
    case 'motorne_sanke':
      return ['Benzin', 'Električni'];
    case 'jetski':
      return ['Benzin', 'Električni'];
    case 'automobil':
    default:
      return fuelTypes;
  }
}

export function getTransmissionTypesByVehicleType(vehicleType: string): string[] {
  switch (vehicleType) {
    case 'motocikl':
      return ['Manuelni', 'Poluautomatski'];
    case 'quad':
      return ['Manuelni', 'Automatski', 'CVT'];
    case 'motorne_sanke':
      return ['CVT'];
    case 'jetski':
      return ['Direktni pogon'];
    case 'automobil':
    default:
      return transmissionTypes;
  }
}

export function getDoorOptionsByVehicleType(vehicleType: string): string[] {
  switch (vehicleType) {
    case 'automobil':
      return ['2/3', '4/5'];
    default:
      return [];
  }
}

export function getSeatOptionsByVehicleType(vehicleType: string): number[] {
  switch (vehicleType) {
    case 'automobil':
      return [2, 4, 5, 6, 7, 8, 9];
    case 'quad':
      return [1, 2];
    default:
      return [];
  }
}

export function getModelsByVehicleType(vehicleType: string, brand: string): string[] {
  let modelsMap: Record<string, string[]>;

  switch (vehicleType) {
    case 'motocikl':
      modelsMap = motorcycleModels;
      break;
    case 'quad':
      modelsMap = quadModels;
      break;
    case 'motorne_sanke':
      modelsMap = snowmobileModels;
      break;
    case 'jetski':
      modelsMap = jetskiModels;
      break;
    case 'automobil':
    default:
      modelsMap = carModels;
      break;
  }

  return modelsMap[brand] || ['Ostalo'];
}
