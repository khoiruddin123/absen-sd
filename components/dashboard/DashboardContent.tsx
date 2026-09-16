"use client";

import useSWR from "swr";
import { Card } from "@/components/ui/Basics";
import { LoadingState, ErrorState } from "@/components/ui/States";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const STAT_LABELS: Array<{ key: "hadir" | "terlambat" | "izin" | "sakit" | "alpa"; label: string; color: string }> = [
  { key: "hadir", label: "Hadir", color: "text-[var(--status-hadir)]" },
  { key: "terlambat", label: "Terlambat", color: "text-[var(--status-terlambat)]" },
  { key: "izin", label: "Izin", color: "text-[var(--status-izin)]" },
  { key: "sakit", label: "Sakit", color: "text-[var(--status-sakit)]" },
  { key: "alpa", label: "Alpa", color: "text-[var(--status-alpa)]" },
];

export function DashboardContent() {
  const { data, error, isLoading } = useSWR("/api/dashboard/stats", fetcher, {
    refreshInterval: 30000,
  });

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div>
        <p className="text-sm font-semibold text-ppm-gold-dark">Beranda</p>
        <h1 className="font-display text-2xl font-extrabold text-gray-800">
          Dashboard Presensi Siswa SD
        </h1>
      </div>

      {isLoading && <LoadingState />}
      {error && <ErrorState message="Gagal memuat statistik. Periksa koneksi internet dan coba lagi." />}

      {data && data.ok && (
        <>
          <Card className="border-l-4 border-sky-600 bg-gradient-to-r from-sky-50 to-white p-5 shadow-sm">
            <h2 className="font-display text-lg font-bold text-gray-800">
              Selamat Datang di Sistem Absensi SD
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              {data.activeSessionLabel ? (
                <span className="font-semibold text-sky-700">
                  🔔 {data.activeSessionLabel}
                </span>
              ) : (
                "Status: Belum ada sesi presensi mata pelajaran yang aktif saat ini."
              )}
            </p>
          </Card>

          <div>
            <h2 className="mb-3 font-display text-lg font-bold text-gray-700">
              Statistik Kehadiran Hari Ini
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {STAT_LABELS.map((s) => (
                <Card key={s.key} className="flex flex-col items-center gap-1 p-5 shadow-sm transition hover:shadow-md">
                  <p className={`font-display text-3xl font-extrabold ${s.color}`}>
                    {data.stats[s.key]}
                  </p>
                  <p className="text-sm font-semibold text-gray-600">{s.label}</p>
                </Card>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
