import { SCALE } from './config';

export default function NotePicker({ value, onChange }) {
  return (
    <div style={{ display: "flex", gap: 5 }}>
      {SCALE.map(s => (
        <button key={s.v} onClick={() => onChange(s.v)} style={{
          flex: 1, padding: "8px 4px", borderRadius: 10,
          border: value === s.v ? `2px solid ${s.c}` : "2px solid transparent",
          cursor: "pointer",
          background: value === s.v ? s.bg : "#f8fafc",
          transition: "all 0.15s", display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
        }}>
          <span style={{ fontSize: 16, fontWeight: 800, color: value === s.v ? s.c : "#cbd5e1", fontFamily: "var(--mono)" }}>{s.v}</span>
          <span style={{ fontSize: 7, fontWeight: 700, color: value === s.v ? s.c : "#cbd5e1", textTransform: "uppercase", letterSpacing: 0.5 }}>{s.l}</span>
        </button>
      ))}
    </div>
  );
}
