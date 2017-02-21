'use strict'

const amqp = require('amqplib')

let should = require('should')
let cp = require('child_process')
let _channel = null
let _conn = null
let connector = null

describe('ActiveMQ Connector Test', () => {
  before('init', () => {
    process.env.ACCOUNT = 'adinglasan'
    process.env.CONFIG = '{"host":"localhost", "port":"8161", "username":"admin", "password":"admin", "default_message_type":"queue", "default_message":"This is a default message from Apache ActiveMQ Plugin.", "topic_queue_name":"default"}'
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

  after('terminate child process', function (done) {
    this.timeout(8000)

    setTimeout(function () {
      _conn.close()
      connector.kill('SIGKILL')
      done()
    }, 5000)
  })

  describe('#spawn', function () {
    it('should spawn a child process', function () {
      should.ok(connector = cp.fork(process.cwd()), 'Child process not spawned.')
    })
  })

  describe('#data', () => {
    it('should send data to third party client', (done) => {
      let data = {
        title: 'test meesage',
        data: 'this is a test message from activemq connector'
      }

      _channel.sendToQueue('ip.activemq', new Buffer(JSON.stringify(data)))
      done()
    })
  })
})
