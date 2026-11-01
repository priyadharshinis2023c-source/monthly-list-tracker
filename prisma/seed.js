const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding initial monthly sheets...");

  const sheets = [
    {
      name: "November 2026",
      month: "2026-11",
      description: "Current month personal & household budget",
      currency: "$",
      color: "indigo",
      transactions: [
        { date: "2026-11-01", description: "Monthly Salary Deposit", type: "INCOME", amount: 4850, category: "Salary / Income" },
        { date: "2026-11-02", description: "Apartment Rent", type: "EXPENSE", amount: 1600, category: "Housing & Rent" },
        { date: "2026-11-04", description: "Supermarket Weekly Groceries", type: "EXPENSE", amount: 185.5, category: "Food & Groceries" },
        { date: "2026-11-05", description: "Freelance Web Project Payment", type: "INCOME", amount: 1200, category: "Freelance / Business" },
        { date: "2026-11-08", description: "High-Speed Internet Bill", type: "EXPENSE", amount: 75, category: "Utilities & Bills" },
        { date: "2026-11-10", description: "Electricity & Heating Bill", type: "EXPENSE", amount: 120.4, category: "Utilities & Bills" },
        { date: "2026-11-12", description: "Stock Portfolio Dividend", type: "INCOME", amount: 145.8, category: "Investments / Dividends" },
        { date: "2026-11-15", description: "Weekend Dining & Restaurants", type: "EXPENSE", amount: 110.25, category: "Food & Groceries" },
        { date: "2026-11-18", description: "Car Fuel & Maintenance", type: "EXPENSE", amount: 85, category: "Transportation & Fuel" },
      ],
    },
    {
      name: "October 2026",
      month: "2026-10",
      description: "Previous month budget & savings",
      currency: "$",
      color: "emerald",
      transactions: [
        { date: "2026-10-01", description: "Monthly Salary Deposit", type: "INCOME", amount: 4850, category: "Salary / Income" },
        { date: "2026-10-02", description: "Apartment Rent", type: "EXPENSE", amount: 1600, category: "Housing & Rent" },
        { date: "2026-10-05", description: "Supermarket Groceries", type: "EXPENSE", amount: 340, category: "Food & Groceries" },
        { date: "2026-10-12", description: "Freelance Consulting", type: "INCOME", amount: 950, category: "Freelance / Business" },
        { date: "2026-10-15", description: "Utilities (Power & Water)", type: "EXPENSE", amount: 195, category: "Utilities & Bills" },
        { date: "2026-10-20", description: "Health Insurance Premium", type: "EXPENSE", amount: 220, category: "Healthcare & Medical" },
        { date: "2026-10-25", description: "Shopping & Tech Accessories", type: "EXPENSE", amount: 180, category: "Shopping & Personal" },
      ],
    },
    {
      name: "September 2026",
      month: "2026-09",
      description: "Autumn expenses and project earnings",
      currency: "$",
      color: "amber",
      transactions: [
        { date: "2026-09-01", description: "Monthly Salary Deposit", type: "INCOME", amount: 4850, category: "Salary / Income" },
        { date: "2026-09-02", description: "Apartment Rent", type: "EXPENSE", amount: 1600, category: "Housing & Rent" },
        { date: "2026-09-08", description: "Quarterly Performance Bonus", type: "INCOME", amount: 2000, category: "Gifts / Bonus" },
        { date: "2026-09-14", description: "Groceries & Supplies", type: "EXPENSE", amount: 410, category: "Food & Groceries" },
        { date: "2026-09-19", description: "Car Insurance & Fuel", type: "EXPENSE", amount: 250, category: "Transportation & Fuel" },
        { date: "2026-09-24", description: "New Laptop Hardware", type: "EXPENSE", amount: 1100, category: "Shopping & Personal" },
      ],
    },
  ];

  for (const s of sheets) {
    await prisma.sheet.create({
      data: {
        name: s.name,
        month: s.month,
        description: s.description,
        currency: s.currency,
        color: s.color,
        transactions: {
          create: s.transactions,
        },
      },
    });
  }

  console.log("Seeding complete! 3 sample monthly sheets created.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
