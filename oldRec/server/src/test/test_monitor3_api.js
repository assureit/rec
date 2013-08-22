var assert = require('assert')

var app = require('../server')
var request = require('supertest');
describe('api', function () {
    describe('deleteMonitor', function () {
        it('should return HTTP500 and -32602 when there is not nodeID.', function () {
            request(app['app']).post('/api/1.0/').send({
                "jsonrpc": "2.0",
                "method": "deleteMonitor",
                "id": 100,
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
                method: "deleteMonitor",
                id: 100,
                "params": {
                    "nodeID": "100"
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

