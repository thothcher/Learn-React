import { describe, expect, it } from 'vitest'
import { safeNextPath } from './navigation'

describe('safeNextPath', () => {
  it('keeps paths inside the site', () => {
    expect(safeNextPath('/teacher')).toBe('/teacher')
    expect(safeNextPath('/lessons/props?tab=quiz')).toBe('/lessons/props?tab=quiz')
  })

  it.each([null, '', 'https://evil.example', '//evil.example', '/\\evil.example', 'javascript:alert(1)'])(
    'falls back to the dashboard for %s',
    (value) => {
      expect(safeNextPath(value)).toBe('/dashboard')
    },
  )
})
