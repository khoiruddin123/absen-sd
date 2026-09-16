# Apsen SD

Aplikasi presensi santri berbasis web untuk mengelola sesi presensi, scan QR code, validasi petugas, rekap kehadiran, serta riwayat siswa dan sesi. Project ini dibangun dengan Next.js dan MySQL.

## Fitur Utama

- Manajemen data santri
- Import data santri dari Excel/CSV
- Pembukaan sesi presensi per tanggal dan jenis sesi
- Scan QR Code santri untuk presensi
- Validasi petugas presensi dengan NIS
- Pengaturan waktu sesi (scan start, batas tepat waktu, selesai)
- Rekap kehadiran per periode
- Detail presensi per santri dan sesi
- Riwayat perubahan kelas santri
- Dashboard ringkasan presensi

## Tech Stack

- Next.js 16+ (App Router)
- React 19
- TypeScript
- MySQL (mysql2)
- Tailwind CSS
- SWR
- html5-qrcode
- xlsx

## Struktur Project

```bash
.
├── app/                  # Route dan halaman aplikasi Next.js
├── components/           # Komponen UI frontend
├── database/             # Skema Database (MySQL)
├── lib/                  # Service, helper, autentikasi, dan koneksi database MySQL
├── public/               # Asset publik
├── types/                # Type definitions
├── .env.example          # Contoh environment variables
├── next.config.ts
├── package.json
├── tsconfig.json
└── README.md
```

## Prasyarat

Pastikan perangkat Anda sudah memiliki:

- Node.js 20+
- npm
- MySQL Server (misalnya via XAMPP)
- Browser modern

## Instalasi

```bash
npm install
```

## Konfigurasi Environment & Database

1. Buat database di MySQL (misalnya via phpMyAdmin) dengan nama **`apsensd`**.
2. Import file `database/schema.sql` ke dalam database `apsensd` tersebut.
3. Buat file `.env` di root project dengan menyalin dari `.env.example`, lalu isi konfigurasi berikut:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=apsensd

AUTH_SECRET=generate_random_secret_here
ADMIN_USERNAME=admin
ADMIN_PASSWORD=password_anda
```

## Menjalankan Aplikasi

### Development

```bash
npm run dev
```

Aplikasi akan berjalan di:

```bash
http://localhost:3000
```

## Login Admin

Setelah aplikasi berjalan, login menggunakan username dan password yang sudah Anda set pada variabel environment (`.env`):

- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`

## Catatan Penting

- Semua akses database dilakukan melalui backend secara langsung menggunakan `mysql2`.
- Browser tidak langsung mengakses data sensitif.

## Lisensi

Project ini dibuat untuk kebutuhan internal.
