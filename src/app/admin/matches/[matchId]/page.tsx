import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { AdminResultForm } from "@/components/matches/AdminResultForm";

export default async function AdminMatchDetailPage({
  params,
}: {
  params: Promise<{ matchId: string }>;
}) {
  const { matchId } = await params;

  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      bets: {
        include: {
          user: { select: { id: true, name: true, image: true } },
          bolao: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!match) notFound();

  // Group bets by bolao
  const betsByBolao = new Map<string, typeof match.bets>();
  match.bets.forEach((bet) => {
    const existing = betsByBolao.get(bet.bolaoId) || [];
    existing.push(bet);
    betsByBolao.set(bet.bolaoId, existing);
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link
        href="/admin/matches"
        className="text-sm text-emerald-600 hover:text-emerald-700 mb-4 inline-block"
      >
        ← Voltar
      </Link>

      <Card className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-zinc-900">
              {match.homeTeam} × {match.awayTeam}
            </h1>
            <p className="text-sm text-zinc-700 mt-1">
              {match.groupName || `Rodada ${match.round}`} ·{" "}
              {new Date(match.date).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "long",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          {match.finished ? (
            <Badge variant="success">Encerrada</Badge>
          ) : (
            <Badge variant="neutral">Pendente</Badge>
          )}
        </div>

        <AdminResultForm
          matchId={match.id}
          currentHomeScore={match.homeScore}
          currentAwayScore={match.awayScore}
          finished={match.finished}
        />
      </Card>

      <h2 className="text-lg font-semibold text-zinc-800 mb-4">
        Palpites ({match.bets.length})
      </h2>

      {match.bets.length === 0 ? (
        <Card className="text-center py-8">
          <p className="text-zinc-700">Nenhum palpite registrado</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {Array.from(betsByBolao.entries()).map(([bolaoId, bets]) => (
            <Card key={bolaoId} padding="sm">
              <h3 className="text-sm font-semibold text-zinc-700 mb-3">
                {bets[0]?.bolao?.name ?? "Bolão"}
                <span className="text-zinc-700 font-normal ml-2">
                  ({bets.length} palpites)
                </span>
              </h3>
              <div className="divide-y divide-zinc-100">
                {bets.map((bet) => (
                  <div
                    key={bet.id}
                    className="flex items-center justify-between py-2"
                  >
                    <div className="flex items-center gap-2">
                      <Avatar
                        src={bet.user.image}
                        name={bet.user.name}
                        size="sm"
                      />
                      <span className="text-sm text-zinc-700">
                        {bet.user.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-mono font-bold text-zinc-800">
                        {bet.homeScore} × {bet.awayScore}
                      </span>
                      {bet.points !== null && (
                        <Badge
                          variant={
                            bet.points >= 5
                              ? "success"
                              : bet.points >= 3
                              ? "warning"
                              : "danger"
                          }
                        >
                          {bet.points > 0 ? `+${bet.points}` : "0"} pts
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
