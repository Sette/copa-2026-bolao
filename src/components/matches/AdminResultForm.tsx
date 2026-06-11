"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";

interface AdminResultFormProps {
  matchId: string;
  currentHomeScore: number | null;
  currentAwayScore: number | null;
  finished: boolean;
}

export function AdminResultForm({
  matchId,
  currentHomeScore,
  currentAwayScore,
  finished,
}: AdminResultFormProps) {
  const router = useRouter();
  const [homeScore, setHomeScore] = useState(
    currentHomeScore?.toString() ?? ""
  );
  const [awayScore, setAwayScore] = useState(
    currentAwayScore?.toString() ?? ""
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    const h = parseInt(homeScore);
    const a = parseInt(awayScore);

    if (isNaN(h) || isNaN(a) || h < 0 || a < 0) {
      setError("Informe um placar válido (números não negativos)");
      return;
    }

    setLoading(true);
    const res = await fetch(`/api/matches/${matchId}/result`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ homeScore: h, awayScore: a }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Erro ao salvar resultado");
      setLoading(false);
      return;
    }

    const data = await res.json();
    setLoading(false);
    setSuccess(
      `Placar salvo! ${data.betsUpdated} palpites foram pontuados.`
    );
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-zinc-700">Placar:</label>
          <input
            type="number"
            min="0"
            max="20"
            value={homeScore}
            onChange={(e) => setHomeScore(e.target.value)}
            className="w-16 h-10 text-center border border-zinc-300 rounded-lg text-lg font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="0"
          />
          <span className="text-zinc-700 font-bold text-lg">×</span>
          <input
            type="number"
            min="0"
            max="20"
            value={awayScore}
            onChange={(e) => setAwayScore(e.target.value)}
            className="w-16 h-10 text-center border border-zinc-300 rounded-lg text-lg font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="0"
          />
        </div>
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? <Spinner size="sm" /> : null}
          {finished ? "Atualizar" : "Encerrar Partida"}
        </Button>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="text-sm text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg">
          {success}
        </div>
      )}
    </form>
  );
}
