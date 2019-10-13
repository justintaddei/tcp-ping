# tcp-ping

![](https://img.shields.io/travis/justintaddei/tcp-ping.svg?style=flat)
![](https://img.shields.io/github/issues-raw/justintaddei/tcp-ping.svg?style=flat)
![](https://img.shields.io/npm/v/@network-utils/tcp-ping.svg?style=flat)
![](https://img.shields.io/npm/dt/@network-utils/tcp-ping.svg?style=flat)
![](https://img.shields.io/npm/l/@network-utils/tcp-ping.svg?style=flat)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat)](https://github.com/prettier/prettier)
![](https://img.shields.io/github/languages/top/justintaddei/tcp-ping.svg?colorB=blue&style=flat)
![](https://img.shields.io/badge/status-awesome-red.svg?style=flat)

A simple promise-based TCP ping util, written in Typescript, to test the reachability and latency of a host.

## Installation

```bash
$ npm install @network-utils/tcp-ping --save
```

## Usage

### `ping(options?: Partial<IPingOptions>, progress?: (progress, total) => void): Promise<IPingResult>`

Pings the given host and returns an object containing the latency of the connection
and any errors that may have occured.

> **NOTE:** Attempts are not concurrent. As such if a host is unreachable and you provide options { attempts: 60, timeout: 1000 } then `ping` will not resolve for a full minute!

```typescript
import { ping } from '@network/tcp-ping'

ping({
  // The IP address of the host you want
  // to ping. Defaults to 127.0.0.1 (localhost)
  address: '192.168.1.47',
  // How many times do you want want to
  // attempt to reach the host? Default is 10
  attempts: 10,
  // What port do you want to connect on?
  // Default is 80
  port: 80,
  // How long do you want to wait (in milliseconds)
  // before assuming an attempt has failed?
  // Default is 3000 (3 seconds)
  timeout: 3000
}, update).then(result => {
  console.log('ping result:', result)


    // ping result:
    {
      averageLatency: 19.2753,
      errors: [
        {
          // Which attempt failed
          attempt: 3,
          error: Error('Request timeout')
        }
      ],
      maximumLatency: 35.1978,
      minimumLatency: 3.7716,
      options: {
        address: '192.168.1.47',
        attempts: 10,
        port: 80,
        timeout: 3000
      }
    }
})

function update(progress, total) {
  console.log(progress, '/', total)
  /*
    1 / 10
    2 / 10
    3 / 10
    ...
  */
}
```

### `probe(port: number, address?: string, timeout?: number): Promise<boolean>`

Makes one attempt to reach the host and returns a `boolean` indicating whether or not it was successful.  
If `address` is not provided it will default to `'127.0.0.1'`.  
If `timeout` is not provided it will default to `3000`.

```typescript
import { probe } from '@network/tcp-ping'

probe(80, '192.168.1.47', 500).then(hostReachable => {
  if (hostReachable) console.log('The host is reachable 🙌')
  else console.log('The host is not reachable 🤐')
})

// Or

const hostReachable = await probe(80, '192.168.1.47', 500)
```

## Errors

- All methods will throw a `"Negative port"` error if `port < 1`.

---

## Testing

```bash
$ git clone https://github.com/justintaddei/tcp-ping.git
$ cd tcp-ping
$ npm install
$ npm test
```

## License

MIT
