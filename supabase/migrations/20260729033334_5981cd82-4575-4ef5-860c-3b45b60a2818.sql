CREATE TYPE public.app_role AS ENUM ('owner','admin');
CREATE TYPE public.profile_status AS ENUM ('pending','approved','rejected');

CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role public.app_role NOT NULL DEFAULT 'admin',
  status public.profile_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.ordner (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  kode TEXT NOT NULL,
  no_urut INTEGER NOT NULL DEFAULT 1,
  jenis TEXT NOT NULL DEFAULT '',
  singkatan TEXT NOT NULL DEFAULT '',
  warna_jenis TEXT NOT NULL DEFAULT '#FF8C00',
  tahun INTEGER NOT NULL DEFAULT 2026,
  nomor_awal TEXT NOT NULL DEFAULT '',
  nomor_akhir TEXT NOT NULL DEFAULT '',
  jumlah INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Belum Print',
  keterangan TEXT NOT NULL DEFAULT '',
  dokumen JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.ordner TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ordner TO authenticated;
GRANT ALL ON public.ordner TO service_role;
ALTER TABLE public.ordner ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_approved(_user_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = _user_id AND status = 'approved');
$$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = _user_id AND role = _role);
$$;

CREATE POLICY "Ordner readable by everyone" ON public.ordner FOR SELECT USING (true);
CREATE POLICY "Approved users can insert ordner" ON public.ordner FOR INSERT TO authenticated WITH CHECK (public.is_approved(auth.uid()));
CREATE POLICY "Approved users can update ordner" ON public.ordner FOR UPDATE TO authenticated USING (public.is_approved(auth.uid())) WITH CHECK (public.is_approved(auth.uid()));
CREATE POLICY "Approved users can delete ordner" ON public.ordner FOR DELETE TO authenticated USING (public.is_approved(auth.uid()));

CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "Owner can read all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'owner'));
CREATE POLICY "Owner can update profiles" ON public.profiles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'owner')) WITH CHECK (public.has_role(auth.uid(), 'owner'));

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, status)
  VALUES (
    NEW.id,
    NEW.email,
    CASE WHEN lower(NEW.email) = 'nasotp1@gmail.com' THEN 'owner'::public.app_role ELSE 'admin'::public.app_role END,
    CASE WHEN lower(NEW.email) = 'nasotp1@gmail.com' THEN 'approved'::public.profile_status ELSE 'pending'::public.profile_status END
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER ordner_updated_at BEFORE UPDATE ON public.ordner FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.ordner (kode, no_urut, jenis, singkatan, warna_jenis, tahun, nomor_awal, nomor_akhir, jumlah, status, keterangan) VALUES
('BBK 01', 1, 'BUKTI BANK KELUAR', 'BBK', '#ff8c00', 2026, '15-000', '15-023', 24, 'Belum Print', ''),
('BBK 02', 2, 'BUKTI BANK KELUAR', 'BBK', '#ff8c00', 2026, '15-024', '15-043', 22, 'Sudah Print', ''),
('BBK 03', 3, 'BUKTI BANK KELUAR', 'BBK', '#ff8c00', 2026, '15-044', '15-062', 18, 'Sudah Print', ''),
('BBK 04', 4, 'BUKTI BANK KELUAR', 'BBK', '#ff8c00', 2026, '15-062', '15-080', 19, 'Sudah Print', ''),
('BBK 05', 5, 'BUKTI BANK KELUAR', 'BBK', '#ff8c00', 2026, '15-081', '15-100', 20, 'Sudah Print', ''),
('MEMO', 1, 'JURNAL MEMORIAL', 'ZM', '#1605ff', 2026, '.', '.', 0, 'Sudah Print', ''),
('KPI 2025', 1, 'FORM PENILAIAN KINERJA', 'KPI', '#00ff4c', 2025, '2025', '2026', 0, 'Sudah Print', ''),
('BA 2026', 6, 'BERITA ACARA', 'BA', '#e1ff00', 2026, 'JUNI', 'JULI', 0, 'Sudah Print', '');