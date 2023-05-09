jest.mock('net')

import { ping, probe } from '../src/index'

describe('Ping localhost', () => {
  test('Ping 127.0.0.1 on an open port', async () => {
    expect.assertions(7)
    await expect(
      ping({ port: 1, attempts: 3 }, (progress, total) => {
        expect(total).toBe(3)
        expect(progress).toBeLessThanOrEqual(total)
      })
    ).resolves.toBeInstanceOf(Object)
  })

  test('Pinging 127.0.0.1 on a closed port times out', async () => {
    await expect(ping({ port: 2, attempts: 3, timeout: 1000 })).resolves.toHaveProperty(
      ['errors', 0, 'error'],
      Error('Request timeout')
    )
  })
})

describe('Probe localhost', () => {
  test('Probe 127.0.0.1 on an open port', async () => {
    await expect(probe(1)).resolves.toBe(true)
  })

  test('Probe 127.0.0.1 on a closed port', async () => {
    await expect(probe(2)).resolves.toBe(false)
  })
})

describe('Valid options', () => {
  // Removed to allow pinging hostnames
  /* test('Throws "Invalid IP" error when an invalid IP is given', async done => {
    await expect(ping({ address: 'not an ip address' })).rejects.toThrowError('Invalid IP')
    await expect(probe(80, 'not an ip address')).rejects.toThrowError('Invalid IP')
    
  }) */

  test('Throws "Negative port" error when the port is less than 1', async () => {
    await expect(ping({ port: 0 })).rejects.toThrowError('Negative port')
    await expect(ping({ port: -100 })).rejects.toThrowError('Negative port')
    await expect(probe(0)).rejects.toThrowError('Negative port')
    await expect(probe(-100)).rejects.toThrowError('Negative port')
  })
})
