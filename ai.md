You are a senior frontend engineer. Build a modern, production-ready marketing website for a Tarot reading service using **Next.js (App Router)**, **TypeScript**, and **Tailwind CSS**.

🎨 DESIGN & FEEL:
- Visual style: minimalism, luxury, smooth and elegant.
- Color palette: black (#000), white (#fff), and soft gray (#eaeaea) only.
- Layout: generous whitespace, balanced typography, clean grid alignment, smooth section transitions.
- Animation: subtle fade/slide/scale transitions using Framer Motion or CSS transitions. Everything should feel calm and refined.
- Typography: must fully support Vietnamese diacritics.
  - Headings: "Playfair Display SC" or "DM Serif Display" (serif, elegant)
  - Body: "Be Vietnam Pro" or "Inter" (sans-serif, readable)
- Avoid any harsh shadows or saturated colors. Focus on contrast, spacing, and motion to convey sophistication.

📄 STRUCTURE:
- Single-page site (scroll navigation) with sections:
  1. Hero (headline, subheadline, CTA button)
  2. Services / Reading types (cards with icons)
  3. About / Philosophy (1–2 paragraphs, photo placeholder)
  4. Testimonials (carousel, minimal dots)
  5. Pricing / Packages (3 options)
  6. Booking form (name, email, date/time, dropdown type, note)
  7. Footer (social icons, copyright)
- Navbar: fixed top, transparent → solid on scroll, smooth scrolling.
- Footer: minimal text + small monochrome icons.

⚙️ TECHNICAL REQUIREMENTS:
- Framework: Next.js 14+ App Router + TypeScript.
- Styling: TailwindCSS v3+, with a custom theme for fonts, colors, and transitions.
- Components: modular (e.g., `<Button>`, `<SectionTitle>`, `<Card>`).
- Accessibility: semantic HTML, keyboard navigation, ARIA labels, high contrast.
- SEO-ready: `<Head>` meta tags, title, description, favicon.
- Form validation: client-side, with accessible error messages and mock success message.
- Use `next/font/google` to import fonts with Vietnamese subsets (e.g., “Playfair Display SC” and “Be Vietnam Pro”).
- Responsive design (mobile → desktop).

💻 FILE STRUCTURE:
- `/app` (Next.js App Router)
  - `page.tsx` → main layout
  - sections: `Hero.tsx`, `Services.tsx`, `About.tsx`, `Testimonials.tsx`, `Pricing.tsx`, `Booking.tsx`, `Footer.tsx`
- `/components` → shared components (Button, Input, etc.)
- `/styles/globals.css` → Tailwind base + smooth scroll styles
- `/public` → monochrome SVG icons (tarot cards, moon, star)
- `/fonts` (optional) → fallback font files
- `tailwind.config.ts` → custom fonts, black-white palette, smooth transitions
- `.env.example` for contact form API key placeholder
- README.md → instructions to run locally and deploy on Vercel.

✅ ACCEPTANCE CRITERIA:
1. `npm run dev` starts a working site with Hero → Footer sections.
2. Typography renders properly with Vietnamese characters.
3. Layout looks elegant, balanced, and smooth across devices.
4. Booking form validates inputs and shows a mock success message.
5. All transitions are subtle (fade/slide), not flashy.
6. Design exudes calmness and luxury through simplicity.

OUTPUT FORMAT:
Provide:
- `tailwind.config.ts`
- sample `app/layout.tsx` and `app/page.tsx`
- 1–2 section components (Hero + Booking)
- example CSS for smooth scroll and transitions
- import statements for Vietnamese fonts
- short explanation of design choices.
