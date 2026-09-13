import { BatchSerial, Brand, ProductCategory, RegisteredWarranty } from '@/types';

export const COMPANY_INFO = {
  nameAr: 'شركة المستقبل تك للتجارة والتوريدات (استيراد وتصدير)',
  nameEn: 'El Mostaqbal Tech for Trading & Supplies (Import & Export)',
  shortNameAr: 'المستقبل تك',
  shortNameEn: 'El Mostaqbal Tech',
  phones: [
    { number: '+201128474862', display: '01128474862', tel: 'tel:+201128474862', wa: 'https://wa.me/201128474862' },
    { number: '+201144606492', display: '01144606492', tel: 'tel:+201144606492', wa: 'https://wa.me/201144606492' },
  ],
  addressAr: 'مصر - القاهرة - وسط البلد - سوق التوفيقية - مول سنتر التوفيقية التجاري أمام فرن فوده - الدور الثاني - محل AIWA & TIGER',
  addressEn: 'Egypt - Cairo - Downtown - Tawfiqiyya Market - Tawfiqiyya Commercial Mall (in front of Fouda Bakery) - 2nd Floor - AIWA & TIGER Store',
  mapUrl: 'https://maps.app.goo.gl/E9APKwjTLvFgDCJi8',
  workingHoursAr: 'يومياً من 10:00 صباحاً حتى 9:00 مساءً (عدا يوم الأحد والإجازات الرسمية)',
  workingHoursEn: 'Daily 10:00 AM to 9:00 PM (Except Sundays & Official Holidays)',
  authorizedDealerAr: 'المستقبل تك وكيل معتمد لـ: AIWA • TIGER • A90 PRO • DX • ROCK MUSIC • Tal2a',
  authorizedDealerEn: 'El Mostaqbal Tech is the Authorized Agent for: AIWA • TIGER • A90 PRO • DX • ROCK MUSIC • Tal2a',
};

export interface BrandDetails {
  id: Brand;
  name: string;
  taglineAr: string;
  taglineEn: string;
  descriptionAr: string;
  descriptionEn: string;
  accentColor: string;
  categories: ProductCategory[];
}

export const BRANDS: Record<Brand, BrandDetails> = {
  AIWA: {
    id: 'AIWA',
    name: 'AIWA',
    taglineAr: 'اليابانية العريقة - شاشات دايموند و 9 بوصة',
    taglineEn: 'Japanese Heritage - Diamond & 9 Inch Screens',
    descriptionAr: 'شاشات سيارات أندرويد عالية الدقة والأداء بموديلات دايموند و9 بوصة مع ضمان الوكيل المعتمد.',
    descriptionEn: 'High-end Android car displays with Diamond and 9" series backed by official agent warranty.',
    accentColor: '#ef4444',
    categories: ['CAR_SCREENS'],
  },
  TIGER: {
    id: 'TIGER',
    name: 'TIGER',
    taglineAr: 'القوة والتحمل - شاشات 9 بوصة و 7 بوصة',
    taglineEn: 'Power & Durability - 9 Inch & 7 Inch Screens',
    descriptionAr: 'شاشات سيارات قوية 9 بوصة (ضمان شامل) و 7 بوصة (ضمان سوفت وير) معتمدة من المستقبل تك.',
    descriptionEn: 'Heavy-duty car screens in 9" (full warranty) and 7" (software warranty) officially distributed.',
    accentColor: '#f97316',
    categories: ['CAR_SCREENS'],
  },
  A90_PRO: {
    id: 'A90_PRO',
    name: 'A90 PRO',
    taglineAr: 'الإضاءة والليدات الفائقة للسيارات',
    taglineEn: 'High-Performance Automotive LED Lighting',
    descriptionAr: 'أنظمة وليدات السيارات فائقة السطوع وعالية الكفاءة مع التفعيل الفوري بفاتورة الشراء.',
    descriptionEn: 'High-intensity LED automotive headlights with instant activation via stamped invoice.',
    accentColor: '#eab308',
    categories: ['LED_LIGHTS'],
  },
  DX: {
    id: 'DX',
    name: 'DX',
    taglineAr: 'أنظمة وشاشات الصوت المتطورة',
    taglineEn: 'Advanced Car Screens & Audio Systems',
    descriptionAr: 'علامة DX المعتمدة في شاشات وأنظمة سيارات احترافية للمستقبل تك.',
    descriptionEn: 'Authorized DX automotive multimedia screens and audio systems.',
    accentColor: '#3b82f6',
    categories: ['CAR_SCREENS', 'SOUND_SYSTEMS'],
  },
  ROCK_MUSIC: {
    id: 'ROCK_MUSIC',
    name: 'ROCK MUSIC',
    taglineAr: 'أنظمة الصوت والسماعات الاحترافية',
    taglineEn: 'Pro Car Audio & Heavy Sound Systems',
    descriptionAr: 'مكبرات ومعالجات صوت وأنظمة سماعات سيارات عالية النقاء والقوة.',
    descriptionEn: 'Professional car amplifiers, DSP processors, and extreme high-clarity sound systems.',
    accentColor: '#8b5cf6',
    categories: ['SOUND_SYSTEMS', 'DSP_PROCESSORS'],
  },
  TAL2A: {
    id: 'TAL2A',
    name: 'Tal2a (طلقة)',
    taglineAr: 'ليدات وإضاءات طلقة الفائقة',
    taglineEn: 'Tal2a Ultra Bright Automotive LEDs',
    descriptionAr: 'إضاءات وليدات طلقة عالية القوة والتركيز المقاومة للحرارة العالية.',
    descriptionEn: 'Ultra-bright high-beam automotive LEDs engineered for extreme visibility.',
    accentColor: '#10b981',
    categories: ['LED_LIGHTS'],
  },
};

// Only these brands are eligible for warranty registration
export const WARRANTY_BRANDS: Brand[] = ['TIGER', 'AIWA', 'A90_PRO'];

export const CATEGORIES: Record<ProductCategory, { nameAr: string; nameEn: string; iconName: string }> = {
  CAR_SCREENS: {
    nameAr: 'شاشات السيارات',
    nameEn: 'Car Screens',
    iconName: 'Monitor',
  },
  LED_LIGHTS: {
    nameAr: 'ليدات وإضاءات السيارات',
    nameEn: 'LED Lights',
    iconName: 'Zap',
  },
  DSP_PROCESSORS: {
    nameAr: 'معالجات الصوت DSP',
    nameEn: 'DSP Audio Processors',
    iconName: 'Sliders',
  },
  SOUND_SYSTEMS: {
    nameAr: 'أنظمة وسماعات الصوت',
    nameEn: 'Sound Systems',
    iconName: 'Speaker',
  },
};

// Verified batch shipments available for user testing
export const INITIAL_BATCH_SERIALS: BatchSerial[] = [
  // AIWA
  {
    serialNumber: 'AIWA-SCR-8821',
    brand: 'AIWA',
    modelName: 'AIWA 9 بوصه QLED Android 13',
    status: 'AVAILABLE',
    batchCode: 'EGY-AIW-2024-Q3',
    importShipmentDate: '2024-07-15',
    standardWarrantyDays: 365,
    notes: 'شحنة رسمية معتمدة - شاشة 9 بوصة',
  },
  {
    serialNumber: 'AIWA-DIA-1040',
    brand: 'AIWA',
    modelName: 'AIWA دايموند Ultra Pro',
    status: 'AVAILABLE',
    batchCode: 'EGY-AIW-2024-Q3',
    importShipmentDate: '2024-08-10',
    standardWarrantyDays: 365,
    notes: 'شحنة رسمية معتمدة - شاشة دايموند',
  },
  // TIGER
  {
    serialNumber: 'TGR-9IN-5501',
    brand: 'TIGER',
    modelName: 'TIGER 9 بوصه IPS Beast Series',
    status: 'AVAILABLE',
    batchCode: 'EGY-TGR-2024-Q2',
    importShipmentDate: '2024-05-18',
    standardWarrantyDays: 365,
    notes: 'شحنة تايجر 9 بوصة - جاهز للتفعيل',
  },
  // DX
  {
    serialNumber: 'DX-PRO-2044',
    brand: 'DX',
    modelName: 'DX Smart Car Display 9" 2K',
    status: 'AVAILABLE',
    batchCode: 'EGY-DX-2024-Q1',
    importShipmentDate: '2024-04-12',
    standardWarrantyDays: 365,
    notes: 'شحنة DX الرسمية',
  }
];

export const INITIAL_REGISTERED_WARRANTIES: RegisteredWarranty[] = [];

// Seeded Shipments (Batches) for Admin Portal
export const SEEDED_SHIPMENTS = [
  {
    id: 'SHIP-2026-001',
    name: 'شحنة 2026 البداية - شاشات AIWA',
    brand: 'AIWA' as Brand,
    category: 'CAR_SCREENS' as ProductCategory,
    arrivalDate: '2026-01-10',
    notes: 'دفعة شاشات دايموند و 9 بوصة كيو ليد معتمدة من المصنع',
    createdAt: '2026-01-10T09:00:00.000Z',
    totalUnits: 4,
    totalActivated: 0,
    totalAvailable: 4,
    totalExpired: 0,
  },
  {
    id: 'SHIP-2025-002',
    name: 'شحنة تايجر 9 بوصة خريف 2025',
    brand: 'TIGER' as Brand,
    category: 'CAR_SCREENS' as ProductCategory,
    arrivalDate: '2025-10-05',
    notes: 'شحنة تايجر المصفحة مع ضمان شامل 9 بوصة',
    createdAt: '2025-10-05T11:30:00.000Z',
    totalUnits: 3,
    totalActivated: 0,
    totalAvailable: 3,
    totalExpired: 0,
  },
  {
    id: 'SHIP-2025-003',
    name: 'شحنة ليدات A90 PRO الترا 2025',
    brand: 'A90_PRO' as Brand,
    category: 'LED_LIGHTS' as ProductCategory,
    arrivalDate: '2025-11-20',
    notes: 'أنظمة إضاءة ليد فائقة مع ضمان سنتين بالفاتورة',
    createdAt: '2025-11-20T14:00:00.000Z',
    totalUnits: 2,
    totalActivated: 0,
    totalAvailable: 2,
    totalExpired: 0,
  }
];

export const SEEDED_SHIPMENT_SERIALS = [
  {
    serialNumber: 'AIWA-SCR-8821',
    shipmentId: 'SHIP-2026-001',
    brand: 'AIWA' as Brand,
    modelName: 'AIWA 9 بوصه QLED Android 13',
    status: 'AVAILABLE' as const,
  },
  {
    serialNumber: 'AIWA-DIA-1040',
    shipmentId: 'SHIP-2026-001',
    brand: 'AIWA' as Brand,
    modelName: 'AIWA دايموند Ultra Pro',
    status: 'AVAILABLE' as const,
  },
  {
    serialNumber: 'AIWA-SCR-9901',
    shipmentId: 'SHIP-2026-001',
    brand: 'AIWA' as Brand,
    modelName: 'AIWA 9 بوصه QLED Android 13',
    status: 'AVAILABLE' as const,
  },
  {
    serialNumber: 'AIWA-DIA-2045',
    shipmentId: 'SHIP-2026-001',
    brand: 'AIWA' as Brand,
    modelName: 'AIWA دايموند Ultra Pro',
    status: 'AVAILABLE' as const,
  },
  {
    serialNumber: 'TGR-9IN-5501',
    shipmentId: 'SHIP-2025-002',
    brand: 'TIGER' as Brand,
    modelName: 'TIGER 9 بوصه IPS Beast Series',
    status: 'AVAILABLE' as const,
  },
  {
    serialNumber: 'TGR-9IN-6620',
    shipmentId: 'SHIP-2025-002',
    brand: 'TIGER' as Brand,
    modelName: 'TIGER 9 بوصه IPS Beast Series',
    status: 'AVAILABLE' as const,
  },
  {
    serialNumber: 'TGR-9IN-7714',
    shipmentId: 'SHIP-2025-002',
    brand: 'TIGER' as Brand,
    modelName: 'TIGER 9 بوصه IPS Beast Series',
    status: 'AVAILABLE' as const,
  },
  {
    serialNumber: 'A90-LED-3310',
    shipmentId: 'SHIP-2025-003',
    brand: 'A90_PRO' as Brand,
    modelName: 'A90 PRO LED Ultra Beam H7',
    status: 'AVAILABLE' as const,
  },
  {
    serialNumber: 'A90-LED-4421',
    shipmentId: 'SHIP-2025-003',
    brand: 'A90_PRO' as Brand,
    modelName: 'A90 PRO LED Turbo Fan 120W',
    status: 'AVAILABLE' as const,
  },
];

// Seeded Non-Serial items (DSP, LED, 7" screens)
export const SEEDED_NON_SERIAL_ITEMS = [
  {
    id: 'NSI-001',
    customerName: 'محمد عبد اللطيف',
    customerPhone: '01012345678',
    brand: 'A90_PRO' as Brand,
    category: 'LED_LIGHTS' as ProductCategory,
    modelName: 'ليدات سيارات A90 PRO الجيل الخامس 120 واط',
    purchaseDate: '2026-02-15',
    activationDate: '2026-02-15T12:00:00.000Z',
    invoicePhotoUrl: 'https://images.unsplash.com/photo-1554415707-9e44667a149c?w=800&auto=format&fit=crop&q=80',
    notes: 'فاتورة شراء معتمدة ومختومة من موزع التوفيقية',
  },
  {
    id: 'NSI-002',
    customerName: 'حسام الدين إبراهيم',
    customerPhone: '01198765432',
    brand: 'TIGER' as Brand,
    category: 'CAR_SCREENS' as ProductCategory,
    modelName: 'شاشة تايجر 7 بوصة أندرويد (سوفت وير)',
    purchaseDate: '2026-01-20',
    activationDate: '2026-01-20T14:30:00.000Z',
    invoicePhotoUrl: 'https://images.unsplash.com/photo-1554415707-9e44667a149c?w=800&auto=format&fit=crop&q=80',
    notes: 'ضمان سوفت وير فقط - فاتورة واضحة بالتاريخ',
  },
  {
    id: 'NSI-003',
    customerName: 'شريف منصور',
    customerPhone: '01234567890',
    brand: 'ROCK_MUSIC' as Brand,
    category: 'DSP_PROCESSORS' as ProductCategory,
    modelName: 'معالج صوت روك ميوزك 8 قنوات DSP Pro High-Res',
    purchaseDate: '2025-12-10',
    activationDate: '2025-12-10T10:00:00.000Z',
    invoicePhotoUrl: 'https://images.unsplash.com/photo-1554415707-9e44667a149c?w=800&auto=format&fit=crop&q=80',
    notes: 'فاتورة شراء ضريبية معتمدة',
  },
];

// Seeded Maintenance Tickets
export const SEEDED_MAINTENANCE_TICKETS = [
  {
    ticketId: 'MNT-AIWA-1024',
    serialNumber: 'AIWA-SCR-8821',
    brand: 'AIWA' as Brand,
    customerName: 'محمود حسني',
    customerPhone: '01009988776',
    deviceModel: 'AIWA 9 بوصه QLED Android 13',
    issueDescription: 'توقف الصوت في السماعات الخلفية وتحديث السوفت وير',
    currentStep: 'UNDER_MAINTENANCE' as const,
    reportedDate: '2026-09-10',
    lastUpdate: '2026-09-12',
    technicianNotes: 'تم فحص مخارج الصوت وجاري استبدال إيسي الصوت الرئيسي IC واختباره',
    branchName: 'فرع التوفيقية - سنتر التوفيقية التجاري',
    invoicePhotoUrl: 'https://images.unsplash.com/photo-1554415707-9e44667a149c?w=800&auto=format&fit=crop&q=80',
    warrantyCardPhotoUrl: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=800&auto=format&fit=crop&q=80',
  },
  {
    ticketId: 'MNT-TGR-2055',
    serialNumber: 'TGR-9IN-5501',
    brand: 'TIGER' as Brand,
    customerName: 'عمر الفاروق',
    customerPhone: '01122334455',
    deviceModel: 'TIGER 9 بوصه IPS Beast Series',
    issueDescription: 'شاشة اللمس تحتاج كاليبريشن وتغيير شريط التاتش',
    currentStep: 'READY_FOR_PICKUP' as const,
    reportedDate: '2026-09-08',
    lastUpdate: '2026-09-13',
    technicianNotes: 'تم استبدال شريط التاتش بنجاح واختبار الشاشة بالكامل 24 ساعة. الجهاز سليم وجاهز للتسليم للعميل في الفرع.',
    branchName: 'فرع التوفيقية - سنتر التوفيقية التجاري',
    invoicePhotoUrl: 'https://images.unsplash.com/photo-1554415707-9e44667a149c?w=800&auto=format&fit=crop&q=80',
    warrantyCardPhotoUrl: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=800&auto=format&fit=crop&q=80',
  },
];
