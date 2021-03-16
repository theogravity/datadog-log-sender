import TLS from 'tls'

import { DataDogLogSenderConfig, IDataDogLogSender } from './interfaces'

const DEFAULT_DD_HOST = 'intake.logs.datadoghq.com'
const DEFAULT_DD_PORT = 10516

export class DataDogLogSender implements IDataDogLogSender {
  protected client: TLS.TLSSocket
  protected _config: DataDogLogSenderConfig
  protected _connectCalled: boolean

  constructor (config: DataDogLogSenderConfig) {
    if (!config.apiKey) {
      throw new Error('DataDogLogSender apiKey config not defined')
    }

    this.client = null
    this._config = config
    this._connectCalled = false
  }

  /**
   * Initializes the connection to DataDog. Must be called once before sending.
   */
  async init (): Promise<TLS.TLSSocket> {
    return new Promise(resolve => {
      this.client = TLS.connect(
        {
          host: DEFAULT_DD_HOST,
          port: DEFAULT_DD_PORT,
          rejectUnauthorized: true,
          ...this._config
        },
        () => {
          this.client.setKeepAlive(true)
          this.client.setEncoding('utf-8')
          this._connectCalled = true
          resolve(this.client)
        }
      )

      if (this._config.onError) {
        this.client.on('error', err => {
          this._config.onError(err, this.client)
        })
      }
    })
  }

  protected assembleData (logData: string) {
    return `${this._config.apiKey} ${logData}`
  }

  /**
   * Sends log data to datadog by stringify-ing the object.
   */
  sendObject<T = Record<string, any>> (logData: T): this {
    return this.sendText(JSON.stringify(logData))
  }

  /**
   * Sends log data to datadog using a text string. Do *not* include a
   * newline at the end of your text.
   */
  sendText (logData: string): this {
    if (!this._connectCalled) {
      throw new Error('Call DataDogLogSender#init() first before sending data')
    }

    this.client.write(this.assembleData(logData) + '\n')
    return this
  }

  /**
   * Ends the connection to DataDog
   */
  close () {
    this.client.end()
    this.client = null
  }
}
