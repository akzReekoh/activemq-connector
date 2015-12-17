# Apache ActiveMQ Connector
[![Build Status](https://travis-ci.org/Reekoh/activemq-connector.svg)](https://travis-ci.org/Reekoh/activemq-connector)
![Dependencies](https://img.shields.io/david/Reekoh/activemq-connector.svg)
![Dependencies](https://img.shields.io/david/dev/Reekoh/activemq-connector.svg)
![Built With](https://img.shields.io/badge/built%20with-gulp-red.svg)

Integrates a Reekoh instance to Apache ActiveMQ messaging service.

## Description
This plugin sends messages from devices connected to Reekoh Instance to Apache ActiveMQ.

## Configuration
To configure this plugin, a running Apache ActiveMQ service is needed to provide the following:

1. Host - The IP/Domain in which the Apache ActiveMQ service is running.
2. Username - The Apache ActiveMQ account username to use.
3. Password -  The Apache ActiveMQ account password to use.
4. Port - The Port where Apache ActiveMQ is running.

Other Parameters:

1. Default Message - The default message to be sent.
2. Default Message Type - The default type of the message to be sent.
3. Default Topic/Queue Name - The default topic or queue where the message will be sent.

These parameters are then injected to the plugin from the platform.

## Sample input data
```
{
    message_type: 'queue', //message type 
    message: 'This is a test message from Apache ActiveMQ Plugin.',
    topic_queue_name: 'test' //topic or queue name
}
```