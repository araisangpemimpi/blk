import { writeFile, mkdir } from 'node:fs/promises'
import { join, extname } from 'node:path'
import { UPLOAD_DIR, safeUploadFilename, verifyAdminEvent } from '../../utils/landing'

const ALLOWED = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'])

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  if (!verifyAdminEvent(event, String(config.adminTokenSecret), String(config.adminPassword))) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }
  const files = await readMultipartFormData(event)
  const file = files?.find(f => f.name === 'file' && f.data)
  if (!file || !file.data) {
    throw createError({ statusCode: 400, message: 'File tidak ditemukan (field: file)' })
  }
  const ext = extname(file.filename || '').toLowerCase()
  if (!ALLOWED.has(ext)) {
    throw createError({ statusCode: 400, message: 'Format harus jpg/png/webp/gif/svg' })
  }
  if (file.data.length > 4 * 1024 * 1024) {
    throw createError({ statusCode: 400, message: 'Maksimal 4MB' })
  }
  await mkdir(UPLOAD_DIR, { recursive: true })
  const name = safeUploadFilename(file.filename || `foto${ext}`)
  await writeFile(join(UPLOAD_DIR, name), file.data)
  return { ok: true, url: `/uploads/${name}` }
})
