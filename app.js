'use strict'

let reekoh = require('reekoh')
let _plugin = new reekoh.plugins.Connector()
let async = require('async')
let isArray = require('lodash.isarray')
let isEmpty = require('lodash.isempty')
let isPlainObject = require('lodash.isplainobject')
let request = require('request')

let sendData = (data, callback) => {
  if (isEmpty(data.message_type)) { data.message_type = _plugin.config.default_message_type }

  if (data.message_type.toLowerCase() !== 'queue' && data.message_type.toLowerCase() !== 'topic') { data.message_type = _plugin.config.default_message_type }

  if (isEmpty(data.message)) {
    data.message = _plugin.config.default_message
  }

  if (isEmpty(data.topic_queue_name)) {
    data.topic_queue_name = _plugin.config.topic_queue_name
  }

  // sanitize the host
  let host
  if (_plugin.config.host.indexOf('://') > -1) {
    host = _plugin.config.host.split('/')[2]
  } else {
    host = _plugin.config.host.split('/')[0]
  }
  host = host.split(':')[0]

  let url = 'http://' + _plugin.config.username + ':' + _plugin.config.password + '@' + host + ':' + _plugin.config.port + '/api/message/' + data.topic_queue_name + '?type=' + data.message_type.toLowerCase()

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
})
