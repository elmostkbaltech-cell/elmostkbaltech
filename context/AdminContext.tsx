'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Brand, MaintenanceStep, ProductCategory, RegisteredWarranty } from '@/types';
import { 
  Shipment, 
  ShipmentSerial, 
  NonSerialItem, 
  BatchExpirationConfig,
  CustomerMessage
} from '@/types/admin';
import { 
  AdminUser, 
  authenticateAdmin, 
  getStoredAdminSession, 
  saveAdminSession, 
  clearAdminSession 
} from '@/lib/admin-auth';
import { getSupabaseClient } from '@/lib/supabase';

export interface MaintenanceRecord {
  ticketId: string;
  serialNumber: string;
  brand: Brand;
  customerName: string;
  customerPhone: string;
  deviceModel: string;
  issueDescription: string;
  currentStep: MaintenanceStep;
  reportedDate: string;
  lastUpdate: string;
  technicianNotes?: string;
  branchName: string;
  invoicePhotoUrl?: string;
  warrantyCardPhotoUrl?: string;
  createdBy?: string;
  updatedBy?: string;
}

interface AdminContextType {
  adminUser: AdminUser | null;
  login: (username: string, pass: string) => { success: boolean; error?: string };
  logout: () => void;
  shipments: Shipment[];
  serials: ShipmentSerial[];
  maintenanceTickets: MaintenanceRecord[];
  nonSerialItems: NonSerialItem[];
  selectedShipment: Shipment | null;
  setSelectedShipment: (s: Shipment | null) => void;
  createShipment: (data: {
    name: string;
    brand: Brand;
    category: ProductCategory;
    arrivalDate: string;
    notes?: string;
    rawSerials: string[];
    modelName?: string;
  }) => { success: boolean; count: number };
  expireBatchWarranty: (config: BatchExpirationConfig) => {
    success: boolean;
    unactivatedExpiredCount: number;
    activatedExpiredCount: number;
  };
  updateMaintenanceStep: (ticketId: string, newStep: MaintenanceStep, technicianNotes?: string) => void;
  createMaintenanceTicket: (data: {
    serialNumber: string;
    brand: Brand;
    customerName: string;
    customerPhone: string;
    deviceModel: string;
    issueDescription: string;
    invoicePhotoUrl?: string;
    warrantyCardPhotoUrl?: string;
  }) => MaintenanceRecord;
  addNonSerialItem: (item: Omit<NonSerialItem, 'id' | 'activationDate'>) => NonSerialItem;
  lookupDeviceBySerial: (serial: string) => {
    serialRecord?: ShipmentSerial;
    warrantyRecord?: RegisteredWarranty;
    ticketRecord?: MaintenanceRecord;
  } | null;
  customerMessages: CustomerMessage[];
  markMessageAsRead: (id: string) => Promise<void>;
  deleteMessage: (id: string) => Promise<void>;
  isRealtimeActive: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

// Helper to broadcast changes across all browser tabs without refresh
function notifyLocalTabs() {
  if (typeof window !== 'undefined') {
    try {
      if ('BroadcastChannel' in window) {
        const bc = new BroadcastChannel('elmostqbal_admin_sync');
        bc.postMessage({ timestamp: Date.now() });
        bc.close();
      }
    } catch {}
  }
}

export function AdminProvider({ children }: { children: ReactNode }) {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [serials, setSerials] = useState<ShipmentSerial[]>([]);
  const [maintenanceTickets, setMaintenanceTickets] = useState<MaintenanceRecord[]>([]);
  const [nonSerialItems, setNonSerialItems] = useState<NonSerialItem[]>([]);
  const [customerMessages, setCustomerMessages] = useState<CustomerMessage[]>([]);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [isRealtimeActive, setIsRealtimeActive] = useState(false);

  // Load state from local storage or cloud
  const loadLocalState = useCallback(() => {
    try {
      const savedShipments = localStorage.getItem('mostaqbal_admin_shipments');
      if (savedShipments) {
        const parsed: Shipment[] = JSON.parse(savedShipments);
        setShipments(parsed);
      } else {
        setShipments([]);
      }

      const savedSerials = localStorage.getItem('mostaqbal_admin_serials');
      if (savedSerials) {
        const parsed: ShipmentSerial[] = JSON.parse(savedSerials);
        setSerials(parsed);
      } else {
        setSerials([]);
      }

      const savedNSI = localStorage.getItem('mostaqbal_admin_nonserial');
      if (savedNSI) {
        const parsed: NonSerialItem[] = JSON.parse(savedNSI);
        setNonSerialItems(parsed);
      } else {
        setNonSerialItems([]);
      }

      const savedTickets = localStorage.getItem('mostaqbal_admin_tickets');
      if (savedTickets) {
        const parsed: MaintenanceRecord[] = JSON.parse(savedTickets);
        setMaintenanceTickets(parsed);
      } else {
        setMaintenanceTickets([]);
      }
    } catch (err) {
      console.warn('Error reading admin state from localStorage', err);
    }
  }, []);

  // Fetch initial data from Supabase if configured
  const loadSupabaseState = useCallback(async () => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    try {
      const [shpRes, serRes, tckRes, nsiRes, msgRes] = await Promise.all([
        supabase.from('shipments').select('*').order('created_at', { ascending: false }),
        supabase.from('serials').select('*').order('created_at', { ascending: false }),
        supabase.from('maintenance_tickets').select('*').order('created_at', { ascending: false }),
        supabase.from('non_serial_items').select('*').order('created_at', { ascending: false }),
        supabase.from('messages').select('*').order('created_at', { ascending: false }),
      ]);

      if (shpRes.data && shpRes.data.length > 0) {
        const mappedShipments: Shipment[] = shpRes.data.map((row) => ({
          id: row.id,
          name: row.name,
          brand: row.brand,
          category: row.category,
          arrivalDate: row.arrival_date,
          notes: row.notes,
          createdAt: row.created_at,
          totalUnits: row.total_units || 0,
          totalActivated: row.total_activated || 0,
          totalAvailable: row.total_available || 0,
          totalExpired: row.total_expired || 0,
          createdBy: row.created_by,
        }));
        setShipments(mappedShipments);
        localStorage.setItem('mostaqbal_admin_shipments', JSON.stringify(mappedShipments));
      }

      if (serRes.data && serRes.data.length > 0) {
        const mappedSerials: ShipmentSerial[] = serRes.data.map((row) => ({
          serialNumber: row.serial_number,
          shipmentId: row.shipment_id,
          brand: row.brand,
          modelName: row.model_name,
          status: row.status,
          customerName: row.customer_name,
          customerPhone: row.customer_phone,
          activationDate: row.activation_date,
          expirationReason: row.expiration_reason,
          createdBy: row.created_by,
          updatedBy: row.updated_by,
        }));
        setSerials(mappedSerials);
        localStorage.setItem('mostaqbal_admin_serials', JSON.stringify(mappedSerials));
      }

      if (tckRes.data && tckRes.data.length > 0) {
        const mappedTickets: MaintenanceRecord[] = tckRes.data.map((row) => ({
          ticketId: row.ticket_id,
          serialNumber: row.serial_number,
          brand: row.brand,
          customerName: row.customer_name,
          customerPhone: row.customer_phone,
          deviceModel: row.device_model,
          issueDescription: row.issue_description,
          currentStep: row.current_step,
          reportedDate: row.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
          lastUpdate: row.updated_at?.split('T')[0] || new Date().toISOString().split('T')[0],
          branchName: 'فرع التوفيقية الرئيسي',
          createdBy: row.created_by,
          updatedBy: row.updated_by,
        }));
        setMaintenanceTickets(mappedTickets);
        localStorage.setItem('mostaqbal_admin_tickets', JSON.stringify(mappedTickets));
      }

      if (nsiRes.data && nsiRes.data.length > 0) {
        const mappedNSI: NonSerialItem[] = nsiRes.data.map((row) => ({
          id: row.id,
          customerName: row.customer_name,
          customerPhone: row.customer_phone,
          brand: row.brand,
          category: row.category,
          modelName: row.model_name,
          purchaseDate: row.purchase_date,
          activationDate: row.created_at,
          invoicePhotoUrl: row.invoice_photo_url,
          notes: row.notes,
          createdBy: row.created_by,
        }));
        setNonSerialItems(mappedNSI);
        localStorage.setItem('mostaqbal_admin_nonserial', JSON.stringify(mappedNSI));
      }

      if (msgRes.data) {
        const mappedMessages: CustomerMessage[] = msgRes.data.map((row) => ({
          id: row.id,
          name: row.name,
          phone: row.phone,
          subject: row.subject,
          message: row.message,
          status: row.status || 'UNREAD',
          createdAt: row.created_at,
        }));
        setCustomerMessages(mappedMessages);
      }
    } catch (e) {
      console.error('Error fetching Supabase admin state:', e);
    }
  }, []);

  // Initial setup, session recovery, and universal real-time sync listeners
  useEffect(() => {
    const session = getStoredAdminSession();
    if (session) {
      setAdminUser(session);
    }

    loadLocalState();
    loadSupabaseState();

    // 1. Cross-tab instant synchronization
    let bc: BroadcastChannel | null = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        bc = new BroadcastChannel('elmostqbal_admin_sync');
        bc.onmessage = () => {
          loadLocalState();
        };
      }
    } catch {}

    const handleStorage = (e: StorageEvent) => {
      if (e.key && e.key.startsWith('mostaqbal_')) {
        loadLocalState();
      }
    };
    window.addEventListener('storage', handleStorage);

    // 2. Supabase Realtime channel subscription across all active admin accounts
    const supabase = getSupabaseClient();
    let realtimeChannel: any = null;

    if (supabase) {
      setIsRealtimeActive(true);
      realtimeChannel = supabase
        .channel('admin-realtime-universal')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'shipments' }, () => {
          loadSupabaseState();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'serials' }, () => {
          loadSupabaseState();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'maintenance_tickets' }, () => {
          loadSupabaseState();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'non_serial_items' }, () => {
          loadSupabaseState();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => {
          loadSupabaseState();
        })
        .subscribe();
    }

    return () => {
      if (bc) bc.close();
      window.removeEventListener('storage', handleStorage);
      if (realtimeChannel && supabase) {
        supabase.removeChannel(realtimeChannel);
      }
    };
  }, [loadLocalState, loadSupabaseState]);

  const login = (username: string, pass: string) => {
    const user = authenticateAdmin(username, pass);
    if (!user) {
      return { success: false, error: 'اسم المستخدم أو كلمة المرور غير صحيحة' };
    }
    setAdminUser(user);
    saveAdminSession(user);
    return { success: true };
  };

  const logout = () => {
    setAdminUser(null);
    clearAdminSession();
  };

  const createShipment = (data: {
    name: string;
    brand: Brand;
    category: ProductCategory;
    arrivalDate: string;
    notes?: string;
    rawSerials: string[];
    modelName?: string;
  }) => {
    const shipmentId = `SHIP-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const cleanedSerials = Array.from(
      new Set(
        data.rawSerials
          .map((s) => s.trim().toUpperCase())
          .filter((s) => s.length > 2)
      )
    );

    const defaultModel = data.modelName || `${data.brand} معتمد 2026`;
    const authorName = adminUser?.username || 'الإدارة العامة';

    const newSerialRecords: ShipmentSerial[] = cleanedSerials.map((s) => ({
      serialNumber: s,
      shipmentId,
      brand: data.brand,
      modelName: defaultModel,
      status: 'AVAILABLE',
      createdBy: authorName,
    }));

    const newShipment: Shipment = {
      id: shipmentId,
      name: data.name.trim(),
      brand: data.brand,
      category: data.category,
      arrivalDate: data.arrivalDate,
      notes: data.notes,
      createdAt: new Date().toISOString(),
      createdBy: authorName,
      totalUnits: newSerialRecords.length,
      totalActivated: 0,
      totalAvailable: newSerialRecords.length,
      totalExpired: 0,
    };

    const updatedShipments = [newShipment, ...shipments];
    const updatedSerials = [...newSerialRecords, ...serials];

    setShipments(updatedShipments);
    setSerials(updatedSerials);

    localStorage.setItem('mostaqbal_admin_shipments', JSON.stringify(updatedShipments));
    localStorage.setItem('mostaqbal_admin_serials', JSON.stringify(updatedSerials));

    // Also sync to customer-facing batch serials list so customer verification works instantly
    try {
      const existingBatchesRaw = localStorage.getItem('mostaqbal_batches');
      const existingBatches = existingBatchesRaw ? JSON.parse(existingBatchesRaw) : [];
      const formattedForPortal = newSerialRecords.map((s) => ({
        serialNumber: s.serialNumber,
        brand: s.brand,
        modelName: s.modelName,
        status: 'AVAILABLE',
        batchCode: shipmentId,
        importShipmentDate: data.arrivalDate,
        standardWarrantyDays: data.brand === 'A90_PRO' ? 730 : 365,
        notes: data.name,
      }));
      localStorage.setItem('mostaqbal_batches', JSON.stringify([...formattedForPortal, ...existingBatches]));
    } catch (e) {
      console.error('Error syncing batch serials to portal', e);
    }

    notifyLocalTabs();

    // Async write to Supabase if configured
    const supabase = getSupabaseClient();
    if (supabase) {
      (async () => {
        try {
          await supabase
            .from('shipments')
            .insert({
              id: newShipment.id,
              name: newShipment.name,
              brand: newShipment.brand,
              category: newShipment.category,
              arrival_date: newShipment.arrivalDate,
              model_name: defaultModel,
              notes: newShipment.notes,
              created_by: authorName,
            });

          const serialRows = newSerialRecords.map((sr) => ({
            serial_number: sr.serialNumber,
            shipment_id: sr.shipmentId,
            brand: sr.brand,
            model_name: sr.modelName,
            status: sr.status,
            created_by: authorName,
          }));
          await supabase.from('serials').insert(serialRows);
        } catch (err) {
          console.error('Supabase shipment insert error:', err);
        }
      })();
    }

    return { success: true, count: newSerialRecords.length };
  };

  const expireBatchWarranty = (config: BatchExpirationConfig) => {
    let unactivatedExpiredCount = 0;
    let activatedExpiredCount = 0;
    const authorName = adminUser?.username || 'الإدارة العامة';

    // Fetch customer registered warranties to check activation dates
    let registeredWarranties: RegisteredWarranty[] = [];
    try {
      const raw = localStorage.getItem('mostaqbal_warranties');
      if (raw) registeredWarranties = JSON.parse(raw);
    } catch (e) {
      console.warn('Error reading warranties for expiration', e);
    }

    const now = new Date();

    const updatedSerials = serials.map((ser) => {
      if (ser.shipmentId !== config.shipmentId) return ser;

      // Unactivated serials
      if (ser.status === 'AVAILABLE') {
        unactivatedExpiredCount++;
        return {
          ...ser,
          status: 'EXPIRED' as const,
          expirationReason: config.reason || 'إنهاء صلاحية السيريال بقرار إداري للشحنة',
          updatedBy: authorName,
        };
      }

      // If user chose Option B (Include Activated)
      if (config.mode === 'INCLUDE_ACTIVATED' && ser.status === 'CLAIMED') {
        const matchingWarranty = registeredWarranties.find(
          (w) => w.serialNumber?.toUpperCase() === ser.serialNumber.toUpperCase()
        );

        if (matchingWarranty) {
          const actDate = new Date(matchingWarranty.activationDate);
          const diffMonths = Math.max(
            1,
            Math.round((now.getTime() - actDate.getTime()) / (1000 * 60 * 60 * 24 * 30))
          );

          let shouldExpire = false;
          if (config.selectedAgeMonths.includes(diffMonths)) {
            shouldExpire = true;
          } else if (diffMonths >= 12 && config.selectedAgeMonths.includes(12)) {
            shouldExpire = true;
          }

          if (shouldExpire) {
            activatedExpiredCount++;
            return {
              ...ser,
              status: 'EXPIRED' as const,
              expirationReason: config.reason || `إنهاء الضمان بقرار إداري بعد مرور ${diffMonths} شهر`,
              updatedBy: authorName,
            };
          }
        }
      }

      return ser;
    });

    // Terminate matching customer warranties immediately so customer countdown timer stops
    if (config.mode === 'INCLUDE_ACTIVATED' && activatedExpiredCount > 0) {
      const expiredSerialSet = new Set(
        updatedSerials.filter((s) => s.status === 'EXPIRED').map((s) => s.serialNumber.toUpperCase())
      );

      const updatedWarranties = registeredWarranties.map((w) => {
        if (w.serialNumber && expiredSerialSet.has(w.serialNumber.toUpperCase())) {
          return {
            ...w,
            status: 'EXPIRED' as const,
            isRevoked: true,
            revocationReason: 'عفواً، انتهت فترة دعم وضمان هذا الموديل/الشحنة من قبل الوكيل المعتمد',
          };
        }
        return w;
      });

      localStorage.setItem('mostaqbal_warranties', JSON.stringify(updatedWarranties));
    }

    // Update shipment metrics
    const updatedShipments = shipments.map((shp) => {
      if (shp.id !== config.shipmentId) return shp;

      const batchSerials = updatedSerials.filter((s) => s.shipmentId === shp.id);
      const totalUnits = batchSerials.length;
      const totalActivated = batchSerials.filter((s) => s.status === 'CLAIMED').length;
      const totalAvailable = batchSerials.filter((s) => s.status === 'AVAILABLE').length;
      const totalExpired = batchSerials.filter((s) => s.status === 'EXPIRED').length;

      return {
        ...shp,
        totalUnits,
        totalActivated,
        totalAvailable,
        totalExpired,
      };
    });

    setSerials(updatedSerials);
    setShipments(updatedShipments);

    localStorage.setItem('mostaqbal_admin_serials', JSON.stringify(updatedSerials));
    localStorage.setItem('mostaqbal_admin_shipments', JSON.stringify(updatedShipments));

    notifyLocalTabs();

    // Async write to Supabase if configured
    const supabase = getSupabaseClient();
    if (supabase) {
      const expiredSerialsInBatch = updatedSerials
        .filter((s) => s.shipmentId === config.shipmentId && s.status === 'EXPIRED')
        .map((s) => s.serialNumber);

      if (expiredSerialsInBatch.length > 0) {
        (async () => {
          try {
            await supabase
              .from('serials')
              .update({
                status: 'EXPIRED',
                updated_by: authorName,
                updated_at: new Date().toISOString(),
              })
              .in('serial_number', expiredSerialsInBatch);
          } catch (err) {
            console.error('Supabase batch expire error:', err);
          }
        })();
      }
    }

    return {
      success: true,
      unactivatedExpiredCount,
      activatedExpiredCount,
    };
  };

  const updateMaintenanceStep = (
    ticketId: string,
    newStep: MaintenanceStep,
    technicianNotes?: string
  ) => {
    const authorName = adminUser?.username || 'الإدارة العامة';
    const updatedTickets = maintenanceTickets.map((tk) => {
      if (tk.ticketId !== ticketId) return tk;
      return {
        ...tk,
        currentStep: newStep,
        lastUpdate: new Date().toISOString().split('T')[0],
        technicianNotes: technicianNotes || tk.technicianNotes,
        updatedBy: authorName,
      };
    });

    setMaintenanceTickets(updatedTickets);
    localStorage.setItem('mostaqbal_admin_tickets', JSON.stringify(updatedTickets));

    // Also sync with registered warranties if ticket matches
    try {
      const raw = localStorage.getItem('mostaqbal_warranties');
      if (raw) {
        const warranties: RegisteredWarranty[] = JSON.parse(raw);
        const updatedWarranties = warranties.map((w) => {
          if (w.maintenanceTicket?.ticketId === ticketId) {
            return {
              ...w,
              maintenanceTicket: {
                ...w.maintenanceTicket,
                currentStep: newStep,
                lastUpdate: new Date().toISOString().split('T')[0],
                technicianNotes: technicianNotes || w.maintenanceTicket.technicianNotes,
              },
            };
          }
          return w;
        });
        localStorage.setItem('mostaqbal_warranties', JSON.stringify(updatedWarranties));
      }
    } catch (e) {
      console.error('Error syncing ticket update to warranty', e);
    }

    notifyLocalTabs();

    // Async write to Supabase if configured
    const supabase = getSupabaseClient();
    if (supabase) {
      (async () => {
        try {
          await supabase
            .from('maintenance_tickets')
            .update({
              current_step: newStep,
              updated_by: authorName,
              updated_at: new Date().toISOString(),
            })
            .eq('ticket_id', ticketId);
        } catch (err) {
          console.error('Supabase ticket step update error:', err);
        }
      })();
    }
  };

  const createMaintenanceTicket = (data: {
    serialNumber: string;
    brand: Brand;
    customerName: string;
    customerPhone: string;
    deviceModel: string;
    issueDescription: string;
    invoicePhotoUrl?: string;
    warrantyCardPhotoUrl?: string;
  }): MaintenanceRecord => {
    const authorName = adminUser?.username || 'الإدارة العامة';
    const ticketId = `MNT-${data.brand}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newRecord: MaintenanceRecord = {
      ticketId,
      serialNumber: data.serialNumber.trim().toUpperCase(),
      brand: data.brand,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      deviceModel: data.deviceModel,
      issueDescription: data.issueDescription,
      currentStep: 'IN_TRANSIT',
      reportedDate: new Date().toISOString().split('T')[0],
      lastUpdate: new Date().toISOString().split('T')[0],
      branchName: 'فرع التوفيقية - سنتر التوفيقية التجاري',
      technicianNotes: 'تم تسجيل طلب الصيانة بنجاح وفي انتظار وصول الجهاز إلى مركز الصيانة',
      invoicePhotoUrl: data.invoicePhotoUrl,
      warrantyCardPhotoUrl: data.warrantyCardPhotoUrl,
      createdBy: authorName,
    };

    const updated = [newRecord, ...maintenanceTickets];
    setMaintenanceTickets(updated);
    localStorage.setItem('mostaqbal_admin_tickets', JSON.stringify(updated));

    notifyLocalTabs();

    // Async write to Supabase if configured
    const supabase = getSupabaseClient();
    if (supabase) {
      (async () => {
        try {
          await supabase
            .from('maintenance_tickets')
            .insert({
              ticket_id: newRecord.ticketId,
              serial_number: newRecord.serialNumber,
              brand: newRecord.brand,
              customer_name: newRecord.customerName,
              customer_phone: newRecord.customerPhone,
              device_model: newRecord.deviceModel,
              issue_description: newRecord.issueDescription,
              current_step: newRecord.currentStep,
              created_by: authorName,
            });
        } catch (err) {
          console.error('Supabase ticket insert error:', err);
        }
      })();
    }

    return newRecord;
  };

  const addNonSerialItem = (item: Omit<NonSerialItem, 'id' | 'activationDate'>): NonSerialItem => {
    const authorName = adminUser?.username || 'الفرع الرئيسي';
    const newItem: NonSerialItem = {
      ...item,
      id: `NSI-${Math.floor(100 + Math.random() * 900)}`,
      activationDate: new Date().toISOString(),
      createdBy: authorName,
    };

    const updated = [newItem, ...nonSerialItems];
    setNonSerialItems(updated);
    localStorage.setItem('mostaqbal_admin_nonserial', JSON.stringify(updated));

    notifyLocalTabs();

    // Async write to Supabase if configured
    const supabase = getSupabaseClient();
    if (supabase) {
      (async () => {
        try {
          await supabase
            .from('non_serial_items')
            .insert({
              id: newItem.id,
              customer_name: newItem.customerName,
              customer_phone: newItem.customerPhone,
              brand: newItem.brand,
              category: newItem.category,
              model_name: newItem.modelName,
              purchase_date: newItem.purchaseDate,
              invoice_photo_url: newItem.invoicePhotoUrl,
              notes: newItem.notes,
              created_by: authorName,
            });
        } catch (err) {
          console.error('Supabase non_serial_items insert error:', err);
        }
      })();
    }

    return newItem;
  };

  const lookupDeviceBySerial = (serial: string) => {
    const trimmed = serial.trim().toUpperCase();
    if (!trimmed) return null;

    const serialRecord = serials.find((s) => s.serialNumber.toUpperCase() === trimmed);
    
    let warrantyRecord: RegisteredWarranty | undefined;
    try {
      const raw = localStorage.getItem('mostaqbal_warranties');
      if (raw) {
        const warranties: RegisteredWarranty[] = JSON.parse(raw);
        warrantyRecord = warranties.find((w) => w.serialNumber?.toUpperCase() === trimmed);
      }
    } catch {}

    const ticketRecord = maintenanceTickets.find((t) => t.serialNumber.toUpperCase() === trimmed);

    if (!serialRecord && !warrantyRecord && !ticketRecord) {
      return null;
    }

    return {
      serialRecord,
      warrantyRecord,
      ticketRecord,
    };
  };

  const markMessageAsRead = async (id: string) => {
    setCustomerMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: 'READ' } : m))
    );
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('messages').update({ status: 'READ' }).eq('id', id);
      } catch (e) {
        console.error('Error marking message read', e);
      }
    }
  };

  const deleteMessage = async (id: string) => {
    setCustomerMessages((prev) => prev.filter((m) => m.id !== id));
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('messages').delete().eq('id', id);
      } catch (e) {
        console.error('Error deleting message', e);
      }
    }
  };

  return (
    <AdminContext.Provider
      value={{
        adminUser,
        login,
        logout,
        shipments,
        serials,
        maintenanceTickets,
        nonSerialItems,
        customerMessages,
        markMessageAsRead,
        deleteMessage,
        selectedShipment,
        setSelectedShipment,
        createShipment,
        expireBatchWarranty,
        updateMaintenanceStep,
        createMaintenanceTicket,
        addNonSerialItem,
        lookupDeviceBySerial,
        isRealtimeActive,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
