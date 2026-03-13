'use client'
import { useState, useEffect } from "react";

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
  const [mode, setMode] = useState<'admin' | 'scout'>('admin');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [scouts, setScouts] = useState<LoginUser[]>([]);
  const [selectedScout, setSelectedScout] = useState<LoginUser | null>(null);
  const [scoutPassword, setScoutPassword] = useState("");

  useEffect(() => {
    fetch('/api/scouts')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setScouts(data); })
      .catch(() => {});
  }, []);

  const handleAdmin = async () => {
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
        setError(data.error ?? "Erreur de connexion.");
      } else {
        onLogin(data);
      }
    } catch {
      setError("Erreur réseau.");
    } finally {
      setLoading(false);
    }
  };

  const handleScout = async () => {
    if (!selectedScout || !scoutPassword) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedScout.id, password: scoutPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erreur de connexion.");
      } else {
        onLogin(data);
      }
    } catch {
      setError("Erreur réseau.");
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") mode === "admin" ? handleAdmin() : handleScout();
  };

  const inputCls = "w-full px-4 py-[13px] bg-[#f0f4f9] border-[1.5px] border-[#e2e8f0] rounded-xl text-[#0f172a] text-sm outline-none transition-all duration-200 focus:border-[#4a9de8] focus:shadow-[0_0_0_3px_rgba(74,157,232,0.12)] placeholder:text-[#94a3b8]";

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
        {/* Tabs */}
        <div className="flex border-b border-[#e2e8f0]">
          <button
            className={`flex-1 px-4 py-[11px] bg-transparent border-none border-b-2 text-[13px] font-semibold cursor-pointer transition-all duration-150 ${mode === "admin" ? "text-[#0c2340] border-b-[#1e6cb6]" : "text-[#94a3b8] border-b-transparent hover:text-[#475569]"}`}
            onClick={() => { setMode("admin"); setError(""); setEmail(""); setPassword(""); }}
          >
            🔐 Admin
          </button>
          <button
            className={`flex-1 px-4 py-[11px] bg-transparent border-none border-b-2 text-[13px] font-semibold cursor-pointer transition-all duration-150 ${mode === "scout" ? "text-[#0c2340] border-b-[#1e6cb6]" : "text-[#94a3b8] border-b-transparent hover:text-[#475569]"}`}
            onClick={() => { setMode("scout"); setError(""); setEmail(""); setPassword(""); }}
          >
            👤 Scout
          </button>
        </div>

        <div className="px-7 pt-8 pb-7">
          {mode === "admin" ? (
            <div key="admin" className="fu">
              <div className="mb-4">
                <div className="lbl">Email</div>
                <input
                  className={inputCls}
                  type="email"
                  placeholder="admin@exemple.fr"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(""); }}
                  onKeyDown={handleKey}
                  autoFocus
                />
              </div>
              <div className="mb-5">
                <div className="lbl">Mot de passe</div>
                <input
                  className={inputCls}
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(""); }}
                  onKeyDown={handleKey}
                />
              </div>
              {error && (
                <div className="px-3.5 py-2.5 bg-[#fef2f2] rounded-[10px] text-xs text-[#dc2626] mb-4">
                  {error}
                </div>
              )}
              <button
                className="w-full py-3.5 border-none rounded-xl text-sm font-bold bg-gradient-to-br from-[#0c2340] to-[#1a3a5c] text-white cursor-pointer shadow-[0_4px_16px_rgba(12,35,64,0.25)] transition-all duration-200 hover:shadow-[0_6px_24px_rgba(12,35,64,0.35)] hover:-translate-y-px disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0"
                onClick={handleAdmin}
                disabled={!email || !password || loading}
              >
                {loading ? "Connexion…" : "Connexion Admin"}
              </button>
              <div className="mt-4 px-3.5 py-2.5 bg-[#eff6ff] rounded-[10px] text-[11px] text-[#1e40af] leading-relaxed">
                ℹ️ L&apos;admin accède à <strong>tous les rapports</strong> de tous les scouts et peut gérer l&apos;équipe complète.
              </div>
            </div>
          ) : (
            <div key="scout" className="fu">
              <div className="mb-4">
                <div className="lbl">Sélectionnez votre profil</div>
                <div className="flex flex-col gap-2">
                  {scouts.map(s => (
                    <button
                      key={s.id}
                      onClick={() => { setSelectedScout(s); setScoutPassword(""); setError(""); }}
                      className="w-full px-4 py-3 rounded-xl cursor-pointer text-sm text-left transition-all duration-150"
                      style={{
                        border: selectedScout?.id === s.id ? "2px solid #1e6cb6" : "1.5px solid #e2e8f0",
                        background: selectedScout?.id === s.id ? "#eff6ff" : "#f8fafc",
                        color: selectedScout?.id === s.id ? "#0c2340" : "#475569",
                        fontWeight: selectedScout?.id === s.id ? 700 : 500,
                      }}
                    >
                      👤 {[s.firstName, s.lastName].filter(Boolean).join(' ')}
                    </button>
                  ))}
                </div>
              </div>
              {selectedScout && (
                <div className="mb-5">
                  <div className="lbl">Mot de passe</div>
                  <input
                    className={inputCls}
                    type="password"
                    placeholder="••••••••••••"
                    value={scoutPassword}
                    onChange={e => { setScoutPassword(e.target.value); setError(""); }}
                    onKeyDown={handleKey}
                    autoFocus
                  />
                </div>
              )}
              {error && (
                <div className="px-3.5 py-2.5 bg-[#fef2f2] rounded-[10px] text-xs text-[#dc2626] mb-4">
                  {error}
                </div>
              )}
              <button
                className="w-full py-3.5 border-none rounded-xl text-sm font-bold bg-gradient-to-br from-[#0c2340] to-[#1a3a5c] text-white cursor-pointer shadow-[0_4px_16px_rgba(12,35,64,0.25)] transition-all duration-200 hover:shadow-[0_6px_24px_rgba(12,35,64,0.35)] hover:-translate-y-px disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0"
                onClick={handleScout}
                disabled={!selectedScout || !scoutPassword || loading}
              >
                {loading ? "Connexion…" : "Accéder au scouting"}
              </button>
              <div className="mt-4 px-3.5 py-2.5 bg-[#f0fdf4] rounded-[10px] text-[11px] text-[#166534] leading-relaxed">
                ℹ️ En mode Scout, vous accédez à une interface <strong>simplifiée</strong> et ne voyez que vos propres rapports.
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 text-[10px] text-white/25 text-center font-mono tracking-[1px]">
        v1.0 · Mbarodi FC · {new Date().getFullYear()}
      </div>
    </div>
  );
}
