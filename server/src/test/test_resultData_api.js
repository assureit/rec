var assert = require('assert')

var app = require('../server')
var request = require('supertest');
describe('api', function () {
    describe('resultDataRecord', function () {
        it('should return HTTP500 and -32602 when there is not monitorID.', function () {
            request(app['app']).post('/api/1.0/').send({
                "jsonrpc": "2.0",
                "method": "resultDataRecord",
                "id": 100,
                "params": {
					"data": {
						"name": "Web Server CPU", 
						"arguments": [], 
						"timestamp": "2013-06-20T13:00:05Z", 
						"errorcode": 0, 
						"output_n": "Recover Script is End\n", 
						"output_e": ""
					}
                }
            }).expect(500).end(function (err, res) {
                if(err) {
                    throw err;
                }
                assert.equal(100, res.body.id);
                assert.notStrictEqual(undefined, res.body.error);
                assert.notStrictEqual(undefined, res.body.error.code);
                assert.equal(-32602, res.body.error.code);
            });
            request(app['app']).post('/api/1.0/').send({
                "jsonrpc": "2.0",
                "method": "resultDataRecord",
                "id": 100,
                "params": {
					"data": {
						"nodeID": 51111, 
						"name": "Web Server CPU", 
						"arguments": [], 
						"timestamp": "2013-06-20T13:00:05Z", 
						"errorcode": 0, 
						"output_n": "Recover Script is End\n", 
						"output_e": ""
					}
                }
            }).expect(500).end(function (err, res) {
                if(err) {
                    throw err;
                }
                assert.equal(100, res.body.id);
                assert.notStrictEqual(undefined, res.body.error);
                assert.notStrictEqual(undefined, res.body.error.code);
                assert.equal(-32602, res.body.error.code);
            });
        });
        it('should return HTTP500 and -32602 when there is not data.', function () {
            request(app['app']).post('/api/1.0/').send({
                "jsonrpc": "2.0",
                "method": "resultDataRecord",
                "id": 100,
                "priority": 0,
                "params": null
            }).expect(500).end(function (err, res) {
                if(err) {
                    throw err;
                }
                assert.equal(100, res.body.id);
                assert.notStrictEqual(undefined, res.body.error);
                assert.notStrictEqual(undefined, res.body.error.code);
                assert.equal(-32602, res.body.error.code);
            });
        });
        it('should return HTTP200 and response object when it succeeded', function (done) {
            request(app['app']).post('/api/1.0/').send({
                jsonrpc: "2.0",
                method: "resultDataRecord",
                id: 100,
                "params": {
					"nodeID": 51111, 
					"data": {
						"name": "Web Server CPU", 
						"arguments": [], 
						"timestamp": "2013-07-04T13:01:05Z", 
						"errorcode": 0, 
						"output_n": "Recover Script is End\n", 
						"output_e": ""
					}
                }
            }).expect(200).end(function (err, res) {
                if(err) {
                    throw err;
                }
                assert.equal(100, res.body.id);
                assert.strictEqual(undefined, res.body.error);
                assert.notStrictEqual(undefined, res.body.result);
                done();
            });
        });
        it('should make success when an error is appointed', function (done) {
            request(app['app']).post('/api/1.0/').send({
                jsonrpc: "2.0",
                method: "resultDataRecord",
                id: 100,
                "params": {
					"nodeID": 51112, 
					"data": {
						"name": "Web Server CPU", 
						"arguments": [0,1,2], 
						"timestamp": "2013-07-04T13:02:05Z", 
						"errorcode": 1, 
						"output_n": "", 
						"output_e": "An error has occurred"
					}
                }
            }).expect(200).end(function (err, res) {
                if(err) {
                    throw err;
                }
                assert.equal(100, res.body.id);
                assert.strictEqual(undefined, res.body.error);
                assert.notStrictEqual(undefined, res.body.result);
                done();
            });
        });
    });
});

