import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { MatchCard } from "@/components/matches/MatchCard";
import { Card } from "@/components/ui/Card";

const ROUNDS = [
  { value: 1, label: "Fase de Grupos" },
  { value: 2, label: "16-avos" },
  { value: 3, label: "Oitavas" },
  { value: 4, label: "Quartas" },
  { value: 5, label: "Semi" },
  { value: 6, label: "3º Lugar" },
  { value: 7, label: "Final" },
];

export default async function MatchesPage({
  params,
  searchParams,
}: {
  params: Promise<{ bolaoId: string }>;
  searchParams: Promise<{ round?: string; group?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const { bolaoId } = await params;
  const sp = await searchParams;
  const selectedRound = sp.round ? Number(sp.round) : null;

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

  // Get matches
  const where: Record<string, unknown> = {};
  if (selectedRound) where.round = selectedRound;
  if (sp.group) where.groupName = sp.group;

  const matches = await prisma.match.findMany({
    where,
    orderBy: { date: "asc" },
  });

  // Get user bets
  const bets = await prisma.bet.findMany({
    where: {
      userId: session.user.id,
      bolaoId,
      matchId: { in: matches.map((m) => m.id) },
    },
  });
  const betMap = new Map(bets.map((b) => [b.matchId, b]));

  // Get unique groups
  const groups = await prisma.match.findMany({
    where: { round: 1 },
    select: { groupName: true },
    distinct: ["groupName"],
    orderBy: { groupName: "asc" },
  });

  // Count matches per round
  const roundCounts: Record<number, number> = {};
  const allRoundCounts = await prisma.match.groupBy({
    by: ["round"],
    _count: { id: true },
  });
  allRoundCounts.forEach((r) => {
    roundCounts[r.round] = r._count.id;
  });

  // Count bets
  const betCount = await prisma.bet.count({
    where: {
      userId: session.user.id,
      bolaoId,
    },
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Partidas</h1>
          <p className="text-sm text-zinc-500">
            {bolao.name} · {betCount} palpites dados
          </p>
        </div>
        <Link
          href={`/boloes/${bolaoId}`}
          className="text-sm text-emerald-600 hover:text-emerald-700"
        >
          ← Voltar ao bolão
        </Link>
      </div>

      {/* Round filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Link
          href={`/boloes/${bolaoId}/matches`}
          className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
            !selectedRound
              ? "bg-emerald-600 text-white"
              : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
          }`}
        >
          Todas
        </Link>
        {ROUNDS.filter((r) => roundCounts[r.value]).map((r) => (
          <Link
            key={r.value}
            href={`/boloes/${bolaoId}/matches?round=${r.value}`}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
              selectedRound === r.value
                ? "bg-emerald-600 text-white"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            {r.label}
          </Link>
        ))}
      </div>

      {/* Group filter (only for group stage) */}
      {(!selectedRound || selectedRound === 1) && (
        <div className="flex flex-wrap gap-2 mb-6">
          {groups.map((g) => (
            <Link
              key={g.groupName}
              href={`/boloes/${bolaoId}/matches?round=1&group=${g.groupName}`}
              className={`px-2.5 py-1 text-xs font-medium rounded-full transition-colors ${
                sp.group === g.groupName
                  ? "bg-emerald-600 text-white"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              Grupo {g.groupName}
            </Link>
          ))}
        </div>
      )}

      {/* Matches list */}
      {matches.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-3xl mb-3">⚽</div>
          <p className="text-zinc-500">
            Nenhuma partida encontrada para este filtro
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {matches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              bet={betMap.get(match.id) ?? null}
              bolaoId={bolaoId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
