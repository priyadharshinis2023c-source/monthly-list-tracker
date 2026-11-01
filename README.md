# MonthlyList - Smart Multi-Sheet Finance & Bookkeeping App

A full-stack financial bookkeeping application built with Next.js, TypeScript, Tailwind CSS, Prisma ORM, and Recharts. Create unlimited sheets (monthly or custom), log income and expense entries with `+` or `-` amounts, instantly calculate net balances, and visualize earnings vs spendings with interactive charts.

---

## Features

- **Unlimited Sheets Management**: Create monthly sheets (e.g., *November 2026*, *December 2026*, *Freelance Projects*, *Household Budget*) with custom currencies and color tags.
- **Easy Transaction Entry (+ or -)**:
  - Enter received money (Income `+`) or sent money (Expense `-`) directly.
  - Type `+500` or `-150` into the amount box to auto-switch between received and sent.
  - Date, description, amount, and categorization.
  - Inline fast-entry bar for spreadsheet-speed logging.
- **Instant Output Calculations**:
  - Net Total Balance (Surplus / Deficit)
  - Total Received (+)
  - Total Sent (-)
  - Savings rate & transaction count
  - Global summary banner aggregating across all sheets.
- **Monthly Charts & Visual Dashboard**:
  - Side-by-side comparison bar chart (Money Got vs Money Spent across months)
  - Net savings trend line chart
  - Expense category donut chart
  - Lifetime statistics (all-time income, average monthly spending, etc.)
- **Spreadsheet Tools**:
  - Instant CSV export for Excel or Google Sheets
  - Search and filter by description or type (Received vs Sent)
  - Column sorting by date, amount, or description
- **Database Persistence**:
  - Zero-config SQLite database for instant local development in VS Code.
  - Ready for PostgreSQL (Neon / Supabase) when deploying to Vercel.

---

## 1. Quick Start in VS Code (Local Run)

### Step 1: Open Terminal in VS Code
Open this project folder in VS Code and press <kbd>Ctrl</kbd> + <kbd>`</kbd> (or `Terminal -> New Terminal`).

### Step 2: Install Dependencies (if not already installed)
```bash
npm install
```

### Step 3: Initialize Database
Run the following command to create your local SQLite database:
```bash
npm run db:push
```

*(Optional)* If you want to populate 3 pre-filled months of realistic sample data to see the charts immediately:
```bash
npm run db:seed
```

### Step 4: Start the Dev Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 2. Pushing to GitHub

1. Initialize git and commit your files:
```bash
git init
git add .
git commit -m "Initial commit of MonthlyList financial app"
```

2. Create a new repository on [GitHub](https://github.com/new).
3. Link your local repo to GitHub and push:
```bash
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

---

## 3. Deploying to Vercel

Since Vercel is a serverless platform with a read-only filesystem, a cloud database is recommended for production persistence.

### Recommended Free Cloud Database (Neon / Supabase):
1. Go to [Neon.tech](https://neon.tech) (Free Serverless PostgreSQL) or [Supabase.com](https://supabase.com) and create a free project.
2. Copy your connection string (`DATABASE_URL`), which looks like:
   ```
   postgresql://username:password@ep-xyz.neon.tech/neondb?sslmode=require
   ```

### Switch Schema to PostgreSQL:
In your project terminal, run:
```bash
npm run use:postgres
```
*(This automatically configures your Prisma schema for PostgreSQL).*

Commit and push this change to GitHub:
```bash
git add prisma/schema.prisma
git commit -m "Configure PostgreSQL for Vercel deployment"
git push
```

### Deploy on Vercel:
1. Go to [vercel.com](https://vercel.com) and log in with your GitHub account.
2. Click **"Add New..."** -> **"Project"**.
3. Select your GitHub repository.
4. Under **Environment Variables**, add:
   - **Key**: `DATABASE_URL`
   - **Value**: Your Neon or Supabase PostgreSQL connection string.
5. In **Build Settings**, set **Build Command** to:
   ```bash
   npm run vercel-build
   ```
   *(This automatically pushes the tables to your PostgreSQL database and builds the app).*
6. Click **Deploy**! In about 1 minute, your app will be live with a free `.vercel.app` URL.

---

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database & ORM**: SQLite (Local Dev) / PostgreSQL (Vercel Prod) via Prisma ORM
- **Charts**: Recharts
- **Icons**: Lucide React
