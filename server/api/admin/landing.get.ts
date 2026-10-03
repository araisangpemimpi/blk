import { readEffectiveLanding, verifyAdminEvent } from '../../utils/landing'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  if (!verifyAdminEvent(event, String(config.adminTokenSecret), String(config.adminPassword))) {
    throw createError({ statusCode: 401, message: 'Unauthorized — silakan login ulang' })
  }
  const { data, customized, updatedAt } = await readEffectiveLanding()
  return { data, customized, updatedAt }
})
