import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 20));
    const offset = Math.max(0, Number(searchParams.get("offset")) || 0);

    const [items, total] = await Promise.all([
      prisma.predictionLog.findMany({
        select: {
          id: true,
          predicted_label: true,
          probability: true,
          model_version: true,
          created_at: true,
        },
        orderBy: { created_at: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.predictionLog.count(),
    ]);

    return NextResponse.json({
      items: items.map((item) => ({
        id: item.id,
        prediction: item.predicted_label,
        probability: Number(item.probability),
        model_version: item.model_version,
        created_at: item.created_at.toISOString(),
      })),
      total,
    });
  } catch {
    return NextResponse.json({
      items: [],
      total: 0,
    });
  }
}
