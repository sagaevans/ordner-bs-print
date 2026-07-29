import { supabase } from "@/integrations/supabase/client";

export const STATUS_SUDAH = "Sudah Print";
export const STATUS_BELUM = "Belum Print";

export type DokumenItem = { nomor?: string; tanggal?: string; uraian?: string };

export type Ordner = {
  id: string;
  kode: string;
  no_urut: number;
  jenis: string;
  singkatan: string;
  warna_jenis: string;
  tahun: number;
  nomor_awal: string;
  nomor_akhir: string;
  jumlah: number;
  status: string;
  keterangan: string;
  dokumen: DokumenItem[];
  created_at: string;
  updated_at: string;
};

export async function fetchOrdner(): Promise<Ordner[]> {
  const { data, error } = await supabase
    .from("ordner")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as Ordner[];
}

export async function fetchOrdnerById(id: string): Promise<Ordner | null> {
  const { data, error } = await supabase.from("ordner").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return (data as unknown as Ordner) ?? null;
}

export function formatDate(value?: string) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
}