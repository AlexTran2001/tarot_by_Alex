# TarotByAlex Change Log

## 2025-11-13 — Booking Meetings & Spread Cards

- Added secure Supabase-admin REST endpoints under `/api/admin/meetings` to create, fetch, update, and delete meetings linked to bookings, including nested spread cards management.
- Added `/api/admin/meetings/[meetingId]/spread-cards` and `/api/admin/spread-cards/[spreadCardId]` routes so multiple spread cards can be attached to each meeting, with support for question, answer, and image gallery data.
- Introduced admin UI at `booking/[bookingId]/meeting` for configuring a meeting after a booking, capturing platform details, meeting links, notes, and creating multiple spread cards.
- Surfaced a “Meeting” action in the booking management table to jump directly into the new meeting workspace.
- Documented the required Supabase SQL migrations (new `meetings` and `spread_cards` tables plus triggers) in `README.md` for easy setup.

## 2025-11-13 — Admin Booking Creation Enhancements

- Expanded `/api/booking` to accept phone numbers, booking descriptions, and an optional `customerAccountId` (stored as `customer_user_id`) so admin-created bookings can link to existing accounts.
- Added `/api/admin/users/search` for secure email lookups when tagging a booking to a Supabase auth account.
- Built `booking/new` admin page with form controls for customer contact details, booking metadata, and optional account tagging.
- Updated booking management and meeting detail views to display phone numbers and linked-account status, plus added a quick “Tạo booking” shortcut.
- Noted the required `bookings.phone` and `bookings.customer_user_id` columns (and index) in the database schema section of the README.


