"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";

export function JoinBolaoForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!code.trim()) {
      setError("Código do bolão é obrigatório");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/boloes/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: code.trim() }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Erro ao entrar no bolão");
      setLoading(false);
      return;
    }

    router.push(`/boloes/${data.bolao.id}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Código do bolão"
        placeholder="Ex: ABC12345"
        value={code}
        onChange={(v) => setCode(v.toUpperCase())}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? <Spinner size="sm" /> : null}
        Entrar no Bolão
      </Button>
    </form>
  );
}
