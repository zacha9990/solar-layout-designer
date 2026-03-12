# Interactive Solar Layout Designer – WordPress Plugin

Total Nilai Proyek: **$1,600**

Dibagi menjadi 3 Tahap Pengembangan.

Setiap tahap memiliki objective yang bisa dicek langsung oleh klien sebelum lanjut ke tahap berikutnya.

Struktur pembayaran per tahap:

- **20% Down Payment (mulai pengerjaan)**
- **40% Progress 50% (tahap tengah, bisa diuji)**
- **40% Final (setelah selesai & disetujui)**

---

# 🟢 TAHAP 1 – Sistem Dasar Panel Manual + Kalkulasi Energi

**Total: $800**

## 🎯 Objective

Setelah tahap ini selesai:

- User bisa menambahkan panel secara manual.
- Panel bisa digeser (drag).
- Panel bisa dihapus.
- Jumlah panel terupdate otomatis.
- Estimasi produksi energi (kWh/tahun & bulanan) tampil otomatis.
- Estimasi penghematan tahunan tampil otomatis.
- Harga listrik bisa diubah.
- Semua berjalan stabil di dalam WordPress (via shortcode plugin).

Tahap ini sudah menghasilkan tool estimasi yang bisa dipakai.

---

## 🔧 Lingkup Pengerjaan

### 1. Struktur Plugin WordPress

- Enqueue script & style dengan benar
- Integrasi API key
- Shortcode tetap berjalan
- Struktur JS modular (tidak campur aduk)

### 2. Sistem Panel Interaktif (Core)

- Class SolarPanel (object-based)
- PanelManager untuk mengelola state
- Add panel
- Drag panel
- Delete panel
- Perhitungan jumlah panel real-time

### 3. Engine Kalkulasi Energi

- Modul perhitungan terpisah
- Estimasi kWh per tahun
- Estimasi rata-rata bulanan
- Estimasi penghematan tahunan
- Input harga listrik editable
- Update otomatis saat jumlah panel berubah

---

## 💳 Struktur Pembayaran Tahap 1 ($800)

- **20% ($160)** → Mulai pengerjaan (setup arsitektur & fondasi sistem)
- **40% ($320)** → Saat fitur add, drag, delete panel sudah bisa diuji
- **40% ($320)** → Setelah kalkulasi energi & savings berjalan stabil dan disetujui

---

# 🟡 TAHAP 2 – Fitur Interaksi Lanjutan

**Total: $450**

## 🎯 Objective (Yang Bisa Dicek Klien)

Setelah tahap ini selesai:

- Panel bisa diputar (rotate) dengan handle.
- Panel bisa diduplikasi.
- Panel yang dipilih akan terlihat aktif (highlight).

Tool sudah terasa seperti mini layout designer profesional.

---

## 🔧 Lingkup Pengerjaan

- Sistem rotation dengan perhitungan geometri (cos/sin transform)
- Rotation handle UI
- Fitur duplicate panel
- Sistem selection state
- Optimasi event listener
- Optimasi performa interaksi

---

## 💳 Struktur Pembayaran Tahap 2 ($450)

- **20% ($90)** → Mulai implementasi rotation & selection system
- **40% ($180)** → Rotation & selection sudah bisa diuji
- **40% ($180)** → Duplicate + performa stabil dan disetujui

---

# 🔵 TAHAP 3 – Optimasi & Production Polish

**Total: $350**

## 🎯 Objective (Yang Bisa Dicek Klien)

Setelah tahap ini selesai:

- Sistem stabil dan siap digunakan secara production.
- Reset behaviour rapi.
- Mobile responsive lebih optimal.
- Tidak ada error di console.
- Performa tetap stabil saat banyak panel.

---

## 🔧 Lingkup Pengerjaan

- Optimasi performa lanjutan
- Edge case handling
- Perbaikan reset logic
- UI refinement
- Perbaikan interaksi mobile
- Code cleanup & refactoring
- Final testing

---

## 💳 Struktur Pembayaran Tahap 3 ($350)

- **20% ($70)** → Mulai tahap optimasi & refactor
- **40% ($140)** → Reset & mobile sudah bisa diuji
- **40% ($140)** → Final testing selesai dan disetujui

---

# 🟣 TAHAP 4 – UI Redesign + Mobile Floating Panel

**Total: Included in Phase 3 scope**

## 🎯 Objective

Setelah tahap ini selesai:

- UI tampil modern, bersih, dan konsisten (design tokens, card-based stats).
- Di mobile, semua kontrol (Add Panel, Duplicate, Reset, search, toggle peta, statistik) ada di floating panel yang melekat di bawah layar.
- D-pad muncul saat panel dipilih — user bisa geser panel pakai jempol tanpa kesulitan drag.
- Peta lebih besar di mobile (82% tinggi viewport).

---

## 🔧 Lingkup Pengerjaan

- CSS redesign: design tokens, card stats, ghost buttons, toggle switch
- Responsive breakpoint 1024px / 768px / 480px
- Floating panel `position: fixed; bottom: 0` di mobile
- D-pad (directional pad) 4 arah dengan hold-to-repeat 80ms
- Mirror stats ke floating panel
- JS-controlled map height (window.innerHeight × 0.82) bypass CSS conflict
- **v1.7.0 — Mobile UX Polish:**
  - Topbar sticky (`position: sticky; top: 0`) agar stats tidak hilang saat scroll
  - Collapsible topbar (▼/▶) untuk memaksimalkan area peta
  - Hint penggunaan ditampilkan di topbar
  - Contextual row: tombol Delete (✕), Rotate CCW (⟲), Rotate CW (⟳) muncul saat panel dipilih
  - Toast notification saat panel ditambah/dihapus
  - Tombol rotate mobile: `rotateSelectedPanel(±15°)` per tap

---

# 🔵 TAHAP 5 – Google Solar API: Radiasi Atap & Orientasi

**Total: $2,300**

## 🎯 Objective

Setelah tahap ini selesai:

- User bisa melihat **overlay warna di peta** yang menunjukkan bagian atap mana yang mendapat sinar matahari paling banyak sebelum menaruh panel (hijau = optimal, oranye = hindari).
- Kalkulasi kWh per panel menjadi **akurat berdasarkan orientasi atap** — atap menghadap selatan menghasilkan lebih banyak listrik daripada yang menghadap utara.
- Google Solar API mendeteksi segmen atap secara otomatis dari data satelit.
- Tabel analisis atap menampilkan ringkasan per segmen (arah, sudut, luas, kWh/tahun).

Referensi teknis lengkap: lihat `PHASE5_PLAN.md`

---

## 🔧 Lingkup Pengerjaan

- Integrasi endpoint `buildingInsights` Google Solar API
- Overlay warna per segmen atap di atas Google Maps (polygon semi-transparan)
- Pixel-level flux heatmap dari endpoint `dataLayers` (opsional, detail lebih tinggi)
- Tooltip saat klik segmen: arah hadap, kemiringan, luas, estimasi kWh/tahun
- Kalkulasi energi berbasis segmen (gantikan nilai flat 400 kWh/panel)
- Fallback: Solar API → PVGIS → nilai admin
- Tabel analisis atap (desktop collapsible, mobile card row)
- Setting baru: `sld_google_solar_api_key`

---

## 💳 Struktur Pembayaran Tahap 5

**Core: $1,600**
- **20% ($320)** → Mulai pengerjaan (SolarApiManager + settings + fetch data)
- **40% ($640)** → Overlay segmen warna + tooltip + kalkulasi berbasis segmen sudah bisa diuji
- **40% ($640)** → Tabel analisis atap + testing selesai dan disetujui

**Add-on Heatmap Pixel-level: +$500** *(opsional, disepakati terpisah)*

---

# 💡 TAHAP 6 (PROPOSAL) – Design Persistence & Export

**Estimasi: $2,700**

Simpan & muat desain panel, ekspor PDF profesional, ekspor CSV.
Referensi lengkap: lihat `PHASE6_PROPOSAL.md`

---

# Ringkasan Total

| Tahap | Biaya | Status |
| --- | --- | --- |
| Tahap 1 | $800 | ✅ Selesai |
| Tahap 2 | $450 | ✅ Selesai |
| Tahap 3 | $350 | ✅ Selesai |
| Tahap 4 | — | ✅ Selesai |
| Tahap 5 | $1,600 (+$500 add-on) | 🔜 Berikutnya |
| Tahap 6 | $2,700 | 💡 Proposal |
| **Total (1–3)** | **$1,600** | |

---

# Catatan Penting

- Setiap tahap harus disetujui sebelum lanjut ke tahap berikutnya.
- Revisi minor termasuk dalam tahap masing-masing.
- Perubahan fitur di luar scope akan dihitung sebagai pengembangan tambahan.