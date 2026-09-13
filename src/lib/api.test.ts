import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiError, authApi, onUnauthorized, progressApi } from './api'

function respondWith(status: number, body?: unknown) {
  return vi.fn(async () => new Response(body === undefined ? null : JSON.stringify(body), { status }))
}

afterEach(() => {
  vi.unstubAllGlobals()
  onUnauthorized(null)
})

describe('api client', () => {
  it('returns parsed JSON', async () => {
    vi.stubGlobal('fetch', respondWith(200, { lessons: [], projects: [], scores: [] }))

    await expect(progressApi.get()).resolves.toEqual({ lessons: [], projects: [], scores: [] })
  })

  it('resolves empty responses without a body', async () => {
    vi.stubGlobal('fetch', respondWith(204))

    await expect(progressApi.setLesson('jsx', true)).resolves.toBeUndefined()
  })

  it('sends JSON and the right method', async () => {
    const fetchMock = respondWith(204)
    vi.stubGlobal('fetch', fetchMock)

    await progressApi.setProject(3, false)
    await authApi.forgotPassword('ana@example.com')

    expect(fetchMock).toHaveBeenNthCalledWith(1, '/api/progress/projects/3', expect.objectContaining({ method: 'DELETE' }))
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      '/api/auth/forgot-password',
      expect.objectContaining({ method: 'POST', body: JSON.stringify({ email: 'ana@example.com' }) }),
    )
  })

  it('turns problem details into an ApiError', async () => {
    vi.stubGlobal(
      'fetch',
      respondWith(401, { title: 'Wrong email or password', detail: 'Check your details and try again.', code: 'InvalidCredentials' }),
    )

    const error = await authApi.login({ email: 'ana@example.com', password: 'nope', rememberMe: false }).catch((e: unknown) => e)

    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({
      status: 401,
      code: 'InvalidCredentials',
      title: 'Wrong email or password',
      message: 'Check your details and try again.',
    })
  })

  it('exposes field errors from validation problems', async () => {
    vi.stubGlobal('fetch', respondWith(400, { title: 'One or more validation errors occurred.', errors: { email: ['Enter a valid email address.'] } }))

    const error = (await authApi.register({ displayName: 'Ana', email: 'x', password: 'long enough' }).catch((e: unknown) => e)) as ApiError

    expect(error.hasFieldErrors).toBe(true)
    expect(error.fieldErrors.email).toEqual(['Enter a valid email address.'])
  })

  it('uses a friendly message when the server sends no details', async () => {
    vi.stubGlobal('fetch', respondWith(429))

    await expect(authApi.login({ email: 'a@b.co', password: 'x', rememberMe: false })).rejects.toMatchObject({
      status: 429,
      message: 'Too many attempts. Wait a minute and try again.',
    })
  })

  it('reports a network failure as status 0', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new TypeError('Failed to fetch')
      }),
    )

    await expect(progressApi.get()).rejects.toMatchObject({ status: 0 })
  })

  it('signals an ended session, but not a failed login', async () => {
    const handler = vi.fn()
    onUnauthorized(handler)
    vi.stubGlobal('fetch', respondWith(401, { title: 'Unauthorized' }))

    await authApi.login({ email: 'ana@example.com', password: 'nope', rememberMe: false }).catch(() => {})
    await authApi.me().catch(() => {})
    expect(handler).not.toHaveBeenCalled()

    await progressApi.get().catch(() => {})
    expect(handler).toHaveBeenCalledTimes(1)
  })
})
