import { auth, signIn } from "@/lib/auth";
import Link from "next/link";

export default async function HomePage() {
  const session = await auth();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 bg-white">
        <div className="flex items-center gap-3">
          <span className="text-2xl">⚽</span>
          <h1 className="text-xl font-bold text-emerald-700">
            Bolão Copa 2026
          </h1>
        </div>
        {session?.user ? (
          <div className="flex items-center gap-3">
            {session.user.image && (
              <img
                src={session.user.image}
                alt="Avatar"
                className="w-8 h-8 rounded-full"
              />
            )}
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
            >
              Meus Bolões
            </Link>
          </div>
        ) : (
          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/dashboard" });
            }}
          >
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-300 rounded-lg hover:bg-zinc-50 transition-colors text-sm font-medium"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Entrar com Google
            </button>
          </form>
        )}
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-20">
        <div className="text-center max-w-2xl">
          <div className="text-6xl mb-6">🏆⚽🏆</div>
          <h2 className="text-4xl font-bold mb-4 text-zinc-800">
            Monte seu bolão da{" "}
            <span className="text-emerald-600">Copa do Mundo 2026</span>
          </h2>
          <p className="text-lg text-zinc-600 mb-8 max-w-lg mx-auto">
            Palpite os placares das partidas, desafie seus amigos e descubra
            quem é o melhor prognosticador da Copa!
          </p>

          {session?.user ? (
            <Link
              href="/dashboard"
              className="inline-block px-8 py-3 bg-emerald-600 text-white rounded-xl text-lg font-semibold hover:bg-emerald-700 transition-colors"
            >
              Ir para Meus Bolões
            </Link>
          ) : (
            <form
              action={async () => {
                "use server";
                await signIn("google", { redirectTo: "/dashboard" });
              }}
            >
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-8 py-3 bg-white border-2 border-zinc-300 rounded-xl text-lg font-semibold hover:bg-zinc-50 transition-colors shadow-sm"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Entrar com Google
              </button>
            </form>
          )}

          {/* How it works */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-zinc-200">
              <div className="text-3xl mb-3">👥</div>
              <h3 className="font-semibold text-lg mb-2">Crie seu bolão</h3>
              <p className="text-sm text-zinc-600">
                Crie um bolão em segundos e convide seus amigos pelo código de
                convite
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-zinc-200">
              <div className="text-3xl mb-3">⚽</div>
              <h3 className="font-semibold text-lg mb-2">Dê seus palpites</h3>
              <p className="text-sm text-zinc-600">
                Antes de cada partida, palpite o placar exato. Placar exato vale
                5 pontos!
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-zinc-200">
              <div className="text-3xl mb-3">🏆</div>
              <h3 className="font-semibold text-lg mb-2">Acompanhe o ranking</h3>
              <p className="text-sm text-zinc-600">
                Veja quem lidera o bolão e acompanhe os palpites dos amigos em
                tempo real
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-sm text-zinc-400 border-t border-zinc-200 bg-white">
        Bolão Copa 2026 · Feito para os amigos ⚽
      </footer>
    </div>
  );
}
