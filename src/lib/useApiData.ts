import { useCallback, useEffect, useState } from 'react'
import { asApiError, type ApiError } from './api'

interface ApiResult<T> {
  request: string
  data: T | null
  error: ApiError | null
}

/**
 * Loads data when the component mounts and whenever `key` changes, like the fetch-in-effect
 * pattern from week 5. Each result remembers which request it answers, so loading is derived
 * during render and late answers for an old key are ignored.
 */
export function useApiData<T>(load: () => Promise<T>, key: string) {
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState<ApiResult<T> | null>(null)
  const request = `${key}#${attempt}`

  useEffect(() => {
    let ignore = false

    load()
      .then((data) => {
        if (!ignore) setResult({ request, data, error: null })
      })
      .catch((error: unknown) => {
        if (!ignore) setResult({ request, data: null, error: asApiError(error) })
      })

    return () => {
      ignore = true
    }
    // `load` is usually an inline function; `request` says when the request really changes.
  }, [request]) // eslint-disable-line react-hooks/exhaustive-deps

  const current = result?.request === request ? result : null
  const reload = useCallback(() => setAttempt((value) => value + 1), [])

  return { data: current?.data ?? null, error: current?.error ?? null, loading: current === null, reload }
}
