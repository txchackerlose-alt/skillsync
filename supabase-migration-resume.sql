-- ══════════════════════════════════════════════════════
--  SkillSync — Resume Parser Migration
--  Run this in: Supabase Dashboard → SQL Editor → New Query
--  This is ADDITIVE — it will NOT delete existing data.
-- ══════════════════════════════════════════════════════

-- 1. Add resume_text column to profiles table to store extracted text
alter table profiles add column if not exists resume_text text;

-- (Optional) If you want to track where skills came from, you can add a source column
-- alter table employee_skills add column if not exists source text default 'manual';
