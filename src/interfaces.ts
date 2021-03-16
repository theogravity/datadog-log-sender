import TLS from 'tls'

export interface DataDogLogSenderConfig {
  /**
   * Datadog API key
   */
  apiKey: string
  /**
   * Datadog log intake hostname. Defaults to 'intake.logs.datadoghq.com'.
   */
  host?: string
  /**
   * Datadog log intake port. Defaults to 10516.
   */
  port?: number

  /**
   * Handler to capture errors. Attaches to the socket.on('error') event emitter.
   */
  onError?: OnErrorHandler

  /**
   * Root Authority Certificate to use in the event you are unable to connect to datadog due to SSL issues.
   * You may need up-to-date root certificates to connect.
   */
  ca?: string
}

export interface IDataDogLogSender {
  /**
   * Initializes the connection to DataDog. Must be called once before sending.
   */
  init(): Promise<TLS.TLSSocket>

  /**
   * Sends log data to datadog by stringify-ing the object.
   */
  sendObject<T = Record<string, any>>(logData: T)

  /**
   * Sends log data to datadog using a text string. Do *not* include a
   * newline at the end of your text.
   */
  sendText(logData: string)

  /**
   * Ends the connection to DataDog. Call this before terminating your application or
   * you'll be unable to terminate since the connection is still open.
   */
  close()
}

export type OnErrorHandler = (err: Error, socket: TLS.TLSSocket) => void
