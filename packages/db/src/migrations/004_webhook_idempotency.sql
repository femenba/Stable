-- Webhook idempotency hardening
-- Fixes duplicate lifecycle emails (e.g. multiple cancellation emails) caused by
-- a check-then-act race in the email dedup. Run this in the Supabase SQL editor.

-- 1. Allow a 'pending' state on email_logs so the send path can claim a row
--    BEFORE sending (atomic dedup via the existing unique index), then finalize.
alter table email_logs
  drop constraint if exists email_logs_status_check;

alter table email_logs
  add constraint email_logs_status_check
  check (status in ('pending', 'sent', 'failed', 'skipped'));

-- 2. Event-level idempotency: one row per Stripe event id. The webhook claims
--    the event atomically (insert; primary-key conflict => already processed)
--    so the entire handler runs at most once per delivery, not just emails.
create table if not exists processed_webhook_events (
  event_id     text        primary key,
  event_type   text,
  processed_at timestamptz not null default now()
);

alter table processed_webhook_events enable row level security;
