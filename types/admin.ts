import { Brand, ProductCategory, SerialStatus } from './index';

export interface Shipment {
  id: string;
  name: string; // e.g. "شحنة 2026 البداية"
  brand: Brand;
  category: ProductCategory;
  arrivalDate: string;
  notes?: string;
  createdAt: string;
  totalUnits: number;
  totalActivated: number;
  totalAvailable: number;
  totalExpired: number;
  createdBy?: string;
}

export interface ShipmentSerial {
  serialNumber: string;
  shipmentId: string;
  brand: Brand;
  modelName: string;
  status: SerialStatus;
  customerName?: string;
  customerPhone?: string;
  activationDate?: string;
  warrantyId?: string;
  expirationReason?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface NonSerialItem {
  id: string;
  customerName: string;
  customerPhone: string;
  brand: Brand;
  category: ProductCategory;
  modelName: string;
  purchaseDate: string;
  activationDate: string;
  invoicePhotoUrl: string;
  warrantyCardPhotoUrl?: string;
  notes?: string;
  createdBy?: string;
}

export interface BatchExpirationConfig {
  shipmentId: string;
  mode: 'UNACTIVATED_ONLY' | 'INCLUDE_ACTIVATED';
  selectedAgeMonths: number[]; // 1 to 12
  reason?: string;
}
