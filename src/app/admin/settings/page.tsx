"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";

export default function AdminSettingsPage() {
  const [registrationEnabled, setRegistrationEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => setRegistrationEnabled(data.registrationEnabled))
      .finally(() => setLoading(false));
  }, []);

  async function toggleRegistration() {
    setSaving(true);
    setMessage("");

    const res = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ registrationEnabled: !registrationEnabled }),
    });

    if (res.ok) {
      setRegistrationEnabled(!registrationEnabled);
      setMessage(
        !registrationEnabled
          ? "✅ Cadastro de novos usuários habilitado"
          : "🔒 Cadastro de novos usuários desabilitado"
      );
    } else {
      setMessage("Erro ao salvar configuração");
    }

    setSaving(false);
    setTimeout(() => setMessage(""), 3000);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-zinc-900 mb-6">⚙️ Configurações</h1>

      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-lg text-zinc-900">
              Cadastro de novos usuários
            </h2>
            <p className="text-sm text-black mt-1">
              {registrationEnabled
                ? "Qualquer pessoa pode criar uma conta"
                : "Apenas usuários existentes podem fazer login"}
            </p>
          </div>
          <button
            onClick={toggleRegistration}
            disabled={saving}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
              registrationEnabled ? "bg-emerald-600" : "bg-zinc-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                registrationEnabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </Card>

      {message && (
        <p className="mt-4 text-sm text-black bg-zinc-100 px-3 py-2 rounded-lg">
          {message}
        </p>
      )}

      <p className="mt-8 text-xs text-zinc-500">
        As configurações são salvas no servidor e persistem entre deploys.
      </p>
    </div>
  );
}
