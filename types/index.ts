export type Brand = 'AIWA' | 'TIGER' | 'A90_PRO' | 'DX' | 'ROCK_MUSIC' | 'TAL2A';

export type ProductCategory = 'CAR_SCREENS' | 'DSP_PROCESSORS' | 'LED_LIGHTS' | 'SOUND_SYSTEMS';

export type AiwaScreenModel = 'DIAMOND' | 'INCH_9';
export type TigerScreenModel = 'INCH_9' | 'INCH_7';

export type WarrantyStatus = 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED' | 'REVOKED';

export type MaintenanceStep = 
  | 'IN_TRANSIT'           // في وجهتها إلى مركز الضمان
  | 'UNDER_MAINTENANCE'    // في الضمان حالياً وجاري معالجة المشكلة
  | 'READY_FOR_PICKUP';    // جاهزة للتسليم من الفرع

export type SerialStatus = 'AVAILABLE' | 'CLAIMED' | 'REVOKED' | 'EXPIRED';

export interface MaintenanceTicket {
  ticketId: string;
  currentStep: MaintenanceStep;
  deviceDescription: string;
  issueDescription: string;
  reportedDate: string;
  lastUpdate: string;
  estimatedPickupDate?: string;
  technicianNotes?: string;
  branchName: string;
}

export interface RegisteredWarranty {
  id: string;
  brand: Brand;
  category: ProductCategory;
  subModel?: string; // e.g. "دايموند", "9 بوصه", "7 بوصه"
  modelName: string;
  serialNumber?: string;
  customerName: string;
  customerPhone: string;
  purchaseDate: string;
  activationDate: string;
  expiryDate: string;
  status: WarrantyStatus;
  devicePhotoUrl?: string;       // صورة كرت الضمان أو ملصق الجهاز
  invoicePhotoUrl: string;       // صورة فاتورة الشراء
  warrantyCardPhotoUrl?: string; // صورة كرت الضمان
  packagingPhotoUrl?: string;
  isRevoked?: boolean;
  revocationReason?: string;
  maintenanceTicket?: MaintenanceTicket;
  qrCodeDataUrl?: string;
  termsNotes?: string[];
}

export interface BatchSerial {
  serialNumber: string;
  brand: Brand;
  modelName: string;
  status: SerialStatus;
  batchCode: string;
  importShipmentDate: string;
  standardWarrantyDays: number;
  notes?: string;
}

export type Language = 'ar' | 'en';
export type Theme = 'dark' | 'light';
