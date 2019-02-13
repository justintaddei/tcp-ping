import { createServer } from 'net'
import { ping, probe } from '../src/index'

describe('Ping localhost', () => {
  test('Ping 127.0.0.1 on an open port', done => {
    expect.assertions(1)
    const server = createServer()

    server.on('listening', async () => {
      await expect(ping({ port: 8124 })).resolves.toBeInstanceOf(Object)
      server.close()
      done()
    })

    server.listen(8124)
  })

  test('Pinging 127.0.0.1 on a closed port times out', async done => {
    await expect(ping({ port: 8123, attempts: 3, timeout: 1000 })).resolves.toHaveProperty(
      ['errors', 0, 'error'],
      Error('Request timeout')
    )
    done()
  })
})

describe('Probe localhost', () => {
  test('Probe 127.0.0.1 on an open port', done => {
    expect.assertions(1)
    const server = createServer()

    server.on('listening', async () => {
      await expect(probe(8125)).resolves.toBe(true)
      server.close()
      done()
    })

    server.listen(8125)
  })

  test('Probe 127.0.0.1 on a closed port', async done => {
    await expect(probe(8123)).resolves.toBe(false)
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
