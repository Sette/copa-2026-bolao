import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";

export default async function BolaoDetailPage({
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
    include: {
      _count: { select: { members: true, bets: true } },
      members: {
        include: {
          user: { select: { id: true, name: true, image: true } },
        },
        orderBy: { user: { name: "asc" } },
      },
    },
  });

  if (!bolao) notFound();

  // Leaderboard top 5
  const topBets = await prisma.bet.groupBy({
    by: ["userId"],
    where: {
      bolaoId,
      points: { not: null },
    },
    _sum: { points: true },
    orderBy: { _sum: { points: "desc" } },
    take: 5,
  });

  const topUserIds = topBets.map((b) => b.userId);
  const topUsers = await prisma.user.findMany({
    where: { id: { in: topUserIds } },
    select: { id: true, name: true, image: true },
  });
  const userMap = new Map(topUsers.map((u) => [u.id, u]));

  // Upcoming matches
  const upcomingMatches = await prisma.match.findMany({
    where: { finished: false },
    orderBy: { date: "asc" },
    take: 5,
  });

  // User bets for upcoming matches
  const userBets = await prisma.bet.findMany({
    where: {
      userId: session.user.id,
      bolaoId,
      matchId: { in: upcomingMatches.map((m) => m.id) },
    },
  });
  const betMap = new Map(userBets.map((b) => [b.matchId, b]));

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">{bolao.name}</h1>
          {bolao.description && (
            <p className="text-zinc-700 mt-1">{bolao.description}</p>
          )}
          <div className="flex items-center gap-3 mt-2">
            <Badge variant="neutral">
              {bolao._count.members}{" "}
              {bolao._count.members === 1 ? "participante" : "participantes"}
            </Badge>
            <Badge variant="neutral">
              {bolao._count.bets} palpites
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button href={`/boloes/${bolao.id}/invite`} variant="outline" size="sm">
            Convidar
          </Button>
          <Button href={`/boloes/${bolao.id}/matches`} variant="primary" size="sm">
            Palpitar
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-zinc-200 mb-6">
        <Link
          href={`/boloes/${bolao.id}`}
          className="px-4 py-2 text-sm font-medium text-emerald-700 border-b-2 border-emerald-600"
        >
          Visão Geral
        </Link>
        <Link
          href={`/boloes/${bolao.id}/leaderboard`}
          className="px-4 py-2 text-sm font-medium text-zinc-700 hover:text-zinc-900 transition-colors"
        >
          Ranking
        </Link>
        <Link
          href={`/boloes/${bolao.id}/matches`}
          className="px-4 py-2 text-sm font-medium text-zinc-700 hover:text-zinc-900 transition-colors"
        >
          Partidas
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Leaderboard preview */}
        <div className="md:col-span-3">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-zinc-800">🏆 Ranking</h2>
            <Link
              href={`/boloes/${bolao.id}/leaderboard`}
              className="text-sm text-emerald-600 hover:text-emerald-700"
            >
              Ver completo
            </Link>
          </div>

          {topBets.length === 0 ? (
            <Card className="text-center py-6">
              <p className="text-sm text-zinc-700">
                Nenhum palpite pontuado ainda. O ranking aparece quando as partidas começarem!
              </p>
            </Card>
          ) : (
            <Card padding="none">
              <div className="divide-y divide-zinc-100">
                {topBets.map((entry, i) => {
                  const user = userMap.get(entry.userId);
                  return (
                    <div
                      key={entry.userId}
                      className="flex items-center gap-3 px-4 py-3"
                    >
                      <span
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          i === 0
                            ? "bg-yellow-100 text-yellow-800"
                            : i === 1
                            ? "bg-zinc-200 text-zinc-700"
                            : i === 2
                            ? "bg-amber-100 text-amber-800"
                            : "bg-zinc-100 text-zinc-700"
                        }`}
                      >
                        {i + 1}
                      </span>
                      <Avatar src={user?.image} name={user?.name} size="sm" />
                      <span className="flex-1 text-sm font-medium text-zinc-800">
                        {user?.name ?? "Desconhecido"}
                      </span>
                      <span className="text-sm font-semibold text-emerald-700">
                        {entry._sum.points} pts
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="md:col-span-2 space-y-6">
          {/* Members */}
          <Card>
            <h3 className="text-sm font-semibold text-zinc-700 mb-3">
              👥 Participantes
            </h3>
            <div className="flex flex-col gap-2">
              {bolao.members.map((m) => (
                <div key={m.user.id} className="flex items-center gap-2">
                  <Avatar src={m.user.image} name={m.user.name} size="sm" />
                  <span className="text-sm text-zinc-700 truncate">
                    {m.user.name}
                  </span>
                  {m.role === "admin" && (
                    <Badge variant="success">Admin</Badge>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Upcoming matches */}
          <Card>
            <h3 className="text-sm font-semibold text-zinc-700 mb-3">
              ⚽ Próximas Partidas
            </h3>
            {upcomingMatches.length === 0 ? (
              <p className="text-sm text-zinc-700">
                Nenhuma partida disponível
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {upcomingMatches.map((match) => {
                  const bet = betMap.get(match.id);
                  return (
                    <div
                      key={match.id}
                      className="flex items-center justify-between text-sm py-1"
                    >
                      <div>
                        <span className="font-medium text-zinc-800">
                          {match.homeTeam}
                        </span>
                        <span className="text-zinc-700 mx-1">vs</span>
                        <span className="font-medium text-zinc-800">
                          {match.awayTeam}
                        </span>
                      </div>
                      {bet ? (
                        <Badge variant="success">Palpitou</Badge>
                      ) : (
                        <Link
                          href={`/boloes/${bolao.id}/matches`}
                          className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                        >
                          Palpitar
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
