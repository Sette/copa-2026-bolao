import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ bolaoId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { bolaoId } = await params;

  // Verify membership
  const member = await prisma.bolaoMember.findUnique({
    where: {
      bolaoId_userId: {
        bolaoId,
        userId: session.user.id,
      },
    },
  });

  if (!member) {
    return NextResponse.json(
      { error: "Você não participa deste bolão" },
      { status: 403 }
    );
  }

  // Aggregate points per user in this bolao
  const leaderboard = await prisma.bet.groupBy({
    by: ["userId"],
    where: {
      bolaoId,
      points: { not: null },
    },
    _sum: { points: true },
    orderBy: { _sum: { points: "desc" } },
  });

  // Get user details
  const userIds = leaderboard.map((entry) => entry.userId);
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true, image: true },
  });
  const userMap = new Map(users.map((u) => [u.id, u]));

  const ranked = leaderboard.map((entry, index) => ({
    rank: index + 1,
    userId: entry.userId,
    name: userMap.get(entry.userId)?.name ?? "Desconhecido",
    image: userMap.get(entry.userId)?.image ?? null,
    totalPoints: entry._sum.points ?? 0,
  }));

  return NextResponse.json(ranked);
}
