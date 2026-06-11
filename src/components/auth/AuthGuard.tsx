import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { type ReactNode } from "react";

interface AuthGuardProps {
  children: ReactNode;
}

export async function AuthGuard({ children }: AuthGuardProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  return <>{children}</>;
}
