import { useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { LOGO_HK_BHIRAWA, LOGO_NAS } from "@/lib/logos";
import { fetchOrdner, type Ordner } from "@/lib/ordner";

type LabelTemplate = {
  nama: string;
  widthMM: number;
  heightMM: number;
  marginTopMM: number;
  marginLeftMM: number;
};

const LABEL_TEMPLATES: Record<string, LabelTemplate> = {
  "a4-landscape-90": {
    nama: "Otomatis Pas (Skala 90%)",
    widthMM: 63,
    heightMM: 180,
    marginTopMM: 0,
    marginLeftMM: 0,
  },
  "a4-landscape-max": {
    nama: "Ukuran Penuh (Tanpa Margin)",
    widthMM: 70,
    heightMM: 200,
    marginTopMM: 0,
    marginLeftMM: 0,
  },
};

const LABELS_PER_PAGE = 4;

export const Route = createFileRoute("/print")({
  validateSearch: (search: Record<string, unknown>) => ({
    ids: typeof search.ids === "string" ? search.ids : "",
  }),
  head: () => ({
    meta: [
      { title: "Print Label Ordner - NasHKB" },
      {
        name: "description",
        content:
          "Cetak label cover ordner akuntansi ukuran presisi pada kertas A4 landscape, 4 label per halaman.",
      },
      { property: "og:title", content: "Print Label Ordner - NasHKB" },
      {
        property: "og:description",
        content: "Cetak label cover ordner akuntansi ukuran presisi pada kertas A4 landscape.",
      },
    ],
  }),
  component: PrintPage,
});

function PrintPage() {
  const { ids } = Route.useSearch();
  const [templateKey, setTemplateKey] = useState("a4-landscape-90");
  const { data = [] } = useQuery({ queryKey: ["ordner"], queryFn: fetchOrdner });

  const targetIds = ids ? ids.split(",").filter(Boolean) : [];
  const selected = targetIds
    .map((id) => data.find((item) => item.id === id))
    .filter(Boolean) as Ordner[];

  const pages: Ordner[][] = [];
  for (let i = 0; i < selected.length; i += LABELS_PER_PAGE) {
    pages.push(selected.slice(i, i + LABELS_PER_PAGE));
  }

  const config = LABEL_TEMPLATES[templateKey];

  return (
    <div className="app">
      <nav className="navbar no-print">
        <div className="container">
          <div className="brand">Ordner Akuntansi</div>
          <div className="nav-links">
            <Link to="/">Kembali ke Dashboard</Link>
          </div>
        </div>
      </nav>

      <div className="print-page-wrapper">
        <div className="control-panel no-print">
          <h2 style={{ fontSize: "1.2rem", color: "var(--navy-primary)" }}>
            Pengaturan Print Label (Otomatis 90%)
          </h2>
          <div className="control-row">
            <div className="form-group" style={{ margin: 0, flexGrow: 1 }}>
              <label htmlFor="templateSelect">Mode Cetak:</label>
              <select
                id="templateSelect"
                className="form-control"
                value={templateKey}
                onChange={(e) => setTemplateKey(e.target.value)}
              >
                {Object.entries(LABEL_TEMPLATES).map(([key, tpl]) => (
                  <option key={key} value={key}>
                    {tpl.nama}
                  </option>
                ))}
              </select>
            </div>
            <button
              className="btn btn-gold"
              style={{ height: 42 }}
              onClick={() => window.print()}
            >
              🖨️ Cetak Sekarang
            </button>
          </div>
          <p
            style={{
              fontSize: "0.85rem",
              color: "var(--danger)",
              marginTop: 10,
              fontWeight: 500,
            }}
          >
            *PENTING: Di jendela Print, cukup atur Layout ke <strong>Landscape</strong>. Scale
            biarkan <strong>Default</strong>, dan Margins: <strong>Default/None</strong>. Sistem
            sudah menyesuaikan ukurannya secara otomatis.
            {pages.length > 1 && (
              <>
                {" "}
                Total {selected.length} label dibagi otomatis menjadi {pages.length} halaman (maks 4
                label per halaman).
              </>
            )}
          </p>
        </div>

        <div
          className="no-print"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 50,
            marginBottom: "2rem",
            width: "100%",
          }}
        >
          <img
            src={LOGO_HK_BHIRAWA}
            alt="HK Bhirawa"
            style={{ height: 50, objectFit: "contain" }}
          />
          <img src={LOGO_NAS} alt="Logo NAS" style={{ height: 50, objectFit: "contain" }} />
        </div>

        {targetIds.length === 0 && (
          <p style={{ color: "red", padding: 20 }}>Tidak ada Ordner yang dipilih untuk dicetak.</p>
        )}

        {pages.map((group, pageIndex) => (
          <div className="print-page" key={pageIndex}>
            <div className="print-grid">
              {group.map((ordner) => (
                <LabelCard key={ordner.id} ordner={ordner} config={config} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LabelCard({ ordner, config }: { ordner: Ordner; config: LabelTemplate }) {
  const warna = ordner.warna_jenis || "#FF8C00";
  return (
    <div
      className="label-wrapper"
      style={
        {
          "--label-width": `${config.widthMM}mm`,
          "--label-height": `${config.heightMM}mm`,
          "--label-mt": `${config.marginTopMM}mm`,
          "--label-ml": `${config.marginLeftMM}mm`,
        } as React.CSSProperties
      }
    >
      <div className="label-outline-inner">
        <div className="label-header">
          <img src={LOGO_HK_BHIRAWA} alt="PT Bhirawa Steel" className="label-logo" />
        </div>

        <div className="label-body">
          <div className="editable label-no-urut" contentEditable suppressContentEditableWarning>
            {ordner.no_urut ?? "-"}
          </div>
          <div
            className="editable label-jenis"
            contentEditable
            suppressContentEditableWarning
            style={{ color: warna }}
          >
            {(ordner.jenis || "-").toUpperCase()}
          </div>
          <div
            className="editable label-singkatan"
            contentEditable
            suppressContentEditableWarning
            style={{ color: warna }}
          >
            {ordner.singkatan ? `(${ordner.singkatan.toUpperCase()})` : ""}
          </div>
          <div className="editable label-tahun" contentEditable suppressContentEditableWarning>
            {ordner.tahun || "-"}
          </div>
        </div>

        <div className="label-footer">
          <div className="no-doc-title">No. Dokumen :</div>
          <div
            className="editable label-no-awal no-doc-value"
            contentEditable
            suppressContentEditableWarning
          >
            {ordner.nomor_awal || "..."}
          </div>
          <div className="no-doc-divider">sampai dengan</div>
          <div
            className="editable label-no-akhir no-doc-value"
            contentEditable
            suppressContentEditableWarning
          >
            {ordner.nomor_akhir || "..."}
          </div>
        </div>
      </div>
    </div>
  );
}