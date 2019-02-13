import { isIP, Socket } from 'net'

/**
 * Ping Options
 */
export interface IPingOptions {
  /**
   * The IP address of the device being pinged
   */
  address: string
  /**
   * The port to ping
   */
  port: number
  /**
   * The number of times
   * `tcp-probe#ping` will attempt to connect to `address`
   */
  attempts: number
  /**
   * The time whichafter each TCP socket will timeout
   */
  timeout: number
}

/**
 * Ping Options
 */
export interface IPingUserOptions {
  /**
   * The IP address of the device being pinged
   */
  address?: string
  /**
   * The port to ping
   */
  port?: number
  /**
   * The number of times
   * `tcp-probe#ping` will attempt to connect to `address`
   */
  attempts?: number
  /**
   * The time whichafter each TCP socket will timeout
   */
  timeout?: number
}

/**
 * The result of ping attempt that failed
 */
export interface IPingError {
  /**
   * The number of the attempt
   */
  attempt: number
  /**
   * The error that occured
   */
  error: Error
}

/**
 * The results of a ping attempt
 */
export interface IPingResult {
  /**
   * The options that were used for this ping
   */
  options: IPingOptions
  /**
   * The average latency of this ping
   */
  averageLatency: number
  /**
   * The latency of the fastest attempt
   */
  minimumLatency: number
  /**
   * The latency of the slowest attempt
   */
  maximumLatency: number
  /**
   * All the ping attempts that failed
   */
  errors: IPingError[]
}

/**
 * The result of a connection attempt
 */
export interface IConnectionAttempt {
  /**
   * The number of this attempt
   */
  attemptNumber: number
  /**
   * The result of the connection
   */
  result: {
    /**
     * The time it took to connect (e.i. the latency of the connection)
     */
    time?: number
    /**
     * The `Error` that caused the connection to fail
     */
    error?: Error
  }
}

/**
 * Attempts to connect to the given host and returns the `IConnectionResult`
 * @param options The `IPingOptions` to use for this connection
 */
function connect({ address, port, timeout }: IPingOptions): Promise<IConnectionAttempt['result']> {
  return new Promise(resolve => {
    // Create a new tcp scoket
    const socket = new Socket()
    // Save the current time so we can calculate latency
    const startTime = process.hrtime()

    // Connect to the given host
    socket.connect(port, address, () => {
      // Calculate the latency of the connection
      const [seconds, nanoseconds] = process.hrtime(startTime)

      // Convert the latency from nanoseconds to milliseconds
      // so that the output is easier to work with
      const timeToConnect = (seconds * 1e9 + nanoseconds) / 1e6

      // We don't need the socket anymore
      // so we should destroy it
      socket.destroy()
      // Resolve with the latency of this attempt
      resolve({ time: timeToConnect })
    })

    // Make sure we catch any errors thrown by the socket
    socket.on('error', error => {
      // We don't need the socket anymore
      // so we should destroy it
      socket.destroy()
      // Resolve with the error
      resolve({ error })
    })

    // Set the timeout for the connection
    socket.setTimeout(timeout, () => {
      // We don't need the socket anymore
      // so we should destroy it
      socket.destroy()
      // Resolve with a timeout error
      resolve({ error: Error('Request timeout') })
    })
  })
}

/**
 * Pings the given device and report the statistics
 * in the form of an `IPingResult` object
 * @param options The `IPingOptions` object
 */
export async function ping(options?: IPingUserOptions): Promise<IPingResult> {
  // Default ping options
  const opts: IPingOptions = {
    address: '127.0.0.1',
    attempts: 10,
    port: 80,
    timeout: 3000,
    // Otherwrite default options
    ...options
  }

  // Make sure this is a real IP address
  if (!isIP(opts.address)) throw Error('Invalid IP')

  if (opts.port < 1) throw RangeError('Negative port')

  /**
   * An array of all the connection attempts
   */
  const connectionResults: IConnectionAttempt[] = []

  // Try to connect to the given host
  for (let i = 0; i < opts.attempts; i++)
    connectionResults.push({
      attemptNumber: i,
      result: await connect(opts)
    })

  /**
   * The result of this ping
   */
  const result: IPingResult = {
    averageLatency: NaN,
    errors: [],
    maximumLatency: 0,
    minimumLatency: Infinity,
    options: opts
  }

  /**
   * The sum of the latency of all
   * the successful ping attempts
   */
  let latencySum: number = 0

  // Loop over all the connection results
  for (const attempt of connectionResults) {
    // If `time` is undefined then
    // assume there's an error
    if (typeof attempt.result.time === 'undefined') {
      // Push the error onto the errors array
      result.errors.push({
        attempt: attempt.attemptNumber,
        // If error is undefined then throw an unknown error
        error: attempt.result.error || Error('Unknown error')
      })
      // We're done with this iteration
      continue
    }

    // Get the latency of this attempt
    const { time } = attempt.result

    // Add it to the sum
    latencySum += time

    // If this attempts latency is less
    // then the current `minimumLatency` then we
    // update `minimumLatency`
    if (time < result.minimumLatency) result.minimumLatency = time

    // If this attempts latency is greater
    // then the current `maximumLatency` then we
    // update `maximumLatency`
    if (time > result.maximumLatency) result.maximumLatency = time
  }

  // Calculate the average latency of all the attempts
  // (excluding the attempts that errored because those
  // didn't return a latency)
  result.averageLatency = latencySum / (connectionResults.length - result.errors.length)

  // Finally, resolve with the result
  return result
}

/**
 * Probes the given host to check if it is reachable
 * @param port The port to probe
 * @param address The address to probe
 * @param timeout The timeout of the probe
 */
export async function probe(port: number, address: string = '127.0.0.1', timeout: number = 3000): Promise<boolean> {
  // Ping the host
  const result = await ping({ address, port, timeout, attempts: 1 })

  // If there aren't any error then the device is reachable
  return result.errors.length === 0
}
