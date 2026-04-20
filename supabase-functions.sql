-- Run this AFTER supabase-schema.sql
-- In Supabase Dashboard → SQL Editor

-- Function to safely increment a poll option's vote count
create or replace function increment_vote(option_id integer)
returns void language sql security definer as $$
  update poll_options set votes = votes + 1 where id = option_id;
$$;
