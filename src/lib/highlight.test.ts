import { describe, expect, it } from 'vitest'
import { highlight } from './highlight'

const typeOf = (source: string, value: string) =>
  highlight(source)
    .flat()
    .find((token) => token.value === value)?.type

describe('highlight', () => {
  it('splits the code into lines', () => {
    expect(highlight('a\nb\nc')).toHaveLength(3)
  })

  it('never loses a character', () => {
    const source = "@Component({ selector: 'app-card', template: `<p>{{ title }}</p>` })\nexport class Card {}"
    const rebuilt = highlight(source)
      .map((line) => line.map((token) => token.value).join(''))
      .join('\n')
    expect(rebuilt).toBe(source)
  })

  it('marks keywords, strings and function calls', () => {
    const source = "const name = format('Ana')"
    expect(typeOf(source, 'const')).toBe('keyword')
    expect(typeOf(source, 'format')).toBe('function')
    expect(typeOf(source, "'Ana'")).toBe('string')
  })

  it('tells HTML tags, components and attributes apart', () => {
    const source = 'return <div><Badge label="New" /></div>'
    expect(typeOf(source, 'div')).toBe('tag')
    expect(typeOf(source, 'Badge')).toBe('component')
    expect(typeOf(source, 'label')).toBe('attr')
  })

  it('does not mistake TypeScript generics for tags', () => {
    expect(typeOf('useState<number>(0)', 'number')).not.toBe('tag')
  })

  it('highlights the markup inside Angular inline templates', () => {
    expect(typeOf('template: `<section>{{ name }}</section>`', 'section')).toBe('tag')
    expect(typeOf('@Input() name = 1', '@Input')).toBe('decorator')
  })
})
