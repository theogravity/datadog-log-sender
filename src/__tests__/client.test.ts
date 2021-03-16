/* eslint-env jest */
import TLS from 'tls'
import selfSigned from 'openssl-self-signed-certificate'
import { DataDogLogSender } from '../client'

const TEST_KEY = 'test-key'

const PORT = 10516
const HOST = 'localhost'

const { key, cert } = selfSigned

const queue = []

let server

beforeAll(done => {
  server = TLS.createServer(
    {
      key,
      cert
    },
    socket => {
      socket.on('data', data => {
        queue.push(data.toString())
      })
    }
  )

  server.listen(PORT, HOST, function () {
    console.log('Mock socket server listening at %s, on port %s', HOST, PORT)
    done()
  })
})

afterAll(() => {
  server.close()
})

describe('Datadog log sending client', () => {
  it('should send data', async done => {
    const logSender = new DataDogLogSender({
      host: HOST,
      port: PORT,
      apiKey: TEST_KEY,
      ca: cert
    })

    const socket = await logSender.init()

    socket.on('end', () => {
      expect(queue).toMatchSnapshot()
      done()
    })

    logSender.sendText('Unstructured log data')

    logSender.sendObject({
      message: 'JSON formatted log sent through TLS',
      ddtags: 'env:dd-send-log',
      ddsource: 'terminal',
      hostname: 'gs-hostame',
      service: 'user'
    })

    logSender.sendObject({
      message: 'JSON formatted log sent through TLS 2',
      ddtags: 'env:dd-send-log',
      ddsource: 'terminal',
      hostname: 'gs-hostame',
      service: 'user'
    })

    logSender.close()
  })

  it('should throw if the apiKey is not defined', () => {
    expect(() => {
      // @ts-expect-error
      new DataDogLogSender({})
    }).toThrowError()
  })

  it('should throw if init is not called', () => {
    const c = new DataDogLogSender({ apiKey: 'abcd' })
    expect(() => {
      c.sendText('test')
    }).toThrowError()
  })

  it('should throw if the CA is invalid', async done => {
    const logSender = new DataDogLogSender({
      host: HOST,
      port: PORT,
      apiKey: TEST_KEY,
      onError: (err, socket) => {
        expect(err).toBeDefined()
        done()
      }
    })

    await logSender.init()
  })
})
