<script setup lang="ts">
const { data: apiLanding } = await useAsyncData('landing-api', () => $fetch('/api/landing').catch(() => null))
const { data: contentRaw } = await useAsyncData('landing-content', () => queryCollection('landing').first())

const landing = computed(() => ((apiLanding.value as any)?.data ?? (contentRaw.value as any)?.meta ?? contentRaw.value ?? {}) as any)

const site = computed(() => landing.value?.site as any)
const hero = computed(() => landing.value?.hero as any)
const marquee = computed(() => (landing.value?.marquee ?? []) as string[])
const programs = computed(() => (landing.value?.programs ?? {}) as any)
const features = computed(() => (landing.value?.features ?? {}) as any)
const steps = computed(() => (landing.value?.steps ?? {}) as any)
const terms = computed(() => (landing.value?.terms ?? {}) as any)
const testimonials = computed(() => (landing.value?.testimonials ?? {}) as any)
const gallery = computed(() => (landing.value?.gallery ?? {}) as any)
const faq = computed(() => (landing.value?.faq ?? {}) as any)
const cta = computed(() => (landing.value?.cta ?? {}) as any)
const contact = computed(() => (landing.value?.contact ?? {}) as any)
const theme = computed(() => ({
  palette: 'emerald',
  default_mode: 'system',
  show_switch: true,
  ...((landing.value?.theme ?? {}) as any)
}))

const colorMode = useColorMode()

// Terapkan mode bawaan dari admin hanya untuk pengunjung baru
// (yang belum pernah menekan tombol gelap/terang)
onMounted(() => {
  try {
    if (!localStorage.getItem('nuxt-color-mode') && (theme.value.default_mode === 'light' || theme.value.default_mode === 'dark')) {
      colorMode.preference = theme.value.default_mode
    }
  }
  catch { /* abaikan */ }
})

const menuOpen = ref(false)

const waNumber = computed(() => site.value?.wa_number ?? '6282245678910')
const waBase = computed(() => site.value?.wa_default_text ?? 'Halo%20BLKK%20Darul%20Maarif')

function waLink(programName?: string) {
  const text = programName
    ? `Assalamu%27alaikum%20kak%2C%20saya%20mau%20daftar%20program%20*${encodeURIComponent(programName)}*%20di%20BLKK%20Darul%20Maarif%20Bangsal%20Mojokerto.%20Nama%20saya%3A%20`
    : waBase.value
  return `https://wa.me/${waNumber.value}?text=${text}`
}

const nav = [
  { label: 'Program', href: '#program' },
  { label: 'Galeri', href: '#galeri' },
  { label: 'Keunggulan', href: '#keunggulan' },
  { label: 'Alur Daftar', href: '#alur' },
  { label: 'Testimoni', href: '#testimoni' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Kontak', href: '#kontak' }
]

function skillList(p: any): string[] {
  if (Array.isArray(p?.skills))
    return p.skills
  if (typeof p?.skills === 'string')
    return (p.skills as string).split(',').map(s => s.trim()).filter(Boolean)
  return []
}

function isActive(p: any): boolean {
  return p?.active !== false
}

const sortedPrograms = computed(() => {
  const items = [...((programs.value?.items ?? []) as any[])]
  return items.sort((a, b) => Number(isActive(b)) - Number(isActive(a)))
})

const faqItems = computed(() =>
  ((faq.value?.items ?? []) as any[]).map((f: any) => ({
    label: f.q,
    icon: 'i-lucide-circle-help',
    content: f.a
  }))
)

useSeoMeta({
  title: 'BLKK Darul Maarif Bangsal Mojokerto — Pelatihan Kerja Gratis & Bersertifikat',
  description: 'BLKK Darul Maarif Bangsal Mojokerto. Saat ini DIBUKA: Pembuatan Konten untuk Social Media (200 JP) — gratis, bersertifikat Kemnaker.'
})
</script>

<template>
  <div class="min-h-screen bg-white text-neutral-900 pb-20 lg:pb-0 dark:bg-neutral-950 dark:text-neutral-100" :data-palette="theme.palette">
    <!-- Topbar (desktop) -->
    <div class="hidden sm:block bg-emerald-950 text-emerald-50/90 text-xs">
      <div class="mx-auto max-w-6xl px-4 py-2 flex items-center justify-between gap-4">
        <p class="flex items-center gap-1.5">
          <UIcon name="i-lucide-map-pin" class="size-3.5" />
          {{ site?.address_short }} • {{ site?.hours }}
        </p>
        <div class="flex items-center gap-4">
          <a :href="site?.phone_href" class="flex items-center gap-1.5 hover:text-white">
            <UIcon name="i-lucide-phone" class="size-3.5" /> {{ site?.phone_display }}
          </a>
          <span class="flex items-center gap-1.5">
            <UIcon name="i-lucide-mail" class="size-3.5" /> {{ site?.email }}
          </span>
        </div>
      </div>
    </div>

    <!-- Header sticky -->
    <header class="sticky top-0 z-40 border-b border-neutral-200/80 bg-white/85 backdrop-blur-lg dark:border-neutral-800 dark:bg-neutral-950/85">
      <div class="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between gap-3">
        <a href="#top" class="flex items-center gap-2.5 min-w-0">
          <img src="/logo-blkk.png" alt="Logo BLKK Darul Maarif Bangsal Mojokerto" class="h-10 w-10 shrink-0 rounded-xl bg-white object-contain shadow-sm ring-1 ring-neutral-200" />
          <span class="min-w-0 leading-tight">
            <span class="block truncate text-[15px] font-800 font-extrabold tracking-tight">{{ site?.name }}</span>
            <span class="block truncate text-[11px] font-medium text-emerald-700">{{ site?.domain }}</span>
          </span>
        </a>
        <nav class="hidden lg:flex items-center gap-1 text-sm font-semibold text-neutral-600 dark:text-neutral-300">
          <a v-for="n in nav" :key="n.href" :href="n.href" class="rounded-full px-3 py-2 hover:bg-emerald-50 hover:text-emerald-800 dark:hover:bg-emerald-950 dark:hover:text-emerald-200">{{ n.label }}</a>
        </nav>
        <div class="flex items-center gap-2">
          <ThemeToggle v-if="theme.show_switch" />
          <UButton :to="waLink()" target="_blank" color="primary" size="sm" icon="i-lucide-message-circle" class="hidden sm:inline-flex font-bold">
            Daftar Gratis
          </UButton>
          <UButton icon="i-lucide-menu" color="neutral" variant="soft" size="sm" class="lg:hidden" aria-label="Buka menu" @click="menuOpen = true" />
        </div>
      </div>
    </header>

    <!-- Mobile menu -->
    <div v-if="menuOpen" class="fixed inset-0 z-50 lg:hidden">
      <div class="absolute inset-0 bg-neutral-950/50" @click="menuOpen = false" />
      <div class="absolute inset-x-0 top-0 rounded-b-3xl bg-white p-4 shadow-2xl dark:bg-neutral-900">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <img src="/logo-blkk.png" alt="Logo BLKK Darul Maarif Bangsal Mojokerto" class="size-8 shrink-0 rounded-lg bg-white object-contain ring-1 ring-neutral-200" />
            <span class="font-extrabold text-sm">{{ site?.name }}</span>
          </div>
          <UButton icon="i-lucide-x" color="neutral" variant="ghost" @click="menuOpen = false" aria-label="Tutup menu" />
        </div>
        <nav class="mt-4 grid gap-1">
          <a v-for="n in nav" :key="n.href" :href="n.href" class="rounded-2xl px-4 py-3 font-bold text-neutral-800 active:bg-emerald-50 dark:text-neutral-100 dark:active:bg-emerald-950" @click="menuOpen = false">{{ n.label }}</a>
        </nav>
        <div class="mt-4 grid grid-cols-2 gap-2">
          <UButton :to="site?.phone_href" color="neutral" variant="soft" icon="i-lucide-phone" block>Telepon</UButton>
          <UButton :to="waLink()" target="_blank" color="primary" icon="i-lucide-message-circle" block class="font-bold">Daftar Gratis</UButton>
        </div>
      </div>
    </div>

    <main id="top">
      <!-- HERO -->
      <section class="relative overflow-hidden bg-emerald-950 text-white">
        <div class="pattern-grid absolute inset-0 opacity-40" />
        <div class="absolute -top-24 -right-24 size-72 rounded-full bg-emerald-500/30 blur-3xl" />
        <div class="absolute -bottom-32 -left-24 size-72 rounded-full bg-amber-400/20 blur-3xl" />
        <div class="relative mx-auto max-w-6xl px-4 pt-8 pb-10 sm:pt-14 sm:pb-16">
          <UBadge color="neutral" variant="solid" class="bg-amber-400 text-emerald-950 font-extrabold rounded-full px-3 py-1.5 text-[11px] sm:text-xs">
            <UIcon name="i-lucide-sparkles" class="size-3.5 mr-1" /> {{ hero?.badge }}
          </UBadge>
          <p class="mt-2 text-xs font-semibold text-emerald-200">{{ hero?.badge_sub }}</p>
          <h1 class="mt-4 max-w-2xl text-[30px] leading-[1.12] font-extrabold tracking-tight sm:text-5xl">
            {{ hero?.title }}
            <span class="text-amber-300">{{ hero?.highlight }}</span>
          </h1>
          <p class="mt-4 max-w-2xl text-sm leading-relaxed text-emerald-50/90 sm:text-base">
            {{ hero?.subtitle }}
          </p>
          <div class="mt-6 flex flex-col gap-2.5 sm:flex-row sm:items-center">
            <a :href="waLink('Pembuatan Konten untuk Social Media')" target="_blank" class="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-amber-300 px-5 py-3 text-sm font-extrabold text-emerald-950 shadow-lg transition hover:bg-amber-200 active:bg-amber-200">
              <UIcon name="i-lucide-message-circle" class="size-5 shrink-0" /> {{ hero?.cta_primary }}
            </a>
            <a href="#program" class="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border-2 border-white/60 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-white/10 active:bg-white/10">
              <UIcon name="i-lucide-layout-grid" class="size-5 shrink-0" /> {{ hero?.cta_secondary }}
            </a>
          </div>
          <div class="mt-6 grid grid-cols-3 gap-2 max-w-xl">
            <div v-for="t in (hero?.trust ?? [])" :key="t.label" class="rounded-2xl bg-white/10 border border-white/15 px-2 py-2.5 text-center backdrop-blur">
              <UIcon :name="t.icon" class="mx-auto size-5 text-amber-300" />
              <p class="mt-1 text-[11px] font-bold leading-tight sm:text-xs">{{ t.label }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Marquee -->
      <div class="overflow-hidden border-y border-amber-300 bg-amber-300 py-2.5">
        <div class="animate-marquee flex w-max items-center gap-6 pr-6 text-[13px] font-extrabold text-emerald-950">
          <span v-for="(m, i) in [...marquee, ...marquee]" :key="i" class="flex items-center gap-6 whitespace-nowrap">
            {{ m }} <UIcon name="i-lucide-star" class="size-3.5" />
          </span>
        </div>
      </div>

      <!-- PROGRAM -->
      <section id="program" class="mx-auto max-w-6xl scroll-mt-20 px-4 py-12 sm:py-16">
        <p class="text-xs font-extrabold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">{{ programs?.title_overline }}</p>
        <h2 class="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">{{ programs?.title }}</h2>
        <p class="mt-2 max-w-2xl text-sm text-neutral-500 sm:text-[15px] dark:text-neutral-400">{{ programs?.subtitle }}</p>
        <div class="mt-6 grid gap-3.5 sm:grid-cols-2">
          <UCard v-for="p in sortedPrograms" :key="p.name" :class="['rounded-3xl ring-1 flex flex-col overflow-hidden dark:ring-neutral-800', isActive(p) ? 'ring-emerald-300 shadow-md' : 'ring-neutral-200 opacity-90']">
            <div class="flex items-start justify-between gap-2">
              <div :class="['flex size-11 items-center justify-center rounded-2xl shadow', isActive(p) ? 'bg-emerald-700 text-white' : 'bg-neutral-200 text-neutral-500']">
                <UIcon :name="p.icon" class="size-5" />
              </div>
              <UBadge :color="isActive(p) ? 'primary' : 'neutral'" variant="soft" class="rounded-full font-bold">{{ p.tag }}</UBadge>
            </div>
            <h3 class="mt-3 text-[17px] font-extrabold leading-snug">{{ p.name }}</h3>
            <p v-if="!isActive(p)" class="mt-1 inline-flex w-fit items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] font-extrabold text-neutral-500">
              <UIcon name="i-lucide-pause-circle" class="size-3.5" /> Non-aktif sementara
            </p>
            <div class="mt-2 space-y-1 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
              <p class="flex items-center gap-1.5"><UIcon name="i-lucide-clock" class="size-3.5 text-emerald-700 dark:text-emerald-400" /> {{ p.duration }}</p>
              <p class="flex items-center gap-1.5"><UIcon name="i-lucide-calendar-days" class="size-3.5 text-emerald-700 dark:text-emerald-400" /> {{ p.schedule }}</p>
              <p class="flex items-center gap-1.5"><UIcon name="i-lucide-users" class="size-3.5 text-emerald-700 dark:text-emerald-400" /> {{ p.quota }} • {{ p.level }}</p>
            </div>
            <p class="mt-2.5 text-[13px] leading-relaxed text-neutral-600 dark:text-neutral-300">{{ p.desc }}</p>
            <div class="mt-3 flex flex-wrap gap-1.5">
              <span v-for="s in skillList(p)" :key="s" class="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">{{ s }}</span>
            </div>
            <template #footer>
              <div class="grid gap-2">
                <UButton v-if="isActive(p)" :to="waLink(p.name)" target="_blank" color="primary" block icon="i-lucide-message-circle" class="rounded-2xl font-extrabold">
                  Daftar {{ p.name }}
                </UButton>
                <UButton v-else :to="waLink(p.name + ' (waitlist)')" target="_blank" variant="soft" color="neutral" block icon="i-lucide-bell-ring" class="rounded-2xl font-bold">
                  Join Waitlist {{ p.name }}
                </UButton>
                <UButton v-if="p.proglat_url" :to="p.proglat_url" target="_blank" variant="soft" color="neutral" block icon="i-lucide-external-link" size="xs" class="rounded-2xl font-bold">
                  Lihat Kurikulum Resmi Kemnaker
                </UButton>
              </div>
            </template>
          </UCard>
        </div>
        <p class="mt-4 rounded-2xl bg-emerald-50 p-3.5 text-center text-xs font-semibold text-emerald-900 ring-1 ring-emerald-100 sm:text-sm dark:bg-emerald-950 dark:text-emerald-100 dark:ring-emerald-900">
          Saat ini yang <span class="font-extrabold">DIBUKA hanya Pembuatan Konten untuk Social Media (200 JP)</span> — 3 program lain non-aktif sementara. Semua kelas <span class="font-extrabold">GRATIS 100%</span> sesuai ketentuan Kemnaker.
        </p>
      </section>

      <!-- GALERI -->
      <section id="galeri" class="mx-auto max-w-6xl scroll-mt-20 px-4 pb-12 sm:pb-16">
        <p class="text-xs font-extrabold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">{{ gallery?.title_overline }}</p>
        <h2 class="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">{{ gallery?.title }}</h2>
        <p class="mt-2 max-w-2xl text-sm text-neutral-500 sm:text-[15px] dark:text-neutral-400">{{ gallery?.subtitle }}</p>
        <div class="snap-row no-scrollbar -mx-4 mt-6 flex gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3">
          <figure v-for="g in (gallery?.items ?? [])" :key="g.src" class="group min-w-[78%] overflow-hidden rounded-3xl bg-white ring-1 ring-neutral-200 shadow-sm sm:min-w-0 dark:bg-neutral-900 dark:ring-neutral-800">
            <div class="relative h-44 overflow-hidden bg-stone-100 sm:h-48 dark:bg-neutral-800">
              <img :src="g.src" :alt="g.title" class="h-full w-full object-cover transition duration-300 group-active:scale-105" loading="lazy" />
              <span class="absolute left-3 top-3 rounded-full bg-emerald-950/85 px-2.5 py-1 text-[10px] font-extrabold text-white backdrop-blur">BLKK Bangsal Mojokerto</span>
            </div>
            <figcaption class="p-4">
              <p class="text-sm font-extrabold leading-snug">{{ g.title }}</p>
              <p class="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">{{ g.desc }}</p>
            </figcaption>
          </figure>
        </div>
        <p class="mt-3 text-center text-xs font-semibold text-neutral-400 sm:hidden">← Geser untuk lihat foto lainnya →</p>
      </section>

      <!-- KEUNGGULAN -->
      <section id="keunggulan" class="scroll-mt-20 bg-stone-50 border-y border-stone-200/70 dark:bg-neutral-950 dark:border-neutral-800">
        <div class="mx-auto max-w-6xl px-4 py-12 sm:py-16">
          <p class="text-xs font-extrabold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">{{ features?.title_overline }}</p>
          <h2 class="mt-1 max-w-xl text-2xl font-extrabold tracking-tight sm:text-3xl">{{ features?.title }}</h2>
          <p class="mt-2 max-w-2xl text-sm text-neutral-500 sm:text-[15px] dark:text-neutral-400">{{ features?.subtitle }}</p>
          <div class="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div v-for="f in (features?.items ?? [])" :key="f.title" class="rounded-3xl bg-white p-5 ring-1 ring-stone-200 shadow-sm dark:bg-neutral-900 dark:ring-neutral-800">
              <div class="flex size-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                <UIcon :name="f.icon" class="size-5" />
              </div>
              <h3 class="mt-3 font-extrabold">{{ f.title }}</h3>
              <p class="mt-1 text-[13px] leading-relaxed text-neutral-500 dark:text-neutral-400">{{ f.desc }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- ALUR + SYARAT -->
      <section id="alur" class="mx-auto max-w-6xl scroll-mt-20 px-4 py-12 sm:py-16">
        <div class="grid gap-8 lg:grid-cols-[1.1fr_.9fr]">
          <div>
            <p class="text-xs font-extrabold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">{{ steps?.title_overline }}</p>
            <h2 class="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">{{ steps?.title }}</h2>
            <p class="mt-2 text-sm text-neutral-500 dark:text-neutral-400">{{ steps?.subtitle }}</p>
            <ol class="mt-6 space-y-3">
              <li v-for="(s, i) in (steps?.items ?? [])" :key="s.title" class="flex gap-3 rounded-3xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                <div class="flex flex-col items-center">
                  <span class="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-700 font-extrabold text-white">{{ i + 1 }}</span>
                  <span v-if="i < (steps?.items?.length ?? 0) - 1" class="my-1 w-0.5 flex-1 rounded bg-emerald-100 dark:bg-emerald-900" />
                </div>
                <div class="pb-1">
                  <p class="flex items-center gap-1.5 font-extrabold text-[15px]"><UIcon :name="s.icon" class="size-4 text-emerald-700 dark:text-emerald-400" /> {{ s.title }}</p>
                  <p class="mt-1 text-[13px] text-neutral-500 dark:text-neutral-400">{{ s.desc }}</p>
                </div>
              </li>
            </ol>
          </div>
          <div class="space-y-3.5">
            <div class="rounded-3xl bg-white p-5 ring-1 ring-neutral-200 shadow-sm dark:bg-neutral-900 dark:ring-neutral-800">
              <h3 class="flex items-center gap-2 font-extrabold"><UIcon name="i-lucide-clipboard-list" class="size-5 text-emerald-700 dark:text-emerald-400" /> {{ terms?.title }}</h3>
              <ul class="mt-3 space-y-2">
                <li v-for="t in (terms?.items ?? [])" :key="t" class="flex gap-2 text-[13px] font-medium text-neutral-700 dark:text-neutral-200">
                  <UIcon name="i-lucide-check-circle-2" class="mt-0.5 size-4 shrink-0 text-emerald-600" /> {{ t }}
                </li>
              </ul>
              <p class="mt-3 rounded-2xl bg-emerald-50 p-3 text-xs leading-relaxed text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100">{{ terms?.note }}</p>
            </div>
            <div class="overflow-hidden rounded-3xl bg-emerald-950 p-5 text-white shadow-lg">
              <div class="flex items-center justify-between gap-2">
                <p class="font-extrabold">{{ terms?.wave?.name }}</p>
                <UBadge color="neutral" variant="solid" class="bg-emerald-400 text-emerald-950 font-extrabold rounded-full">
                  {{ terms?.wave?.status }}
                </UBadge>
              </div>
              <p class="mt-1 text-xs text-emerald-200">{{ terms?.wave?.deadline }}</p>
              <ul class="mt-3 space-y-1.5 text-[13px] text-emerald-50/90">
                <li v-for="w in (terms?.wave?.info ?? [])" :key="w" class="flex gap-2">
                  <UIcon name="i-lucide-check" class="mt-0.5 size-4 shrink-0 text-amber-300" /> {{ w }}
                </li>
              </ul>
              <a :href="waLink('Pembuatan Konten untuk Social Media')" target="_blank" class="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-amber-300 px-5 py-3 text-sm font-extrabold text-emerald-950 shadow transition hover:bg-amber-200 active:bg-amber-200">
                <UIcon name="i-lucide-zap" class="size-5 shrink-0" /> Amankan Kursi Sekarang
              </a>
            </div>
          </div>
        </div>
      </section>

      <!-- TESTIMONI -->
      <section id="testimoni" class="scroll-mt-20 border-y border-stone-200/70 bg-stone-50 dark:border-neutral-800 dark:bg-neutral-950">
        <div class="mx-auto max-w-6xl px-4 py-12 sm:py-16">
          <p class="text-xs font-extrabold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">{{ testimonials?.title_overline }}</p>
          <h2 class="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">{{ testimonials?.title }}</h2>
          <div class="snap-row no-scrollbar -mx-4 mt-6 flex gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3">
            <figure v-for="t in (testimonials?.items ?? [])" :key="t.name" class="min-w-[86%] rounded-3xl bg-white p-5 ring-1 ring-stone-200 shadow-sm sm:min-w-0 dark:bg-neutral-900 dark:ring-neutral-800">
              <div class="flex gap-0.5 text-amber-500">
                <UIcon v-for="n in (t.rating ?? 5)" :key="n" name="i-lucide-star" class="size-4 fill-amber-400 text-amber-400" />
              </div>
              <blockquote class="mt-2.5 text-[13px] leading-relaxed text-neutral-700 dark:text-neutral-200">“{{ t.text }}”</blockquote>
              <figcaption class="mt-4 flex items-center gap-2.5">
                <UAvatar :text="t.initial" size="md" class="bg-emerald-700 text-white font-extrabold" />
                <span>
                  <span class="block text-[13px] font-extrabold">{{ t.name }}</span>
                  <span class="block text-[11px] font-medium text-neutral-500 dark:text-neutral-400">{{ t.role }}</span>
                </span>
              </figcaption>
            </figure>
          </div>
          <p class="mt-3 text-center text-xs font-semibold text-neutral-400 sm:hidden">← Geser untuk lihat cerita lainnya →</p>
        </div>
      </section>

      <!-- FAQ -->
      <section id="faq" class="mx-auto max-w-3xl scroll-mt-20 px-4 py-12 sm:py-16">
        <p class="text-center text-xs font-extrabold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">{{ faq?.title_overline }}</p>
        <h2 class="mt-1 text-center text-2xl font-extrabold tracking-tight sm:text-3xl">{{ faq?.title }}</h2>
        <UAccordion :items="faqItems" variant="soft" class="mt-6" :ui="{ item: 'rounded-2xl mb-2 ring-1 ring-neutral-200', trigger: 'px-4 py-3.5 font-bold text-left text-[14px]', content: 'px-4 pb-4 text-[13px] text-neutral-600 leading-relaxed' }" />
        <div class="mt-4 rounded-3xl bg-emerald-50 p-4 text-center ring-1 ring-emerald-100 dark:bg-neutral-900 dark:ring-neutral-800">
          <p class="text-sm font-bold text-emerald-950 dark:text-white">Masih ada pertanyaan lain?</p>
          <p class="text-xs text-emerald-800 dark:text-neutral-300">Admin fast-respon di jam kerja {{ site?.hours }}.</p>
          <UButton :to="waLink()" target="_blank" color="primary" icon="i-lucide-message-circle" class="mt-3 rounded-2xl font-bold">Tanya via WhatsApp</UButton>
        </div>
      </section>

      <!-- KONTAK -->
      <section id="kontak" class="mx-auto max-w-6xl scroll-mt-20 px-4 pb-12 sm:pb-16">
        <p class="text-xs font-extrabold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">{{ contact?.title_overline }}</p>
        <h2 class="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">{{ contact?.title }}</h2>
        <p class="mt-2 max-w-2xl text-sm text-neutral-500 dark:text-neutral-400">{{ contact?.subtitle }}</p>
        <div class="mt-6 grid gap-3.5 lg:grid-cols-2">
          <div class="space-y-3">
            <div class="rounded-3xl border border-neutral-200 p-5 dark:border-neutral-800">
              <p class="flex items-center gap-2 font-extrabold"><UIcon name="i-lucide-map-pin" class="size-5 text-emerald-700 dark:text-emerald-400" /> Alamat Kampus</p>
              <p class="mt-1.5 text-[13px] leading-relaxed text-neutral-600 dark:text-neutral-300">{{ site?.address_full }}</p>
              <div class="mt-3 grid grid-cols-2 gap-2">
                <UButton :to="site?.maps_link" target="_blank" variant="soft" color="primary" icon="i-lucide-navigation" class="rounded-2xl font-bold">Buka Maps</UButton>
                <UButton :to="waLink()" target="_blank" color="primary" icon="i-lucide-message-circle" class="rounded-2xl font-bold">Chat Admin</UButton>
              </div>
            </div>
            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <a :href="site?.phone_href" class="rounded-3xl border border-neutral-200 p-4 hover:border-emerald-300 hover:bg-emerald-50/50 dark:border-neutral-800 dark:hover:bg-emerald-950/50">
                <UIcon name="i-lucide-phone-call" class="size-5 text-emerald-700 dark:text-emerald-400" />
                <p class="mt-1.5 text-xs font-bold text-neutral-500 dark:text-neutral-400">Telepon Kantor</p>
                <p class="font-extrabold">{{ site?.phone_display }}</p>
              </a>
              <a :href="waLink()" target="_blank" class="rounded-3xl border border-neutral-200 p-4 hover:border-emerald-300 hover:bg-emerald-50/50 dark:border-neutral-800 dark:hover:bg-emerald-950/50">
                <UIcon name="i-lucide-message-circle" class="size-5 text-emerald-700 dark:text-emerald-400" />
                <p class="mt-1.5 text-xs font-bold text-neutral-500 dark:text-neutral-400">WhatsApp Admin</p>
                <p class="font-extrabold">{{ site?.wa_display }}</p>
              </a>
            </div>
            <div class="rounded-3xl bg-stone-100 p-4 text-[13px] font-medium text-neutral-600 dark:bg-neutral-900 dark:text-neutral-300">
              <p class="flex items-center gap-2 font-extrabold text-neutral-900 dark:text-white"><UIcon name="i-lucide-clock" class="size-4 text-emerald-700 dark:text-emerald-400" /> Jam Layanan</p>
              <p class="mt-1">{{ site?.hours }}</p>
              <p class="mt-1 flex items-center gap-1.5"><UIcon name="i-lucide-mail" class="size-3.5" /> {{ site?.email }}</p>
            </div>
          </div>
          <div class="overflow-hidden rounded-3xl ring-1 ring-neutral-200 shadow-sm min-h-[320px] dark:ring-neutral-800">
            <iframe :src="site?.maps_embed" class="h-full min-h-[320px] w-full border-0" loading="lazy" title="Peta BLKK Darul Maarif Bangsal Mojokerto" />
          </div>
        </div>
      </section>

      <!-- CTA AKHIR -->
      <section class="mx-auto max-w-6xl px-4 pb-12">
        <div class="relative overflow-hidden rounded-[2rem] bg-emerald-950 p-6 text-center text-white shadow-xl sm:p-12">
          <div class="pattern-grid absolute inset-0 opacity-30" />
          <div class="relative">
            <UBadge color="neutral" variant="solid" class="bg-amber-300 text-emerald-950 font-extrabold rounded-full">KUOTA TERBATAS</UBadge>
            <h2 class="mx-auto mt-4 max-w-xl text-2xl font-extrabold leading-tight sm:text-4xl">{{ cta?.title }}</h2>
            <p class="mx-auto mt-2 max-w-lg text-[13px] text-emerald-100/90 sm:text-sm">{{ cta?.subtitle }}</p>
            <div class="mx-auto mt-6 grid max-w-md grid-cols-2 gap-2 sm:gap-3">
              <a :href="waLink('Pembuatan Konten untuk Social Media')" target="_blank" class="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-2xl bg-amber-300 px-3 py-2.5 text-[13px] font-extrabold text-emerald-950 shadow-lg transition hover:bg-amber-200 active:bg-amber-200 sm:text-sm">
                <UIcon name="i-lucide-message-circle" class="size-4 shrink-0" />
                <span class="truncate sm:hidden">Daftar via WA</span>
                <span class="hidden truncate sm:inline">{{ cta?.primary }}</span>
              </a>
              <a :href="site?.phone_href" class="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-2xl border-2 border-white/70 px-3 py-2.5 text-[13px] font-extrabold text-white transition hover:bg-white/10 active:bg-white/10 sm:text-sm">
                <UIcon name="i-lucide-phone" class="size-4 shrink-0" />
                <span class="truncate sm:hidden">Telepon</span>
                <span class="hidden truncate sm:inline">{{ cta?.secondary }}</span>
              </a>
            </div>
            <p class="mx-auto mt-4 max-w-md text-[11px] font-medium text-emerald-200/90">Khusus kelas Pembuatan Konten untuk Social Media (200 JP) • Kuota 16 orang</p>
          </div>
        </div>
      </section>
    </main>

    <!-- FOOTER -->
    <footer class="bg-emerald-950 text-emerald-50/80">
      <div class="mx-auto max-w-6xl px-4 py-10 grid gap-8 sm:grid-cols-3">
        <div>
          <div class="flex items-center gap-2">
            <img src="/logo-blkk.png" alt="Logo BLKK Darul Maarif Bangsal Mojokerto" class="size-10 shrink-0 rounded-xl bg-white object-contain p-0.5" />
            <div class="leading-tight">
              <p class="font-extrabold text-white">{{ site?.logo_text }}</p>
              <p class="text-[11px]">{{ site?.domain }}</p>
            </div>
          </div>
          <p class="mt-3 text-[13px] leading-relaxed">{{ site?.description }}</p>
          <div class="mt-3 flex flex-wrap gap-1.5">
            <span v-for="b in (site?.badges ?? [])" :key="b" class="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[11px] font-bold">{{ b }}</span>
          </div>
        </div>
        <div>
          <p class="font-extrabold text-white">Program Pelatihan</p>
          <ul class="mt-3 space-y-2 text-[13px] font-medium">
            <li v-for="p in (programs?.items ?? [])" :key="p.name">
              <a :href="waLink(p.name)" target="_blank" class="hover:text-amber-300">{{ p.name }}</a>
            </li>
          </ul>
        </div>
        <div>
          <p class="font-extrabold text-white">Hubungi Kami</p>
          <ul class="mt-3 space-y-2 text-[13px]">
            <li>{{ site?.address_full }}</li>
            <li><a :href="site?.phone_href" class="hover:text-amber-300">{{ site?.phone_display }}</a> • <a :href="waLink()" target="_blank" class="hover:text-amber-300">{{ site?.wa_display }}</a></li>
            <li>{{ site?.email }}</li>
            <li>{{ site?.hours }}</li>
          </ul>
        </div>
      </div>
      <USeparator class="opacity-20" />
      <div class="mx-auto max-w-6xl px-4 py-4 flex flex-col gap-1 text-center text-[11px] sm:flex-row sm:items-center sm:justify-between sm:text-left">
        <p>© 2026 {{ site?.full_name }} • {{ site?.tagline }}</p>
        <p>Konten dikelola via <a href="/admin" class="underline hover:text-amber-300">/admin</a> • blk.darulmaarif.org</p>
      </div>
    </footer>

    <!-- Sticky bottom bar (mobile-first) -->
    <div class="fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200 bg-white/95 backdrop-blur-lg lg:hidden dark:border-neutral-800 dark:bg-neutral-950/95">
      <div class="grid grid-cols-[1fr_1fr_1.4fr] gap-2 p-2.5 pb-[max(.625rem,env(safe-area-inset-bottom))]">
        <UButton :to="site?.phone_href" color="neutral" variant="soft" icon="i-lucide-phone" size="sm" class="justify-center rounded-2xl font-bold">Telepon</UButton>
        <UButton :to="waLink()" target="_blank" color="neutral" variant="soft" icon="i-lucide-message-circle" size="sm" class="justify-center rounded-2xl font-bold !bg-emerald-50 !text-emerald-800 dark:!bg-emerald-950 dark:!text-emerald-200">WA Admin</UButton>
        <UButton :to="waLink()" target="_blank" color="primary" icon="i-lucide-zap" size="sm" class="justify-center rounded-2xl font-extrabold">Daftar Gratis</UButton>
      </div>
    </div>
  </div>
</template>
