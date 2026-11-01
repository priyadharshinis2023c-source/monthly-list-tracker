import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/sheets/[id] - Get a single sheet with its transactions
export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const sheet = await prisma.sheet.findUnique({
      where: { id },
      include: {
        transactions: {
          orderBy: [
            { date: "desc" },
            { createdAt: "desc" },
          ],
        },
      },
    });

    if (!sheet) {
      return NextResponse.json({ error: "Sheet not found" }, { status: 404 });
    }

    let totalIncome = 0;
    let totalExpense = 0;

    for (const t of sheet.transactions) {
      if (t.type === "INCOME") {
        totalIncome += t.amount;
      } else {
        totalExpense += t.amount;
      }
    }

    return NextResponse.json({
      ...sheet,
      totalIncome,
      totalExpense,
      netBalance: totalIncome - totalExpense,
    });
  } catch (error) {
    console.error("Failed to fetch sheet:", error);
    return NextResponse.json(
      { error: "Failed to fetch sheet" },
      { status: 500 }
    );
  }
}

// PUT /api/sheets/[id] - Update sheet info
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { name, month, description, currency, color } = body;

    const updatedSheet = await prisma.sheet.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name: name.trim() } : {}),
        ...(month !== undefined ? { month: month || null } : {}),
        ...(description !== undefined ? { description: description?.trim() || null } : {}),
        ...(currency !== undefined ? { currency } : {}),
        ...(color !== undefined ? { color } : {}),
      },
    });

    return NextResponse.json(updatedSheet);
  } catch (error) {
    console.error("Failed to update sheet:", error);
    return NextResponse.json(
      { error: "Failed to update sheet" },
      { status: 500 }
    );
  }
}

// DELETE /api/sheets/[id] - Delete a sheet and all its transactions
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    await prisma.sheet.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Sheet deleted" });
  } catch (error) {
    console.error("Failed to delete sheet:", error);
    return NextResponse.json(
      { error: "Failed to delete sheet" },
      { status: 500 }
    );
  }
}
