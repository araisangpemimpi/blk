import { resetOverrideLanding, verifyAdminEvent } from '../../utils/landing'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  if (!verifyAdminEvent(event, String(config.adminTokenSecret), String(config.adminPassword))) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }
  await resetOverrideLanding()
  return { ok: true, message: 'Kustomisasi dihapus — kembali ke content/landing.yml' }
})
