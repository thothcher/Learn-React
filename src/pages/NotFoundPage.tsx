import { ArrowLeft, Compass, TriangleAlert } from 'lucide-react'
import { isRouteErrorResponse, Link, useRouteError } from 'react-router'
import styles from './NotFoundPage.module.css'

export function NotFoundPage() {
  return (
    <section className={`container ${styles.page}`}>
      <title>Page not found · Refract</title>
      <span className={styles.icon}>
        <Compass size={28} />
      </span>
      <p className={styles.code}>404</p>
      <h1 className={styles.title}>This route has no page.tsx</h1>
      <p className={styles.text}>
        The page you are looking for does not exist. Maybe it moved, or maybe the URL has a typo.
      </p>
      <Link to="/" className="btn btn-primary">
        <ArrowLeft size={18} />
        Back to home
      </Link>
    </section>
  )
}

export function RouteErrorPage() {
  const error = useRouteError()
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : 'Something went wrong.'

  return (
    <section className={`container ${styles.page}`}>
      <span className={styles.icon} data-tone="danger">
        <TriangleAlert size={28} />
      </span>
      <h1 className={styles.title}>An error boundary caught this</h1>
      <p className={styles.text}>{message}</p>
      <a href={import.meta.env.BASE_URL} className="btn btn-primary">
        Reload the app
      </a>
    </section>
  )
}
