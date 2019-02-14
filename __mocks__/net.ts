import { EventEmitter } from 'events'

export class Socket extends EventEmitter {
  private timeout: NodeJS.Timeout = setTimeout(() => null, 1)
  public connect(port: number, address: string, cb: () => void) {
    if (port === 2) return
    if (this.timeout) clearTimeout(this.timeout)
    setTimeout(cb, 150)
  }

  public setTimeout(mils: number, cb: () => void) {
    this.timeout = setTimeout(cb, mils)
  }

  public destroy() {
    if (this.timeout) clearTimeout(this.timeout)
  }
}

export function isIP(ip: string) {
  if (ip === '127.0.0.1') return true
  else return false
}
