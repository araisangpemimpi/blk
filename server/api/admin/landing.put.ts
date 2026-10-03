import { verifyAdminEvent, writeOverrideLanding } from '../../utils/landing'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  if (!verifyAdminEvent(event, String(config.adminTokenSecret), String(config.adminPassword))) {
    throw createError({ statusCode: 401, message: 'Unauthorized — silakan login ulang' })
  }
  const body = await readBody(event)
  if (!body || typeof body !== 'object') {
    throw createError({ statusCode: 400, message: 'Payload kosong' })
  }
  const saved = await writeOverrideLanding(body)
  return { ok: true, message: 'Landing page tersimpan', updatedAt: saved.__updatedAt }
})
