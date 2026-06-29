export function StatusBadge({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="status-badge">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}
