'use strict';

var platform = require('./platform'),
    request = require('request'),
    isEmpty = require('lodash.isempty'),
    isArray = require('lodash.isarray'),
    async = require('async'),
    isPlainObject = require('lodash.isplainobject'),
	config;

let sendData = (data) => {
    if(isEmpty(data.message_type))
        data.message_type = config.default_message_type;

    if(data.message_type.toLowerCase() !== 'queue' && data.message_type.toLowerCase() !== 'topic')
        data.message_type = config.default_message_type;

    if(isEmpty(data.message))
        data.message = config.default_message;

    if(isEmpty(data.topic_queue_name))
        data.topic_queue_name = config.topic_queue_name;

    //sanitize the host
    var host;
    if (config.host.indexOf('://') > -1) {
        host = config.host.split('/')[2];
    }
    else {
        host = config.host.split('/')[0];
    }
    host = host.split(':')[0];

    var url = 'http://'+ config.username +':'+ config.password +'@'+ host +':'+ config.port +'/api/message/'+ data.topic_queue_name +'?type='+ data.message_type.toLowerCase();

    request.post({
        url: url,
        body: JSON.stringify(data.message)
    }, function (error) {
        if (error)
            platform.handleException(error);
        else {
            platform.log(JSON.stringify({
                title: 'Data sent to Apache ActiveMQ.',
                data: data
            }));
        }
    });
};

platform.on('data', function (data) {
    if(isPlainObject(data)){
        sendData(data);
    }
    else if(isArray(data)){
        async.each(data, (datum) => {
            sendData(datum);
        });
    }
    else
        platform.handleException(new Error('Invalid data received. Must be a valid Array/JSON Object. Data: ' + data));


});

platform.once('close', function () {
    platform.notifyClose();
});

platform.once('ready', function (options) {
    config = options;

	platform.log('Apache ActiveMQ Connector has been initialized.');
    platform.notifyReady();
});