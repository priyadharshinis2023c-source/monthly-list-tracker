import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PUT /api/transactions/[id] - Update transaction
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { date, description, amount, type, category } = body;

    let updateData: any = {};

    if (date !== undefined) updateData.date = date;
    if (description !== undefined) updateData.description = description.trim();
    if (category !== undefined) updateData.category = category.trim();

    if (amount !== undefined) {
      const numAmount = typeof amount === "number" ? amount : parseFloat(amount);
      if (!isNaN(numAmount)) {
        if (numAmount < 0) {
          updateData.type = "EXPENSE";
          updateData.amount = Math.abs(numAmount);
        } else {
          updateData.amount = Math.abs(numAmount);
          if (type) updateData.type = type;
        }
      }
    } else if (type !== undefined) {
      updateData.type = type;
    }

    const updated = await prisma.transaction.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update transaction:", error);
    return NextResponse.json(
      { error: "Failed to update transaction" },
      { status: 500 }
    );
  }
}

// DELETE /api/transactions/[id] - Delete transaction
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    await prisma.transaction.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Transaction deleted" });
  } catch (error) {
    console.error("Failed to delete transaction:", error);
    return NextResponse.json(
      { error: "Failed to delete transaction" },
      { status: 500 }
    );
  }
}
