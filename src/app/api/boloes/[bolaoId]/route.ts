import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ bolaoId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { bolaoId } = await params;

  const membership = await prisma.bolaoMember.findUnique({
    where: {
      bolaoId_userId: {
        bolaoId,
        userId: session.user.id,
      },
    },
  });

  if (!membership) {
    return NextResponse.json(
      { error: "Você não participa deste bolão" },
      { status: 403 }
    );
  }

  const bolao = await prisma.bolao.findUnique({
    where: { id: bolaoId },
    include: {
      _count: { select: { members: true, bets: true } },
      members: {
        include: {
          user: {
            select: { id: true, name: true, image: true },
          },
        },
        orderBy: { user: { name: "asc" } },
      },
    },
  });

  return NextResponse.json({ ...bolao, membership });
}
