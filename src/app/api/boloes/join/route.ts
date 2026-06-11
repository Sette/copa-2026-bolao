import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { code } = await req.json();

  if (!code || code.trim().length === 0) {
    return NextResponse.json(
      { error: "Código do bolão é obrigatório" },
      { status: 400 }
    );
  }

  const bolao = await prisma.bolao.findUnique({
    where: { code: code.trim().toUpperCase() },
  });

  if (!bolao) {
    return NextResponse.json(
      { error: "Bolão não encontrado. Verifique o código." },
      { status: 404 }
    );
  }

  // Check if already a member
  const existing = await prisma.bolaoMember.findUnique({
    where: {
      bolaoId_userId: {
        bolaoId: bolao.id,
        userId: session.user.id,
      },
    },
  });

  if (existing) {
    return NextResponse.json(
      { error: "Você já participa deste bolão", bolao },
      { status: 409 }
    );
  }

  await prisma.bolaoMember.create({
    data: {
      bolaoId: bolao.id,
      userId: session.user.id,
      role: "member",
    },
  });

  return NextResponse.json({ success: true, bolao });
}
