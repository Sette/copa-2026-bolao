import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { nanoid } from "nanoid";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const memberships = await prisma.bolaoMember.findMany({
    where: { userId: session.user.id },
    include: {
      bolao: {
        include: {
          _count: { select: { members: true } },
        },
      },
    },
    orderBy: { bolao: { createdAt: "desc" } },
  });

  return NextResponse.json(memberships);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { name, description } = await req.json();

  if (!name || name.trim().length === 0) {
    return NextResponse.json(
      { error: "Nome do bolão é obrigatório" },
      { status: 400 }
    );
  }

  const code = nanoid(8);

  const bolao = await prisma.bolao.create({
    data: {
      name: name.trim(),
      description: description?.trim(),
      code,
      ownerId: session.user.id,
      members: {
        create: {
          userId: session.user.id,
          role: "admin",
        },
      },
    },
    include: {
      _count: { select: { members: true } },
    },
  });

  return NextResponse.json(bolao);
}
