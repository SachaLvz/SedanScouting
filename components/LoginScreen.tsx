'use client'
import { useState, useEffect } from "react";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');
* { box-sizing: border-box; }
body { margin: 0; font-family: 'Plus Jakarta Sans', sans-serif; }
.login-inp {
  width: 100%; padding: 13px 16px;
  background: #f0f4f9; border: 1.5px solid #e2e8f0;
  border-radius: 12px; color: #0f172a; font-size: 14px;
  font-family: inherit; outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.login-inp:focus { border-color: #4a9de8; box-shadow: 0 0 0 3px rgba(74,157,232,0.12); }
.login-inp::placeholder { color: #94a3b8; }
.login-btn-p {
  width: 100%; padding: 14px; border: none; border-radius: 12px;
  font-size: 14px; font-weight: 700; font-family: inherit;
  background: linear-gradient(135deg, #0c2340, #1a3a5c); color: white;
  cursor: pointer; box-shadow: 0 4px 16px rgba(12,35,64,0.25);
  transition: box-shadow 0.2s, transform 0.15s;
}
.login-btn-p:hover { box-shadow: 0 6px 24px rgba(12,35,64,0.35); transform: translateY(-1px); }
.login-btn-p:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
.tab-login {
  flex: 1; padding: 11px 16px; background: none;
  border: none; border-bottom: 2px solid transparent;
  font-size: 13px; font-weight: 600; color: #94a3b8;
  cursor: pointer; transition: all 0.15s; font-family: inherit;
}
.tab-login.on { color: #0c2340; border-bottom-color: #1e6cb6; }
.tab-login:hover:not(.on) { color: #475569; }
@keyframes fu { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
.fu { animation: fu 0.35s ease-out forwards; }
`;

interface LoginUser {
  id: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'scout';
}

interface Props {
  onLogin: (user: LoginUser) => void;
}

const ADMIN_PASSWORD = "mbarodi2026";

export default function LoginScreen({ onLogin }: Props) {
  const [mode, setMode] = useState<'admin' | 'scout'>('admin');
  const [password, setPassword] = useState("");
  const [scoutName, setScoutName] = useState("");
  const [error, setError] = useState("");
  const [scouts, setScouts] = useState<LoginUser[]>([]);
  const [selectedScout, setSelectedScout] = useState<LoginUser | null>(null);

  useEffect(() => {
    fetch('/api/scouts')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setScouts(data); })
      .catch(() => {});
  }, []);

  const handleAdmin = () => {
    if (password === ADMIN_PASSWORD) {
      onLogin({ id: "admin-1", firstName: '', lastName: "Admin", role: "admin" });
    } else {
      setError("Mot de passe incorrect.");
    }
  };

  const handleScout = () => {
    if (selectedScout) {
      onLogin(selectedScout);
    } else {
      const name = scoutName.trim();
      if (!name) { setError("Sélectionnez ou entrez votre nom."); return; }
      const id = "scout-" + Math.random().toString(36).substr(2, 8);
      onLogin({ id, firstName: '', lastName: name, role: "scout" });
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") mode === "admin" ? handleAdmin() : handleScout();
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "linear-gradient(160deg, #0c2340 0%, #1a3a5c 45%, #0f2d4a 100%)",
      padding: "20px",
    }}>
      <style>{CSS}</style>

      {/* Branding */}
      <div className="fu" style={{ textAlign: "center", marginBottom: 36 }}>
        <div style={{ fontSize: 56, marginBottom: 10, filter: "drop-shadow(0 0 20px rgba(125,184,232,0.4))" }}>🦁</div>
        <h1 style={{
          margin: 0, fontSize: 32, fontWeight: 800, letterSpacing: 5,
          textTransform: "uppercase",
          background: "linear-gradient(135deg, #7db8e8, #b8ddf8, #ffffff)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>MBARODI FC</h1>
        <div style={{
          fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase",
          letterSpacing: 4, marginTop: 6, fontFamily: "'JetBrains Mono', monospace",
        }}>Scouting · Détection · Recrutement</div>
      </div>

      {/* Card */}
      <div className="fu" style={{
        width: "100%", maxWidth: 420,
        background: "rgba(255,255,255,0.97)", borderRadius: 24,
        boxShadow: "0 24px 80px rgba(0,0,0,0.35)",
        overflow: "hidden",
        animationDelay: "0.1s",
      }}>
        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid #e2e8f0" }}>
          <button className={`tab-login ${mode === "admin" ? "on" : ""}`} onClick={() => { setMode("admin"); setError(""); }}>
            🔐 Admin
          </button>
          <button className={`tab-login ${mode === "scout" ? "on" : ""}`} onClick={() => { setMode("scout"); setError(""); }}>
            👤 Scout
          </button>
        </div>

        <div style={{ padding: "32px 28px 28px" }}>
          {mode === "admin" ? (
            <div key="admin" className="fu">
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
                  Mot de passe Admin
                </div>
                <input
                  className="login-inp"
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(""); }}
                  onKeyDown={handleKey}
                  autoFocus
                />
              </div>
              {error && (
                <div style={{ padding: "10px 14px", background: "#fef2f2", borderRadius: 10, fontSize: 12, color: "#dc2626", marginBottom: 16 }}>
                  {error}
                </div>
              )}
              <button className="login-btn-p" onClick={handleAdmin} disabled={!password}>
                Connexion Admin
              </button>
              <div style={{ marginTop: 16, padding: "10px 14px", background: "#eff6ff", borderRadius: 10, fontSize: 11, color: "#1e40af", lineHeight: 1.6 }}>
                ℹ️ L'admin accède à <strong>tous les rapports</strong> de tous les scouts et peut gérer l'équipe complète.
              </div>
            </div>
          ) : (
            <div key="scout" className="fu">
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
                  {scouts.length > 0 ? "Sélectionnez votre profil" : "Votre nom"}
                </div>
                {scouts.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {scouts.map(s => (
                      <button
                        key={s.id}
                        onClick={() => { setSelectedScout(s); setScoutName(""); setError(""); }}
                        style={{
                          width: "100%", padding: "12px 16px", borderRadius: 12, cursor: "pointer",
                          border: selectedScout?.id === s.id ? "2px solid #1e6cb6" : "1.5px solid #e2e8f0",
                          background: selectedScout?.id === s.id ? "#eff6ff" : "#f8fafc",
                          color: selectedScout?.id === s.id ? "#0c2340" : "#475569",
                          fontWeight: selectedScout?.id === s.id ? 700 : 500,
                          fontSize: 14, fontFamily: "inherit", textAlign: "left",
                          transition: "all 0.15s",
                        }}
                      >
                        👤 {[s.firstName, s.lastName].filter(Boolean).join(' ')}
                      </button>
                    ))}
                  </div>
                ) : (
                  <input
                    className="login-inp"
                    type="text"
                    placeholder="Ex: Mamadou Diallo"
                    value={scoutName}
                    onChange={e => { setScoutName(e.target.value); setError(""); }}
                    onKeyDown={handleKey}
                    autoFocus
                  />
                )}
              </div>
              {error && (
                <div style={{ padding: "10px 14px", background: "#fef2f2", borderRadius: 10, fontSize: 12, color: "#dc2626", marginBottom: 16 }}>
                  {error}
                </div>
              )}
              <button className="login-btn-p" onClick={handleScout} disabled={scouts.length > 0 ? !selectedScout : !scoutName.trim()}>
                Accéder au scouting
              </button>
              <div style={{ marginTop: 16, padding: "10px 14px", background: "#f0fdf4", borderRadius: 10, fontSize: 11, color: "#166534", lineHeight: 1.6 }}>
                ℹ️ En mode Scout, vous accédez à une interface <strong>simplifiée</strong> et ne voyez que vos propres rapports.
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: 24, fontSize: 10, color: "rgba(255,255,255,0.25)", textAlign: "center", fontFamily: "'JetBrains Mono', monospace", letterSpacing: 1 }}>
        v1.0 · Mbarodi FC · {new Date().getFullYear()}
      </div>
    </div>
  );
}
