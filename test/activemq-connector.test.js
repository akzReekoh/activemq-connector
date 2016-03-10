'use strict';

const HOST = '52.90.56.209',
    PORT = '8161';

var cp     = require('child_process'),
	assert = require('assert'),
	connector;

describe('Connector', function () {
	this.slow(5000);

	after('terminate child process', function (done) {
		this.timeout(7000);

        setTimeout(function(){
            connector.kill('SIGKILL');
			done();
        }, 5000);

	});

	describe('#spawn', function () {
		it('should spawn a child process', function () {
			assert.ok(connector = cp.fork(process.cwd()), 'Child process not spawned.');
		});
	});

	describe('#handShake', function () {
		it('should notify the parent process when ready within 5 seconds', function (done) {
			this.timeout(5000);

			connector.on('message', function (message) {
				if (message.type === 'ready')
					done();
			});

			connector.send({
				type: 'ready',
				data: {
					options: {
						host: HOST,
                        port: PORT,
                        username: 'admin',
                        password: 'admin',
                        default_message_type: 'queue',
                        default_message: 'This is a default message from Apache ActiveMQ Plugin.',
                        topic_queue_name: 'default'
					}
				}
			}, function (error) {
				assert.ifError(error);
			});
		});
	});

	describe('#data', function (done) {
		it('should process the JSON data', function () {
			connector.send({
				type: 'data',
				data: {
					message_type: 'queue',
                    message: 'This is a test message from Apache ActiveMQ Plugin.',
                    topic_queue_name: 'test'
				}
			}, done);
		});
	});

	describe('#data', function (done) {
		it('should process the Array data', function () {
			connector.send({
				type: 'data',
				data: [
					{
						message_type: 'queue',
						message: 'This is a test message from Apache ActiveMQ Plugin.',
						topic_queue_name: 'test'
					},
					{
						message_type: 'queue',
						message: 'This is a test message from Apache ActiveMQ Plugin.',
						topic_queue_name: 'test'
					}
				]
			}, done);
		});
	});
});