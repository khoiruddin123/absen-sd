"use client";

import useSWR from "swr";
import { useEffect, useState } from "react";
import { Card, Field, Input, Button } from "@/components/ui/Basics";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/States";
import { useToast } from "@/components/ui/Toast";
import { formatDateIndonesian } from "@/lib/timezone";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function todayWIBString() {
  const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" });
  return fmt.format(new Date());
}

export function SessionsContent() {
  const { showToast } = useToast();
  const { data: ref, isLoading: refLoading } = useSWR("/api/reference", fetcher);
  const { data: sessionsData, isLoading: sessionsLoading, mutate } = useSWR(
    "/api/sessions",
    fetcher
  );

  const [date, setDate] = useState(todayWIBString());
  const [sessionType, setSessionType] = useState("");
  const [scanStart, setScanStart] = useState("");
  const [onTimeUntil, setOnTimeUntil] = useState("");
  const [endTime, setEndTime] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (ref?.groups && ref.groups.length > 0 && !selectedGroupId) {
      setSelectedGroupId(ref.groups[0].id);
    }
  }, [ref, selectedGroupId]);

  async function handleCreateSession() {
    setFormError(null);
    if (!sessionType.trim()) {
      setFormError("Nama mata pelajaran wajib diisi.");
      return;
    }
    if (!scanStart || !onTimeUntil || !endTime) {
      setFormError("Waktu mulai scan, batas tepat waktu, dan waktu selesai wajib diisi.");
      return;
    }
    if (!selectedGroupId) {
      setFormError("Pilih kelas terlebih dahulu.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionDate: date,
          sessionType: sessionType.trim(),
          scanStartTime: scanStart,
          onTimeUntil,
          endTime,
          groupIds: [selectedGroupId],
        }),
      });
      const result = await res.json();
      if (!result.ok) {
        setFormError(result.message ?? "Gagal membuka sesi.");
        return;
      }
      showToast("Sesi presensi pelajaran berhasil dibuka.");
      setSessionType("");
      mutate();
    } catch {
      setFormError("Gagal terhubung ke server. Periksa koneksi internet dan coba lagi.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleGroup(sessionId: string, groupId: string, action: "close" | "reopen") {
    try {
      const res = await fetch(`/api/sessions/${sessionId}/groups`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId, action }),
      });
      const result = await res.json();
      if (!result.ok) {
        showToast(result.message ?? "Gagal memperbarui kelompok.", "error");
        return;
      }
      showToast(action === "close" ? "Kelompok ditutup lebih awal." : "Kelompok dibuka kembali.");
      mutate();
    } catch {
      showToast("Gagal terhubung ke server.", "error");
    }
  }

  async function handleDeleteSession(sessionId: string) {
    const confirmed = window.confirm("Hapus riwayat sesi ini? Data presensi yang terkait akan ikut terhapus dari rekap dan detail presensi.");
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/sessions/${sessionId}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (!result.ok) {
        showToast(result.message ?? "Gagal menghapus riwayat sesi.", "error");
        return;
      }
      showToast("Riwayat sesi berhasil dihapus.");
      mutate();
    } catch {
      showToast("Gagal terhubung ke server.", "error");
    }
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div>
        <p className="text-sm font-semibold text-ppm-gold-dark">Presensi</p>
        <h1 className="font-display text-2xl font-extrabold text-gray-800">Buka Sesi Presensi Pelajaran</h1>
      </div>

      <Card className="p-5">
        {refLoading ? (
          <LoadingState />
        ) : (
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <Field label="Tanggal">
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </Field>
              <Field label="Jadwal Mata Pelajaran">
                <Input
                  placeholder="Ketik Mapel (contoh: Matematika)"
                  value={sessionType}
                  onChange={(e) => setSessionType(e.target.value)}
                />
              </Field>
              <Field label="Mulai Scan">
                <Input type="time" value={scanStart} onChange={(e) => setScanStart(e.target.value)} />
              </Field>
              <Field label="Batas Tepat Waktu">
                <Input
                  type="time"
                  value={onTimeUntil}
                  onChange={(e) => setOnTimeUntil(e.target.value)}
                />
              </Field>
              <Field label="Selesai">
                <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
              </Field>
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold text-ppm-gold-dark">
                Pilih Kelas Pelajaran
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                {(ref?.groups ?? []).map((g: any) => {
                  const isSelected = selectedGroupId === g.id;
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setSelectedGroupId(g.id)}
                      className={`relative flex items-center justify-center rounded-xl border py-3 px-4 text-sm font-bold transition-all ${
                        isSelected
                          ? "border-sky-600 bg-sky-50 text-sky-800 shadow-sm ring-2 ring-sky-500/20"
                          : "border-gray-200 bg-white text-gray-700 hover:border-sky-300 hover:bg-sky-50/50"
                      }`}
                    >
                      {g.name}
                      {isSelected && (
                        <span className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-sky-600 text-[10px] text-white">
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {formError && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">
                {formError}
              </p>
            )}

            <div>
              <Button onClick={handleCreateSession} disabled={submitting}>
                {submitting ? "Membuka Sesi..." : "Buka Sesi"}
              </Button>
            </div>
          </div>
        )}
      </Card>

      <div>
        <h2 className="mb-3 font-display text-lg font-bold text-gray-700">Riwayat Sesi</h2>
        {sessionsLoading && <LoadingState />}
        {sessionsData && !sessionsData.ok && (
          <ErrorState message="Gagal memuat riwayat sesi." />
        )}
        {sessionsData?.ok && sessionsData.sessions.length === 0 && (
          <EmptyState title="Belum ada sesi yang dibuka" />
        )}
        <div className="flex flex-col gap-3">
          {(sessionsData?.sessions ?? []).map((s: any) => (
            <Card key={s.id} className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-gray-800">
                    {formatDateIndonesian(s.session_date)} &middot; {s.session_type}
                  </p>
                  <p className="text-xs text-gray-500">
                    Scan {s.scan_start_time?.slice(0, 5)} &bull; Tepat waktu s/d{" "}
                    {s.on_time_until?.slice(0, 5)} &bull; Selesai {s.end_time?.slice(0, 5)}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                  {(s.session_groups ?? []).map((sg: any) => (
                    <div
                      key={sg.id}
                      className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold ${
                        sg.closed_manually
                          ? "border-red-200 bg-red-50 text-red-600"
                          : "border-ppm-border bg-ppm-cream text-gray-600"
                      }`}
                    >
                      {sg.groups?.name}
                      {sg.finalized && (
                        <span className="rounded bg-gray-200 px-1.5 py-0.5 text-[10px] text-gray-600">
                          selesai
                        </span>
                      )}
                      {!sg.finalized && (
                        <button
                          onClick={() =>
                            handleToggleGroup(
                              s.id,
                              sg.groups?.id,
                              sg.closed_manually ? "reopen" : "close"
                            )
                          }
                          className="ml-1 underline decoration-dotted"
                        >
                          {sg.closed_manually ? "Buka lagi" : "Tutup"}
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleDeleteSession(s.id)}
                  className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100"
                >
                  Hapus
                </button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
