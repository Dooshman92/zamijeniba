export interface EquipmentItem {
  key: string;
  label: string;
  category: string;
}

export const automobilEquipment: EquipmentItem[] = [
  { key: 'xenon_lights', label: 'Xenon/LED farovi', category: 'Rasvjeta i vidljivost' },
  { key: 'fog_lights', label: 'Maglenke', category: 'Rasvjeta i vidljivost' },
  { key: 'light_sensor', label: 'Senzor svjetla', category: 'Rasvjeta i vidljivost' },
  { key: 'tinted_windows', label: 'Zatamnjeni stakla', category: 'Rasvjeta i vidljivost' },

  { key: 'heated_seats', label: 'Grijači sjedišta', category: 'Komfor' },
  { key: 'leather_seats', label: 'Kožna sjedišta', category: 'Komfor' },
  { key: 'electric_seats', label: 'Električna sjedišta', category: 'Komfor' },
  { key: 'memory_seats', label: 'Memorija sjedišta', category: 'Komfor' },
  { key: 'sport_seats', label: 'Sport sjedišta', category: 'Komfor' },
  { key: 'sunroof', label: 'Panorama krov', category: 'Komfor' },
  { key: 'climate_control', label: 'Automatska klima', category: 'Komfor' },
  { key: 'cruise_control', label: 'Tempomat', category: 'Komfor' },
  { key: 'rain_sensor', label: 'Senzor kiše', category: 'Komfor' },

  { key: 'navigation', label: 'Navigacija', category: 'Multimedija' },
  { key: 'bluetooth', label: 'Bluetooth', category: 'Multimedija' },

  { key: 'rear_parking_sensors', label: 'Zadnji park senzori', category: 'Pomoć pri parkiranju' },
  { key: 'front_parking_sensors', label: 'Prednji park senzori', category: 'Pomoć pri parkiranju' },
  { key: 'parking_camera', label: 'Parking kamera', category: 'Pomoć pri parkiranju' },

  { key: 'abs', label: 'ABS', category: 'Sigurnost' },
  { key: 'esp', label: 'ESP', category: 'Sigurnost' },
  { key: 'alarm', label: 'Alarm', category: 'Sigurnost' },
  { key: 'immobilizer', label: 'Imobilajzer', category: 'Sigurnost' },
  { key: 'central_locking', label: 'Centralno zaključavanje', category: 'Sigurnost' },
  { key: 'keyless_entry', label: 'Keyless ulazak', category: 'Sigurnost' },
  { key: 'isofix', label: 'ISOFIX', category: 'Sigurnost' },

  { key: 'alloy_wheels', label: 'Alu felge', category: 'Eksterijer' },
  { key: 'roof_rack', label: 'Krovni nosač', category: 'Eksterijer' },
  { key: 'tow_hitch', label: 'Kuka za vuču', category: 'Eksterijer' },
  { key: 'sport_package', label: 'Sport paket', category: 'Eksterijer' },

  { key: 'electric_windows', label: 'Električni podizači stakala', category: 'Dodatno' },
  { key: 'electric_mirrors', label: 'Električna retrovizora', category: 'Dodatno' },
  { key: 'start_stop', label: 'Start-Stop sistem', category: 'Dodatno' },
  { key: 'winter_tires', label: 'Zimske gume', category: 'Dodatno' },
  { key: 'summer_tires', label: 'Ljetne gume', category: 'Dodatno' },
  { key: 'spare_tire', label: 'Rezervna guma', category: 'Dodatno' },
];

export const motociklEquipment: EquipmentItem[] = [
  { key: 'abs', label: 'ABS kočnice', category: 'Sigurnost' },
  { key: 'alarm', label: 'Alarm', category: 'Sigurnost' },
  { key: 'immobilizer', label: 'Imobilajzer', category: 'Sigurnost' },

  { key: 'xenon_lights', label: 'Xenon/LED farovi', category: 'Rasvjeta' },
  { key: 'fog_lights', label: 'Maglenke', category: 'Rasvjeta' },

  { key: 'heated_seats', label: 'Grijana sjedala', category: 'Komfor' },
  { key: 'cruise_control', label: 'Tempomat', category: 'Komfor' },
  { key: 'bluetooth', label: 'Bluetooth', category: 'Komfor' },
  { key: 'navigation', label: 'Navigacija', category: 'Komfor' },

  { key: 'alloy_wheels', label: 'Laki točkovi', category: 'Dodatno' },
  { key: 'sport_package', label: 'Sport izduvni sistem', category: 'Dodatno' },
  { key: 'tow_hitch', label: 'Nosač prtljage', category: 'Dodatno' },
];

export const quadEquipment: EquipmentItem[] = [
  { key: 'alloy_wheels', label: 'Laki točkovi', category: 'Dodatno' },
  { key: 'roof_rack', label: 'Krovni nosač', category: 'Dodatno' },
  { key: 'tow_hitch', label: 'Kuka za vuču', category: 'Dodatno' },
  { key: 'fog_lights', label: 'Maglenke', category: 'Rasvjeta' },
  { key: 'xenon_lights', label: 'LED farovi', category: 'Rasvjeta' },
  { key: 'alarm', label: 'Alarm', category: 'Sigurnost' },
  { key: 'immobilizer', label: 'Imobilajzer', category: 'Sigurnost' },
];

export const motorneSankeEquipment: EquipmentItem[] = [
  { key: 'heated_seats', label: 'Grijana sjedala', category: 'Komfor' },
  { key: 'electric_windows', label: 'Električno podizanje vjetrobrana', category: 'Komfor' },
  { key: 'xenon_lights', label: 'LED farovi', category: 'Rasvjeta' },
  { key: 'fog_lights', label: 'Maglenke', category: 'Rasvjeta' },
  { key: 'tow_hitch', label: 'Kuka za prikolicu', category: 'Dodatno' },
  { key: 'roof_rack', label: 'Nosač za prtljagu', category: 'Dodatno' },
];

export const jetskiEquipment: EquipmentItem[] = [
  { key: 'navigation', label: 'GPS navigacija', category: 'Navigacija' },
  { key: 'bluetooth', label: 'Bluetooth audio sistem', category: 'Multimedija' },
  { key: 'parking_camera', label: 'Reverse kamera', category: 'Dodatno' },
  { key: 'tow_hitch', label: 'Nosač za ski', category: 'Dodatno' },
  { key: 'sport_package', label: 'Sportski paketi', category: 'Dodatno' },
  { key: 'alarm', label: 'Alarm', category: 'Sigurnost' },
  { key: 'immobilizer', label: 'Imobilajzer', category: 'Sigurnost' },
];

export function getEquipmentByVehicleType(vehicleType: string): EquipmentItem[] {
  switch (vehicleType) {
    case 'automobil':
      return automobilEquipment;
    case 'motocikl':
      return motociklEquipment;
    case 'quad':
      return quadEquipment;
    case 'motorne_sanke':
      return motorneSankeEquipment;
    case 'jetski':
      return jetskiEquipment;
    default:
      return automobilEquipment;
  }
}

export function getEquipmentCategories(vehicleType: string): string[] {
  const equipment = getEquipmentByVehicleType(vehicleType);
  const categories = [...new Set(equipment.map(item => item.category))];
  return categories;
}

export function getEquipmentByCategory(vehicleType: string, category: string): EquipmentItem[] {
  const equipment = getEquipmentByVehicleType(vehicleType);
  return equipment.filter(item => item.category === category);
}
