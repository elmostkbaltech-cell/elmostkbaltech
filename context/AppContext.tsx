'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { BatchSerial, Brand, Language, ProductCategory, RegisteredWarranty, Theme } from '@/types';
import { INITIAL_BATCH_SERIALS, INITIAL_REGISTERED_WARRANTIES } from '@/lib/mock-data';
import { translations } from '@/lib/translations';
import confetti from 'canvas-confetti';
import QRCode from 'qrcode';
import { getSupabaseClient } from '@/lib/supabase';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  t: typeof translations.ar;
  batchSerials: BatchSerial[];
  registeredWarranties: RegisteredWarranty[];
  currentWarranty: RegisteredWarranty | null;
  setCurrentWarranty: (warranty: RegisteredWarranty | null) => void;
  activeTab: 'home' | 'activate' | 'dashboard' | 'maintenance' | 'contact';
  setActiveTab: (tab: 'home' | 'activate' | 'dashboard' | 'maintenance' | 'contact') => void;
  isMapModalOpen: boolean;
  setIsMapModalOpen: (open: boolean) => void;
  
  // Selection state for activation
  selectedBrand: Brand;
  setSelectedBrand: (brand: Brand) => void;
  selectedCategory: ProductCategory;
  setSelectedCategory: (cat: ProductCategory) => void;
  selectedSubModel: string;
  setSelectedSubModel: (sub: string) => void;

  // Actions
  verifySerial: (serial: string) => {
    status: 'AVAILABLE' | 'CLAIMED' | 'REVOKED' | 'NOT_FOUND';
    batch?: BatchSerial;
  };
  registerNewWarranty: (data: {
    brand: Brand;
    category: ProductCategory;
    modelName: string;
    serialNumber?: string;
    customerName: string;
    customerPhone: string;
    purchaseDate: string;
    devicePhotoUrl?: string;
    invoicePhotoUrl: string;
    packagingPhotoUrl?: string;
  }) => Promise<RegisteredWarranty>;
  searchWarranty: (query: string) => RegisteredWarranty | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('ar');
  const [theme, setThemeState] = useState<Theme>('dark');
  const [batchSerials, setBatchSerials] = useState<BatchSerial[]>(INITIAL_BATCH_SERIALS);
  const [registeredWarranties, setRegisteredWarranties] = useState<RegisteredWarranty[]>([]);
  const [currentWarranty, setCurrentWarranty] = useState<RegisteredWarranty | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'activate' | 'dashboard' | 'maintenance' | 'contact'>('home');
  const [isMapModalOpen, setIsMapModalOpen] = useState<boolean>(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand>('AIWA');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('CAR_SCREENS');
  const [selectedSubModel, setSelectedSubModel] = useState<string>('9 بوصه');

  // Load persisted state from localStorage on mount
  useEffect(() => {
    try {
      const savedLang = localStorage.getItem('mostaqbal_lang') as Language;
      if (savedLang && (savedLang === 'ar' || savedLang === 'en')) {
        setLanguageState(savedLang);
      }

      const savedTheme = localStorage.getItem('mostaqbal_theme') as Theme;
      if (savedTheme && (savedTheme === 'dark' || savedTheme === 'light')) {
        setThemeState(savedTheme);
      } else {
        setThemeState('dark');
      }

      const savedWarranties = localStorage.getItem('mostaqbal_warranties');
      if (savedWarranties) {
        const parsed: RegisteredWarranty[] = JSON.parse(savedWarranties);
        // Filter out any older mock names from previous runs
        const clean = parsed.filter(w => !['أحمد محمود السعيد', 'مروان الشناوي', 'طارق عبد الفتاح', 'عصام عبد المنعم', 'سامح إبراهيم'].includes(w.customerName));
        setRegisteredWarranties(clean);
        if (clean.length > 0) {
          setCurrentWarranty(clean[0]);
        }
        localStorage.setItem('mostaqbal_warranties', JSON.stringify(clean));
      }

      // Load locally stored batches from admin shipments
      const savedBatches = localStorage.getItem('mostaqbal_batches');
      if (savedBatches) {
        try {
          const parsedBatches: BatchSerial[] = JSON.parse(savedBatches);
          if (parsedBatches.length > 0) {
            setBatchSerials(parsedBatches);
          }
        } catch (e) {}
      }
    } catch (e) {
      console.warn('Error reading from localStorage', e);
    }
  }, []);

  // Synchronize serials from Supabase Cloud in real-time
  useEffect(() => {
    const fetchCloudSerials = async () => {
      const supabase = getSupabaseClient();
      if (!supabase) return;

      try {
        const { data } = await supabase.from('serials').select('*');
        if (data && data.length > 0) {
          const cloudBatches: BatchSerial[] = data.map((r: any) => ({
            serialNumber: r.serial_number,
            brand: r.brand,
            modelName: r.model_name || `${r.brand} معتمد`,
            status: r.status,
            batchCode: r.shipment_id || 'SHIP-CLOUD',
            importShipmentDate: r.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
            standardWarrantyDays: r.brand === 'A90_PRO' ? 730 : 365,
          }));
          setBatchSerials(cloudBatches);
          localStorage.setItem('mostaqbal_batches', JSON.stringify(cloudBatches));
        }
      } catch (err) {
        console.warn('Could not fetch cloud serials', err);
      }
    };

    fetchCloudSerials();

    // Listen to real-time additions/updates of serials
    const supabase = getSupabaseClient();
    if (supabase) {
      const channel = supabase
        .channel('portal_serials_realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'serials' },
          () => {
            fetchCloudSerials();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, []);

  // Listen to cross-tab admin synchronization
  useEffect(() => {
    if (typeof window === 'undefined' || !('BroadcastChannel' in window)) return;
    const bc = new BroadcastChannel('elmostqbal_admin_sync');
    bc.onmessage = () => {
      const savedBatches = localStorage.getItem('mostaqbal_batches');
      if (savedBatches) {
        try {
          const parsed = JSON.parse(savedBatches);
          setBatchSerials(parsed);
        } catch (e) {}
      }
    };
    return () => bc.close();
  }, []);

  // Update HTML dir and class when language or theme changes
  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    localStorage.setItem('mostaqbal_lang', language);
  }, [language]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
    localStorage.setItem('mostaqbal_theme', theme);
  }, [theme]);

  const toggleLanguage = () => {
    const nextLang = language === 'ar' ? 'en' : 'ar';
    setLanguageState(nextLang);
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setThemeState(nextTheme);
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const setTheme = (th: Theme) => {
    setThemeState(th);
  };

  const verifySerial = (serial: string) => {
    const trimmed = serial.trim().toUpperCase();
    if (!trimmed) return { status: 'NOT_FOUND' as const };

    const match = batchSerials.find(b => b.serialNumber.toUpperCase() === trimmed);
    if (!match) {
      return { status: 'NOT_FOUND' as const };
    }

    if (match.status === 'REVOKED' || match.status === 'EXPIRED') {
      return { status: 'REVOKED' as const, batch: match };
    }

    if (match.status === 'CLAIMED') {
      return { status: 'CLAIMED' as const, batch: match };
    }

    return { status: 'AVAILABLE' as const, batch: match };
  };

  const registerNewWarranty = async (data: {
    brand: Brand;
    category: ProductCategory;
    modelName: string;
    serialNumber?: string;
    customerName: string;
    customerPhone: string;
    purchaseDate: string;
    devicePhotoUrl?: string;
    invoicePhotoUrl: string;
    packagingPhotoUrl?: string;
  }): Promise<RegisteredWarranty> => {
    const activationDate = new Date().toISOString();
    const daysToAdd = data.brand === 'A90_PRO' ? 730 : 365;
    const expiryDate = new Date(Date.now() + daysToAdd * 24 * 60 * 60 * 1000).toISOString();
    const id = `WAR-${data.brand}-${Math.floor(100000 + Math.random() * 900000)}`;

    // Generate QR code data URL
    const qrPayload = JSON.stringify({
      id,
      serial: data.serialNumber || 'N/A',
      brand: data.brand,
      owner: data.customerName,
      phone: data.customerPhone,
      expiry: expiryDate.split('T')[0],
      agent: 'El Mostaqbal Tech'
    });
    
    let qrCodeDataUrl = '';
    try {
      qrCodeDataUrl = await QRCode.toDataURL(qrPayload, {
        margin: 1,
        color: {
          dark: '#0A2540',
          light: '#ffffff',
        }
      });
    } catch (e) {
      console.error('QR generation error', e);
    }

    const newWarranty: RegisteredWarranty = {
      id,
      brand: data.brand,
      category: data.category,
      modelName: data.modelName,
      serialNumber: data.serialNumber?.trim().toUpperCase(),
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      purchaseDate: data.purchaseDate,
      activationDate,
      expiryDate,
      status: 'ACTIVE',
      devicePhotoUrl: data.devicePhotoUrl,
      invoicePhotoUrl: data.invoicePhotoUrl,
      packagingPhotoUrl: data.packagingPhotoUrl,
      isRevoked: false,
      qrCodeDataUrl,
    };

    // Update batch serial status if serial was provided
    if (data.serialNumber) {
      const upperSerial = data.serialNumber.trim().toUpperCase();
      const updatedBatches = batchSerials.map(b => 
        b.serialNumber.toUpperCase() === upperSerial
          ? { ...b, status: 'CLAIMED' as const }
          : b
      );
      setBatchSerials(updatedBatches);
      localStorage.setItem('mostaqbal_batches', JSON.stringify(updatedBatches));

      // Sync to Admin portal serials and shipments
      try {
        const rawAdminSerials = localStorage.getItem('mostaqbal_admin_serials');
        if (rawAdminSerials) {
          const adminSerials = JSON.parse(rawAdminSerials);
          let targetShipmentId: string | undefined;
          const updatedAdminSerials = adminSerials.map((s: any) => {
            if (s.serialNumber?.toUpperCase() === upperSerial) {
              targetShipmentId = s.shipmentId;
              return {
                ...s,
                status: 'CLAIMED',
                customerName: data.customerName,
                customerPhone: data.customerPhone,
                activationDate,
                warrantyId: id,
                updatedBy: 'العميل (تفعيل إلكتروني)',
              };
            }
            return s;
          });
          localStorage.setItem('mostaqbal_admin_serials', JSON.stringify(updatedAdminSerials));

          if (targetShipmentId) {
            const rawShipments = localStorage.getItem('mostaqbal_admin_shipments');
            if (rawShipments) {
              const adminShipments = JSON.parse(rawShipments);
              const updatedShipments = adminShipments.map((shp: any) => {
                if (shp.id === targetShipmentId) {
                  const bSerials = updatedAdminSerials.filter((s: any) => s.shipmentId === shp.id);
                  return {
                    ...shp,
                    totalActivated: bSerials.filter((s: any) => s.status === 'CLAIMED').length,
                    totalAvailable: bSerials.filter((s: any) => s.status === 'AVAILABLE').length,
                  };
                }
                return shp;
              });
              localStorage.setItem('mostaqbal_admin_shipments', JSON.stringify(updatedShipments));
            }
          }
        }

        // Broadcast to other open browser tabs
        if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
          const bc = new BroadcastChannel('elmostqbal_admin_sync');
          bc.postMessage({ timestamp: Date.now() });
          bc.close();
        }
      } catch (err) {
        console.warn('Error syncing serial claim to admin dashboard', err);
      }

      // Sync to Supabase if configured
      const supabase = getSupabaseClient();
      if (supabase) {
        (async () => {
          try {
            await supabase
              .from('serials')
              .update({
                status: 'CLAIMED',
                customer_name: data.customerName,
                customer_phone: data.customerPhone,
                activation_date: activationDate,
                warranty_end_date: expiryDate,
                invoice_photo_url: data.invoicePhotoUrl,
                device_photo_url: data.devicePhotoUrl,
                packaging_photo_url: data.packagingPhotoUrl,
                updated_by: 'العميل (تفعيل إلكتروني)',
                updated_at: new Date().toISOString(),
              })
              .eq('serial_number', upperSerial);
          } catch (sbErr) {
            console.error('Supabase serial activation sync error:', sbErr);
          }
        })();
      }
    }

    const updatedWarranties = [newWarranty, ...registeredWarranties];
    setRegisteredWarranties(updatedWarranties);
    setCurrentWarranty(newWarranty);
    localStorage.setItem('mostaqbal_warranties', JSON.stringify(updatedWarranties));

    // Celebratory confetti animation
    try {
      confetti({
        particleCount: 130,
        spread: 85,
        origin: { y: 0.6 },
        colors: ['#2563eb', '#ef4444', '#f97316', '#eab308', '#ffffff'],
      });
    } catch (e) {
      console.log('Confetti triggered', e);
    }

    return newWarranty;
  };

  const searchWarranty = (query: string): RegisteredWarranty | null => {
    const q = query.trim().toLowerCase();
    if (!q) return null;

    const found = registeredWarranties.find(w => 
      (w.serialNumber && w.serialNumber.toLowerCase().includes(q)) ||
      w.customerPhone.replace(/[^0-9]/g, '').includes(q.replace(/[^0-9]/g, '')) ||
      w.id.toLowerCase().includes(q) ||
      (w.maintenanceTicket && w.maintenanceTicket.ticketId.toLowerCase().includes(q))
    );

    return found || null;
  };

  const t = translations[language];

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        theme,
        setTheme,
        toggleTheme,
        t,
        batchSerials,
        registeredWarranties,
        currentWarranty,
        setCurrentWarranty,
        activeTab,
        setActiveTab,
        isMapModalOpen,
        setIsMapModalOpen,
        selectedBrand,
        setSelectedBrand,
        selectedCategory,
        setSelectedCategory,
        selectedSubModel,
        setSelectedSubModel,
        verifySerial,
        registerNewWarranty,
        searchWarranty,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
