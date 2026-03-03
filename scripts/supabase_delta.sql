-- Supabase Delta Script
-- Run in Supabase SQL Editor (dashboard.supabase.com → SQL Editor)
-- Safe to re-run: all statements are idempotent.
--
-- NOTE: HNSW/IVFFlat indexes are capped at 2000 dimensions.
-- vector(2048) exceeds that cap, so no vector index is created here.
-- pgvector falls back to an exact sequential scan, which is fast at
-- portfolio scale.

-- 1. Updated match_chunks — adds match_threshold param
create or replace function match_chunks(
  query_embedding  vector(2048),
  match_count      int,
  match_threshold  float default 0.65
)
returns table (content text, source text, category text)
language sql stable as $$
  select content, source, category
  from portfolio_chunks
  where 1 - (embedding <=> query_embedding) >= match_threshold
  order by embedding <=> query_embedding
  limit match_count;
$$;

-- 2. FTS generated column for BM25 (safe to re-run)
alter table portfolio_chunks
  add column if not exists fts tsvector
  generated always as (to_tsvector('english', content)) stored;

-- 3. GIN index on fts column
create index if not exists portfolio_chunks_fts_idx
  on portfolio_chunks using gin(fts);

-- 4. Hybrid RPC using Reciprocal Rank Fusion (vector + BM25)
create or replace function match_chunks_hybrid(
  query_embedding  vector(2048),
  query_text       text,
  match_count      int   default 8,
  match_threshold  float default 0.5
)
returns table (content text, source text, category text)
language plpgsql stable as $$
declare
  rrf_k int := 60;
begin
  return query
  with vector_hits as (
    select id,
      row_number() over (order by embedding <=> query_embedding) as rn
    from portfolio_chunks
    where 1 - (embedding <=> query_embedding) >= match_threshold
    order by embedding <=> query_embedding
    limit match_count * 3
  ),
  text_hits as (
    select id,
      row_number() over (
        order by ts_rank(fts, websearch_to_tsquery('english', query_text)) desc
      ) as rn
    from portfolio_chunks
    where fts @@ websearch_to_tsquery('english', query_text)
    limit match_count * 3
  ),
  combined as (
    select
      coalesce(v.id, t.id) as id,
      coalesce(1.0 / (rrf_k + v.rn), 0) +
      coalesce(1.0 / (rrf_k + t.rn), 0) as score
    from vector_hits v
    full outer join text_hits t on v.id = t.id
  )
  select p.content, p.source, p.category
  from combined c
  join portfolio_chunks p on p.id = c.id
  order by c.score desc
  limit match_count;
end;
$$;

-- 5. Chat logs table
create table if not exists chat_logs (
  id                bigserial primary key,
  session_id        text        not null,
  user_message      text        not null,
  assistant_message text        not null,
  created_at        timestamptz default now()
);

-- 6. Add retrieved_chunks column to chat_logs
alter table chat_logs
  add column if not exists retrieved_chunks jsonb;
