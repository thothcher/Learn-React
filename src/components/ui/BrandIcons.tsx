interface IconProps {
  size?: number
  className?: string
}

export function GitHubIcon({ size = 20, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" className={className} aria-hidden="true">
      <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z" />
    </svg>
  )
}

export function ReactIcon({ size = 20, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="-11.5 -10.23 23 20.46" className={className} aria-hidden="true">
      <circle r="2.05" fill="currentColor" />
      <g stroke="currentColor" strokeWidth="1" fill="none">
        <ellipse rx="11" ry="4.2" />
        <ellipse rx="11" ry="4.2" transform="rotate(60)" />
        <ellipse rx="11" ry="4.2" transform="rotate(120)" />
      </g>
    </svg>
  )
}

export function AngularIcon({ size = 20, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 250 250" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M125 30 31.9 63.2l14.2 123.1L125 230l78.9-43.7 14.2-123.1L125 30Zm0 22.1-58.2 130.5h21.7l11.7-29.2h49.4l11.7 29.2H183L125 52.1Zm17 83.3h-34l17-40.9 17 40.9Z"
      />
    </svg>
  )
}

export function NextIcon({ size = 20, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M12 0a12 12 0 1 0 0 24 12 12 0 0 0 0-24ZM7.75 6.75h1.6l6.9 8.95V6.75h1.5v10.5h-1.45L9.25 9.2v8.05h-1.5V6.75Z"
      />
    </svg>
  )
}

export function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="var(--next)" />
      <ellipse
        cx="16"
        cy="16.5"
        rx="12"
        ry="4.6"
        transform="rotate(-28 16 16.5)"
        stroke="var(--react)"
        strokeWidth="2"
      />
      <path d="M16 7.5 23 21.5H9Z" fill="var(--next-contrast)" />
      <circle cx="16" cy="16.5" r="2.2" fill="var(--react)" />
    </svg>
  )
}
