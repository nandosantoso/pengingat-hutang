# Pengingat Hutang

Aplikasi web dashboard pengingat hutang dengan desain brutalist modern.

## Setup

1. Clone repo
2. Copy `.env.example` ke `.env` dan isi kredensial Supabase
3. Jalankan SQL di Supabase SQL Editor (lihat README atau di bawah)
4. `npm install`
5. `npm run dev`

## SQL Table

```sql
CREATE TABLE debts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  total NUMERIC NOT NULL,
  minimum_payment NUMERIC,
  due_date DATE NOT NULL,
  is_paid BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (optional, for public anon access)
ALTER TABLE debts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all for anon" ON debts
  FOR ALL USING (true) WITH CHECK (true);
```

## Seed Data (opsional)

Jalankan insert statements di SQL Editor atau gunakan tombol seed di app (jika diimplementasikan).
