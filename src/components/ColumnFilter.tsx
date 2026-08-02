import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  label: string;
  values: string[];
  selected: Set<string> | undefined;
  onApply: (next: Set<string> | undefined) => void;
};

export function ColumnFilter({ label, values, selected, onApply }: Props) {
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [draft, setDraft] = useState<Set<string>>(new Set(values));
  const ref = useRef<HTMLDivElement>(null);

  const active = selected !== undefined;

  useEffect(() => {
    if (!open) return;
    setKeyword("");
    setDraft(new Set(selected ?? values));
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, selected, values]);

  const visible = useMemo(() => {
    const k = keyword.toLowerCase().trim();
    if (!k) return values;
    return values.filter((v) => v.toLowerCase().includes(k));
  }, [values, keyword]);

  const allVisibleChecked = visible.length > 0 && visible.every((v) => draft.has(v));

  const toggle = (value: string) => {
    setDraft((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  };

  const toggleAll = () => {
    setDraft((prev) => {
      const next = new Set(prev);
      if (allVisibleChecked) visible.forEach((v) => next.delete(v));
      else visible.forEach((v) => next.add(v));
      return next;
    });
  };

  const apply = () => {
    const isAll = values.length > 0 && values.every((v) => draft.has(v));
    onApply(isAll ? undefined : new Set(draft));
    setOpen(false);
  };

  return (
    <div className="col-filter" ref={ref}>
      <span className="col-filter-label">{label}</span>
      <button
        type="button"
        className={`col-filter-btn${active ? " is-active" : ""}`}
        aria-label={`Filter ${label}`}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {active ? "⛃" : "▾"}
      </button>

      {open && (
        <div className="col-filter-panel">
          <input
            type="text"
            className="col-filter-search"
            placeholder="Cari..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            autoFocus
          />
          <div className="col-filter-list">
            <label className="col-filter-item">
              <input type="checkbox" checked={allVisibleChecked} onChange={toggleAll} />
              <span>(Pilih Semua)</span>
            </label>
            {visible.map((value) => (
              <label className="col-filter-item" key={value}>
                <input
                  type="checkbox"
                  checked={draft.has(value)}
                  onChange={() => toggle(value)}
                />
                <span>{value === "" ? "(Kosong)" : value}</span>
              </label>
            ))}
            {visible.length === 0 && <p className="col-filter-empty">Tidak ada hasil</p>}
          </div>
          <div className="col-filter-actions">
            <button type="button" className="col-filter-action" onClick={() => setOpen(false)}>
              Batal
            </button>
            <button
              type="button"
              className="col-filter-action is-primary"
              onClick={apply}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
