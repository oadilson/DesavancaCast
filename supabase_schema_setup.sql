-- Create a table for public profiles
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  first_name text,
  last_name text,
  avatar_url text,
  updated_at timestamp with time zone default now()
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;

-- Create a policy to allow authenticated users to view their own profile
create policy "Public profiles are viewable by authenticated users."
  on profiles for select
  using ( auth.role() = 'authenticated' );

-- Create a policy to allow authenticated users to insert their own profile
create policy "Authenticated users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

-- Create a policy to allow authenticated users to update their own profile
create policy "Authenticated users can update their own profile."
  on profiles for update
  using ( auth.uid() = id );

-- This trigger automatically creates a profile entry when a new user signs up
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, first_name)
  values (new.id, new.raw_user_meta_data->>'first_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();