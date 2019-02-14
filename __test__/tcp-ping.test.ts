jest.mock('net')

import { ping, probe } from '../src/index'

describe('Ping localhost', () => {
  test('Ping 127.0.0.1 on an open port', async done => {
    await expect(ping({ port: 1 })).resolves.toBeInstanceOf(Object)
    done()
  })

  test('Pinging 127.0.0.1 on a closed port times out', async done => {
    await expect(ping({ port: 2, attempts: 3, timeout: 1000 })).resolves.toHaveProperty(
      ['errors', 0, 'error'],
      Error('Request timeout')
    )
    done()
  })
})

describe('Probe localhost', () => {
  test('Probe 127.0.0.1 on an open port', async done => {
    await expect(probe(1)).resolves.toBe(true)
    done()
  })

  test('Probe 127.0.0.1 on a closed port', async done => {
    await expect(probe(2)).resolves.toBe(false)
    done()
  })
})

describe('Valid options', () => {
  test('Throws "Invalid IP" error when an invalid IP is given', async done => {
    await expect(ping({ address: 'not an ip address' })).rejects.toThrowError('Invalid IP')
    await expect(probe(80, 'not an ip address')).rejects.toThrowError('Invalid IP')
    done()
  })

  test('Throws "Negative port" error when the port is less than 1', async done => {
    await expect(ping({ port: 0 })).rejects.toThrowError('Negative port')
    await expect(ping({ port: -100 })).rejects.toThrowError('Negative port')
    await expect(probe(0)).rejects.toThrowError('Negative port')
    await expect(probe(-100)).rejects.toThrowError('Negative port')
    done()
  })
})
