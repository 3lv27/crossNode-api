'use strict'

// Dependencies
const http = require('http')
const https = require('https')
const url = require('url')
const StringDecoder = require('string_decoder').StringDecoder
const config = require('./config')
const fs = require('fs')

// Instantiate the HTTP server
const httpServer = http.createServer((req, res) => {
  serverLogic(req, res)
})

// Start the HTTP server
httpServer.listen (config.httpPort, () => {
  console.log('> HTTP server listening on port', config.httpPort, 'in', config.envName, 'mode')
})

// Instantiate the HTTPS server
const httpsServerOptions = {
  key: fs.readFileSync('./https/key.pem'),
  cert: fs.readFileSync('./https/cert.pem'),
}
const httpsServer = https.createServer((req, res) => {
  serverLogic(req, res)
})

// Start the HTTPS server
httpsServer.listen(config.httpsPort, () => {
  console.log('> HTTPS server listening on port', config.httpsPort, 'in', config.envName, 'mode')
})

// Server logic for both the http and https servers
function serverLogic (req, res) {
  // Get the URL and parse it 
  const parsedUrl = url.parse(req.url, true)

  // Get the path already trimmed
  const path = parsedUrl.pathname.replace(/^\/+|\/+$/g, '')

  //Get the query string as an object
  const queryStringObject = parsedUrl.query

  // Get the HTTP method
  const method = req.method.toLowerCase()

  // Get the headers as an object
  const headers = req.headers

  // Get the payload, if any
  const decoder = new StringDecoder('utf-8')
  let buffer = ''
  req.on('data', data => buffer += decoder.write(data))

  // On request end event, preparing the response
  req.on('end', () => {
    buffer += decoder.end()

    // Choose the handler this request should go to. If one is not found use the notFound handler
    const chosenHandler = typeof (router[path]) !== 'undefined' ? router[path] : handlers.notFound

    // Construct the data object to send to the handler
    const data = {
      path: path,
      queryString: queryStringObject,
      method: method,
      header: headers,
      body: buffer
    }

    //** Route the request to the handler specified in the router
    chosenHandler(data, (statusCode, payload) => {

      statusCode = typeof(statusCode) === 'number' ? statusCode : 200
      payload = typeof(payload) === 'object' ? payload : {}
      payload = JSON.stringify(payload)

      //Return the response
      res.setHeader('Content-Type', 'application/json')
      res.writeHead(statusCode)
      res.end(payload)

      console.log('Returning this respionse:',statusCode, payload)

    })
  }) 
}

// ** Define the router handlers 
let handlers = {}

// Hello handler
handlers.hello = function (data, callback) {
  callback(200, {status: 1, data:'Hello beloved user'})
}

//Not found handler
handlers.notFound = function (data, callback) {
  callback(404, {status: 0, info:'Page not found'})
}

// ** Define a request router
const router = {
  hello: handlers.hello 
}