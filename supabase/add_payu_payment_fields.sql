-- One-time migration: adds fields needed for real PayU online payments.
-- payu_txn_id is the unique transaction id sent to PayU (separate from our
-- own order id, since PayU txnid must be unique per attempt and an order
-- could in theory be retried). gateway_response stores PayU's raw callback
-- payload for auditing/support. Safe to re-run.

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payu_txn_id TEXT,
  ADD COLUMN IF NOT EXISTS gateway_response JSONB;

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_payu_txn_id ON public.orders(payu_txn_id) WHERE payu_txn_id IS NOT NULL;
