import { useState } from 'react';

export default function NotesPanel({ notes, onAdd }) {
  const [text, setText] = useState("");
  return (
    <div className="fade-up">
      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        <input className="inp" style={{ flex: 1 }} value={text} onChange={e => setText(e.target.value)}
          placeholder="Info agent, famille, salaire, discussions..."
          onKeyDown={e => { if (e.key === "Enter" && text.trim()) { onAdd(text); setText(""); } }} />
        <button className="glow-btn" style={{ padding: "10px 18px", fontSize: 12 }}
          onClick={() => { if (text.trim()) { onAdd(text); setText(""); } }}>+</button>
      </div>
      {notes.length === 0 ? (
        <p style={{ textAlign: "center", color: "var(--text-3)", fontSize: 13, padding: 30 }}>Aucune note. Ajoutez des infos extra-sportives.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {notes.map(n => (
            <div key={n.id} className="card" style={{ padding: "14px 18px" }}>
              <span style={{ fontSize: 10, fontWeight: 700, fontFamily: "var(--mono)", color: "var(--blue)" }}>{n.date}</span>
              <p style={{ margin: "6px 0 0", fontSize: 13, color: "var(--text-2)", lineHeight: 1.7 }}>{n.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
