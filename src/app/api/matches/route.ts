import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const round = searchParams.get("round");
  const groupName = searchParams.get("groupName");
  const bolaoId = searchParams.get("bolaoId");

  const where: Record<string, unknown> = {};

  if (round) where.round = Number(round);
  if (groupName) where.groupName = groupName;

  const matches = await prisma.match.findMany({
    where,
    orderBy: { date: "asc" },
  });

  // If bolaoId provided, include user's bets
  if (bolaoId && session.user.id) {
    const bets = await prisma.bet.findMany({
      where: {
        userId: session.user.id,
        bolaoId,
        matchId: { in: matches.map((m) => m.id) },
      },
    });
    const betMap = new Map(bets.map((b) => [b.matchId, b]));

    const matchesWithBets = matches.map((match) => ({
      ...match,
      bet: betMap.get(match.id) ?? null,
    }));

    return NextResponse.json(matchesWithBets);
  }

  return NextResponse.json(matches);
}
