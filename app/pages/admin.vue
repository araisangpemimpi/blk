<script setup lang="ts">
definePageMeta({ layout: false })

const TOKEN_KEY = 'blk-admin-token'
const token = ref<string | null>(null)
const password = ref('')
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const ok = ref('')
const tab = ref<'situs' | 'hero' | 'program' | 'galeri' | 'konten' | 'tema'>('situs')
const customized = ref(false)
const updatedAt = ref<string | null>(null)

const form = ref<any>({})
const toast = useToast()

if (import.meta.client) {
  token.value = localStorage.getItem(TOKEN_KEY)
}

function authHeaders() {
  return { Authorization: `Bearer ${token.value ?? ''}` }
}

async function doLogin() {
  loading.value = true
  error.value = ''
  try {
    const res: any = await $fetch('/api/admin/login', { method: 'POST', body: { password: password.value } })
    token.value = res.token
    if (import.meta.client)
      localStorage.setItem(TOKEN_KEY, res.token)
    password.value = ''
    await loadData()
  }
  catch (e: any) {
    error.value = e?.data?.message || 'Login gagal — periksa password lalu coba lagi.'
    toast.add({ title: 'Login gagal', description: error.value, color: 'error', icon: 'i-lucide-alert-circle' })
  }
  finally {
    loading.value = false
  }
}

function logout() {
  token.value = null
  form.value = {}
  if (import.meta.client)
    localStorage.removeItem(TOKEN_KEY)
}

async function loadData() {
  if (!token.value)
    return
  loading.value = true
  error.value = ''
  ok.value = ''
  try {
    const res: any = await $fetch('/api/admin/landing', { headers: authHeaders() })
    const d = JSON.parse(JSON.stringify(res.data))
    // Normalisasi agar enak diketik di form
    d.gallery ||= { title_overline: 'Galeri Kegiatan', title: '', subtitle: '', items: [] }
    d.gallery.items ||= []
    d.marquee = Array.isArray(d.marquee) ? d.marquee : []
    d.programs ||= { title: '', subtitle: '', items: [] }
    d.programs.items ||= []
    d.theme = { palette: 'emerald', default_mode: 'system', show_switch: true, ...(d.theme || {}) }
    for (const p of d.programs.items) {
      if (Array.isArray(p.skills))
        p.skills = p.skills.join(', ')
      if (typeof p.active !== 'boolean')
        p.active = p.active !== false
    }
    if (Array.isArray(d.site?.badges))
      d.site.badges = d.site.badges.join(', ')
    form.value = d
    customized.value = !!res.customized
    updatedAt.value = res.updatedAt
  }
  catch (e: any) {
    if (e?.statusCode === 401) {
      logout()
      error.value = 'Sesi habis — silakan login ulang.'
    }
    else {
      error.value = e?.data?.message || 'Gagal memuat data.'
    }
  }
  finally {
    loading.value = false
  }
}

async function save() {
  saving.value = true
  error.value = ''
  ok.value = ''
  try {
    for (const p of (form.value.programs?.items ?? [])) {
      if (typeof p.skills === 'string')
        p.skills = (p.skills as string).split(',').map((s: string) => s.trim()).filter(Boolean)
      if (typeof p.proglat_url !== 'string')
        p.proglat_url = ''
      if (typeof p.active !== 'boolean')
        p.active = p.active !== false
    }
    if (typeof form.value.site?.badges === 'string')
      form.value.site.badges = (form.value.site.badges as string).split(',').map((s: string) => s.trim()).filter(Boolean)
    if (typeof form.value.marquee === 'string')
      form.value.marquee = (form.value.marquee as string).split('\n').map((s: string) => s.trim()).filter(Boolean)
    const res: any = await $fetch('/api/admin/landing', { method: 'PUT', headers: authHeaders(), body: form.value })
    ok.value = `Tersimpan! Buka halaman utama untuk melihat hasilnya.${res.updatedAt ? ' • ' + new Date(res.updatedAt).toLocaleString('id-ID') : ''}`
    customized.value = true
    // sinkronkan tampilan form dengan yang tersimpan
    await loadData()
    ok.value = 'Tersimpan! Buka halaman utama untuk melihat hasilnya.'
    toast.add({ title: 'Perubahan tersimpan', description: 'Buka halaman utama untuk melihat hasilnya.', color: 'success', icon: 'i-lucide-check-circle-2' })
  }
  catch (e: any) {
    error.value = e?.data?.message || 'Gagal menyimpan — coba lagi.'
    toast.add({ title: 'Gagal menyimpan', description: error.value, color: 'error', icon: 'i-lucide-alert-circle' })
  }
  finally {
    saving.value = false
  }
}

async function resetAll() {
  if (!confirm('Hapus semua perubahan dan kembali ke bawaan (content/landing.yml)?'))
    return
  try {
    await $fetch('/api/admin/reset', { method: 'POST', headers: authHeaders() })
    await loadData()
    ok.value = 'Sudah kembali ke bawaan.'
    toast.add({ title: 'Dikembalikan ke bawaan', description: 'Semua kustomisasi dihapus.', color: 'success', icon: 'i-lucide-rotate-ccw' })
  }
  catch (e: any) {
    error.value = e?.data?.message || 'Gagal reset.'
    toast.add({ title: 'Gagal reset', description: error.value, color: 'error', icon: 'i-lucide-alert-circle' })
  }
}

function addProgram() {
  form.value.programs.items.push({ icon: 'i-lucide-sparkles', name: 'Program Baru', tag: 'Belum Dibuka', active: false, duration: '', schedule: 'Senin – Jumat • 08.00 – 15.00', quota: 'Kuota 16 orang', level: '', desc: '', skills: '', proglat_url: '' })
}
function delProgram(i: number) {
  if (!confirm(`Hapus "${form.value.programs.items[i]?.name}" dari landing page?`))
    return
  form.value.programs.items.splice(i, 1)
}
function addGallery() {
  form.value.gallery.items.push({ src: '', title: 'Foto baru', desc: '' })
}
function delGallery(i: number) {
  form.value.gallery.items.splice(i, 1)
}
function addMarquee() {
  if (!Array.isArray(form.value.marquee))
    form.value.marquee = []
  form.value.marquee.push('')
}
function delMarquee(i: number) {
  form.value.marquee.splice(i, 1)
}

async function uploadGalleryPhoto(i: number, ev: Event) {
  const input = ev.target as HTMLInputElement
  const file = input?.files?.[0]
  if (!file)
    return
  error.value = ''
  try {
    const fd = new FormData()
    fd.append('file', file)
    const res: any = await $fetch('/api/admin/upload', { method: 'POST', headers: authHeaders(), body: fd })
    form.value.gallery.items[i].src = res.url
    ok.value = `Foto terupload. Jangan lupa klik “Simpan Perubahan”.`
    toast.add({ title: 'Foto terupload', description: 'Jangan lupa klik “Simpan Perubahan”.', color: 'success', icon: 'i-lucide-image-check' })
  }
  catch (e: any) {
    error.value = e?.data?.message || 'Upload gagal — maksimal 4MB (jpg/png/webp).'
    toast.add({ title: 'Upload gagal', description: error.value, color: 'error', icon: 'i-lucide-alert-circle' })
  }
  finally {
    input.value = ''
  }
}

const tabs = [
  { id: 'situs', label: 'Kontak & Alamat', desc: 'Nomor WA, telepon, alamat, jam buka', icon: 'i-lucide-phone' },
  { id: 'hero', label: 'Tampilan Atas', desc: 'Judul besar & tombol utama', icon: 'i-lucide-megaphone' },
  { id: 'program', label: 'Program', desc: 'Buka/tutup pendaftaran tiap kelas', icon: 'i-lucide-layout-grid' },
  { id: 'galeri', label: 'Galeri Foto', desc: 'Foto kegiatan yang tampil di web', icon: 'i-lucide-images' },
  { id: 'tema', label: 'Warna & Mode', desc: 'Palet warna + gelap/terang', icon: 'i-lucide-palette' },
  { id: 'konten', label: 'Teks Lainnya', desc: 'Teks berjalan & kalimat ajakan', icon: 'i-lucide-type' }
] as const

const palettes = [
  { id: 'emerald', label: 'Hijau', hint: 'Warna bawaan', dot: '#047857' },
  { id: 'teal', label: 'Toska', hint: 'Sesuai warna logo', dot: '#0f766e' },
  { id: 'blue', label: 'Biru', hint: '', dot: '#1d4ed8' },
  { id: 'violet', label: 'Ungu', hint: '', dot: '#6d28d9' }
] as const

const displayModes = [
  { id: 'system', label: 'Ikuti HP pengunjung', desc: 'Otomatis gelap/terang mengikuti pengaturan perangkat', icon: 'i-lucide-smartphone' },
  { id: 'light', label: 'Selalu terang', desc: 'Pengunjung baru selalu melihat tampilan terang', icon: 'i-lucide-sun' },
  { id: 'dark', label: 'Selalu gelap', desc: 'Pengunjung baru selalu melihat tampilan gelap', icon: 'i-lucide-moon' }
] as const

const openProgramCount = computed(() => ((form.value.programs?.items ?? []) as any[]).filter(p => p.active !== false).length)
const programCount = computed(() => ((form.value.programs?.items ?? []) as any[]).length)
const galleryCount = computed(() => ((form.value.gallery?.items ?? []) as any[]).length)

watch(token, (t) => {
  if (t && !Object.keys(form.value).length)
    loadData()
}, { immediate: true })

useSeoMeta({ title: 'Admin — BLKK Darul Maarif Bangsal Mojokerto', robots: 'noindex' })
</script>

<template>
  <div class="min-h-screen bg-stone-100 pb-36 text-neutral-900">
    <!-- Header -->
    <header class="sticky top-0 z-40 border-b border-emerald-900 bg-emerald-950 text-white">
      <div class="mx-auto flex h-14 max-w-3xl items-center justify-between gap-2 px-4">
        <a href="/" class="flex min-w-0 items-center gap-2">
          <img src="/logo-blkk.png" alt="Logo BLKK Darul Maarif Bangsal Mojokerto" class="size-7 shrink-0 rounded-md bg-white object-contain" />
          <span class="truncate text-sm font-extrabold">Admin BLKK Bangsal Mojokerto</span>
        </a>
        <div class="flex shrink-0 items-center gap-1.5">
          <UButton to="/" target="_blank" size="xs" icon="i-lucide-eye" class="rounded-full bg-white font-bold text-emerald-950">Lihat Web</UButton>
          <UButton v-if="token" variant="ghost" size="xs" icon="i-lucide-log-out" class="text-white" @click="logout">Keluar</UButton>
        </div>
      </div>
    </header>

    <main class="mx-auto max-w-3xl px-4 pt-5">
      <!-- LOGIN -->
      <div v-if="!token" class="space-y-4">
        <div class="overflow-hidden rounded-3xl bg-emerald-950 p-6 text-white">
          <p class="text-lg font-extrabold leading-snug">Ubah isi website tanpa perlu bisa ngoding.</p>
          <p class="mt-1.5 text-sm leading-relaxed text-emerald-100/90">Masuk, ubah tulisan/foto lewat formulir, lalu tekan Simpan — perubahan langsung tampil di halaman utama.</p>
          <ol class="mt-4 space-y-2 text-sm font-semibold">
            <li class="flex items-center gap-2.5"><span class="flex size-6 shrink-0 items-center justify-center rounded-full bg-amber-300 text-xs font-extrabold text-emerald-950">1</span> Masukkan password admin</li>
            <li class="flex items-center gap-2.5"><span class="flex size-6 shrink-0 items-center justify-center rounded-full bg-amber-300 text-xs font-extrabold text-emerald-950">2</span> Ubah tulisan & foto per bagian</li>
            <li class="flex items-center gap-2.5"><span class="flex size-6 shrink-0 items-center justify-center rounded-full bg-amber-300 text-xs font-extrabold text-emerald-950">3</span> Tekan “Simpan Perubahan”</li>
          </ol>
        </div>
        <div class="rounded-3xl bg-white p-5 ring-1 ring-neutral-200">
          <p class="text-base font-extrabold">Masuk Admin</p>
          <div class="mt-4 space-y-3">
            <label class="fld">
              <span class="fld-label">Password admin</span>
              <input v-model="password" type="password" placeholder="Ketik password admin…" class="fld-input" @keyup.enter="doLogin" />
            </label>
            <UButton :loading="loading" block color="primary" icon="i-lucide-log-in" class="rounded-2xl py-3 font-extrabold" @click="doLogin">Masuk</UButton>
            <p class="text-center text-xs text-neutral-400">Password bawaan: <code class="font-bold">admin123</code> (bisa diganti di file .env)</p>
            <p v-if="error" class="rounded-2xl bg-red-50 p-3.5 text-sm font-bold text-red-700">{{ error }}</p>
          </div>
        </div>
      </div>

      <!-- EDITOR -->
      <div v-else class="space-y-4">
        <!-- Status -->
        <div class="rounded-3xl bg-emerald-950 p-4 text-white sm:p-5">
          <div class="flex items-center justify-between gap-2">
            <div class="flex min-w-0 items-center gap-2">
              <span :class="['shrink-0 rounded-full px-2.5 py-1 text-[11px] font-extrabold', customized ? 'bg-amber-300 text-emerald-950' : 'bg-white/15 text-white']">
                {{ customized ? 'Sudah diubah manual' : 'Pakai bawaan' }}
              </span>
              <span v-if="updatedAt" class="truncate text-[11px] text-emerald-200">{{ new Date(updatedAt).toLocaleString('id-ID') }}</span>
            </div>
            <UButton size="xs" icon="i-lucide-rotate-ccw" class="shrink-0 rounded-full bg-white/15 font-bold text-white" @click="resetAll">Kembalikan bawaan</UButton>
          </div>
          <div class="mt-3 grid grid-cols-2 gap-2">
            <div class="rounded-2xl bg-white p-3.5 text-neutral-900">
              <p class="text-2xl font-extrabold text-emerald-800">{{ openProgramCount }}/{{ programCount }}</p>
              <p class="text-xs font-bold text-neutral-500">Program dibuka</p>
            </div>
            <div class="rounded-2xl bg-white p-3.5 text-neutral-900">
              <p class="text-2xl font-extrabold text-emerald-800">{{ galleryCount }}</p>
              <p class="text-xs font-bold text-neutral-500">Foto galeri</p>
            </div>
          </div>
        </div>

        <!-- Navigasi bagian -->
        <nav class="grid grid-cols-1 gap-2">
          <button v-for="t in tabs" :key="t.id" :class="['flex items-center gap-3 rounded-2xl border-2 p-3.5 text-left transition', tab === t.id ? 'border-emerald-600 bg-white shadow-sm' : 'border-transparent bg-white/70 active:bg-white']" @click="tab = t.id as any">
            <span :class="['flex size-11 shrink-0 items-center justify-center rounded-xl', tab === t.id ? 'bg-emerald-700 text-white' : 'bg-stone-100 text-neutral-500']">
              <UIcon :name="t.icon" class="size-5" />
            </span>
            <span class="min-w-0 flex-1">
              <span class="flex items-center gap-1.5 text-[15px] font-extrabold">{{ t.label }}
                <UIcon v-if="tab === t.id" name="i-lucide-check-circle-2" class="size-4 shrink-0 text-emerald-600" />
              </span>
              <span class="block truncate text-[13px] text-neutral-500">{{ t.desc }}</span>
            </span>
            <UIcon name="i-lucide-chevron-right" :class="['size-4 shrink-0', tab === t.id ? 'text-emerald-700' : 'text-neutral-300']" />
          </button>
        </nav>

        <p v-if="error" class="rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">{{ error }}</p>
        <p v-if="ok" class="rounded-2xl bg-emerald-600 p-4 text-sm font-bold text-white">{{ ok }}</p>
        <div v-if="loading" class="rounded-3xl bg-white p-10 text-center text-sm text-neutral-500">Memuat data website…</div>

        <!-- 1. KONTAK & ALAMAT -->
        <section v-if="!loading && tab === 'situs'" class="space-y-3">
          <div class="rounded-3xl bg-white p-5 ring-1 ring-neutral-200 sm:p-6">
            <p class="text-base font-extrabold">Nomor yang diklik pengunjung</p>
            <p class="mt-0.5 text-[13px] text-neutral-500">Tombol “Daftar” & “Telepon” di web memakai nomor ini.</p>
            <div class="mt-4 grid gap-4">
              <label class="fld">
                <span class="fld-label">Nomor WA <em class="fld-hint">(diawali 628, tanpa + / spasi)</em></span>
                <input v-model="form.site.wa_number" placeholder="6282245678910" class="fld-input" inputmode="numeric" />
              </label>
              <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label class="fld">
                  <span class="fld-label">Tulisan WA di web</span>
                  <input v-model="form.site.wa_display" placeholder="0822-4567-8910" class="fld-input" />
                </label>
                <label class="fld">
                  <span class="fld-label">Tulisan telepon di web</span>
                  <input v-model="form.site.phone_display" placeholder="(0321) 888-123" class="fld-input" />
                </label>
              </div>
              <label class="fld">
                <span class="fld-label">Email</span>
                <input v-model="form.site.email" placeholder="info@blk.darulmaarif.org" class="fld-input" inputmode="email" />
              </label>
            </div>
          </div>
          <div class="rounded-3xl bg-white p-5 ring-1 ring-neutral-200 sm:p-6">
            <p class="text-base font-extrabold">Alamat & jam buka</p>
            <p class="mt-0.5 text-[13px] text-neutral-500">Tampil di bagian “Lokasi & Kontak” beserta peta.</p>
            <div class="mt-4 grid gap-4">
              <label class="fld">
                <span class="fld-label">Alamat lengkap</span>
                <textarea v-model="form.site.address_full" rows="3" class="fld-input" />
              </label>
              <label class="fld">
                <span class="fld-label">Jam layanan</span>
                <input v-model="form.site.hours" class="fld-input" />
              </label>
              <label class="fld">
                <span class="fld-label">Link tombol “Buka Maps”</span>
                <input v-model="form.site.maps_link" class="fld-input" />
              </label>
              <label class="fld">
                <span class="fld-label">Kode peta <em class="fld-hint">(isi src iframe Google Maps)</em></span>
                <input v-model="form.site.maps_embed" class="fld-input" />
              </label>
            </div>
          </div>
          <div class="rounded-3xl bg-white p-5 ring-1 ring-neutral-200 sm:p-6">
            <p class="text-base font-extrabold">Nama & deskripsi singkat</p>
            <div class="mt-4 grid gap-4">
              <label class="fld">
                <span class="fld-label">Nama singkat <em class="fld-hint">(di header web)</em></span>
                <input v-model="form.site.name" class="fld-input" />
              </label>
              <label class="fld">
                <span class="fld-label">Kalimat di footer</span>
                <textarea v-model="form.site.description" rows="3" class="fld-input" />
              </label>
            </div>
          </div>
        </section>

        <!-- 2. TAMPILAN ATAS -->
        <section v-if="!loading && tab === 'hero'" class="space-y-3">
          <div class="rounded-3xl bg-white p-5 ring-1 ring-neutral-200 sm:p-6">
            <p class="text-base font-extrabold">Bagian paling atas web <em class="fld-hint">(yang berlatar hijau)</em></p>
            <p class="mt-0.5 text-[13px] text-neutral-500">Tulis semenarik mungkin — ini yang pertama dibaca calon peserta.</p>
            <div class="mt-4 grid gap-4">
              <label class="fld">
                <span class="fld-label">Label pengumuman <em class="fld-hint">(latar kuning)</em></span>
                <input v-model="form.hero.badge" placeholder="Pendaftaran DIBUKA: …" class="fld-input" />
              </label>
              <label class="fld">
                <span class="fld-label">Keterangan kuota</span>
                <input v-model="form.hero.badge_sub" placeholder="Kuota terbatas — 16 orang / kelas" class="fld-input" />
              </label>
              <label class="fld">
                <span class="fld-label">Judul besar</span>
                <input v-model="form.hero.title" class="fld-input" />
              </label>
              <label class="fld">
                <span class="fld-label">Sambungan judul <em class="fld-hint">(warna kuning)</em></span>
                <input v-model="form.hero.highlight" class="fld-input" />
              </label>
              <label class="fld">
                <span class="fld-label">Penjelasan singkat</span>
                <textarea v-model="form.hero.subtitle" rows="5" class="fld-input" />
              </label>
              <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label class="fld">
                  <span class="fld-label">Tulisan tombol utama</span>
                  <input v-model="form.hero.cta_primary" class="fld-input" />
                </label>
                <label class="fld">
                  <span class="fld-label">Tulisan tombol kedua</span>
                  <input v-model="form.hero.cta_secondary" class="fld-input" />
                </label>
              </div>
            </div>
          </div>
        </section>

        <!-- 3. PROGRAM -->
        <section v-if="!loading && tab === 'program'" class="space-y-3">
          <div class="rounded-3xl bg-amber-50 p-5 ring-1 ring-amber-200">
            <p class="flex items-center gap-1.5 text-[15px] font-extrabold text-amber-900"><UIcon name="i-lucide-info" class="size-5 shrink-0" /> Cara memakai</p>
            <p class="mt-1.5 text-[13px] leading-relaxed text-amber-900">Geser saklar <b>DIBUKA</b> untuk membuka/menutup pendaftaran tiap kelas. Kelas yang dibuka otomatis naik ke paling atas di web.</p>
          </div>
          <div class="rounded-3xl bg-white p-5 ring-1 ring-neutral-200 sm:p-6">
            <div class="grid gap-4">
              <label class="fld">
                <span class="fld-label">Judul bagian Program</span>
                <input v-model="form.programs.title" class="fld-input" />
              </label>
              <label class="fld">
                <span class="fld-label">Penjelasan di bawah judul</span>
                <textarea v-model="form.programs.subtitle" rows="3" class="fld-input" />
              </label>
            </div>
          </div>
          <details v-for="(p, i) in (form.programs.items ?? [])" :key="i" :open="p.active !== false || i === 0" class="overflow-hidden rounded-3xl bg-white ring-1 ring-neutral-200">
            <summary class="flex cursor-pointer list-none items-center gap-3 p-4 sm:p-5">
              <span class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-700 text-[15px] font-extrabold text-white">{{ i + 1 }}</span>
              <span class="min-w-0 flex-1">
                <span class="block truncate text-[15px] font-extrabold">{{ p.name || '(tanpa nama)' }}</span>
                <span :class="['mt-1 inline-block rounded-full px-2.5 py-1 text-[11px] font-extrabold', p.active !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-100 text-neutral-500']">
                  {{ p.active !== false ? '● DIBUKA' : '○ NON-AKTIF' }}
                </span>
              </span>
              <UIcon name="i-lucide-chevron-down" class="size-5 shrink-0 text-neutral-400" />
            </summary>
            <div class="grid gap-4 border-t border-neutral-100 p-5 sm:p-6">
              <label class="flex cursor-pointer items-center justify-between gap-3 rounded-2xl p-4 text-sm font-extrabold" :class="p.active !== false ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-neutral-700'">
                <span>{{ p.active !== false ? 'Pendaftaran DIBUKA' : 'Pendaftaran DITUTUP' }}</span>
                <input v-model="p.active" type="checkbox" class="size-7 shrink-0 accent-white" />
              </label>
              <label class="fld">
                <span class="fld-label">Nama program</span>
                <input v-model="p.name" class="fld-input" />
              </label>
              <label class="fld">
                <span class="fld-label">Label kecil <em class="fld-hint">(mis. “DIBUKA • Kuota 16”)</em></span>
                <input v-model="p.tag" class="fld-input" />
              </label>
              <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label class="fld">
                  <span class="fld-label">Durasi</span>
                  <input v-model="p.duration" placeholder="25 hari • 200 JP" class="fld-input" />
                </label>
                <label class="fld">
                  <span class="fld-label">Jadwal</span>
                  <input v-model="p.schedule" class="fld-input" />
                </label>
              </div>
              <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label class="fld">
                  <span class="fld-label">Kuota</span>
                  <input v-model="p.quota" class="fld-input" />
                </label>
                <label class="fld">
                  <span class="fld-label">Syarat peserta</span>
                  <input v-model="p.level" class="fld-input" />
                </label>
              </div>
              <label class="fld">
                <span class="fld-label">Penjelasan singkat</span>
                <textarea v-model="p.desc" rows="4" class="fld-input" />
              </label>
              <label class="fld">
                <span class="fld-label">Keahlian yang dipelajari <em class="fld-hint">(pisahkan dengan koma)</em></span>
                <input v-model="p.skills" placeholder="Shooting & editing, Copywriting" class="fld-input" />
              </label>
              <label class="fld">
                <span class="fld-label">Link kurikulum Kemnaker</span>
                <input v-model="p.proglat_url" placeholder="https://proglat.kemnaker.go.id/…" class="fld-input" inputmode="url" />
              </label>
              <UButton size="sm" color="neutral" variant="soft" icon="i-lucide-trash-2" class="w-fit rounded-full px-4 py-2.5" @click="delProgram(i)">Hapus program ini</UButton>
            </div>
          </details>
          <UButton variant="soft" color="primary" icon="i-lucide-plus" block class="rounded-2xl py-3 font-bold" @click="addProgram">Tambah program baru</UButton>
        </section>

        <!-- 4. GALERI -->
        <section v-if="!loading && tab === 'galeri'" class="space-y-3">
          <div class="rounded-3xl bg-white p-5 ring-1 ring-neutral-200 sm:p-6">
            <div class="grid gap-4">
              <label class="fld">
                <span class="fld-label">Judul galeri</span>
                <input v-model="form.gallery.title" class="fld-input" />
              </label>
              <label class="fld">
                <span class="fld-label">Penjelasan</span>
                <textarea v-model="form.gallery.subtitle" rows="3" class="fld-input" />
              </label>
            </div>
          </div>
          <div v-if="!galleryCount" class="rounded-3xl border-2 border-dashed border-neutral-300 bg-white p-10 text-center">
            <UIcon name="i-lucide-images" class="mx-auto size-9 text-neutral-300" />
            <p class="mt-2 text-[15px] font-extrabold">Belum ada foto</p>
            <p class="text-[13px] text-neutral-500">Tambahkan foto kegiatan pertama.</p>
          </div>
          <UCard v-for="(g, i) in (form.gallery.items ?? [])" :key="i" class="rounded-3xl">
            <div class="relative">
              <img v-if="g.src" :src="g.src" alt="pratinjau foto" class="h-48 w-full rounded-2xl object-cover" loading="lazy" />
              <div v-else class="flex h-48 w-full items-center justify-center rounded-2xl bg-stone-100 text-[13px] font-bold text-neutral-400">Belum ada foto — upload di bawah</div>
              <span class="absolute left-2.5 top-2.5 rounded-full bg-emerald-950/85 px-3 py-1 text-[11px] font-extrabold text-white">Foto {{ i + 1 }}</span>
            </div>
            <div class="mt-4 grid gap-4">
              <label class="block rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50 p-4 text-center text-sm font-extrabold text-emerald-800 active:bg-emerald-100">
                {{ g.src ? 'Ganti foto (ketuk untuk upload)' : 'Upload foto (ketuk)' }}
                <input type="file" accept="image/*" class="hidden" @change="(e) => uploadGalleryPhoto(i, e)" />
              </label>
              <label class="fld">
                <span class="fld-label">atau tempel link foto</span>
                <input v-model="g.src" placeholder="https://… atau /uploads/…" class="fld-input" inputmode="url" />
              </label>
              <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label class="fld">
                  <span class="fld-label">Judul foto</span>
                  <input v-model="g.title" class="fld-input" />
                </label>
                <label class="fld">
                  <span class="fld-label">Keterangan</span>
                  <input v-model="g.desc" class="fld-input" />
                </label>
              </div>
              <UButton size="sm" color="neutral" variant="soft" icon="i-lucide-trash-2" class="w-fit rounded-full px-4 py-2.5" @click="delGallery(i)">Hapus foto ini</UButton>
            </div>
          </UCard>
          <UButton variant="soft" color="primary" icon="i-lucide-plus" block class="rounded-2xl py-3 font-bold" @click="addGallery">Tambah foto</UButton>
        </section>

        <!-- 5. WARNA & MODE -->
        <section v-if="!loading && tab === 'tema'" class="space-y-3">
          <div class="rounded-3xl bg-white p-5 ring-1 ring-neutral-200 sm:p-6">
            <p class="text-base font-extrabold">Warna utama website</p>
            <p class="mt-0.5 text-[13px] text-neutral-500">Berlaku ke tombol, ikon & bagian hijau di seluruh web. Warna kuning tidak ikut berubah.</p>
            <div class="mt-4 grid grid-cols-2 gap-2.5">
              <button v-for="pl in palettes" :key="pl.id" type="button" :class="['rounded-2xl border-2 p-3 text-left transition active:scale-[.98]', form.theme.palette === pl.id ? 'border-emerald-600 bg-emerald-50/60' : 'border-neutral-200 bg-white']" @click="form.theme.palette = pl.id">
                <span class="flex items-center gap-2">
                  <span class="size-7 shrink-0 rounded-full shadow ring-2 ring-white" :style="{ background: pl.dot }" />
                  <span class="text-sm font-extrabold">{{ pl.label }}</span>
                  <UIcon v-if="form.theme.palette === pl.id" name="i-lucide-check-circle-2" class="ml-auto size-5 shrink-0 text-emerald-600" />
                </span>
                <span v-if="pl.hint" class="mt-1 block text-[11px] font-bold text-neutral-400">{{ pl.hint }}</span>
                <span class="mt-2.5 flex h-9 overflow-hidden rounded-xl ring-1 ring-black/5">
                  <span class="w-2/3" :style="{ background: pl.dot }" />
                  <span class="w-1/3 bg-amber-300" />
                </span>
              </button>
            </div>
          </div>
          <div class="rounded-3xl bg-white p-5 ring-1 ring-neutral-200 sm:p-6">
            <p class="text-base font-extrabold">Pratinjau langsung</p>
            <p class="mt-0.5 text-[13px] text-neutral-500">Contoh tampilan web dengan warna yang dipilih.</p>
            <div :data-palette="form.theme.palette" class="mt-3 overflow-hidden rounded-2xl ring-1 ring-neutral-300">
              <div class="bg-emerald-950 px-4 py-3">
                <p class="text-sm font-extrabold text-white">BLKK Darul Maarif Bangsal Mojokerto</p>
              </div>
              <div class="flex flex-wrap items-center gap-2 bg-white px-4 py-3.5">
                <span class="rounded-full bg-emerald-600 px-4 py-2 text-xs font-extrabold text-white">Daftar via WA</span>
                <span class="rounded-full bg-amber-300 px-4 py-2 text-xs font-extrabold text-emerald-950">Kuota 16</span>
              </div>
            </div>
          </div>
          <div class="rounded-3xl bg-white p-5 ring-1 ring-neutral-200 sm:p-6">
            <p class="text-base font-extrabold">Tampilan awal untuk pengunjung</p>
            <p class="mt-0.5 text-[13px] text-neutral-500">Berlaku untuk pengunjung baru. Setelah menekan tombol gelap/terang, pilihan pengunjung yang dipakai.</p>
            <div class="mt-4 grid gap-2">
              <button v-for="m in displayModes" :key="m.id" type="button" :class="['flex items-center gap-3 rounded-2xl border-2 p-3.5 text-left transition active:scale-[.99]', form.theme.default_mode === m.id ? 'border-emerald-600 bg-emerald-50/60' : 'border-neutral-200 bg-white']" @click="form.theme.default_mode = m.id">
                <span :class="['flex size-10 shrink-0 items-center justify-center rounded-xl', form.theme.default_mode === m.id ? 'bg-emerald-700 text-white' : 'bg-stone-100 text-neutral-500']">
                  <UIcon :name="m.icon" class="size-5" />
                </span>
                <span class="min-w-0 flex-1">
                  <span class="block text-sm font-extrabold">{{ m.label }}</span>
                  <span class="block text-xs text-neutral-500">{{ m.desc }}</span>
                </span>
                <UIcon v-if="form.theme.default_mode === m.id" name="i-lucide-check-circle-2" class="size-5 shrink-0 text-emerald-600" />
              </button>
            </div>
          </div>
          <div class="rounded-3xl bg-white p-5 ring-1 ring-neutral-200 sm:p-6">
            <label class="flex cursor-pointer items-center justify-between gap-3">
              <span>
                <span class="block text-[15px] font-extrabold">Tombol gelap / terang di web</span>
                <span class="block text-[13px] text-neutral-500">Tampil di header (ikon bulan/matahari). Matikan bila ingin web terkunci satu mode.</span>
              </span>
              <input v-model="form.theme.show_switch" type="checkbox" class="size-7 shrink-0 accent-emerald-700" />
            </label>
          </div>
        </section>

        <!-- 6. TEKS LAINNYA -->
        <section v-if="!loading && tab === 'konten'" class="space-y-3">
          <div class="rounded-3xl bg-white p-5 ring-1 ring-neutral-200 sm:p-6">
            <p class="text-base font-extrabold">Teks berjalan <em class="fld-hint">(pita kuning)</em></p>
            <p class="mt-0.5 text-[13px] text-neutral-500">Satu baris = satu tulisan yang berjalan. Hapus yang tidak perlu.</p>
            <div class="mt-4 space-y-2.5">
              <div v-for="(_, i) in (form.marquee ?? [])" :key="i" class="flex items-center gap-2">
                <input v-model="form.marquee[i]" placeholder="Contoh: GRATIS 100%" class="fld-input flex-1" />
                <UButton size="sm" color="neutral" variant="soft" icon="i-lucide-trash-2" class="shrink-0 rounded-full p-3" @click="delMarquee(i)" aria-label="Hapus baris" />
              </div>
              <UButton size="sm" variant="soft" color="primary" icon="i-lucide-plus" class="rounded-full px-4 py-2.5 font-bold" @click="addMarquee">Tambah baris</UButton>
            </div>
          </div>
          <div class="rounded-3xl bg-white p-5 ring-1 ring-neutral-200 sm:p-6">
            <p class="text-base font-extrabold">Kotak ajakan sebelum footer</p>
            <p class="mt-0.5 text-[13px] text-neutral-500">Kotak hijau tua berisi tombol WhatsApp & Telepon.</p>
            <div class="mt-4 grid gap-4">
              <label class="fld">
                <span class="fld-label">Judul</span>
                <input v-model="form.cta.title" class="fld-input" />
              </label>
              <label class="fld">
                <span class="fld-label">Penjelasan</span>
                <textarea v-model="form.cta.subtitle" rows="3" class="fld-input" />
              </label>
            </div>
          </div>
          <div class="rounded-3xl bg-white p-5 ring-1 ring-neutral-200 sm:p-6">
            <p class="text-base font-extrabold">Judul bagian lain</p>
            <div class="mt-4 grid gap-4">
              <label class="fld">
                <span class="fld-label">Judul Testimoni</span>
                <input v-model="form.testimonials.title" class="fld-input" />
              </label>
              <label class="fld">
                <span class="fld-label">Judul Tanya-Jawab</span>
                <input v-model="form.faq.title" class="fld-input" />
              </label>
            </div>
            <p class="mt-4 rounded-2xl bg-stone-100 p-4 text-xs leading-relaxed text-neutral-500">Isi testimoni & pertanyaan lengkap diubah lewat file <code>content/landing.yml</code>. Panel ini hanya untuk judul agar tetap simpel.</p>
          </div>
        </section>
      </div>
    </main>

    <!-- Bilah simpan -->
    <div v-if="token" class="fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200 bg-white/95 backdrop-blur">
      <div class="mx-auto max-w-3xl p-3.5">
        <p class="mb-2.5 text-center text-xs font-bold text-neutral-500">Perubahan belum tampil di web sebelum tombol Simpan ditekan.</p>
        <div class="flex gap-2">
          <UButton variant="soft" color="neutral" icon="i-lucide-rotate-ccw" class="shrink-0 rounded-2xl px-4 py-3" @click="loadData">Batalkan</UButton>
          <UButton :loading="saving" color="primary" icon="i-lucide-save" block class="rounded-2xl py-3 font-extrabold" @click="save">Simpan Perubahan</UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
/* Form admin: besar, penuh, mudah dibaca di HP */
.fld { display: block; }
.fld-label { display: block; font-size: 14px; font-weight: 800; color: #1c1917; margin-bottom: 2px; }
.fld-hint { font-weight: 500; color: #a8a29e; font-style: normal; }
.fld-input {
  width: 100%;
  border-radius: 14px;
  border: 1.5px solid #d6d3d1;
  background: #fff;
  padding: 13px 15px;
  font-size: 15.5px;
  font-weight: 500;
  line-height: 1.6;
  color: #1c1917;
  outline: none;
  transition: border-color .15s ease, box-shadow .15s ease;
}
.fld-input::placeholder { color: #a8a29e; font-weight: 400; }
.fld-input:focus { border-color: #047857; box-shadow: 0 0 0 3px #d1fae5; }
textarea.fld-input { min-height: 120px; resize: vertical; }
</style>
