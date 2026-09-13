-- ==============================================================================
-- Al Mostaqbal Tech (المستقبل تك) - Official Supabase PostgreSQL Schema
-- Zero-Cost Free Tier Architecture (< 500MB, supports millions of records)
-- Realtime synchronization enabled across all admin sessions
-- ==============================================================================

-- 1. Users & Admin Accounts Table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'ADMIN', -- 'SUPER_ADMIN' | 'ADMIN'
  email TEXT,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seed Default Management Accounts (Passwords hashed with Bcrypt)
INSERT INTO users (id, username, display_name, role, email, password_hash)
VALUES
  ('admin-walid', 'وليد', 'وليد (المدير التنفيذي)', 'SUPER_ADMIN', 'elmostkbaltech@gmail.com', '$2b$10$WSisBhOD/5cZaHNY7Prymu46SNu1MVFwE4toDtgirPGEKo.WZaTzi'),
  ('admin-karim', 'كريم', 'كريم (مسؤول الصيانة والضمانات)', 'ADMIN', 'elmostkbaltech@gmail.com', '$2b$10$N4QBnpZgHIO6wJJgxa6P8.YMBspq1q8Ui4hBMf99xe9otE06L1/Cm'),
  ('admin-abdelrahman', 'عبد الرحمن', 'عبد الرحمن (مسؤول الشحنات والمخزون)', 'ADMIN', 'elmostkbaltech@gmail.com', '$2b$10$phph/LHCPXdHbHbyt4BR/uWJQLhHbRWolNqQqZhroEPVM9USXNqyG')
ON CONFLICT (username) DO NOTHING;


-- 2. Shipments & Import Batches Table (شحنات الاستيراد)
CREATE TABLE IF NOT EXISTS shipments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT NOT NULL, -- 'AIWA' | 'TIGER' | 'A90_PRO'
  category TEXT NOT NULL, -- 'CAR_SCREENS' | 'DSP_PROCESSORS' | 'LED_LIGHTS'
  arrival_date DATE NOT NULL,
  model_name TEXT NOT NULL,
  notes TEXT,
  created_by TEXT NOT NULL DEFAULT 'الإدارة العامة',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);


-- 3. Serial Numbers Table (سيريالات الأجهزة المعتمدة)
CREATE TABLE IF NOT EXISTS serials (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  serial_number TEXT UNIQUE NOT NULL,
  shipment_id TEXT REFERENCES shipments(id) ON DELETE CASCADE,
  brand TEXT NOT NULL,
  model_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'AVAILABLE', -- 'AVAILABLE' | 'CLAIMED' | 'EXPIRED'
  customer_name TEXT,
  customer_phone TEXT,
  purchase_date DATE,
  activation_date TIMESTAMPTZ,
  warranty_end_date TIMESTAMPTZ,
  invoice_photo_url TEXT, -- Base64 DataURL or Supabase Storage URL (Compressed WebP < 150KB)
  device_photo_url TEXT,
  packaging_photo_url TEXT,
  created_by TEXT NOT NULL DEFAULT 'الإدارة العامة',
  updated_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Fast Index for instantaneous customer and admin serial lookups
CREATE INDEX IF NOT EXISTS idx_serials_number ON serials (serial_number);
CREATE INDEX IF NOT EXISTS idx_serials_status ON serials (status);
CREATE INDEX IF NOT EXISTS idx_serials_phone ON serials (customer_phone);
CREATE INDEX IF NOT EXISTS idx_serials_shipment ON serials (shipment_id);


-- 4. Maintenance & RMA Tickets Table (تذاكر وعمليات الصيانة)
CREATE TABLE IF NOT EXISTS maintenance_tickets (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  ticket_id TEXT UNIQUE NOT NULL,
  serial_number TEXT,
  brand TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  device_model TEXT NOT NULL,
  issue_description TEXT NOT NULL,
  current_step TEXT NOT NULL DEFAULT 'IN_TRANSIT', -- 'IN_TRANSIT' | 'UNDER_MAINTENANCE' | 'READY_FOR_PICKUP'
  created_by TEXT NOT NULL DEFAULT 'الإدارة العامة',
  updated_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tickets_phone ON maintenance_tickets (customer_phone);
CREATE INDEX IF NOT EXISTS idx_tickets_serial ON maintenance_tickets (serial_number);


-- 5. Non-Serial Items Table (أجهزة الليد ومعالجات DSP المسجلة بفاتورة)
CREATE TABLE IF NOT EXISTS non_serial_items (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  brand TEXT NOT NULL,
  category TEXT NOT NULL, -- 'LED_LIGHTS' | 'DSP_PROCESSORS' | 'CAR_SCREENS'
  model_name TEXT NOT NULL,
  purchase_date DATE NOT NULL,
  invoice_photo_url TEXT, -- Compressed WebP < 150KB
  notes TEXT,
  created_by TEXT NOT NULL DEFAULT 'الفرع الرئيسي',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_non_serial_phone ON non_serial_items (customer_phone);


-- 6. Contact Inquiries / Messages Table (رسائل واستفسارات العملاء)
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'UNREAD',
  created_at TIMESTAMPTZ DEFAULT now()
);


-- ==============================================================================
-- 7. Realtime Replication Configuration
-- Enables instant live WebSocket updates across all admin sessions
-- ==============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE shipments;
ALTER PUBLICATION supabase_realtime ADD TABLE serials;
ALTER PUBLICATION supabase_realtime ADD TABLE maintenance_tickets;
ALTER PUBLICATION supabase_realtime ADD TABLE non_serial_items;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- Transmit old record on UPDATE events for precise diffing
ALTER TABLE serials REPLICA IDENTITY FULL;
ALTER TABLE maintenance_tickets REPLICA IDENTITY FULL;


-- ==============================================================================
-- 8. Row-Level Security (RLS) & Policies
-- ==============================================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE serials ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE non_serial_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Allow public read access to verify warranty & maintenance by customer
CREATE POLICY "Public serials read access" ON serials FOR SELECT USING (true);
CREATE POLICY "Public serials update for activation" ON serials FOR UPDATE USING (true);

-- Allow public ticket lookup & contact message submission
CREATE POLICY "Public ticket read access" ON maintenance_tickets FOR SELECT USING (true);
CREATE POLICY "Public messages insert access" ON messages FOR INSERT WITH CHECK (true);

-- Admin full access policies
CREATE POLICY "Admin full access users" ON users FOR ALL USING (true);
CREATE POLICY "Admin full access shipments" ON shipments FOR ALL USING (true);
CREATE POLICY "Admin full access serials" ON serials FOR ALL USING (true);
CREATE POLICY "Admin full access maintenance_tickets" ON maintenance_tickets FOR ALL USING (true);
CREATE POLICY "Admin full access non_serial_items" ON non_serial_items FOR ALL USING (true);
CREATE POLICY "Admin full access messages" ON messages FOR ALL USING (true);
