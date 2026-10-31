/**
 * SNTE Official Card Allocation and Quota System
 * نظام ترقيم وتوزيع بطاقات الانخراط المعتمد للأسنتيو
 * 
 * ترتيب حزم البطاقات تصاعدياً لكل ولاية وبقية الأرقام حتى 60000 من اختصاص الأمين العام الوطني
 */

export interface CardBatchRange {
  start: number;
  end: number;
  batchSize: number;
  label?: string;
}

export interface WilayaCardAllocation {
  wilayaName: string;
  aliases: string[];
  codes: string[];
  batches: CardBatchRange[];
}

export const OFFICIAL_CARD_ALLOCATIONS: WilayaCardAllocation[] = [
  {
    wilayaName: 'الجلفة',
    aliases: ['الجلفة', 'ولاية الجلفة'],
    codes: ['17'],
    batches: [
      { start: 1, end: 1000, batchSize: 1000, label: 'حزمة 1000 بطاقة (0001 - 1000)' },
    ],
  },
  {
    wilayaName: 'مسعد',
    aliases: ['مسعد', 'ولاية مسعد'],
    codes: ['69'],
    batches: [
      { start: 1001, end: 2000, batchSize: 1000, label: 'حزمة 1000 بطاقة (1001 - 2000)' },
    ],
  },
  {
    wilayaName: 'البيض',
    aliases: ['البيض', 'ولاية البيض'],
    codes: ['32'],
    batches: [
      { start: 2001, end: 3000, batchSize: 1000, label: 'حزمة 1000 بطاقة (2001 - 3000)' },
      { start: 34501, end: 35000, batchSize: 500, label: 'حزمة 500 بطاقة (34501 - 35000)' },
    ],
  },
  {
    wilayaName: 'معسكر',
    aliases: ['معسكر', 'ولاية معسكر'],
    codes: ['29'],
    batches: [
      { start: 3001, end: 4000, batchSize: 1000, label: 'حزمة 1000 بطاقة (3001 - 4000)' },
    ],
  },
  {
    wilayaName: 'النعامة',
    aliases: ['النعامة', 'ولاية النعامة'],
    codes: ['45'],
    batches: [
      { start: 4000, end: 5000, batchSize: 1000, label: 'حزمة 1000 بطاقة (4000 - 5000)' },
    ],
  },
  {
    wilayaName: 'البليدة',
    aliases: ['البليدة', 'ولاية البليدة'],
    codes: ['09'],
    batches: [
      { start: 5001, end: 6000, batchSize: 1000, label: 'حزمة 1000 بطاقة (5001 - 6000)' },
    ],
  },
  {
    wilayaName: 'سعيدة',
    aliases: ['سعيدة', 'ولاية سعيدة'],
    codes: ['20'],
    batches: [
      { start: 6001, end: 7000, batchSize: 1000, label: 'حزمة 1000 بطاقة (6001 - 7000)' },
    ],
  },
  {
    wilayaName: 'وهران',
    aliases: ['وهران', 'ولاية وهران'],
    codes: ['31'],
    batches: [
      { start: 7001, end: 8000, batchSize: 1000, label: 'حزمة 1000 بطاقة (7001 - 8000)' },
      { start: 35001, end: 35500, batchSize: 500, label: 'حزمة 500 بطاقة (35001 - 35500)' },
    ],
  },
  {
    wilayaName: 'بجاية',
    aliases: ['بجاية', 'ولاية بجاية'],
    codes: ['06'],
    batches: [
      { start: 10001, end: 11000, batchSize: 1000, label: 'حزمة 1000 بطاقة (10001 - 11000)' },
    ],
  },
  {
    wilayaName: 'غليزان',
    aliases: ['غليزان', 'ولاية غليزان'],
    codes: ['48'],
    batches: [
      { start: 12001, end: 13000, batchSize: 1000, label: 'حزمة 1000 بطاقة (12001 - 13000)' },
    ],
  },
  {
    wilayaName: 'تيارت',
    aliases: ['تيارت', 'ولاية تيارت'],
    codes: ['14'],
    batches: [
      { start: 13001, end: 14000, batchSize: 1000, label: 'حزمة 1000 بطاقة (13001 - 14000)' },
    ],
  },
  {
    wilayaName: 'الشلف',
    aliases: ['الشلف', 'ولاية الشلف'],
    codes: ['02'],
    batches: [
      { start: 14001, end: 15000, batchSize: 1000, label: 'حزمة 1000 بطاقة (14001 - 15000)' },
    ],
  },
  {
    wilayaName: 'مستغانم',
    aliases: ['مستغانم', 'ولاية مستغانم'],
    codes: ['27'],
    batches: [
      { start: 15001, end: 16000, batchSize: 1000, label: 'حزمة 1000 بطاقة (15001 - 16000)' },
      { start: 39001, end: 39500, batchSize: 500, label: 'حزمة 500 بطاقة (39001 - 39500)' },
    ],
  },
  {
    wilayaName: 'عين تيموشنت',
    aliases: ['عين تيموشنت', 'عين تموشنت', 'ولاية عين تيموشنت', 'ولاية عين تموشنت'],
    codes: ['46'],
    batches: [
      { start: 16001, end: 17000, batchSize: 1000, label: 'حزمة 1000 بطاقة (16001 - 17000)' },
      { start: 33501, end: 34000, batchSize: 500, label: 'حزمة 500 بطاقة (33501 - 34000)' },
      { start: 40000, end: 41000, batchSize: 1000, label: 'حزمة 1000 بطاقة (40000 - 41000)' },
      { start: 53001, end: 53500, batchSize: 500, label: 'حزمة 500 بطاقة (53001 - 53500)' },
    ],
  },
  {
    wilayaName: 'سيدي بلعباس',
    aliases: ['سيدي بلعباس', 'ولاية سيدي بلعباس'],
    codes: ['22'],
    batches: [
      { start: 17000, end: 18000, batchSize: 1000, label: 'حزمة 1000 بطاقة (17000 - 18000)' },
      { start: 49501, end: 50000, batchSize: 500, label: 'حزمة 500 بطاقة (49501 - 50000)' },
    ],
  },
  {
    wilayaName: 'المدية قصر البخاري',
    aliases: ['المدية', 'قصر البخاري', 'ولاية المدية', 'ولاية قصر البخاري', 'المدية قصر البخاري'],
    codes: ['26', '66'],
    batches: [
      { start: 18001, end: 19000, batchSize: 1000, label: 'حزمة 1000 بطاقة (18001 - 19000)' },
    ],
  },
  {
    wilayaName: 'تلمسان',
    aliases: ['تلمسان', 'ولاية تلمسان'],
    codes: ['13'],
    batches: [
      { start: 19001, end: 20000, batchSize: 1000, label: 'حزمة 1000 بطاقة (19001 - 20000)' },
      { start: 34001, end: 34500, batchSize: 500, label: 'حزمة 500 بطاقة (34001 - 34500)' },
    ],
  },
  {
    wilayaName: 'البويرة',
    aliases: ['البويرة', 'ولاية البويرة'],
    codes: ['10'],
    batches: [
      { start: 20001, end: 21000, batchSize: 1000, label: 'حزمة 1000 بطاقة (20001 - 21000)' },
    ],
  },
  {
    wilayaName: 'بومرداس',
    aliases: ['بومرداس', 'ولاية بومرداس'],
    codes: ['35'],
    batches: [
      { start: 22001, end: 23000, batchSize: 1000, label: 'حزمة 1000 بطاقة (22001 - 23000)' },
    ],
  },
  {
    wilayaName: 'تيزي وزو',
    aliases: ['تيزي وزو', 'ولاية تيزي وزو'],
    codes: ['15'],
    batches: [
      { start: 23000, end: 24000, batchSize: 1000, label: 'حزمة 1000 بطاقة (23000 - 24000)' },
    ],
  },
  {
    wilayaName: 'تيسمسيلت',
    aliases: ['تيسمسيلت', 'ولاية تيسمسيلت'],
    codes: ['38'],
    batches: [
      { start: 24001, end: 25000, batchSize: 1000, label: 'حزمة 1000 بطاقة (24001 - 25000)' },
    ],
  },
  {
    wilayaName: 'الأغواط',
    aliases: ['الأغواط', 'ولاية الأغواط'],
    codes: ['03'],
    batches: [
      { start: 25001, end: 26000, batchSize: 1000, label: 'حزمة 1000 بطاقة (25001 - 26000)' },
    ],
  },
  {
    wilayaName: 'غرداية',
    aliases: ['غرداية', 'ولاية غرداية'],
    codes: ['47'],
    batches: [
      { start: 26001, end: 27000, batchSize: 1000, label: 'حزمة 1000 بطاقة (26001 - 27000)' },
    ],
  },
  {
    wilayaName: 'المسيلة',
    aliases: ['المسيلة', 'ولاية المسيلة'],
    codes: ['28'],
    batches: [
      { start: 27000, end: 28000, batchSize: 1000, label: 'حزمة 1000 بطاقة (27000 - 28000)' },
    ],
  },
  {
    wilayaName: 'باتنة',
    aliases: ['باتنة', 'ولاية باتنة'],
    codes: ['05'],
    batches: [
      { start: 28000, end: 29000, batchSize: 1000, label: 'حزمة 1000 بطاقة (28000 - 29000)' },
    ],
  },
  {
    wilayaName: 'قسنطينة',
    aliases: ['قسنطينة', 'ولاية قسنطينة'],
    codes: ['25'],
    batches: [
      { start: 29001, end: 30000, batchSize: 1000, label: 'حزمة 1000 بطاقة (29001 - 30000)' },
    ],
  },
  {
    wilayaName: 'برج بوعريريج',
    aliases: ['برج بوعريريج', 'ولاية برج بوعريريج'],
    codes: ['34'],
    batches: [
      { start: 30001, end: 40000, batchSize: 10000, label: 'حزمة بطاقات (30001 - 40000)' },
    ],
  },
  {
    wilayaName: 'قالمة',
    aliases: ['قالمة', 'ولاية قالمة'],
    codes: ['24'],
    batches: [
      { start: 30501, end: 31000, batchSize: 500, label: 'حزمة 500 بطاقة (30501 - 31000)' },
    ],
  },
  {
    wilayaName: 'عنابة',
    aliases: ['عنابة', 'ولاية عنابة'],
    codes: ['23'],
    batches: [
      { start: 35501, end: 36000, batchSize: 500, label: 'حزمة 500 بطاقة (35501 - 36000)' },
    ],
  },
  {
    wilayaName: 'الأبيض سيدي الشيخ',
    aliases: ['الأبيض سيدي الشيخ', 'ولاية الأبيض سيدي الشيخ'],
    codes: ['60'],
    batches: [
      { start: 37001, end: 37500, batchSize: 500, label: 'حزمة 500 بطاقة (37001 - 37500)' },
    ],
  },
  {
    wilayaName: 'بريكة',
    aliases: ['بريكة', 'ولاية بريكة'],
    codes: ['63'],
    batches: [
      { start: 37500, end: 38000, batchSize: 500, label: 'حزمة 500 بطاقة (37500 - 38000)' },
    ],
  },
  {
    wilayaName: 'ميلة',
    aliases: ['ميلة', 'ولاية ميلة'],
    codes: ['43'],
    batches: [
      { start: 38001, end: 38500, batchSize: 500, label: 'حزمة 500 بطاقة (38001 - 38500)' },
    ],
  },
  {
    wilayaName: 'بوسعادة',
    aliases: ['بوسعادة', 'ولاية بوسعادة'],
    codes: ['64'],
    batches: [
      { start: 38501, end: 39000, batchSize: 500, label: 'حزمة 500 بطاقة (38501 - 39000)' },
    ],
  },
  {
    wilayaName: 'أولاد جلال',
    aliases: ['أولاد جلال', 'ولاية أولاد جلال'],
    codes: ['51'],
    batches: [
      { start: 39501, end: 40000, batchSize: 500, label: 'حزمة 500 بطاقة (39501 - 40000)' },
    ],
  },
  {
    wilayaName: 'أم البواقي',
    aliases: ['أم البواقي', 'ولاية أم البواقي'],
    codes: ['04'],
    batches: [
      { start: 42000, end: 43000, batchSize: 1000, label: 'حزمة 1000 بطاقة (42000 - 43000)' },
    ],
  },
  {
    wilayaName: 'سكيكدة',
    aliases: ['سكيكدة', 'ولاية سكيكدة'],
    codes: ['21'],
    batches: [
      { start: 43001, end: 44000, batchSize: 1000, label: 'حزمة 1000 بطاقة (43001 - 44000)' },
    ],
  },
  {
    wilayaName: 'سوق أهراس',
    aliases: ['سوق أهراس', 'ولاية سوق أهراس'],
    codes: ['41'],
    batches: [
      { start: 45000, end: 46000, batchSize: 1000, label: 'حزمة 1000 بطاقة (45000 - 46000)' },
      { start: 57501, end: 58000, batchSize: 500, label: 'حزمة 500 بطاقة (57501 - 58000)' },
    ],
  },
  {
    wilayaName: 'تبسة',
    aliases: ['تبسة', 'ولاية تبسة'],
    codes: ['12'],
    batches: [
      { start: 46000, end: 47000, batchSize: 1000, label: 'حزمة 1000 بطاقة (46000 - 47000)' },
      { start: 52501, end: 53000, batchSize: 500, label: 'حزمة 500 بطاقة (52501 - 53000)' },
    ],
  },
  {
    wilayaName: 'خنشلة',
    aliases: ['خنشلة', 'ولاية خنشلة'],
    codes: ['40'],
    batches: [
      { start: 52001, end: 52500, batchSize: 500, label: 'حزمة 500 بطاقة (52001 - 52500)' },
    ],
  },
];

/**
 * National SG Reserve: All remaining numbers up to 60000
 * بقية البطاقات إلى 60000 من اختصاص الأمين العام الوطني
 */
export const MAX_NATIONAL_CARD_NUMBER = 60000;

/**
 * Format card number string (pads to 4 digits if < 10000, e.g. "0001", "0450", "12050")
 */
export function formatCardNumber(num: number): string {
  if (num < 10000) {
    return num.toString().padStart(4, '0');
  }
  return num.toString();
}

/**
 * Normalize input string into pure card number digits (handles "SNTE-2026-0045", "45", "0045")
 */
export function normalizeCardNumber(val: string | number): string {
  if (typeof val === 'number') {
    return formatCardNumber(val);
  }
  const clean = val.replace(/[^0-9]/g, '');
  if (!clean) return '';
  const num = parseInt(clean, 10);
  if (isNaN(num)) return clean;
  return formatCardNumber(num);
}

/**
 * Find the allocation entry for a given Wilaya name or code
 */
export function findWilayaAllocation(wilayaNameOrCode: string): WilayaCardAllocation | undefined {
  if (!wilayaNameOrCode) return undefined;
  const target = wilayaNameOrCode.trim().toLowerCase();
  
  return OFFICIAL_CARD_ALLOCATIONS.find((alloc) => {
    if (alloc.codes.some((c) => c.toLowerCase() === target)) return true;
    if (alloc.wilayaName.toLowerCase() === target) return true;
    if (alloc.aliases.some((a) => a.toLowerCase() === target || target.includes(a.toLowerCase()))) return true;
    return false;
  });
}

/**
 * Gather all currently used card numbers from localStorage (members sheet, accounts, etc.)
 */
export function getRegisteredCardNumbers(): Set<string> {
  const set = new Set<string>();

  // 1. From members sheet (snte_members_v3)
  try {
    const raw = localStorage.getItem('snte_members_v3');
    if (raw) {
      const list = JSON.parse(raw);
      if (Array.isArray(list)) {
        list.forEach((m: any) => {
          if (m?.membershipCardNo) {
            set.add(normalizeCardNumber(m.membershipCardNo));
          }
        });
      }
    }
  } catch (e) {
    console.error('Error reading snte_members_v3:', e);
  }

  // 2. From accounts (snte_accounts_v3)
  try {
    const raw = localStorage.getItem('snte_accounts_v3');
    if (raw) {
      const list = JSON.parse(raw);
      if (Array.isArray(list)) {
        list.forEach((a: any) => {
          if (a?.membershipCardNo) {
            set.add(normalizeCardNumber(a.membershipCardNo));
          }
        });
      }
    }
  } catch (e) {
    console.error('Error reading snte_accounts_v3:', e);
  }

  return set;
}

/**
 * Check if a card number is already taken in the sheet / database
 */
export function isCardNumberTaken(cardNo: string | number): boolean {
  const norm = normalizeCardNumber(cardNo);
  if (!norm) return false;
  const takenSet = getRegisteredCardNumbers();
  return takenSet.has(norm);
}

/**
 * Generate the next available card number for a given Wilaya based on its assigned batches
 */
export function generateNextCardNumberForWilaya(
  wilayaNameOrCode: string,
  isNationalSG: boolean = false
): {
  cardNumber: string;
  batchLabel: string;
  isNationalReserve: boolean;
  totalBatchesCount: number;
} {
  const takenSet = getRegisteredCardNumbers();
  const allocation = findWilayaAllocation(wilayaNameOrCode);

  if (allocation && allocation.batches.length > 0) {
    // Try to find the first unused number within the wilaya's batches
    for (const batch of allocation.batches) {
      for (let n = batch.start; n <= batch.end; n++) {
        const formatted = formatCardNumber(n);
        if (!takenSet.has(formatted)) {
          return {
            cardNumber: formatted,
            batchLabel: batch.label || `حزمة ولاية ${allocation.wilayaName} (${batch.start} - ${batch.end})`,
            isNationalReserve: false,
            totalBatchesCount: allocation.batches.length,
          };
        }
      }
    }
  }

  // If Wilaya has no specific batch or all allocated batches are filled,
  // allocate from the National SG reserve (بقية البطاقات حتى 60000)
  for (let n = 53501; n <= MAX_NATIONAL_CARD_NUMBER; n++) {
    const formatted = formatCardNumber(n);
    if (!takenSet.has(formatted)) {
      return {
        cardNumber: formatted,
        batchLabel: `حصة الأمانة العامة الوطنية الاحتياطية (${n} / ${MAX_NATIONAL_CARD_NUMBER})`,
        isNationalReserve: true,
        totalBatchesCount: allocation ? allocation.batches.length : 0,
      };
    }
  }

  // Fallback fallback if somehow full
  const randomFallback = formatCardNumber(Math.floor(58000 + Math.random() * 2000));
  return {
    cardNumber: randomFallback,
    batchLabel: 'حصة التوزيع الوطني المباشر',
    isNationalReserve: true,
    totalBatchesCount: 0,
  };
}

/**
 * Validate a card number against:
 * 1. Duplication in the sheet / database (رفض فوري)
 * 2. Range boundaries for the Wilaya (حزم الترقيم) or National SG
 */
export function validateCardNumberSubmission(
  cardNoStr: string,
  wilayaNameOrCode: string,
  isNationalSG: boolean = false
): {
  isValid: boolean;
  error?: string;
  normalizedCardNo: string;
} {
  const normalized = normalizeCardNumber(cardNoStr);

  if (!normalized) {
    return {
      isValid: false,
      error: 'يرجى إدخال رقم بطاقة صحيح.',
      normalizedCardNo: '',
    };
  }

  const numVal = parseInt(normalized, 10);
  if (isNaN(numVal) || numVal < 1 || numVal > MAX_NATIONAL_CARD_NUMBER) {
    return {
      isValid: false,
      error: `رقم البطاقة غير صالح. يجب أن يكون الرقم محصوراً بين 0001 و ${MAX_NATIONAL_CARD_NUMBER}.`,
      normalizedCardNo: normalized,
    };
  }

  // 1. Strict Duplicate Check against Sheet / LocalStorage
  if (isCardNumberTaken(normalized)) {
    return {
      isValid: false,
      error: `عذراً، رقم البطاقة (${normalized}) مسجل ومحجوز مسبقاً في قاعدة بيانات المنخرطين (شيت المنخرطين). يمنع تكرار رقم الانخراط! يرجى اختيار رقم متاح آخر أو استخدام التوليد الآلي المعتمد.`,
      normalizedCardNo: normalized,
    };
  }

  // 2. Check if Wilaya has assigned batches
  const allocation = findWilayaAllocation(wilayaNameOrCode);

  if (allocation && allocation.batches.length > 0) {
    const inWilayaRange = allocation.batches.some(
      (b) => numVal >= b.start && numVal <= b.end
    );

    if (!inWilayaRange) {
      // If user is National SG, they can bypass or assign from national quota
      if (isNationalSG) {
        return {
          isValid: true,
          normalizedCardNo: normalized,
        };
      }

      const rangesDesc = allocation.batches
        .map((b) => `${b.start} إلى ${b.end}`)
        .join(' و ');

      return {
        isValid: false,
        error: `رقم البطاقة (${normalized}) لا يقع ضمن الحزم المخصصة رسمياً لولاية ${allocation.wilayaName} (الحزم المعتمدة: ${rangesDesc}). بقية الأرقام من اختصاص الأمانة العامة الوطنية.`,
        normalizedCardNo: normalized,
      };
    }
  }

  return {
    isValid: true,
    normalizedCardNo: normalized,
  };
}
