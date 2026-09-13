import styles from './Avatar.module.css'

const tones = ['primary', 'purple', 'warning', 'success', 'angular'] as const

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const letters = parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : (parts[0] ?? '?').slice(0, 2)
  return letters.toUpperCase()
}

export function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  // The same name always gets the same color.
  const tone = tones[[...name].reduce((sum, char) => sum + char.charCodeAt(0), 0) % tones.length]

  return (
    <span
      className={styles.avatar}
      data-tone={tone}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.38) }}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  )
}
