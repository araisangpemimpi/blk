import { readEffectiveLanding } from '../utils/landing'

export default defineEventHandler(async () => {
  const { data, customized, updatedAt } = await readEffectiveLanding()
  return { data, customized, updatedAt }
})
