-- Run this in Supabase SQL editor

create table if not exists subscriptions (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references users(id) on delete cascade,
  stripe_customer_id    text unique,
  stripe_subscription_id text unique,
  plan                  text not null default 'free',       -- 'free' | 'pro'
  status                text not null default 'active',     -- 'active' | 'trialing' | 'past_due' | 'canceled'
  trial_ends_at         timestamptz,
  current_period_end    timestamptz,
  cancel_at_period_end  boolean not null default false,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index if not exists subscriptions_user_id_idx
  on subscriptions(user_id);

create index if not exists subscriptions_stripe_customer_id_idx
  on subscriptions(stripe_customer_id);

create index if not exists subscriptions_stripe_subscription_id_idx
  on subscriptions(stripe_subscription_id);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger subscriptions_updated_at
  before update on subscriptions
  for each row execute function update_updated_at();

-- RLS: service role only (all access goes through Next.js API layer)
alter table subscriptions enable row level security;
