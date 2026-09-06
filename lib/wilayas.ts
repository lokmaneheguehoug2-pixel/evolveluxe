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

export const DEFAULT_WILAYA_RATE: WilayaRate = { home: 700, desk: 400 };

export function createDefaultWilayaRates(): Record<string, WilayaRate> {
  return Object.fromEntries(WILAYAS.map(({ code }) => [code, { ...DEFAULT_WILAYA_RATE }]));
}

export function normalizeWilayaRates(value: unknown): Record<string, WilayaRate> {
  const source = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  return Object.fromEntries(WILAYAS.map(({ code }) => {
    const candidate = source[code] && typeof source[code] === 'object' ? source[code] as Record<string, unknown> : {};
    const home = Number(candidate.home);
    const desk = Number(candidate.desk);
    return [code, { home: Number.isFinite(home) && home >= 0 ? home : DEFAULT_WILAYA_RATE.home, desk: Number.isFinite(desk) && desk >= 0 ? desk : DEFAULT_WILAYA_RATE.desk }];
  }));
}

export function getWilayaRate(rates: unknown, code: string | undefined, method: 'home' | 'desk'): number {
  const normalized = normalizeWilayaRates(rates);
  return normalized[code || '']?.[method] ?? 0;
}
