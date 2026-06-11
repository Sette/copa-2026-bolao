import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user!.id;

  const memberships = await prisma.bolaoMember.findMany({
    where: { userId },
    include: {
      bolao: {
        include: {
          _count: { select: { members: true } },
        },
      },
    },
  });

  const upcomingMatches = await prisma.match.findMany({
    where: { finished: false },
    orderBy: { date: "asc" },
    take: 5,
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-zinc-900 mb-2">
        Olá, {session?.user?.name?.split(" ")[0]}!
      </h1>
      <p className="text-zinc-700 mb-8">
        Bem-vindo ao Bolão da Copa do Mundo 2026
      </p>

      {/* Ações rápidas */}
      <div className="flex gap-3 mb-8">
        <Button href="/boloes/create" variant="primary">
          + Criar Bolão
        </Button>
        <Button href="/boloes/join" variant="outline">
          Entrar em Bolão
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Meus bolões */}
        <div className="md:col-span-2">
          <h2 className="text-lg font-semibold text-zinc-800 mb-4">
            Meus Bolões
          </h2>
          {memberships.length === 0 ? (
            <Card className="text-center py-8">
              <div className="text-3xl mb-3">🏆</div>
              <p className="text-zinc-700 mb-4">
                Você ainda não participa de nenhum bolão
              </p>
              <Button href="/boloes/create" variant="primary" size="sm">
                Criar meu primeiro bolão
              </Button>
            </Card>
          ) : (
            <div className="flex flex-col gap-3">
              {memberships.map((m) => (
                <Link
                  key={m.bolao.id}
                  href={`/boloes/${m.bolao.id}`}
                  className="block"
                >
                  <Card className="hover:border-emerald-300 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-zinc-900">
                          {m.bolao.name}
                        </h3>
                        <p className="text-sm text-zinc-700">
                          {m.bolao._count.members}{" "}
                          {m.bolao._count.members === 1
                            ? "participante"
                            : "participantes"}
                        </p>
                      </div>
                      <Badge variant="success">
                        {m.role === "admin" ? "Admin" : "Membro"}
                      </Badge>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Próximas partidas */}
        <div>
          <h2 className="text-lg font-semibold text-zinc-800 mb-4">
            Próximas Partidas
          </h2>
          {upcomingMatches.length === 0 ? (
            <Card className="text-center py-6">
              <p className="text-sm text-zinc-700">
                Nenhuma partida disponível
              </p>
            </Card>
          ) : (
            <div className="flex flex-col gap-2">
              {upcomingMatches.map((match) => (
                <Card key={match.id} padding="sm">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-zinc-800">
                      {match.homeTeam}
                    </span>
                    <span className="text-zinc-700">vs</span>
                    <span className="font-medium text-zinc-800">
                      {match.awayTeam}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-700 mt-1">
                    {new Date(match.date).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
