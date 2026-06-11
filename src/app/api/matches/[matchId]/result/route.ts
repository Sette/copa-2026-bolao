import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculatePoints } from "@/lib/points";
import { NextResponse } from "next/server";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ matchId: string }> }
) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  // Check admin
  const adminEmails = (process.env.ADMIN_EMAILS || "").split(",");
  if (!adminEmails.includes(session.user.email)) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const { matchId } = await params;
  const { homeScore, awayScore } = await req.json();

  if (homeScore === undefined || awayScore === undefined) {
    return NextResponse.json(
      { error: "Placar é obrigatório" },
      { status: 400 }
    );
  }

  // Update match
  const match = await prisma.match.update({
    where: { id: matchId },
    data: {
      homeScore: Number(homeScore),
      awayScore: Number(awayScore),
      finished: true,
    },
  });

  // Recalculate points for all bets on this match
  const bets = await prisma.bet.findMany({
    where: { matchId },
  });

  let updatedCount = 0;
  for (const bet of bets) {
    const { points } = calculatePoints(
      bet.homeScore,
      bet.awayScore,
      Number(homeScore),
      Number(awayScore)
    );

    await prisma.bet.update({
      where: { id: bet.id },
      data: { points },
    });
    updatedCount++;
  }

  return NextResponse.json({
    success: true,
    match,
    betsUpdated: updatedCount,
  });
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ matchId: string }> }
) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { matchId } = await params;

  const betStats = await prisma.bet.groupBy({
    by: ["homeScore", "awayScore"],
    where: {
      matchId,
      points: { not: null },
    },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
  });

  return NextResponse.json(betStats);
}
