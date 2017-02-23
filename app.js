'use strict'

let reekoh = require('reekoh')
let _plugin = new reekoh.plugins.Connector()
let async = require('async')
let isArray = require('lodash.isarray')
let isEmpty = require('lodash.isempty')
let isPlainObject = require('lodash.isplainobject')
let request = require('request')

let sendData = (data, callback) => {
  if (isEmpty(data.messageType)) { data.messageType = _plugin.config.defaultMessageType }

  if (data.messageType.toLowerCase() !== 'queue' && data.messageType.toLowerCase() !== 'topic') { data.messageType = _plugin.config.defaultMessageType }

  if (isEmpty(data.message)) {
    data.message = _plugin.config.defaultMessage
  }

  if (isEmpty(data.topicQueueName)) {
    data.topicQueueName = _plugin.config.topicQueueName
  }

  // sanitize the host
  let host
  if (_plugin.config.host.indexOf('://') > -1) {
    host = _plugin.config.host.split('/')[2]
  } else {
    host = _plugin.config.host.split('/')[0]
  }
  host = host.split(':')[0]

  let url = 'http://' + _plugin.config.username + ':' + _plugin.config.password + '@' + host + ':' + _plugin.config.port + '/api/message/' + data.topicQueueName + '?type=' + data.messageType.toLowerCase()

  request.post({
    url: url,
    body: JSON.stringify(data.message)
  }, (error) => {
    if (!error) {
      _plugin.log(JSON.stringify({
        title: 'Data sent to Apache ActiveMQ.',
        data: data
      }))
    }

    callback(error)
  })
}

/**
 * Emitted when device data is received.
 * This is the event to listen to in order to get real-time data feed from the connected devices.
 * @param {object} data The data coming from the device represented as JSON Object.
 */
_plugin.on('data', (data) => {
  if (isPlainObject(data)) {
    sendData(data, (error) => {
      if (error) {
        console.error(error)
        _plugin.logException(error)
      }
    })
  } else if (isArray(data)) {
    async.each(data, (datum, done) => {
      sendData(datum, done)
    }, (error) => {
      if (error) {
        console.error(error)
        _plugin.logException(error)
      }
    })
  } else { _plugin.logException(new Error('Invalid data received. Must be a valid Array/JSON Object. Data: ' + data)) }
})

/**
 * Emitted when the platform bootstraps the plugin. The plugin should listen once and execute its init process.
 */
_plugin.once('ready', () => {
  _plugin.log('ActiveMQ Connector has been initialized.')
  _plugin.emit('init')
})

module.exports = _plugin
