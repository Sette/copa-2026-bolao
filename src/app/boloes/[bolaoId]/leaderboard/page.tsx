import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";

export default async function LeaderboardPage({
  params,
}: {
  params: Promise<{ bolaoId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const { bolaoId } = await params;

  const membership = await prisma.bolaoMember.findUnique({
    where: {
      bolaoId_userId: {
        bolaoId,
        userId: session.user.id,
      },
    },
  });

  if (!membership) redirect("/dashboard");

  const bolao = await prisma.bolao.findUnique({
    where: { id: bolaoId },
  });

  if (!bolao) redirect("/dashboard");

  // Aggregate points
  const leaderboard = await prisma.bet.groupBy({
    by: ["userId"],
    where: {
      bolaoId,
      points: { not: null },
    },
    _sum: { points: true },
    orderBy: { _sum: { points: "desc" } },
  });

  const userIds = leaderboard.map((entry) => entry.userId);
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true, image: true },
  });
  const userMap = new Map(users.map((u) => [u.id, u]));

  // Stats per user
  const allMembers = await prisma.bolaoMember.findMany({
    where: { bolaoId },
    include: { user: { select: { id: true, name: true, image: true } } },
  });

  // Count bets per user
  const betCounts = await prisma.bet.groupBy({
    by: ["userId"],
    where: { bolaoId },
    _count: { id: true },
  });
  const betCountMap = new Map(betCounts.map((b) => [b.userId, b._count.id]));

  // Count exact scores
  const exactCounts = await prisma.bet.groupBy({
    by: ["userId"],
    where: {
      bolaoId,
      points: 5, // Exact score
    },
    _count: { id: true },
  });
  const exactMap = new Map(exactCounts.map((b) => [b.userId, b._count.id]));

  const ranked = leaderboard.map((entry, index) => ({
    rank: index + 1,
    userId: entry.userId,
    name: userMap.get(entry.userId)?.name ?? "Desconhecido",
    image: userMap.get(entry.userId)?.image ?? null,
    totalPoints: entry._sum.points ?? 0,
    totalBets: betCountMap.get(entry.userId) ?? 0,
    exactScores: exactMap.get(entry.userId) ?? 0,
  }));

  // Add members without any points yet
  const rankedUserIds = new Set(ranked.map((r) => r.userId));
  allMembers.forEach((m) => {
    if (!rankedUserIds.has(m.user.id)) {
      ranked.push({
        rank: ranked.length + 1,
        userId: m.user.id,
        name: m.user.name ?? "Desconhecido",
        image: m.user.image ?? null,
        totalPoints: 0,
        totalBets: betCountMap.get(m.user.id) ?? 0,
        exactScores: 0,
      });
    }
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">🏆 Ranking</h1>
          <p className="text-sm text-zinc-700">{bolao.name}</p>
        </div>
        <Link
          href={`/boloes/${bolaoId}`}
          className="text-sm text-emerald-600 hover:text-emerald-700"
        >
          ← Voltar ao bolão
        </Link>
      </div>

      {ranked.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-3xl mb-3">📊</div>
          <p className="text-zinc-700">
            Nenhum palpite pontuado ainda. O ranking aparece quando as partidas
            começarem!
          </p>
        </Card>
      ) : (
        <Card padding="none">
          <div className="divide-y divide-zinc-100">
            {/* Header */}
            <div className="grid grid-cols-12 gap-2 px-4 py-3 text-xs font-medium text-zinc-700 uppercase">
              <div className="col-span-1">#</div>
              <div className="col-span-4">Jogador</div>
              <div className="col-span-2 text-center">Palpites</div>
              <div className="col-span-2 text-center">Exatos</div>
              <div className="col-span-3 text-right">Pontos</div>
            </div>

            {ranked.map((entry, i) => {
              const isCurrentUser = entry.userId === session!.user!.id;
              return (
                <div
                  key={entry.userId}
                  className={`grid grid-cols-12 gap-2 px-4 py-3 items-center text-sm ${
                    isCurrentUser ? "bg-emerald-50" : ""
                  }`}
                >
                  <div className="col-span-1">
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                        i === 0
                          ? "bg-yellow-100 text-yellow-800"
                          : i === 1
                          ? "bg-zinc-200 text-zinc-700"
                          : i === 2
                          ? "bg-amber-100 text-amber-800"
                          : "text-zinc-700"
                      }`}
                    >
                      {entry.rank}
                    </span>
                  </div>
                  <div className="col-span-4 flex items-center gap-2">
                    <Avatar src={entry.image} name={entry.name} size="sm" />
                    <span className="font-medium text-zinc-800 truncate">
                      {entry.name}
                    </span>
                    {isCurrentUser && (
                      <Badge variant="success">Você</Badge>
                    )}
                  </div>
                  <div className="col-span-2 text-center text-zinc-700">
                    {entry.totalBets}
                  </div>
                  <div className="col-span-2 text-center text-zinc-700">
                    {entry.exactScores}
                  </div>
                  <div className="col-span-3 text-right font-semibold text-emerald-700">
                    {entry.totalPoints} pts
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
