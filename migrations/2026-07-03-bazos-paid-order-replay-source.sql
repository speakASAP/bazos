-- Goal 24: Bazos paid order source projection for order-affinity replay.
-- This migration adds only bounded local replay eligibility fields; it does not
-- store customer, address, provider payment, raw marketplace, or secret data.

ALTER TABLE bazos_orders
  ADD COLUMN IF NOT EXISTS "paymentStatus" varchar(50) NOT NULL DEFAULT 'unknown',
  ADD COLUMN IF NOT EXISTS "paidAt" timestamp(6),
  ADD COLUMN IF NOT EXISTS "itemSnapshots" jsonb;

CREATE INDEX IF NOT EXISTS bazos_orders_paymentStatus_idx
  ON bazos_orders ("paymentStatus");

CREATE INDEX IF NOT EXISTS bazos_orders_paidAt_idx
  ON bazos_orders ("paidAt");
