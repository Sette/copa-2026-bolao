import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { BetForm } from "./BetForm";

interface MatchData {
  id: string;
  homeTeam: string;
  awayTeam: string;
  groupName: string | null;
  round: number;
  date: Date | string;
  location: string | null;
  homeScore: number | null;
  awayScore: number | null;
  finished: boolean;
  started: boolean;
}

interface BetData {
  id?: string;
  homeScore: number;
  awayScore: number;
  points: number | null;
}

interface MatchCardProps {
  match: MatchData;
  bet: BetData | null;
  bolaoId: string;
  showResult?: boolean;
}

const roundLabels: Record<number, string> = {
  1: "Fase de Grupos",
  2: "16-avos de Final",
  3: "Oitavas de Final",
  4: "Quartas de Final",
  5: "Semifinal",
  6: "3º Lugar",
  7: "Final",
};

export function MatchCard({ match, bet, bolaoId, showResult }: MatchCardProps) {
  const matchDate = new Date(match.date);
  const isPast = new Date() > matchDate;
  const canBet = !match.finished && !match.started && !isPast;

  return (
    <Card padding="sm" className="hover:border-zinc-300 transition-colors">
      <div className="flex flex-col gap-2">
        {/* Match info header */}
        <div className="flex items-center justify-between text-xs text-black">
          <div className="flex items-center gap-2">
            <Badge variant="neutral">
              {match.groupName || roundLabels[match.round] || `Rodada ${match.round}`}
            </Badge>
          </div>
          <span>
            {matchDate.toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>

        {/* Teams and score */}
        <div className="flex items-center justify-between">
          <div className="flex-1 text-right">
            <span className="font-semibold text-zinc-800">{match.homeTeam}</span>
            {match.finished && match.homeScore !== null && (
              <span className="ml-2 text-xl font-bold text-zinc-900">
                {match.homeScore}
              </span>
            )}
          </div>

          <div className="px-3 text-black font-medium text-sm">vs</div>

          <div className="flex-1">
            <span className="font-semibold text-zinc-800">{match.awayTeam}</span>
            {match.finished && match.awayScore !== null && (
              <span className="ml-2 text-xl font-bold text-zinc-900">
                {match.awayScore}
              </span>
            )}
          </div>
        </div>

        {/* Bet section */}
        {match.finished && bet ? (
          // Finished match - show bet result
          <div className="flex items-center justify-between mt-1 pt-2 border-t border-zinc-100">
            <div className="text-xs text-black">
              Seu palpite:{" "}
              <span className="font-medium text-black">
                {bet.homeScore} × {bet.awayScore}
              </span>
            </div>
            {bet.points !== null && (
              <Badge
                variant={bet.points >= 5 ? "success" : bet.points >= 3 ? "warning" : "danger"}
              >
                {bet.points > 0 ? `+${bet.points} pts` : "0 pts"}
              </Badge>
            )}
          </div>
        ) : match.finished ? (
          <div className="text-xs text-black mt-1 pt-2 border-t border-zinc-100">
            Você não palpitou nesta partida
          </div>
        ) : !canBet ? (
          <div className="text-xs text-black mt-1 pt-2 border-t border-zinc-100">
            {bet
              ? `Palpite: ${bet.homeScore} × ${bet.awayScore}`
              : "Partida em andamento - palpites encerrados"}
          </div>
        ) : bet ? (
          <div className="mt-1 pt-2 border-t border-zinc-100">
            <BetForm
              matchId={match.id}
              bolaoId={bolaoId}
              currentBet={bet}
            />
          </div>
        ) : (
          <div className="mt-1 pt-2 border-t border-zinc-100">
            <BetForm
              matchId={match.id}
              bolaoId={bolaoId}
              currentBet={null}
            />
          </div>
        )}
      </div>
    </Card>
  );
}
