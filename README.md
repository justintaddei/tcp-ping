# tcp-ping

[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat)](https://github.com/prettier/prettier)
![](https://img.shields.io/github/issues-raw/justintaddei/tcp-ping.svg?style=flat)

A simple TCP ping util, written in Typescript, to test the connectivity of a host.

## Installation

```bash
$ npm install @network/tcp-ping --save
```

## Usage

`ping(options: IPingPartialOptions): Promise<IPingResult>`  
Pings the given host and returns an object containing the latency of the connection
and any errors that may have occured.

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
}).then(result => {
  console.log('ping result:', result)


    //ping result:
    {
        averageLatency: 19.2753,
        errors: [
            {
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
```

> **NOTE:** Attempts are not concurrent. As such if a host is unreachable and you provide options { attempts: 60, timeout: 1000 } then `ping` will not resolve for a full minute!

`probe(port: number, address: string = '127.0.0.1', timeout: number = 3000): Promise<boolean>`  
Makes one attempt to reach the host and return a boolean indicating whether it was successful or not

```typescript
import { probe } from '@network/tcp-ping'

probe(80, '192.168.1.47', 500).then(hostReachable => {
  if (hostReachable) console.log('The host is reachable 🙌')
  else console.log('The host is not reachable 🤐')
})
```
