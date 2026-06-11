import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { InviteCodeDisplay } from "@/components/boloes/InviteCodeDisplay";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ bolaoId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const { bolaoId } = await params;

  const membership = await prisma.bolaoMember.findUnique({
    where: {
      bolaoId_userId: {
        bolaoId,
        userId: session.user.id,
      },
    },
  });

  if (!membership) redirect("/dashboard");

  const bolao = await prisma.bolao.findUnique({
    where: { id: bolaoId },
  });

  if (!bolao) notFound();

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-zinc-900 mb-2">
        Convidar Amigos
      </h1>
      <p className="text-zinc-600 mb-6">
        Compartilhe o código abaixo com seus amigos para entrarem no bolão{" "}
        <strong>{bolao.name}</strong>
      </p>
      <Card>
        <InviteCodeDisplay code={bolao.code} bolaoId={bolao.id} />
      </Card>
    </div>
  );
}
