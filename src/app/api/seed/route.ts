import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { INITIAL_SEED_SHEETS } from "@/lib/seed-data";

export async function POST() {
  try {
    // Clear existing data (optional, or just append)
    for (const sheetData of INITIAL_SEED_SHEETS) {
      const sheet = await prisma.sheet.create({
        data: {
          name: sheetData.name,
          month: sheetData.month,
          description: sheetData.description,
          currency: sheetData.currency,
          color: sheetData.color,
          transactions: {
            create: sheetData.transactions.map((t) => ({
              date: t.date,
              description: t.description,
              type: t.type,
              amount: t.amount,
              category: t.category,
            })),
          },
        },
      });
    }

    return NextResponse.json({ success: true, message: "Sample sheets loaded successfully" });
  } catch (error) {
    console.error("Failed to seed data:", error);
    return NextResponse.json({ error: "Failed to seed sample data" }, { status: 500 });
  }
}
