"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { useRouter } from "next/navigation";

interface BetData {
  homeScore: number;
  awayScore: number;
}

interface BetFormProps {
  matchId: string;
  bolaoId: string;
  currentBet: BetData | null;
}

export function BetForm({ matchId, bolaoId, currentBet }: BetFormProps) {
  const router = useRouter();
  const [homeScore, setHomeScore] = useState(
    currentBet?.homeScore?.toString() ?? ""
  );
  const [awayScore, setAwayScore] = useState(
    currentBet?.awayScore?.toString() ?? ""
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const h = parseInt(homeScore);
    const a = parseInt(awayScore);

    if (isNaN(h) || isNaN(a) || h < 0 || a < 0) {
      setError("Informe um placar válido");
      return;
    }

    setLoading(true);
    const res = await fetch(`/api/boloes/${bolaoId}/bets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matchId, homeScore: h, awayScore: a }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Erro ao salvar palpite");
      setLoading(false);
      return;
    }

    setLoading(false);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      router.refresh();
    }, 1500);
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2">
      <div className="flex items-center gap-1.5 flex-1">
        <input
          type="number"
          min="0"
          max="20"
          value={homeScore}
          onChange={(e) => setHomeScore(e.target.value)}
          className="w-12 h-8 text-center border border-zinc-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder="0"
        />
        <span className="text-black text-sm font-medium">×</span>
        <input
          type="number"
          min="0"
          max="20"
          value={awayScore}
          onChange={(e) => setAwayScore(e.target.value)}
          className="w-12 h-8 text-center border border-zinc-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder="0"
        />
      </div>
      <Button type="submit" size="sm" disabled={loading}>
        {loading ? (
          <Spinner size="sm" />
        ) : saved ? (
          "✓"
        ) : currentBet ? (
          "Atualizar"
        ) : (
          "Palpitar"
        )}
      </Button>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </form>
  );
}
