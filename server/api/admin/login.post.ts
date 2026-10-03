import { makeAdminToken } from '../../utils/landing'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const password = String(body?.password ?? '')
  const config = useRuntimeConfig()
  const real = String(config.adminPassword || 'admin123')
  const secret = String(config.adminTokenSecret || 'blk-secret')

  if (!password || password !== real) {
    throw createError({ statusCode: 401, message: 'Password salah' })
  }
  return {
    token: makeAdminToken(real, secret),
    message: 'Login berhasil'
  }
})
