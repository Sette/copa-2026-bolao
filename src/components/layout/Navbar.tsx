"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Avatar } from "@/components/ui/Avatar";
import { useState, useRef, useEffect } from "react";

export function Navbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-zinc-200">
      <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <span className="text-xl">⚽</span>
          <span className="text-lg font-bold text-emerald-700 hidden sm:inline">
            Bolão Copa 2026
          </span>
        </Link>

        {session?.user ? (
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
            >
              Meus Bolões
            </Link>
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <Avatar
                  src={session.user.image}
                  name={session.user.name}
                  size="sm"
                />
                <span className="text-sm font-medium text-zinc-700 hidden sm:inline truncate max-w-[120px]">
                  {session.user.name}
                </span>
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-zinc-200 rounded-lg shadow-lg py-1">
                  <div className="px-4 py-2 border-b border-zinc-100">
                    <p className="text-sm font-medium text-zinc-900 truncate">
                      {session.user.name}
                    </p>
                    <p className="text-xs text-zinc-500 truncate">
                      {session.user.email}
                    </p>
                  </div>
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="w-full text-left px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors"
                  >
                    Sair
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <Link
            href="/login"
            className="text-sm font-medium text-emerald-700 hover:text-emerald-800 transition-colors"
          >
            Entrar
          </Link>
        )}
      </div>
    </header>
  );
}
