export type TokenType =
  | 'plain'
  | 'comment'
  | 'keyword'
  | 'string'
  | 'number'
  | 'tag'
  | 'component'
  | 'attr'
  | 'function'
  | 'decorator'
  | 'punct'

export interface Token {
  type: TokenType
  value: string
}

const KEYWORDS = new Set(
  (
    'const let var function return if else for while do switch case break continue new class ' +
    'extends implements interface type enum export import from default as async await try catch ' +
    'finally throw typeof instanceof in of this null undefined true false void readonly private ' +
    'public protected static satisfies keyof declare track'
  ).split(' '),
)

// Order matters: the first rule that matches at the current position wins.
const RULES: Array<[TokenType | 'template' | 'word' | 'tagOpen', RegExp]> = [
  ['comment', /\/\/[^\n]*|\/\*[\s\S]*?\*\/|<!--[\s\S]*?-->/y],
  ['template', /`(?:\\[\s\S]|[^`\\])*`/y],
  ['string', /"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'/y],
  ['decorator', /@[A-Za-z]\w*/y],
  ['tagOpen', /<\/?[A-Za-z][\w.-]*/y],
  ['attr', /(?:\[\(|\[|\(|\*|#)?[A-Za-z_][\w.-]*(?:\)\]|\]|\))?(?==["'{])/y],
  ['number', /\b\d[\d_.]*\b/y],
  ['word', /[A-Za-z_$][\w$]*/y],
  ['punct', /=>|[{}()[\];,.<>/=+\-*!?:&|%^~]+/y],
  ['plain', /\s+|[^\s]/y],
]

function tokenizeInto(source: string, out: Token[]) {
  let pos = 0
  while (pos < source.length) {
    for (const [kind, regex] of RULES) {
      regex.lastIndex = pos
      const match = regex.exec(source)
      if (!match) continue
      const value = match[0]

      if (kind === 'template') {
        const inner = value.slice(1, -1)
        if (/<[A-Za-z]/.test(inner)) {
          // Angular inline templates: highlight the markup inside the backticks.
          out.push({ type: 'string', value: '`' })
          tokenizeInto(inner, out)
          out.push({ type: 'string', value: '`' })
        } else {
          out.push({ type: 'string', value })
        }
      } else if (kind === 'tagOpen') {
        // `useState<number>` is a generic, not a tag.
        const previous = source[pos - 1]
        if (previous && /[\w)\]]/.test(previous)) {
          out.push({ type: 'punct', value: '<' })
          pos += 1
          break
        }
        const slash = value.startsWith('</') ? 2 : 1
        const name = value.slice(slash)
        out.push({ type: 'punct', value: value.slice(0, slash) })
        out.push({ type: /^[A-Z]/.test(name) ? 'component' : 'tag', value: name })
      } else if (kind === 'word') {
        const next = source.slice(pos + value.length).match(/^\s*(\(|<)/)
        let type: TokenType = 'plain'
        if (KEYWORDS.has(value)) type = 'keyword'
        else if (next?.[1] === '(') type = 'function'
        else if (/^[A-Z]/.test(value)) type = 'component'
        out.push({ type, value })
      } else {
        out.push({ type: kind, value })
      }

      pos += value.length
      break
    }
  }
}

/** Splits code into lines of tokens, ready to render. */
export function highlight(source: string): Token[][] {
  const tokens: Token[] = []
  tokenizeInto(source, tokens)

  const lines: Token[][] = [[]]
  for (const token of tokens) {
    const parts = token.value.split('\n')
    parts.forEach((part, index) => {
      if (index > 0) lines.push([])
      if (part) lines[lines.length - 1].push({ type: token.type, value: part })
    })
  }
  return lines
}
