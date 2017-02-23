'use strict'

const amqp = require('amqplib')

let _channel = null
let _conn = null
let app = null

describe('ActiveMQ Connector Test', () => {
  before('init', () => {
    process.env.ACCOUNT = 'adinglasan'
    process.env.CONFIG = '{"host":"localhost", "port":"8161", "username":"admin", "password":"admin", "defaultMessageType":"queue", "defaultMessage":"This is a default message from Apache ActiveMQ Plugin.", "topicQueueName":"default"}'
    process.env.INPUT_PIPE = 'ip.activemq'
    process.env.LOGGERS = 'logger1, logger2'
    process.env.EXCEPTION_LOGGERS = 'ex.logger1, ex.logger2'
    process.env.BROKER = 'amqp://guest:guest@127.0.0.1/'

    amqp.connect(process.env.BROKER)
      .then((conn) => {
        _conn = conn
        return conn.createChannel()
      }).then((channel) => {
        _channel = channel
      }).catch((err) => {
        console.log(err)
      })
  })

  after('close connection', function (done) {
    _conn.close()
    done()
  })

  describe('#start', function () {
    it('should start the app', function (done) {
      this.timeout(10000)
      app = require('../app')
      app.once('init', done)
    })
  })

  describe('#data', () => {
    it('should send data to third party client', function (done) {
      this.timeout(15000)

      let data = {
        title: 'test meesage',
        data: 'this is a test message from activemq connector',
        messageType: 'queue'
      }

      _channel.sendToQueue('ip.activemq', new Buffer(JSON.stringify(data)))
      setTimeout(done, 10000)
    })
  })
})
