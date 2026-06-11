import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

const ROUNDS = [
  { value: 1, label: "Fase de Grupos" },
  { value: 2, label: "16-avos" },
  { value: 3, label: "Oitavas" },
  { value: 4, label: "Quartas" },
  { value: 5, label: "Semi" },
  { value: 6, label: "3º Lugar" },
  { value: 7, label: "Final" },
];

export default async function AdminMatchesPage({
  searchParams,
}: {
  searchParams: Promise<{ round?: string }>;
}) {
  const sp = await searchParams;
  const selectedRound = sp.round ? Number(sp.round) : null;

  const where: Record<string, unknown> = {};
  if (selectedRound) where.round = selectedRound;

  const matches = await prisma.match.findMany({
    where,
    orderBy: { date: "asc" },
    include: {
      _count: { select: { bets: true } },
    },
  });

  // Count bets per match by result (for finished matches)
  const finishedMatches = matches.filter((m) => m.finished);

  // Count total
  const totalMatches = await prisma.match.count();
  const finishedCount = await prisma.match.count({
    where: { finished: true },
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">
            Gerenciar Partidas
          </h1>
          <p className="text-sm text-zinc-700">
            {finishedCount} de {totalMatches} partidas encerradas
          </p>
        </div>
      </div>

      {/* Round filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Link
          href="/admin/matches"
          className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
            !selectedRound
              ? "bg-amber-600 text-white"
              : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
          }`}
        >
          Todas
        </Link>
        {ROUNDS.map((r) => (
          <Link
            key={r.value}
            href={`/admin/matches?round=${r.value}`}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
              selectedRound === r.value
                ? "bg-amber-600 text-white"
                : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
            }`}
          >
            {r.label}
          </Link>
        ))}
      </div>

      {/* Matches table */}
      <Card padding="none">
        <div className="divide-y divide-zinc-100">
          {matches.map((match) => (
            <div
              key={match.id}
              className="grid grid-cols-12 gap-2 px-4 py-3 items-center text-sm hover:bg-zinc-50"
            >
              <div className="col-span-1 text-xs text-zinc-700">
                #{match.matchNumber}
              </div>
              <div className="col-span-3 font-medium text-zinc-800">
                {match.homeTeam} × {match.awayTeam}
              </div>
              <div className="col-span-2 text-xs text-zinc-700">
                <Badge variant="neutral">{match.groupName || `Rodada ${match.round}`}</Badge>
              </div>
              <div className="col-span-1 text-xs text-zinc-700">
                {new Date(match.date).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                })}
              </div>
              <div className="col-span-2 text-center">
                {match.finished ? (
                  <span className="font-bold text-zinc-900">
                    {match.homeScore} × {match.awayScore}
                  </span>
                ) : (
                  <span className="text-zinc-700">—</span>
                )}
              </div>
              <div className="col-span-1 text-xs text-zinc-700">
                {match._count.bets} palpites
              </div>
              <div className="col-span-2 text-right">
                <Link href={`/admin/matches/${match.id}`}>
                  <Button size="sm" variant={match.finished ? "ghost" : "primary"}>
                    {match.finished ? "Editar" : "Resultado"}
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
