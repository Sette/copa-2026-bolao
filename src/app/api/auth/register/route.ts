import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const { name, email, password } = await req.json();

  if (!name || !email || !password) {
    return NextResponse.json(
      { error: "Nome, email e senha são obrigatórios" },
      { status: 400 }
    );
  }

  const trimmedEmail = email.toLowerCase().trim();

  if (password.length < 6) {
    return NextResponse.json(
      { error: "A senha deve ter no mínimo 6 caracteres" },
      { status: 400 }
    );
  }

  // Check if email already exists
  const existing = await prisma.user.findUnique({
    where: { email: trimmedEmail },
  });

  if (existing) {
    return NextResponse.json(
      { error: "Este email já está cadastrado" },
      { status: 409 }
    );
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name: name.trim(),
      email: trimmedEmail,
      password: hashedPassword,
    },
  });

  return NextResponse.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  });
}
