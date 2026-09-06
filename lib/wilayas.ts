export type WilayaRate = {
  home: number;
  desk: number;
};

export type Wilaya = {
  code: string;
  name: string;
  nameAr: string;
};

export const WILAYAS: Wilaya[] = [
  ['01', 'Adrar', 'أدرار'], ['02', 'Chlef', 'الشلف'], ['03', 'Laghouat', 'الأغواط'], ['04', 'Oum El Bouaghi', 'أم البواقي'], ['05', 'Batna', 'باتنة'], ['06', 'Béjaïa', 'بجاية'], ['07', 'Biskra', 'بسكرة'], ['08', 'Béchar', 'بشار'], ['09', 'Blida', 'البليدة'], ['10', 'Bouira', 'البويرة'],
  ['11', 'Tamanrasset', 'تمنراست'], ['12', 'Tébessa', 'تبسة'], ['13', 'Tlemcen', 'تلمسان'], ['14', 'Tiaret', 'تيارت'], ['15', 'Tizi Ouzou', 'تيزي وزو'], ['16', 'Alger', 'الجزائر'], ['17', 'Djelfa', 'الجلفة'], ['18', 'Jijel', 'جيجل'], ['19', 'Sétif', 'سطيف'], ['20', 'Saïda', 'سعيدة'],
  ['21', 'Skikda', 'سكيكدة'], ['22', 'Sidi Bel Abbès', 'سيدي بلعباس'], ['23', 'Annaba', 'عنابة'], ['24', 'Guelma', 'قالمة'], ['25', 'Constantine', 'قسنطينة'], ['26', 'Médéa', 'المدية'], ['27', 'Mostaganem', 'مستغانم'], ['28', "M'Sila", 'المسيلة'], ['29', 'Mascara', 'معسكر'], ['30', 'Ouargla', 'ورقلة'],
  ['31', 'Oran', 'وهران'], ['32', 'El Bayadh', 'البيض'], ['33', 'Illizi', 'إليزي'], ['34', 'Bordj Bou Arréridj', 'برج بوعريريج'], ['35', 'Boumerdès', 'بومرداس'], ['36', 'El Tarf', 'الطارف'], ['37', 'Tindouf', 'تندوف'], ['38', 'Tissemsilt', 'تيسمسيلت'], ['39', 'El Oued', 'الوادي'], ['40', 'Khenchela', 'خنشلة'],
  ['41', 'Souk Ahras', 'سوق أهراس'], ['42', 'Tipaza', 'تيبازة'], ['43', 'Mila', 'ميلة'], ['44', 'Aïn Defla', 'عين الدفلى'], ['45', 'Naâma', 'النعامة'], ['46', 'Aïn Témouchent', 'عين تموشنت'], ['47', 'Ghardaïa', 'غرداية'], ['48', 'Relizane', 'غليزان'], ['49', 'Timimoun', 'تيميمون'], ['50', 'Bordj Badji Mokhtar', 'برج باجي مختار'],
  ['51', 'Ouled Djellal', 'أولاد جلال'], ['52', 'Béni Abbès', 'بني عباس'], ['53', 'In Salah', 'عين صالح'], ['54', 'In Guezzam', 'عين قزام'], ['55', 'Touggourt', 'تقرت'], ['56', 'Djanet', 'جانت'], ['57', "El M'Ghair", 'المغير'], ['58', 'El Meniaa', 'المنيعة'],
].map(([code, name, nameAr]) => ({ code, name, nameAr }));

const MATRIX_RATES: Record<string, WilayaRate> = {
  '01': { home: 1650, desk: 1550 }, '02': { home: 700, desk: 600 }, '03': { home: 850, desk: 700 }, '04': { home: 550, desk: 450 }, '05': { home: 700, desk: 600 }, '06': { home: 700, desk: 600 }, '07': { home: 850, desk: 700 }, '08': { home: 1650, desk: 1550 }, '09': { home: 700, desk: 600 }, '10': { home: 700, desk: 600 },
  '11': { home: 1650, desk: 1550 }, '12': { home: 700, desk: 600 }, '13': { home: 700, desk: 600 }, '14': { home: 700, desk: 600 }, '15': { home: 700, desk: 600 }, '16': { home: 550, desk: 450 }, '17': { home: 850, desk: 700 }, '18': { home: 550, desk: 450 }, '19': { home: 700, desk: 600 }, '20': { home: 700, desk: 600 },
  '21': { home: 550, desk: 450 }, '22': { home: 700, desk: 600 }, '23': { home: 700, desk: 600 }, '24': { home: 550, desk: 450 }, '25': { home: 500, desk: 400 }, '26': { home: 700, desk: 600 }, '27': { home: 700, desk: 600 }, '28': { home: 700, desk: 600 }, '29': { home: 700, desk: 600 }, '30': { home: 850, desk: 700 },
  '31': { home: 700, desk: 600 }, '32': { home: 1650, desk: 1550 }, '33': { home: 1650, desk: 1550 }, '34': { home: 700, desk: 600 }, '35': { home: 700, desk: 600 }, '36': { home: 700, desk: 600 }, '37': { home: 1650, desk: 1550 }, '38': { home: 700, desk: 600 }, '39': { home: 850, desk: 700 }, '40': { home: 700, desk: 600 },
  '41': { home: 700, desk: 600 }, '42': { home: 700, desk: 600 }, '43': { home: 550, desk: 450 }, '44': { home: 700, desk: 600 }, '45': { home: 1650, desk: 1550 }, '46': { home: 700, desk: 600 }, '47': { home: 850, desk: 700 }, '48': { home: 700, desk: 600 }, '49': { home: 1650, desk: 1550 }, '50': { home: 1650, desk: 1550 },
  '51': { home: 850, desk: 700 }, '52': { home: 1650, desk: 1550 }, '53': { home: 1650, desk: 1550 }, '54': { home: 1650, desk: 1550 }, '55': { home: 850, desk: 700 }, '56': { home: 1650, desk: 1550 }, '57': { home: 850, desk: 700 }, '58': { home: 850, desk: 700 },
};

export const DEFAULT_WILAYA_RATE: WilayaRate = { home: 700, desk: 600 };

export function createDefaultWilayaRates(): Record<string, WilayaRate> {
  return Object.fromEntries(WILAYAS.map(({ code }) => [code, MATRIX_RATES[code] ?? { ...DEFAULT_WILAYA_RATE }]));
}

export function normalizeWilayaRates(value: unknown): Record<string, WilayaRate> {
  const source = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  return Object.fromEntries(WILAYAS.map(({ code }) => {
    const candidate = source[code] && typeof source[code] === 'object' ? source[code] as Record<string, unknown> : {};
    const home = Number(candidate.home);
    const desk = Number(candidate.desk);
    const fallback = MATRIX_RATES[code] ?? DEFAULT_WILAYA_RATE;
    return [code, { home: Number.isFinite(home) && home >= 0 ? home : fallback.home, desk: Number.isFinite(desk) && desk >= 0 ? desk : fallback.desk }];
  }));
}

export function getWilayaRate(rates: unknown, code: string | undefined, method: 'home' | 'desk'): number {
  const normalized = normalizeWilayaRates(rates);
  return normalized[code || '']?.[method] ?? 0;
}
