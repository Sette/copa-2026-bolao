"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

interface InviteCodeDisplayProps {
  code: string;
  bolaoId: string;
}

export function InviteCodeDisplay({ code, bolaoId }: InviteCodeDisplayProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <p className="text-sm text-zinc-600 text-center">
        Código do bolão:
      </p>
      <div className="flex items-center gap-3">
        <code className="px-6 py-3 bg-zinc-100 rounded-xl text-2xl font-mono font-bold tracking-widest text-emerald-700 select-all">
          {code}
        </code>
        <Button onClick={handleCopy} variant={copied ? "primary" : "outline"} size="md">
          {copied ? "✓ Copiado!" : "Copiar"}
        </Button>
      </div>
      <p className="text-xs text-zinc-400 mt-2">
        Seus amigos devem usar este código na página &quot;Entrar em Bolão&quot;
      </p>
    </div>
  );
}
