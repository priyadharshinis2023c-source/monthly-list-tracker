import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTodayDateString } from "@/lib/utils";

// POST /api/transactions - Create a transaction
export async function POST(request: Request) {
  try {
    const body = await request.json();
    let { sheetId, date, description, amount, type, category } = body;

    if (!sheetId) {
      return NextResponse.json(
        { error: "sheetId is required" },
        { status: 400 }
      );
    }

    if (!description || typeof description !== "string" || !description.trim()) {
      return NextResponse.json(
        { error: "Description is required" },
        { status: 400 }
      );
    }

    const numericAmount = typeof amount === "number" ? amount : parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount === 0) {
      return NextResponse.json(
        { error: "A non-zero valid amount is required" },
        { status: 400 }
      );
    }

    // Determine type and absolute amount:
    // If negative value was entered like -150, it's an EXPENSE
    // If positive like +500, or explicitly passed type
    let finalType: "INCOME" | "EXPENSE" = "INCOME";
    let finalAmount = Math.abs(numericAmount);

    if (numericAmount < 0) {
      finalType = "EXPENSE";
    } else if (type === "EXPENSE" || type === "SENT") {
      finalType = "EXPENSE";
    } else {
      finalType = "INCOME";
    }

    const finalDate = date && date.trim() ? date.trim() : getTodayDateString();
    const finalCategory = category && category.trim() ? category.trim() : (finalType === "INCOME" ? "Salary / Income" : "General");

    const transaction = await prisma.transaction.create({
      data: {
        sheetId,
        date: finalDate,
        description: description.trim(),
        type: finalType,
        amount: finalAmount,
        category: finalCategory,
      },
    });

    return NextResponse.json(transaction);
  } catch (error) {
    console.error("Failed to create transaction:", error);
    return NextResponse.json(
      { error: "Failed to create transaction" },
      { status: 500 }
    );
  }
}
