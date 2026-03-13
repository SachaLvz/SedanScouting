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
      <div className="flex gap-2 mb-4">
        <input
          className="inp flex-1"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Info agent, famille, salaire, discussions..."
          onKeyDown={e => { if (e.key === 'Enter' && text.trim()) { onAdd(text); setText(''); } }}
        />
        <button className="btn-p px-[18px] py-2.5 text-xs" onClick={() => { if (text.trim()) { onAdd(text); setText(''); } }}>+</button>
      </div>
      {notes.length === 0
        ? <p className="text-center text-[#94a3b8] text-[13px] py-[30px]">Aucune note.</p>
        : (
          <div className="flex flex-col gap-1.5">
            {notes.map(n => (
              <div key={n.id} className="card px-4 py-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold font-mono text-[#1e6cb6]">{n.date}</span>
                  {n.scout && <Tag>par {n.scout}</Tag>}
                </div>
                <p className="mt-1.5 mb-0 text-[13px] text-[#475569] leading-[1.7]">{n.text}</p>
              </div>
            ))}
          </div>
        )
      }
    </div>
  );
}
