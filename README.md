# GrantPilot 🌍

> AI-powered grant applications for African founders — built to bridge the translation gap between great businesses and the funding they deserve.

**Live:** [grantpilot-nine.vercel.app](https://grantpilot-nine.vercel.app)

---

## The Problem

The Tony Elumelu Foundation receives over 200,000 grant applications every year. Most are rejected — not because the businesses aren't viable, but because African founders were never taught to speak funder language.

GrantPilot fixes that.

---

## What It Does

1. **Describe your business** — Answer 8 focused questions about your problem, customers, traction, and funding needs
2. **Choose your grant** — Select from 7 major funding opportunities
3. **Generate your application** — AI writes all 8 sections tailored to that specific funder's criteria and language
4. **Export and apply** — Download as HTML or text, ready to paste into any application portal

### Supported Grants
- Tony Elumelu Foundation
- Y Combinator
- Seedstars Africa
- Google for Startups Africa
- Mastercard Foundation
- African Development Bank (AFAWA)
- Catapult: Innovate for Africa

---

## Tech Stack

| Layer | Tool |
|---|---|
| Framework | Next.js 14 (App Router) |
| Database + Auth | Supabase |
| AI Engine | Claude API (Anthropic) |
| Hosting | Vercel |
| Analytics | Novus.ai |
| Styling | Tailwind CSS |

---

## Getting Started (Local Development)

### Prerequisites
- Node.js 18+
- A Supabase account
- An Anthropic API key

### Installation

```bash
git clone https://github.com/yourusername/grantpilot.git
cd grantpilot
npm install
```

### Environment Variables

Create a `.env.local` file in the root:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
ANTHROPIC_API_KEY=your_anthropic_key
```

### Database Setup

Run the following SQL in your Supabase SQL editor:

```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Business profiles
create table business_profiles (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  business_name text not null,
  description text,
  country text,
  sector text,
  stage text,
  traction text,
  problem text,
  customers text,
  funding_use text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Grants
create table grants (
  id uuid default uuid_generate_v4() primary key,
  slug text unique not null,
  name text not null,
  provider text not null,
  description text,
  criteria text,
  tone text,
  max_amount text,
  deadline text,
  logo_url text
);

-- Applications
create table applications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  profile_id uuid references business_profiles(id) on delete cascade,
  grant_id uuid references grants(id),
  sections jsonb default '{}',
  scores jsonb default '{}',
  status text default 'draft',
  version integer default 1,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Row Level Security
alter table business_profiles enable row level security;
alter table applications enable row level security;

create policy "Users can only access their own profiles"
  on business_profiles for all using (auth.uid() = user_id);

create policy "Users can only access their own applications"
  on applications for all using (auth.uid() = user_id);
```

### Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deployment

Deployed on Vercel. Add your three environment variables in the Vercel project settings and deploy directly from GitHub.

---

## Built For

[Mind the Product — World Product Day Hackathon 2026](https://mindtheproduct.devpost.com)

---

## License

MIT