import { readFile, writeFile, mkdir, rm, stat } from 'node:fs/promises'
import { join, basename } from 'node:path'
import yaml from 'js-yaml'
import { createHash } from 'node:crypto'

const DATA_DIR = join(process.cwd(), 'data')
const OVERRIDE_FILE = join(DATA_DIR, 'landing.json')
const DEFAULT_YML = join(process.cwd(), 'content', 'landing.yml')
const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads')

export async function readDefaultLanding(): Promise<any> {
  const raw = await readFile(DEFAULT_YML, 'utf-8')
  return yaml.load(raw) as any
}

export async function readOverrideLanding(): Promise<any | null> {
  try {
    await stat(OVERRIDE_FILE)
  }
  catch {
    return null
  }
  try {
    const raw = await readFile(OVERRIDE_FILE, 'utf-8')
    return JSON.parse(raw)
  }
  catch {
    return null
  }
}

export async function readEffectiveLanding(): Promise<{ data: any, customized: boolean, updatedAt: string | null }> {
  const [def, over] = await Promise.all([readDefaultLanding(), readOverrideLanding()])
  if (over && typeof over === 'object') {
    return {
      data: deepMerge(def, over),
      customized: true,
      updatedAt: (over as any).__updatedAt ?? null
    }
  }
  return { data: def, customized: false, updatedAt: null }
}

export async function writeOverrideLanding(payload: any) {
  await mkdir(DATA_DIR, { recursive: true })
  const clean = sanitizeLanding(payload)
  clean.__updatedAt = new Date().toISOString()
  await writeFile(OVERRIDE_FILE, JSON.stringify(clean, null, 2), 'utf-8')
  return clean
}

export async function resetOverrideLanding() {
  try {
    await rm(OVERRIDE_FILE, { force: true })
  }
  catch { /* abaikan */ }
}

// Deep merge sederhana: override menang, array diganti penuh
function deepMerge(base: any, over: any): any {
  if (Array.isArray(over))
    return over
  if (over !== null && typeof over === 'object' && base !== null && typeof base === 'object' && !Array.isArray(base)) {
    const out: any = { ...base }
    for (const k of Object.keys(over)) {
      if (k === '__updatedAt')
        continue
      out[k] = k in base ? deepMerge(base[k], over[k]) : over[k]
    }
    return out
  }
  return over ?? base
}

// Batasi struktur agar file override tidak liar + cegah path traversal
function sanitizeLanding(input: any): any {
  if (!input || typeof input !== 'object')
    throw new Error('Payload tidak valid')
  const pick = (obj: any, keys: string[]) => {
    const out: any = {}
    for (const k of keys)
      if (obj[k] !== undefined)
        out[k] = obj[k]
    return out
  }
  const str = (v: any, max = 2000) => String(v ?? '').slice(0, max)
  const arr = (v: any) => (Array.isArray(v) ? v.slice(0, 50) : [])

  const out: any = {}
  if (input.site)
    out.site = pick(input.site, ['name', 'full_name', 'domain', 'tagline', 'description', 'logo_text', 'phone_display', 'phone_href', 'wa_display', 'wa_number', 'wa_default_text', 'email', 'address_short', 'address_full', 'maps_embed', 'maps_link', 'hours', 'badges'])
  if (input.hero)
    out.hero = input.hero
  if (input.marquee)
    out.marquee = arr(input.marquee).map((s: any) => str(s, 120)).filter(Boolean)
  if (input.programs)
    out.programs = input.programs
  if (input.gallery)
    out.gallery = {
      title_overline: str(input.gallery.title_overline, 120),
      title: str(input.gallery.title, 200),
      subtitle: str(input.gallery.subtitle, 500),
      items: arr(input.gallery.items).slice(0, 12).map((g: any) => ({
        src: str(g?.src, 500),
        title: str(g?.title, 200),
        desc: str(g?.desc, 300)
      })).filter((g: any) => g.src)
    }
  if (input.features)
    out.features = input.features
  if (input.steps)
    out.steps = input.steps
  if (input.terms)
    out.terms = input.terms
  if (input.testimonials)
    out.testimonials = input.testimonials
  if (input.faq)
    out.faq = input.faq
  if (input.cta)
    out.cta = input.cta
  if (input.contact)
    out.contact = input.contact
  if (input.theme && typeof input.theme === 'object') {
    const PALETTES = ['emerald', 'teal', 'blue', 'violet']
    const MODES = ['system', 'light', 'dark']
    out.theme = {
      palette: PALETTES.includes(input.theme.palette) ? input.theme.palette : 'emerald',
      default_mode: MODES.includes(input.theme.default_mode) ? input.theme.default_mode : 'system',
      show_switch: input.theme.show_switch !== false
    }
  }
  return out
}

export function makeAdminToken(password: string, secret: string) {
  return createHash('sha256').update(`blk-admin:${password}:${secret}`).digest('hex')
}

export function verifyAdminEvent(event: any, secret: string, expectedPassword: string): boolean {
  const header = getRequestHeader(event, 'authorization') || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : getRequestHeader(event, 'x-admin-token') as string
  if (!token)
    return false
  const expected = makeAdminToken(expectedPassword, secret)
  return token === expected
}

export function safeUploadFilename(original: string) {
  const base = basename(original || 'upload').toLowerCase().replace(/[^a-z0-9.\-_]+/g, '-').slice(0, 80) || 'foto'
  return `${Date.now()}-${base}`
}

export { UPLOAD_DIR }
