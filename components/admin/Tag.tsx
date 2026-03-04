interface TagProps {
  children: React.ReactNode;
  color?: string;
  bg?: string;
}

export default function Tag({ children, color, bg }: TagProps) {
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 6,
      background: bg ?? '#f1f5f9', color: color ?? '#64748b',
      letterSpacing: .3, whiteSpace: 'nowrap', display: 'inline-block', lineHeight: '18px',
    }}>
      {children}
    </span>
  );
}
