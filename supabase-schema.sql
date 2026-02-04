-- Supabase Database Schema for TradeTax
-- Run this SQL in your Supabase project's SQL Editor

-- =============================================================================
-- PROFILES TABLE
-- =============================================================================

-- Create profiles table to store user profile information
create table profiles (
  id uuid references auth.users not null primary key,
  email text unique not null,
  full_name text,
  company_name text,
  phone text,
  address text,
  tax_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable Row Level Security on profiles
alter table profiles enable row level security;

-- Create policies for profiles
-- Users can view their own profile
create policy "Users can view own profile" on profiles
  for select using (auth.uid() = id);

-- Users can insert their own profile
create policy "Users can insert own profile" on profiles
  for insert with check (auth.uid() = id);

-- Users can update their own profile
create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);

-- =============================================================================
-- TRANSACTIONS TABLE
-- =============================================================================

-- Add user_id column to existing transactions table if not exists
-- Uncomment the line below if the column doesn't exist:
-- alter table transactions add column user_id uuid references auth.users;

-- Ensure user_id has an index for faster queries
create index if not exists idx_transactions_user_id on transactions(user_id);

-- Enable Row Level Security on transactions
alter table transactions enable row level security;

-- Create policies for transactions
create policy "Users can view own transactions" on transactions
  for select using (auth.uid() = user_id);

create policy "Users can insert own transactions" on transactions
  for insert with check (auth.uid() = user_id);

create policy "Users can update own transactions" on transactions
  for update using (auth.uid() = user_id);

create policy "Users can delete own transactions" on transactions
  for delete using (auth.uid() = user_id);

-- =============================================================================
-- MILEAGE TRIPS TABLE
-- =============================================================================

-- Add user_id column to existing mileage_trips table if not exists
-- Uncomment the line below if the column doesn't exist:
-- alter table mileage_trips add column user_id uuid references auth.users;

-- Ensure user_id has an index for faster queries
create index if not exists idx_mileage_trips_user_id on mileage_trips(user_id);

-- Enable Row Level Security on mileage_trips
alter table mileage_trips enable row level security;

-- Create policies for mileage_trips
create policy "Users can view own mileage trips" on mileage_trips
  for select using (auth.uid() = user_id);

create policy "Users can insert own mileage trips" on mileage_trips
  for insert with check (auth.uid() = user_id);

create policy "Users can update own mileage trips" on mileage_trips
  for update using (auth.uid() = user_id);

create policy "Users can delete own mileage trips" on mileage_trips
  for delete using (auth.uid() = user_id);

-- =============================================================================
-- AUTO-CREATE PROFILE FUNCTION
-- =============================================================================

-- Function to automatically create a profile when a new user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call the function when a new user is created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =============================================================================
-- UTILITY FUNCTIONS
-- =============================================================================

-- Function to update the updated_at timestamp
create or replace function update_modified_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language 'plpgsql';

-- Apply the update function to profiles table
create trigger update_profiles_modtime
  before update on profiles
  for each row execute function update_modified_column();

-- =============================================================================
-- EMAIL CONFIRMATION SETTINGS
-- =============================================================================
-- Note: By default, Supabase requires email confirmation.
-- To disable it (not recommended for production), run:
-- update auth.users set email_confirmed_at = now() where id = 'user-id';

-- Or configure in Supabase Dashboard:
-- Authentication > Providers > Email > Confirm email
