import { STATUS_SUDAH } from "@/lib/ordner";

export function StatusBadge({
  status,
  onToggle,
  disabled,
}: {
  status: string;
  onToggle?: () => void;
  disabled?: boolean;
}) {
  const className = `badge ${status === STATUS_SUDAH ? "badge-active" : "badge-inactive"}`;

  if (!onToggle) return <span className={className}>{status}</span>;

  return (
    <button
      type="button"
      className={className}
      disabled={disabled}
      title="Klik untuk ubah status"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggle();
      }}
    >
      {status}
    </button>
  );
}