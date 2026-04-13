# 💰 Shared Expense Tracker

A premium, modern, and highly functional shared expense tracking application designed for roommates, families, or small teams. Built with the latest tech stack (Next.js 15+, React 19) and a focus on visual excellence.

![Dashboard Preview](https://img.shields.io/badge/Status-Beta-brightgreen)
![Next.js](https://img.shields.io/badge/Next.js-15+-black)
![React](https://img.shields.io/badge/React-19-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38bdf8)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2d3748)

---

## ✨ Key Features

- **📊 Visual Dashboard**: Real-time overview of the shared balance, total deposits, and total expenses.
- **🕒 Timeline History**: A beautifully grouped transaction history (Today, Yesterday, and beyond) with category icons and multi-user attribution.
- **🛡️ Role-Based Access (RBAC)**:
  - **USER**: Can log expenses and view dashboard/analytics.
  - **ADMIN**: Complete control over editing/deleting expenses and logging shared deposits.
- **📈 Advanced Analytics**: Interactive spending charts powered by Recharts to visualize where the money goes.
- **⚡ Supercharged Performance**: Leveraging Next.js Server Actions for instant data mutations and revalidation.
- **🔐 Secure Auth**: Robust authentication using Auth.js (NextAuth) v5.
- **🎨 Glassmorphic UI**: A dark-themed, premium design with smooth gradients, subtle micro-animations, and responsive layouts.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
- **Library**: [React 19](https://react.dev/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) (via [Supabase](https://supabase.com/))
- **ORM**: [Prisma](https://www.prisma.io/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Auth**: [Auth.js v5](https://authjs.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)
- **Date Handing**: [date-fns](https://date-fns.org/)

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ installed
- A PostgreSQL database (e.g., Supabase)
- Auth provider credentials (e.g., Google OAuth)

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/expense-tracker.git
    cd expense-tracker
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Setup**:
    Create a `.env` file in the root and add the following:
    ```env
    DATABASE_URL="postgresql://..."
    AUTH_SECRET="your-secret-here"
    AUTH_GOOGLE_ID="your-google-id"
    AUTH_GOOGLE_SECRET="your-google-secret"
    ```

4.  **Database Migration**:
    ```bash
    npx prisma db push
    ```

5.  **Run Development Server**:
    ```bash
    npm run dev
    ```

Open [http://localhost:3000](http://localhost:3000) to see your app in action!

---

## 📂 Project Structure

```text
├── src/
│   ├── app/            # App router, pages, and server actions
│   ├── components/     # Reusable UI components
│   ├── lib/            # Utility functions and Prisma client
│   └── auth.ts         # Auth.js configuration
├── prisma/             # Schema and migrations
└── public/             # Static assets
```

---

## 📝 License

This project is licensed under the MIT License.

