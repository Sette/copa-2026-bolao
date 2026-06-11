import { auth } from "@/lib/auth";
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
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="px-3 py-2 text-sm font-medium text-zinc-700 hover:text-zinc-900 transition-colors"
            >
              Entrar
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
            >
              Criar Conta
            </Link>
          </div>
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
          <p className="text-lg text-zinc-700 mb-8 max-w-lg mx-auto">
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
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/register"
                className="px-8 py-3 bg-emerald-600 text-white rounded-xl text-lg font-semibold hover:bg-emerald-700 transition-colors"
              >
                Criar Conta
              </Link>
              <Link
                href="/login"
                className="px-8 py-3 bg-white border-2 border-zinc-300 rounded-xl text-lg font-semibold hover:bg-zinc-50 transition-colors"
              >
                Entrar
              </Link>
            </div>
          )}

          {/* How it works */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-zinc-200">
              <div className="text-3xl mb-3">👥</div>
              <h3 className="font-semibold text-lg mb-2">Crie seu bolão</h3>
              <p className="text-sm text-zinc-700">
                Crie um bolão em segundos e convide seus amigos pelo código de
                convite
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-zinc-200">
              <div className="text-3xl mb-3">⚽</div>
              <h3 className="font-semibold text-lg mb-2">Dê seus palpites</h3>
              <p className="text-sm text-zinc-700">
                Antes de cada partida, palpite o placar exato. Placar exato vale
                5 pontos!
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-zinc-200">
              <div className="text-3xl mb-3">🏆</div>
              <h3 className="font-semibold text-lg mb-2">Acompanhe o ranking</h3>
              <p className="text-sm text-zinc-700">
                Veja quem lidera o bolão e acompanhe os palpites dos amigos em
                tempo real
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-sm text-zinc-700 border-t border-zinc-200 bg-white">
        Bolão Copa 2026 · Feito para os amigos ⚽
      </footer>
    </div>
  );
}
