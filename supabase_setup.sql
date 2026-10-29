-- SQL untuk membuat tabel di Supabase SQL Editor

CREATE TABLE debts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  total NUMERIC NOT NULL,
  minimum_payment NUMERIC,
  due_date DATE NOT NULL,
  is_paid BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Opsional: Enable Row Level Security agar bisa diakses dari client dengan anon key
ALTER TABLE debts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations for anon" ON debts
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Seed data awal (opsional, bisa juga pakai tombol Seed di aplikasi)
INSERT INTO debts (name, total, minimum_payment, due_date) VALUES
('Tokopedia Card (Bank BRI)', 106136842, 5306842, '2026-11-01'),
('GoPayLater', 3392863, 3392863, '2026-11-01'),
('Kartu Kredit Bank BRI (Hernando)', 29879776, 1493989, '2026-11-03'),
('Superbank', 9355930, 9355930, '2026-11-03'),
('SPinjam', 4776055, 4776055, '2026-11-03'),
('GoPay Pinjam', 4850056, 4850056, '2026-11-03'),
('TMRW Credit Card', 4805531, 308124, '2026-11-05'),
('UOB Privimiles Card', 36812993, 2360400, '2026-11-05'),
('BCA Paylater', 54814954, 21224074, '2026-11-08');
