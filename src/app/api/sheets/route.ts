import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/sheets - Returns all sheets with financial summaries
export async function GET() {
  try {
    const sheets = await prisma.sheet.findMany({
      include: {
        transactions: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const sheetsWithSummaries = sheets.map((sheet) => {
      let totalIncome = 0;
      let totalExpense = 0;

      for (const t of sheet.transactions) {
        if (t.type === "INCOME") {
          totalIncome += t.amount;
        } else {
          totalExpense += t.amount;
        }
      }

      return {
        id: sheet.id,
        name: sheet.name,
        month: sheet.month,
        description: sheet.description,
        currency: sheet.currency,
        color: sheet.color,
        createdAt: sheet.createdAt,
        updatedAt: sheet.updatedAt,
        _count: {
          transactions: sheet.transactions.length,
        },
        totalIncome,
        totalExpense,
        netBalance: totalIncome - totalExpense,
      };
    });

    return NextResponse.json(sheetsWithSummaries);
  } catch (error) {
    console.error("Failed to fetch sheets:", error);
    return NextResponse.json(
      { error: "Failed to fetch sheets" },
      { status: 500 }
    );
  }
}

// POST /api/sheets - Create a new sheet
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, month, description, currency = "$", color = "indigo" } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Sheet name is required" },
        { status: 400 }
      );
    }

    const newSheet = await prisma.sheet.create({
      data: {
        name: name.trim(),
        month: month || null,
        description: description?.trim() || null,
        currency: currency || "$",
        color: color || "indigo",
      },
      include: {
        transactions: true,
      },
    });

    return NextResponse.json({
      ...newSheet,
      totalIncome: 0,
      totalExpense: 0,
      netBalance: 0,
    });
  } catch (error) {
    console.error("Failed to create sheet:", error);
    return NextResponse.json(
      { error: "Failed to create sheet" },
      { status: 500 }
    );
  }
}
