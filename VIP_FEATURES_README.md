# VIP Features Implementation

This document describes the VIP user features that have been implemented for the Tarot by Alex website.

## Overview

The VIP system provides premium content and features for subscribed users, including:
- Daily Tarot card readings
- Magazine articles
- Tarot lessons
- User progress tracking
- Account data saving

## Database Schema

Run the SQL file `supabase_vip_schema.sql` in your Supabase SQL editor to create the following tables:

1. **vip_users** - Tracks VIP status and expiration dates
2. **daily_cards** - Stores daily Tarot card readings
3. **magazines** - Stores magazine articles for VIP users
4. **lessons** - Stores Tarot lessons and courses
5. **user_progress** - Tracks user progress in lessons and cards
6. **user_saved_data** - Saves user account data and history

All tables have Row Level Security (RLS) enabled to ensure only VIP users can access the content.

## API Routes

### VIP Status
- `GET /api/vip/status` - Check VIP status for current user

### Today's Card
- `GET /api/vip/today-card` - Get today's Tarot card reading

### Magazines
- `GET /api/vip/magazines` - List all magazines (with pagination)
- `POST /api/vip/magazines` - Create new magazine (admin only)

### Lessons
- `GET /api/vip/lessons` - List all lessons
- `GET /api/vip/lessons/[id]` - Get specific lesson
- `POST /api/vip/lessons` - Create new lesson (admin only)

### Progress
- `GET /api/vip/progress` - Get user progress
- `POST /api/vip/progress` - Save user progress

### Saved Data
- `GET /api/vip/saved-data` - Get user saved data
- `POST /api/vip/saved-data` - Save user data
- `DELETE /api/vip/saved-data` - Delete user saved data

### User Management
- `GET /api/vip/users/[id]` - Get VIP status for a user
- `PUT /api/vip/users/[id]` - Set VIP status for a user

## Pages

### VIP Dashboard
- **Route**: `/vip/dashboard`
- **Description**: Main dashboard for VIP users with links to all VIP features
- **Access**: VIP users only

### Today's Card
- **Route**: `/vip/today-card`
- **Description**: Displays today's Tarot card with meaning and description
- **Features**: 
  - Automatically marks card as viewed
  - Shows card image, meaning, and description
  - Updates daily

### Magazines
- **Route**: `/vip/magazines`
- **Description**: List of all magazine articles
- **Features**:
  - Pagination support
  - Search and filter (can be extended)
  - Article detail pages

### Magazine Detail
- **Route**: `/vip/magazines/[id]`
- **Description**: Individual magazine article page
- **Features**: Full article content with images

### Lessons
- **Route**: `/vip/lessons`
- **Description**: List of all Tarot lessons
- **Features**:
  - Filter by lesson type (beginner, intermediate, advanced, general)
  - Progress tracking
  - Completion status

### Lesson Detail
- **Route**: `/vip/lessons/[id]`
- **Description**: Individual lesson page
- **Features**:
  - Lesson content with images and videos
  - Mark as complete functionality
  - Progress tracking

## User Management

The user management page has been updated to support VIP status:

1. **VIP Status Column**: Shows VIP status for each user
2. **VIP Toggle**: Button to add/remove VIP status
3. **VIP Expiration**: Option to set expiration date when granting VIP access
4. **VIP Status Display**: Shows expiration date if set

### Setting VIP Status

1. Navigate to `/users/manage`
2. Click "Thêm VIP" or "Hủy VIP" button
3. If adding VIP, optionally enter number of days for expiration
4. VIP status is updated immediately

## Navigation

VIP users will see additional navigation links in the navbar:
- VIP Dashboard
- Bài Hôm Nay (Today's Card)
- Tạp Chí (Magazines)
- Khóa Học (Lessons)

These links are only visible to authenticated VIP users.

## Hooks

### useVIP Hook
- **Location**: `src/hooks/useVIP.ts`
- **Description**: Custom hook to check VIP status
- **Returns**: `{ user, isVip, expiresAt, loading }`
- **Usage**: Import and use in any component to check VIP status

## Utilities

### VIP Utils
- **Location**: `src/lib/vipUtils.ts`
- **Functions**:
  - `getSupabaseAdmin()` - Get Supabase admin client
  - `checkVIPStatus(userId)` - Check if user is VIP
  - `setVIPStatus(userId, isVip, expiresAt)` - Set VIP status

## Features

### Progress Tracking
- Users can track their progress through lessons
- Progress is automatically saved when viewing cards
- Progress data includes completion status and metadata

### Saved Data
- Users can save their account data and history
- Data can be set to expire after a certain date
- Supports multiple data types (reading_history, favorite_cards, notes, etc.)

### Automatic Card Tracking
- When a user views today's card, it's automatically marked as viewed
- View history is saved in the user_progress table

## Security

- All VIP routes are protected with authentication
- Row Level Security (RLS) policies ensure only VIP users can access content
- VIP status is checked on both client and server side
- API routes verify VIP status before returning content

## Setup Instructions

1. **Run Database Schema**:
   ```sql
   -- Run supabase_vip_schema.sql in Supabase SQL editor
   ```

2. **Environment Variables**:
   Ensure you have `SUPABASE_SERVICE_ROLE_KEY` in your `.env.local` file

3. **Set VIP Status**:
   - Navigate to `/users/manage`
   - Click "Thêm VIP" for a user
   - Optionally set expiration date

4. **Add Content**:
   - Daily cards: Insert into `daily_cards` table
   - Magazines: Use the API or insert directly into `magazines` table
   - Lessons: Use the API or insert directly into `lessons` table

## Future Enhancements

Potential improvements:
- Automatic VIP expiration handling
- Email notifications for new content
- User favorites system
- Reading history with filters
- Lesson completion certificates
- Social sharing features
- Mobile app support

## Notes

- VIP status expiration is checked on each request
- Users with expired VIP status will be redirected to dashboard
- All content is stored in Supabase and respects RLS policies
- Progress and saved data are user-specific and private

