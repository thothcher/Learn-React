import { Check, Copy } from 'lucide-react'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { highlight } from '../../lib/highlight'
import { cx } from '../../lib/utils'
import styles from './CodeBlock.module.css'

interface CodeBlockProps {
  code: string
  label?: ReactNode
  /** Hides the title bar; used for short snippets inside questions. */
  bare?: boolean
  className?: string
}

export function CodeBlock({ code, label, bare = false, className }: CodeBlockProps) {
  const lines = useMemo(() => highlight(code), [code])

  return (
    <figure className={cx(styles.block, className)}>
      {!bare && (
        <figcaption className={styles.bar}>
          <span className={styles.label}>{label ?? 'Code'}</span>
          <CopyButton text={code} />
        </figcaption>
      )}
      <pre className={cx(styles.pre, bare && styles.preBare)}>
        <code>
          {lines.map((line, lineIndex) => (
            <span key={lineIndex}>
              {line.map((token, tokenIndex) =>
                token.type === 'plain' ? (
                  token.value
                ) : (
                  <span key={tokenIndex} className={`tok-${token.type}`}>
                    {token.value}
                  </span>
                ),
              )}
              {lineIndex < lines.length - 1 && '\n'}
            </span>
          ))}
        </code>
      </pre>
    </figure>
  )
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timeout = setTimeout(() => setCopied(false), 1600)
    return () => clearTimeout(timeout)
  }, [copied])

  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
    } catch {
      // Clipboard access can be blocked; the code is still selectable.
    }
  }

  return (
    <button type="button" className={styles.copy} onClick={copy} aria-label="Copy code">
      {copied ? <Check size={14} /> : <Copy size={14} />}
      <span>{copied ? 'Copied' : 'Copy'}</span>
    </button>
  )
}
