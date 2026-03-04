const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');
:root{--bg:#f4f7fb;--card:#fff;--input:#f0f4f9;--navy:#0c2340;--navy2:#1a3a5c;--blue:#1e6cb6;--blueL:#4a9de8;--blueP:#dbeafe;--blueG:#eef5fd;--border:#e2e8f0;--borderH:#cbd5e1;--t1:#0f172a;--t2:#475569;--t3:#94a3b8;--sh:0 4px 16px rgba(15,23,42,0.06);--shL:0 12px 40px rgba(15,23,42,0.1);--r:16px;--f:'Plus Jakarta Sans',sans-serif;--m:'JetBrains Mono',monospace;}
*{box-sizing:border-box}input,select,textarea,button{font-family:var(--f)}
.card{background:var(--card);border:1px solid var(--border);border-radius:var(--r);box-shadow:0 1px 3px rgba(15,23,42,0.04);transition:border-color .2s,box-shadow .2s,transform .15s}
.card:hover{border-color:var(--borderH);box-shadow:var(--sh)}.card-click:hover{transform:translateY(-1px);cursor:pointer}
.btn-p{background:linear-gradient(135deg,var(--navy),var(--navy2));color:#fff;border:none;border-radius:12px;font-weight:700;cursor:pointer;box-shadow:0 4px 16px rgba(12,35,64,.2);transition:box-shadow .2s,transform .15s}
.btn-p:hover{box-shadow:0 6px 24px rgba(12,35,64,.3);transform:translateY(-1px)}
.btn-g{background:var(--card);border:1px solid var(--border);border-radius:10px;color:var(--t2);cursor:pointer;transition:all .15s}.btn-g:hover{background:var(--input);color:var(--t1)}
.tab{background:none;border:none;cursor:pointer;padding:10px 18px;font-size:12px;font-weight:600;color:var(--t3);border-bottom:2px solid transparent;transition:all .15s;letter-spacing:.3px}
.tab.on{color:var(--navy);border-bottom-color:var(--blue)}.tab:hover:not(.on){color:var(--t2)}
.inp{width:100%;padding:11px 14px;background:var(--input);border:1px solid var(--border);border-radius:10px;color:var(--t1);font-size:13px;outline:none;transition:border-color .2s,box-shadow .2s}
.inp:focus{border-color:var(--blueL);box-shadow:0 0 0 3px rgba(74,157,232,.1)}.inp::placeholder{color:var(--t3)}select.inp{cursor:pointer}
.lbl{display:block;font-size:10px;font-weight:700;color:var(--t3);margin-bottom:6px;text-transform:uppercase;letter-spacing:1px}
@keyframes fu{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}.fu{animation:fu .3s ease-out forwards}
::selection{background:rgba(30,108,182,.15)}
`;

export default CSS;
