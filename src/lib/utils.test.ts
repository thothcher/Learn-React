import { describe, expect, it } from 'vitest'
import { code, cx, formatTime, percent, shuffle } from './utils'

describe('code', () => {
  it('removes the indentation shared by every line', () => {
    const sample = code`
      function App() {
        return null
      }
    `
    expect(sample).toBe('function App() {\n  return null\n}')
  })

  it('keeps blank lines and deeper indentation', () => {
    const sample = code`
      const a = 1

        const b = 2
    `
    expect(sample).toBe('const a = 1\n\n  const b = 2')
  })
})

describe('helpers', () => {
  it('joins only truthy class names', () => {
    expect(cx('a', false, null, undefined, 'b')).toBe('a b')
  })

  it('rounds percentages and handles an empty total', () => {
    expect(percent(1, 3)).toBe(33)
    expect(percent(0, 0)).toBe(0)
  })

  it('formats seconds as m:ss', () => {
    expect(formatTime(5)).toBe('0:05')
    expect(formatTime(65)).toBe('1:05')
  })

  it('shuffles into a new array with the same items', () => {
    const items = [1, 2, 3, 4, 5]
    const shuffled = shuffle(items)
    expect(shuffled).not.toBe(items)
    expect([...shuffled].sort()).toEqual(items)
    expect(items).toEqual([1, 2, 3, 4, 5])
  })
})
