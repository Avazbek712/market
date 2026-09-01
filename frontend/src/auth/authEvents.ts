type Listener = () => void

let listener: Listener | null = null

export function onUnauthorized(callback: Listener) {
  listener = callback
  return () => {
    if (listener === callback) listener = null
  }
}

export function emitUnauthorized() {
  listener?.()
}
