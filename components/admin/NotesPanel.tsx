'use client';
import { useState } from 'react';
import Tag from './Tag';
import type { Note } from './config';

interface NotesPanelProps {
  notes: Note[];
  onAdd: (text: string) => void;
}

export default function NotesPanel({ notes, onAdd }: NotesPanelProps) {
  const [text, setText] = useState('');

  return (
    <div className="fu">
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input
          className="inp"
          style={{ flex: 1 }}
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Info agent, famille, salaire, discussions..."
          onKeyDown={e => { if (e.key === 'Enter' && text.trim()) { onAdd(text); setText(''); } }}
        />
        <button className="btn-p" style={{ padding: '10px 18px', fontSize: 12 }} onClick={() => { if (text.trim()) { onAdd(text); setText(''); } }}>+</button>
      </div>
      {notes.length === 0
        ? <p style={{ textAlign: 'center', color: 'var(--t3)', fontSize: 13, padding: 30 }}>Aucune note.</p>
        : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {notes.map(n => (
              <div key={n.id} className="card" style={{ padding: '12px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 10, fontWeight: 700, fontFamily: 'var(--m)', color: 'var(--blue)' }}>{n.date}</span>
                  {n.scout && <Tag>par {n.scout}</Tag>}
                </div>
                <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--t2)', lineHeight: 1.7 }}>{n.text}</p>
              </div>
            ))}
          </div>
        )
      }
    </div>
  );
}
