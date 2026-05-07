-- Email delivery log
-- Tracks every email send attempt with deduplication via stripe_event_id + email_type.
-- Run this in the Supabase SQL editor.

create table if not exists email_logs (
  id                uuid        primary key default gen_random_uuid(),
  user_id           uuid        references users(id) on delete set null,
  stripe_event_id   text,
  email_type        text        not null,
  recipient         text        not null,
  subject           text        not null,
  status            text        not null default 'sent'
    check (status in ('sent', 'failed', 'skipped')),
  error             text,
  resend_id         text,
  created_at        timestamptz not null default now()
);

-- Prevent duplicate email sends for the same Stripe event
create unique index if not exists email_logs_stripe_dedup_idx
  on email_logs(stripe_event_id, email_type)
  where stripe_event_id is not null;

create index if not exists email_logs_user_id_idx      on email_logs(user_id);
create index if not exists email_logs_email_type_idx   on email_logs(email_type);
create index if not exists email_logs_created_at_idx   on email_logs(created_at desc);

-- RLS: service role only
alter table email_logs enable row level security;
