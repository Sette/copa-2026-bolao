import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { CreateBolaoForm } from "@/components/boloes/CreateBolaoForm";

export default function CreateBolaoPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-zinc-900 mb-2">Criar Bolão</h1>
      <p className="text-black mb-6">
        Crie um bolão e convide seus amigos para participar
      </p>
      <Card>
        <CreateBolaoForm />
      </Card>
    </div>
  );
}
