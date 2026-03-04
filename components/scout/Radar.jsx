'use client';
import { useState } from 'react';
import { CATS, getSc } from './config';

export default function Radar({ ratings, size = 200 }) {
  const [hovered, setHovered] = useState(null);
  const cx = size / 2, cy = size / 2, r = size / 2 - 32;
  const n = CATS.length;

  const pt = (i, v, mx = 6) => {
    const a = (Math.PI * 2 * i) / n - Math.PI / 2;
    const d = (v / mx) * r;
    return [cx + d * Math.cos(a), cy + d * Math.sin(a)];
  };
  const poly = vals => vals.map((v, i) => pt(i, v).join(",")).join(" ");

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: "block", overflow: "visible" }}>
      <defs>
        <linearGradient id="sc-rfill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e6cb6" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#7db8e8" stopOpacity="0.08" />
        </linearGradient>
      </defs>
      {[1, 2, 3, 4, 5, 6].map(lv => (
        <polygon key={lv} points={poly(Array(n).fill(lv))} fill="none" stroke="#e2e8f0" strokeWidth="1" />
      ))}
      {Array.from({ length: n }, (_, i) => {
        const [x, y] = pt(i, 6);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#e2e8f0" strokeWidth="1" />;
      })}
      <polygon points={poly(CATS.map(c => ratings[c.key] || 1))} fill="url(#sc-rfill)" stroke="#1e6cb6" strokeWidth="2.5" />
      {CATS.map((c, i) => {
        const [x, y] = pt(i, ratings[c.key] || 1);
        const s = getSc(ratings[c.key] || 1);
        const isHov = hovered === c.key;
        return (
          <circle
            key={c.key} cx={x} cy={y}
            r={isHov ? 8 : 5.5}
            fill={s.c} stroke="white" strokeWidth="2.5"
            style={{ cursor: "pointer", transition: "r .12s" }}
            onMouseEnter={() => setHovered(c.key)}
            onMouseLeave={() => setHovered(null)}
          />
        );
      })}
      {CATS.map((c, i) => {
        const [x, y] = pt(i, 8.2);
        return (
          <text key={c.key + "t"} x={x} y={y} textAnchor="middle" dominantBaseline="middle"
            fill="#94a3b8" fontSize="14" fontFamily="var(--font)">{c.icon}</text>
        );
      })}

      {hovered && (() => {
        const cat = CATS.find(c => c.key === hovered);
        const i = CATS.indexOf(cat);
        const val = ratings[cat.key] || 1;
        const s = getSc(val);
        const [px, py] = pt(i, val);
        const label = `${cat.label}  ${val}/6 — ${s.l}`;
        const tw = label.length * 6.4 + 22;
        const th = 22;
        let tx = px - tw / 2;
        let ty = py - 32;
        if (tx < 2) tx = 2;
        if (tx + tw > size - 2) tx = size - tw - 2;
        if (ty < 2) ty = py + 14;
        return (
          <g key="tip" style={{ pointerEvents: "none" }}>
            <rect x={tx} y={ty} width={tw} height={th} rx="6" fill={s.c} opacity="0.93" />
            <text x={tx + tw / 2} y={ty + th / 2 + 1} textAnchor="middle" dominantBaseline="middle"
              fill="#fff" fontSize="10.5" fontWeight="700" fontFamily="'Plus Jakarta Sans',sans-serif">
              {label}
            </text>
          </g>
        );
      })()}
    </svg>
  );
}
