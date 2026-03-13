import { getSc } from './config';

interface BarLineProps {
  v: number;
}

export default function BarLine({ v }: BarLineProps) {
  const s = getSc(v);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 5, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 3, width: `${(v / 6) * 100}%`,
          background: `linear-gradient(90deg,${s.c}88,${s.c})`, transition: 'width .4s',
        }} />
      </div>
      <span style={{ fontSize: 14, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: s.c, minWidth: 16, textAlign: 'right' }}>{v}</span>
    </div>
  );
}
