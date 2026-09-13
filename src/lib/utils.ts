export function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

export function shuffle<T>(items: readonly T[]): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/**
 * Tagged template for code samples: strips the leading newline and the
 * indentation shared by every line, so snippets can be indented with the data.
 */
export function code(strings: TemplateStringsArray, ...values: unknown[]) {
  const text = strings.reduce(
    (acc, part, i) => acc + part + (i < values.length ? String(values[i]) : ''),
    '',
  )
  const lines = text.replace(/^\n/, '').replace(/\s+$/, '').split('\n')
  const indent = Math.min(
    ...lines.filter((line) => line.trim()).map((line) => line.match(/^ */)![0].length),
  )
  return lines.map((line) => line.slice(indent)).join('\n')
}

export function percent(part: number, total: number) {
  return total === 0 ? 0 : Math.round((part / total) * 100)
}

export function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}
