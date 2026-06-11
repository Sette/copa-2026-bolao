"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";

export function CreateBolaoForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Nome do bolão é obrigatório");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/boloes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), description: description.trim() }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Erro ao criar bolão");
      setLoading(false);
      return;
    }

    const bolao = await res.json();
    router.push(`/boloes/${bolao.id}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Nome do bolão"
        placeholder="Ex: Bolão da Galera"
        value={name}
        onChange={(v) => setName(v)}
      />
      <Input
        label="Descrição (opcional)"
        placeholder="Uma breve descrição..."
        value={description}
        onChange={(v) => setDescription(v)}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? <Spinner size="sm" /> : null}
        Criar Bolão
      </Button>
    </form>
  );
}
