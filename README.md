# datadog-log-sender

[![NPM version](https://img.shields.io/npm/v/datadog-log-sender.svg?style=flat-square)](https://www.npmjs.com/package/datadog-log-sender)
[![CircleCI](https://circleci.com/gh/theogravity/datadog-log-sender.svg?style=svg)](https://circleci.com/gh/theogravity/datadog-log-sender)
![built with typescript](https://camo.githubusercontent.com/92e9f7b1209bab9e3e9cd8cdf62f072a624da461/68747470733a2f2f666c61742e62616467656e2e6e65742f62616467652f4275696c74253230576974682f547970655363726970742f626c7565)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

Sends logs to Datadog using the secure socket method described [here](https://docs.datadoghq.com/getting_started/logs/).

This is useful if you are unable to install the DataDog Agent to consume logs.

You should generally use the DataDog Agent for log consumption for performance reasons.

This code has 100% code coverage!

<!-- TOC -->

- [Installation](#installation)
- [Usage](#usage)
- [API](#api)
  - [Class `DataDogLogSender`](#class-datadoglogsender)
    - [Options](#options)
    - [Methods](#methods)
- [Troubleshooting](#troubleshooting)
  - [I'm not seeing a response from the datadog connection](#im-not-seeing-a-response-from-the-datadog-connection)
  - [I get `connect ECONNREFUSED` from the `onError` handler](#i-get-connect-econnrefused-from-the-onerror-handler)

<!-- TOC END -->

## Installation

- Obtain a DataDog API key from [here](https://app.datadoghq.com/account/settings#api)

`$ npm i datadog-log-sender --save`

## Usage

```typescript
import {DataDogLogSender} from 'datadog-log-sender'

const ddLogSender = new DataDogLogSender({
  // the host and port are defaulted to the datadog recommended ones
  apiKey: 'your-api-key',
  onError: (err, socket) => {
    console.log(err)
    // maybe you want to end the connection depending on the error
    socket.end()
  }
})

// socket is an instance of TLS.TLSSocket
// see: https://nodejs.org/api/tls.html#tls_class_tls_tlssocket
// this is useful if you want to add any additional event handlers
// like socket.on('...')
const socket = await ddLogSender.init()

// send a structured log
ddLogSender.sendObject({
  "message": "My log message",
  "ddtags": "env:dev",
  "ddsource": "terminal",
  "hostname": "gs-hostame",
  "service": "user"
})

// send a single line of text
ddLogSender.sendText('This is a text log')

// close the connection once you are done sending all your logs
ddLogSender.close()
```

## API

### Class `DataDogLogSender` 

`new DataDogLogSender(options)`

#### Options

```typescript
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
  onError?: (err, socket) => void

  /**
   * Root Authority Certificate to use in the event you are unable to connect to datadog due to SSL issues.
   * You may need up-to-date root certificates to connect.
   */
  ca?: string
}
```

#### Methods

```typescript
export interface IDataDogLogSender {
  /**
   * Initializes the connection to DataDog. Must be called once before sending.
   */
  init() : Promise<TLS.TLSSocket>

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
```

## Troubleshooting

### I'm not seeing a response from the datadog connection

This is normal. Datadog does not write a response back.

### I get `connect ECONNREFUSED` from the `onError` handler

You can verify that you can connect by using the following command:

`$ openssl s_client -connect intake.logs.datadoghq.com:10516`

The output should look like this

```
CONNECTED(00000006)
depth=3 C = GB, ST = Greater Manchester, L = Salford, O = Comodo CA Limited, CN = AAA Certificate Services
verify return:1
depth=2 C = US, ST = New Jersey, L = Jersey City, O = The USERTRUST Network, CN = USERTrust RSA Certification Authority
verify return:1
depth=1 C = GB, ST = Greater Manchester, L = Salford, O = Sectigo Limited, CN = Sectigo RSA Domain Validation Secure Server CA
verify return:1
depth=0 CN = *.logs.datadoghq.com
verify return:1
---
Certificate chain
 0 s:/CN=*.logs.datadoghq.com
   i:/C=GB/ST=Greater Manchester/L=Salford/O=Sectigo Limited/CN=Sectigo RSA Domain Validation Secure Server CA
 1 s:/C=GB/ST=Greater Manchester/L=Salford/O=Sectigo Limited/CN=Sectigo RSA Domain Validation Secure Server CA
   i:/C=US/ST=New Jersey/L=Jersey City/O=The USERTRUST Network/CN=USERTrust RSA Certification Authority
 2 s:/C=US/ST=New Jersey/L=Jersey City/O=The USERTRUST Network/CN=USERTrust RSA Certification Authority
   i:/C=GB/ST=Greater Manchester/L=Salford/O=Comodo CA Limited/CN=AAA Certificate Services
---
Server certificate
-----BEGIN CERTIFICATE-----
...
-----END CERTIFICATE-----
subject=/CN=*.logs.datadoghq.com
issuer=/C=GB/ST=Greater Manchester/L=Salford/O=Sectigo Limited/CN=Sectigo RSA Domain Validation Secure Server CA
---
No client certificate CA names sent
Server Temp Key: ECDH, P-256, 256 bits
---
SSL handshake has read 5092 bytes and written 322 bytes
---
New, TLSv1/SSLv3, Cipher is ECDHE-RSA-AES128-GCM-SHA256
Server public key is 2048 bit
Secure Renegotiation IS supported
Compression: NONE
Expansion: NONE
No ALPN negotiated
SSL-Session:
    Protocol  : TLSv1.2
    Cipher    : ECDHE-RSA-AES128-GCM-SHA256
    Session-ID: C23CBE5452D372EE5A63A0D4199E543218CD404725BC3718239603B54E3C568B
    Session-ID-ctx: 
    Master-Key: 440CB8AC718AB9F48C3DA9F064315C899F2CB6538138E53F3EA9CDF8E4E77C56EDDEF3FBA51B4B2AFAAF6D9C9FD93893
    Start Time: 1615862093
    Timeout   : 7200 (sec)
    Verify return code: 0 (ok)
---
```

If you are still unable to connect using the library, it is possible your certificate store may not have the latest root certificates. Node.js has the store
baked in, so if you're using an old version, it is very possible they contain expired root certificates.

You can get an up-to-date certificate store, such as [`node_extra_ca_certs_mozilla_bundle`](https://www.npmjs.com/package/node_extra_ca_certs_mozilla_bundle),
and feed in the contents of the `ca_intermediate_root_bundle.pem` file in the `ca` parameter of this library.
