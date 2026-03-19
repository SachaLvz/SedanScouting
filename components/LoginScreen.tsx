'use client'
import { useState } from "react";

interface LoginUser {
  id: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'scout';
}

interface Props {
  onLogin: (user: LoginUser) => void;
}

export default function LoginScreen({ onLogin }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const inputCls = "w-full px-4 py-[13px] bg-[#f0f4f9] border-[1.5px] border-[#e2e8f0] rounded-xl text-[#0f172a] text-sm outline-none transition-all duration-200 focus:border-[#4a9de8] focus:shadow-[0_0_0_3px_rgba(74,157,232,0.12)] placeholder:text-[#94a3b8]";

  const handleLogin = async () => {
    if (!email || !password) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Identifiants incorrects.");
      } else {
        onLogin(data);
      }
    } catch {
      setError("Erreur réseau.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-5"
      style={{ background: "linear-gradient(160deg, #0c2340 0%, #1a3a5c 45%, #0f2d4a 100%)" }}
    >
      {/* Branding */}
      <div className="fu text-center mb-9">
        <div className="text-[56px] mb-2.5" style={{ filter: "drop-shadow(0 0 20px rgba(125,184,232,0.4))" }}>🦁</div>
        <h1
          className="m-0 text-[32px] font-extrabold tracking-[5px] uppercase"
          style={{ background: "linear-gradient(135deg, #7db8e8, #b8ddf8, #ffffff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
        >
          MBARODI FC
        </h1>
        <div className="text-[11px] text-white/40 uppercase tracking-[4px] mt-1.5 font-mono">
          Scouting · Détection · Recrutement
        </div>
      </div>

      {/* Card */}
      <div
        className="fu w-full max-w-[420px] bg-white/[0.97] rounded-3xl overflow-hidden"
        style={{ boxShadow: "0 24px 80px rgba(0,0,0,0.35)", animationDelay: "0.1s" }}
      >
        <div className="px-7 pt-8 pb-7">
          <div className="text-[13px] font-bold text-[#1e6cb6] mb-1">Connexion</div>
          <div className="text-[20px] font-extrabold text-[#0c2340] mb-6">Accéder à la plateforme</div>

          <div className="flex flex-col gap-4">
            <div>
              <div className="lbl">Email</div>
              <input
                className={inputCls}
                type="email"
                placeholder="votre@email.fr"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(""); }}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
                autoFocus
              />
            </div>
            <div>
              <div className="lbl">Mot de passe</div>
              <input
                className={inputCls}
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(""); }}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
              />
            </div>

            {error && (
              <div className="px-3.5 py-2.5 bg-[#fef2f2] rounded-[10px] text-xs text-[#dc2626]">
                {error}
              </div>
            )}

            <button
              className="w-full py-3.5 border-none rounded-xl text-sm font-bold bg-gradient-to-br from-[#0c2340] to-[#1a3a5c] text-white cursor-pointer shadow-[0_4px_16px_rgba(12,35,64,0.25)] transition-all duration-200 hover:shadow-[0_6px_24px_rgba(12,35,64,0.35)] hover:-translate-y-px disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0"
              onClick={handleLogin}
              disabled={!email || !password || loading}
            >
              {loading ? "Connexion…" : "Se connecter"}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 text-[10px] text-white/25 text-center font-mono tracking-[1px]">
        v1.0 · Mbarodi FC · {new Date().getFullYear()}
      </div>
    </div>
  );
}
