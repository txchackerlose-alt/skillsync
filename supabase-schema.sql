-- ══════════════════════════════════════════════════════
--  SkillSync MVP — Supabase Schema
--  Run this in: Supabase Dashboard → SQL Editor → New Query
-- ══════════════════════════════════════════════════════

-- Drop existing tables if they exist to start fresh
drop table if exists poll_responses cascade;
drop table if exists poll_options cascade;
drop table if exists polls cascade;
drop table if exists project_requests cascade;
drop table if exists project_skills cascade;
drop table if exists project_members cascade;
drop table if exists projects cascade;
drop table if exists notifications cascade;
drop table if exists feedback cascade;
drop table if exists task_assignments cascade;
drop table if exists tasks cascade;
drop table if exists resumes cascade;
drop table if exists employee_skills cascade;
drop table if exists profiles cascade;

-- ── Profiles (extends auth.users) ────────────────────
create table if not exists profiles (
  id          uuid references auth.users on delete cascade primary key,
  name        text        not null,
  role        text        not null check (role in ('manager', 'employee')),
  email       text,
  dept        text,
  bio         text,
  created_at  timestamptz default now()
);

-- Auto-create a profile row when a new user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, name, role, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'employee'),
    new.email
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── Employee Skills ───────────────────────────────────
create table if not exists employee_skills (
  id          serial primary key,
  employee_id uuid references profiles(id) on delete cascade,
  skill       text not null
);

-- ── Resumes ───────────────────────────────────────────
create table if not exists resumes (
  id           serial primary key,
  employee_id  uuid references profiles(id) on delete cascade,
  file_url     text not null,
  file_name    text not null,
  created_at   timestamptz default now()
);

-- ── Tasks ─────────────────────────────────────────────
create table if not exists tasks (
  id              serial primary key,
  title           text    not null,
  description     text,
  priority        text    default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  deadline        text,
  required_skills text[], -- Array of strings for skills
  status          text    default 'Not Started' check (status in ('Not Started', 'In Progress', 'Completed')),
  created_by      uuid    references profiles(id),
  created_at      timestamptz default now()
);

-- ── Task Assignments ──────────────────────────────────
create table if not exists task_assignments (
  task_id     integer references tasks(id) on delete cascade,
  employee_id uuid references profiles(id) on delete cascade,
  assigned_at timestamptz default now(),
  primary key (task_id, employee_id)
);

-- ── Feedback ──────────────────────────────────────────
create table if not exists feedback (
  id          serial primary key,
  task_id     integer references tasks(id) on delete cascade,
  manager_id  uuid references profiles(id) on delete cascade,
  employee_id uuid references profiles(id) on delete cascade,
  comment     text not null,
  created_at  timestamptz default now()
);

-- ── Notifications ─────────────────────────────────────
create table if not exists notifications (
  id          serial primary key,
  user_id     uuid references profiles(id) on delete cascade,
  message     text not null,
  read        boolean default false,
  created_at  timestamptz default now()
);


-- ══════════════════════════════════════════════════════
--  Row Level Security
-- ══════════════════════════════════════════════════════
alter table profiles         enable row level security;
alter table employee_skills  enable row level security;
alter table resumes          enable row level security;
alter table tasks            enable row level security;
alter table task_assignments enable row level security;
alter table feedback         enable row level security;
alter table notifications    enable row level security;

-- Profiles: everyone authenticated can read, own row can update
create policy "Read all profiles"   on profiles for select using (auth.role() = 'authenticated');
create policy "Update own profile"  on profiles for update using (auth.uid() = id);

-- Skills: everyone authenticated can read, manage own
create policy "Read all skills"     on employee_skills for select using (auth.role() = 'authenticated');
create policy "Manage own skills"   on employee_skills for all    using (auth.uid() = employee_id);

-- Resumes: everyone can read, own can insert/update
create policy "Read all resumes"    on resumes for select using (auth.role() = 'authenticated');
create policy "Manage own resumes"  on resumes for all    using (auth.uid() = employee_id);

-- Tasks: everyone authenticated can read, only managers can insert/update
create policy "Read all tasks"      on tasks for select using (auth.role() = 'authenticated');
create policy "Manager manage tasks" on tasks for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'manager')
);
-- Employee can update task status if they are assigned to it
create policy "Employee update assigned tasks" on tasks for update using (
  exists (select 1 from task_assignments where task_id = tasks.id and employee_id = auth.uid())
);

-- Task Assignments: read all, managers assign
create policy "Read all assignments" on task_assignments for select using (auth.role() = 'authenticated');
create policy "Manager manage assignments" on task_assignments for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'manager')
);

-- Feedback: read all, managers leave feedback
create policy "Read all feedback"   on feedback for select using (auth.role() = 'authenticated');
create policy "Manager leave feedback" on feedback for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'manager')
);

-- Notifications: read own, update own
create policy "Read own notifications" on notifications for select using (auth.uid() = user_id);
create policy "Update own notifications" on notifications for update using (auth.uid() = user_id);

-- System can create notifications (bypassing RLS or creating an insert policy)
create policy "Insert notifications" on notifications for insert with check (auth.role() = 'authenticated');

-- ══════════════════════════════════════════════════════
--  Seed Data (Optional)
-- ══════════════════════════════════════════════════════
create extension if not exists pgcrypto;

do $$
declare
  manager_id uuid := gen_random_uuid();
  employee_id uuid := gen_random_uuid();
begin
  -- 1. Insert Manager into auth.users
  insert into auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at
  ) values (
    manager_id, 'authenticated', 'authenticated', 'manager@company.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"name": "Manager One", "role": "manager"}', now(), now()
  );

  -- 2. Insert Employee into auth.users
  insert into auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at
  ) values (
    employee_id, 'authenticated', 'authenticated', 'employee@company.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"name": "Employee One", "role": "employee"}', now(), now()
  );

  -- Update generated profiles
  update public.profiles set dept = 'Management', bio = 'Engineering Manager' where id = manager_id;
  update public.profiles set dept = 'Frontend', bio = 'React Developer' where id = employee_id;

  -- Add some skills
  insert into employee_skills (employee_id, skill) values
    (employee_id, 'React'),
    (employee_id, 'Next.js'),
    (employee_id, 'Tailwind');
    
  -- Add a task
  insert into tasks (title, description, priority, deadline, required_skills, status, created_by) values
    ('Build Dashboard UI', 'Create a responsive dashboard using Tailwind', 'high', '2026-05-01', ARRAY['React', 'Tailwind'], 'In Progress', manager_id);
    
  -- Assign task
  insert into task_assignments (task_id, employee_id) values (1, employee_id);

end;
$$;
