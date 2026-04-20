-- ══════════════════════════════════════════════════════
--  SkillSync — Task Lifecycle Migration
--  Run this in: Supabase Dashboard → SQL Editor → New Query
--  This is ADDITIVE — it will NOT delete existing data.
-- ══════════════════════════════════════════════════════

-- ── 1. Update tasks table status constraint ───────────
-- Drop old constraint and add new one with expanded statuses
alter table tasks drop constraint if exists tasks_status_check;
alter table tasks add constraint tasks_status_check
  check (status in (
    'Not Started',
    'In Progress',
    'Submitted for Review',
    'Completed',
    'Rejected',
    'Overdue'
  ));

-- ── 2. Add new columns to tasks table ────────────────
alter table tasks add column if not exists progress        integer default 0 check (progress >= 0 and progress <= 100);
alter table tasks add column if not exists review_status   text    check (review_status in ('Submitted', 'Approved', 'Rejected'));
alter table tasks add column if not exists manager_feedback text;
alter table tasks add column if not exists completed_at    timestamptz;
alter table tasks add column if not exists reviewed_at     timestamptz;
alter table tasks add column if not exists updated_at      timestamptz default now();

-- ── 3. Create task_comments table ────────────────────
create table if not exists task_comments (
  id         serial primary key,
  task_id    integer references tasks(id) on delete cascade not null,
  user_id    uuid    references profiles(id) on delete cascade not null,
  comment    text not null,
  created_at timestamptz default now()
);

-- ── 4. Create task_files table ───────────────────────
create table if not exists task_files (
  id          serial primary key,
  task_id     integer references tasks(id) on delete cascade not null,
  uploaded_by uuid    references profiles(id) on delete cascade not null,
  file_url    text not null,
  file_name   text not null,
  created_at  timestamptz default now()
);

-- ── 5. Create task_updates table ─────────────────────
create table if not exists task_updates (
  id         serial primary key,
  task_id    integer references tasks(id) on delete cascade not null,
  progress   integer not null check (progress >= 0 and progress <= 100),
  note       text,
  created_by uuid references profiles(id) on delete cascade not null,
  created_at timestamptz default now()
);

-- ── 6. Enable RLS on new tables ──────────────────────
alter table task_comments enable row level security;
alter table task_files    enable row level security;
alter table task_updates  enable row level security;

-- ── 7. RLS Policies for task_comments ────────────────
create policy "Read all task comments"
  on task_comments for select
  using (auth.role() = 'authenticated');

create policy "Authenticated users can add comments"
  on task_comments for insert
  with check (auth.uid() = user_id);

-- ── 8. RLS Policies for task_files ───────────────────
create policy "Read all task files"
  on task_files for select
  using (auth.role() = 'authenticated');

create policy "Authenticated users can upload task files"
  on task_files for insert
  with check (auth.uid() = uploaded_by);

-- ── 9. RLS Policies for task_updates ─────────────────
create policy "Read all task updates"
  on task_updates for select
  using (auth.role() = 'authenticated');

create policy "Authenticated users can post updates"
  on task_updates for insert
  with check (auth.uid() = created_by);

-- ── 10. Allow employees to update tasks assigned to them ─
-- (The existing policy may not cover all new status values — replace it)
drop policy if exists "Employee update assigned tasks" on tasks;
create policy "Employee update assigned tasks"
  on tasks for update
  using (
    exists (
      select 1 from task_assignments
      where task_id = tasks.id and employee_id = auth.uid()
    )
  );

-- ── 11. Grant managers full access to delete tasks ───
drop policy if exists "Manager manage tasks" on tasks;
create policy "Manager manage tasks"
  on tasks for all
  using (
    exists (select 1 from profiles where id = auth.uid() and role = 'manager')
  );
