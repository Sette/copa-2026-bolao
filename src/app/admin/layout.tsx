import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/");
  }

  const adminEmails = (process.env.ADMIN_EMAILS || "").split(",");
  if (!adminEmails.includes(session.user.email)) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1 bg-zinc-50">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center gap-4 mb-0">
            <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
              ADMIN
            </span>
            <Link
              href="/admin/matches"
              className="text-sm text-zinc-700 hover:text-zinc-900 transition-colors"
            >
              Gerenciar Partidas
            </Link>
          </div>
        </div>
        {children}
      </div>
      <Footer />
    </div>
  );
}
