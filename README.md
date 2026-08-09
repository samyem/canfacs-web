# 🍁 CANFACS Web Platform

**Canada-Nepal Friendship and Cultural Society (CANFACS)**  
A modern, nationwide web portal and community platform connecting members across Canada, celebrating bilateral culture, managing executive & advisory boards, and providing a member portal with D1/R2 cloud infrastructure.

---

## 🚀 Features

- **Executive & Advisory Board Directory**: Detailed leadership and advisor profiles with high-resolution portraits and credentials.
- **Membership Registration (`/join-canfacs`)**: Public application form saving candidate applications into Cloudflare D1 database in a `pending` state.
- **Admin Management Panel (`/admin/members`)**:
  - Secure admin control panel to review, approve, or deny membership applications.
  - Automatic temporary password generation upon approval with 1-click clipboard copy.
- **Protected Member Portal (`/members`)**: Searchable member directory filtered by province, profession, or bio (requires member login).
- **Social Community Feed (`/feed`)**:
  - Facebook/LinkedIn-style member feed.
  - Image attachments uploaded to Cloudflare R2 object storage (`IMAGES_BUCKET`).
  - Interactive **Likes**, **Threaded Comments** (with image support), and **Reshares**.

---

## 🛠️ Tech Stack

- **Framework**: [SvelteKit](https://svelte.dev) 5 (TypeScript)
- **Styling**: [Tailwind CSS](https://tailwindcss.com) v4 & Vanilla CSS Glassmorphism
- **Hosting & Serverless**: [Cloudflare Pages & Workers](https://pages.cloudflare.com) (`@sveltejs/adapter-cloudflare`)
- **Database**: [Cloudflare D1](https://developers.cloudflare.com/d1/) (Serverless SQLite)
- **Object Storage**: [Cloudflare R2](https://developers.cloudflare.com/r2/) (`IMAGES_BUCKET`)

---

## 📦 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Initialize Database Schema (Local Dev)
```bash
npm run db:setup:local
```

### 3. Start Development Server
```bash
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## 🔑 Initial Admin Credentials

To access `/admin/members` in development or production:
- **Email**: `info@canfacs.org`
- **Password**: `CANFACS2026!2437`

---

## 🗄️ Database & Deployment Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts local SvelteKit development server |
| `npm run check` | Runs TypeScript & Svelte diagnostics (`wrangler types --check` + `svelte-check`) |
| `npm run db:setup:local` | Applies `schema.sql` to local Cloudflare D1 database |
| `npm run db:setup:remote` | Applies `schema.sql` to production Cloudflare D1 database |
| `npm run gen` | Regenerates Wrangler TypeScript types (`wrangler types`) |
| `npm run build` | Builds production bundle for Cloudflare Pages deployment |

---

## 📄 License & Attribution

© 2016 - 2026 Canada-Nepal Friendship and Cultural Society. All rights reserved.
