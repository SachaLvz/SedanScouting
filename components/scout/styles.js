const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');
:root {
  --bg: #f4f7fb; --bg-card: #ffffff; --bg-input: #f0f4f9;
  --navy: #0c2340; --navy-soft: #1a3a5c;
  --blue: #1e6cb6; --blue-light: #4a9de8; --blue-sky: #7db8e8;
  --blue-pale: #dbeafe; --blue-ghost: #eef5fd;
  --border: #e2e8f0; --border-h: #cbd5e1;
  --text-1: #0f172a; --text-2: #475569; --text-3: #94a3b8;
  --shadow-sm: 0 1px 3px rgba(15,23,42,0.04);
  --shadow: 0 4px 16px rgba(15,23,42,0.06), 0 1px 3px rgba(15,23,42,0.04);
  --shadow-lg: 0 12px 40px rgba(15,23,42,0.1), 0 4px 12px rgba(15,23,42,0.05);
  --radius: 16px; --font: 'Plus Jakarta Sans', -apple-system, sans-serif;
  --mono: 'JetBrains Mono', monospace;
}
* { box-sizing: border-box; }
input, select, textarea, button { font-family: var(--font); }
.card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); box-shadow: var(--shadow-sm); transition: border-color 0.2s, box-shadow 0.2s, transform 0.15s; }
.card:hover { border-color: var(--border-h); box-shadow: var(--shadow); }
.card-click:hover { transform: translateY(-1px); cursor: pointer; }
.glow-btn { background: linear-gradient(135deg, var(--navy), var(--navy-soft)); color: white; border: none; border-radius: 12px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 16px rgba(12,35,64,0.2); transition: box-shadow 0.2s, transform 0.15s; }
.glow-btn:hover { box-shadow: 0 6px 24px rgba(12,35,64,0.3); transform: translateY(-1px); }
.ghost-btn { background: var(--bg-card); border: 1px solid var(--border); border-radius: 10px; color: var(--text-2); cursor: pointer; transition: all 0.15s; }
.ghost-btn:hover { background: var(--bg-input); color: var(--text-1); border-color: var(--border-h); }
.tab-btn { background: none; border: none; cursor: pointer; padding: 10px 20px; font-size: 12px; font-weight: 600; color: var(--text-3); border-bottom: 2px solid transparent; transition: all 0.15s; letter-spacing: 0.3px; }
.tab-btn.active { color: var(--navy); border-bottom-color: var(--blue); }
.tab-btn:hover:not(.active) { color: var(--text-2); }
.inp { width: 100%; padding: 11px 14px; background: var(--bg-input); border: 1px solid var(--border); border-radius: 10px; color: var(--text-1); font-size: 13px; outline: none; transition: border-color 0.2s, box-shadow 0.2s; }
.inp:focus { border-color: var(--blue-light); box-shadow: 0 0 0 3px rgba(74,157,232,0.1); }
.inp::placeholder { color: var(--text-3); }
select.inp { cursor: pointer; }
.label { display: block; font-size: 10px; font-weight: 700; color: var(--text-3); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 1px; }
@keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.fade-up { animation: fadeUp 0.3s ease-out forwards; }
::selection { background: rgba(30,108,182,0.15); }
`;

export default CSS;
