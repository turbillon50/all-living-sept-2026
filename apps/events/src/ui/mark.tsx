export function Mark({ size = 36 }: { size?: number; motion?: boolean }) {
  return <span className="events-mark" style={{ width: size, height: size }} aria-hidden><span /></span>;
}
