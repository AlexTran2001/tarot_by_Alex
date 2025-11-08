Build a complete login page for a Next.js 14 application that uses Supabase for authentication and Tailwind CSS for styling.

Requirements:

Use Next.js 14 with the App Router (app/ directory structure).

Set up Supabase client using @supabase/supabase-js.

Create a helper file at lib/supabaseClient.ts that initializes the Supabase client with the project URL and anon key.

Create a /login page that includes:

An email input field.

A password input field.

A “Login” button.

A link to /signup if the user doesn’t have an account.

When the user clicks “Login”:

Call supabase.auth.signInWithPassword({ email, password }).

If login succeeds, redirect the user to /dashboard.

If login fails, display a readable error message (below the form or as a toast notification).

Style the UI using Tailwind CSS. Make it clean, modern, and fully responsive.

Use TypeScript throughout the codebase.

Additional details (optional but preferred):

Include a Google login button that uses supabase.auth.signInWithOAuth({ provider: 'google' }).

Show a loading spinner or a disabled button state while the login request is being processed.

Use server components and client components appropriately (e.g., mark the login form as "use client").

Follow good UX practices (spacing, error feedback, transitions).