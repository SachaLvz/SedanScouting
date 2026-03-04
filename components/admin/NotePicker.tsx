import { SCALE } from './config';

interface NotePickerProps {
  value: number;
  onChange: (v: number) => void;
}

export default function NotePicker({ value, onChange }: NotePickerProps) {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {SCALE.map(s => (
        <button
          key={s.v}
          onClick={() => onChange(s.v)}
          style={{
            flex: 1, padding: '7px 2px', borderRadius: 9,
            border: value === s.v ? `2px solid ${s.c}` : '2px solid transparent',
            cursor: 'pointer',
            background: value === s.v ? s.bg : '#f8fafc',
            transition: 'all .15s', display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 2,
          }}
        >
          <span style={{ fontSize: 15, fontWeight: 800, color: value === s.v ? s.c : '#cbd5e1', fontFamily: 'var(--m)' }}>{s.v}</span>
          <span style={{ fontSize: 7, fontWeight: 700, color: value === s.v ? s.c : '#cbd5e1', textTransform: 'uppercase' }}>{s.l}</span>
        </button>
      ))}
    </div>
  );
}
