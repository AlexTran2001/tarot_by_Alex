This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Database Schema Notes

The booking → meeting → spread cards workflow relies on two additional tables in Supabase. Run the SQL below (or apply equivalent migrations) before using the new admin UI.

```sql
-- Meetings table
create table if not exists public.meetings (
  id uuid primary key default uuid_generate_v4(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  title text,
  scheduled_for timestamptz,
  platform text,
  meeting_link text,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists meetings_booking_id_idx on public.meetings(booking_id);

-- Spread cards table
create table if not exists public.spread_cards (
  id uuid primary key default uuid_generate_v4(),
  meeting_id uuid not null references public.meetings(id) on delete cascade,
  question text not null,
  answer text not null,
  image_urls text[] not null default '{}',
  position integer,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists spread_cards_meeting_id_idx on public.spread_cards(meeting_id);

-- Optional trigger to keep updated_at in sync
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$ language plpgsql;

do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'set_updated_at_meetings'
  ) then
    create trigger set_updated_at_meetings
      before update on public.meetings
      for each row execute procedure public.set_updated_at();
  end if;

  if not exists (
    select 1 from pg_trigger where tgname = 'set_updated_at_spread_cards'
  ) then
    create trigger set_updated_at_spread_cards
      before update on public.spread_cards
      for each row execute procedure public.set_updated_at();
  end if;
end;
$$;
```

Enable RLS as needed and adjust policies to allow authenticated admins to manage these records.

### Booking table extensions

The admin booking form expects a couple of new fields on the existing `bookings` table:

```sql
alter table public.bookings
  add column if not exists phone text,
  add column if not exists customer_user_id uuid references auth.users(id);

create index if not exists bookings_customer_user_id_idx on public.bookings(customer_user_id);
```

The existing `note` column is reused as the booking description shown throughout the admin UI.
