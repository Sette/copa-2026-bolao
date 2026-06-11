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

  // Verify membership
  const member = await prisma.bolaoMember.findUnique({
    where: {
      bolaoId_userId: {
        bolaoId,
        userId: session.user.id,
      },
    },
  });

  if (!member) {
    return NextResponse.json(
      { error: "Você não participa deste bolão" },
      { status: 403 }
    );
  }

  const bets = await prisma.bet.findMany({
    where: {
      userId: session.user.id,
      bolaoId,
    },
    include: {
      match: true,
    },
    orderBy: { match: { date: "asc" } },
  });

  return NextResponse.json(bets);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ bolaoId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { bolaoId } = await params;

  // Verify membership
  const member = await prisma.bolaoMember.findUnique({
    where: {
      bolaoId_userId: {
        bolaoId,
        userId: session.user.id,
      },
    },
  });

  if (!member) {
    return NextResponse.json(
      { error: "Você não participa deste bolão" },
      { status: 403 }
    );
  }

  const { matchId, homeScore, awayScore } = await req.json();

  if (homeScore === undefined || awayScore === undefined) {
    return NextResponse.json(
      { error: "Placar do palpite é obrigatório" },
      { status: 400 }
    );
  }

  // Validate match exists and hasn't started
  const match = await prisma.match.findUnique({
    where: { id: matchId },
  });

  if (!match) {
    return NextResponse.json(
      { error: "Partida não encontrada" },
      { status: 404 }
    );
  }

  if (match.finished || new Date() > match.date) {
    return NextResponse.json(
      { error: "Partida já começou ou foi encerrada" },
      { status: 400 }
    );
  }

  // Upsert bet
  const bet = await prisma.bet.upsert({
    where: {
      userId_matchId_bolaoId: {
        userId: session.user.id,
        matchId,
        bolaoId,
      },
    },
    update: {
      homeScore: Number(homeScore),
      awayScore: Number(awayScore),
    },
    create: {
      userId: session.user.id,
      matchId,
      bolaoId,
      homeScore: Number(homeScore),
      awayScore: Number(awayScore),
    },
    include: {
      match: true,
    },
  });

  return NextResponse.json(bet);
}
