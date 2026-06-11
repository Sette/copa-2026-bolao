import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { JoinBolaoForm } from "@/components/boloes/JoinBolaoForm";

export default function JoinBolaoPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-zinc-900 mb-2">Entrar em Bolão</h1>
      <p className="text-zinc-700 mb-6">
        Insira o código do bolão que seu amigo compartilhou
      </p>
      <Card>
        <JoinBolaoForm />
      </Card>
    </div>
  );
}
