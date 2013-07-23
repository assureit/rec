var assert = require('assert')

var app = require('../server')
var request = require('supertest');
describe('api', function () {
    describe('getMonitor', function () {
        it('should return HTTP500 and -32602 when there is not nodeID.', function () {
            request(app['app']).post('/api/1.0/').send({
                "jsonrpc": "2.0",
                "method": "getMonitor",
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
            request(app['app']).post('/api/1.0/').send({
                "jsonrpc": "2.0",
                "method": "getMonitor",
                "id": 100,
                "params": {"nodeID":"555555"}
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
        it('should return HTTP500 and -32602 when there is no data.', function () {
            request(app['app']).post('/api/1.0/').send({
                "jsonrpc": "2.0",
                "method": "getMonitor",
                "id": 100,
                "params": {"nodeID":"5555"}
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
        it('should return HTTP200 and response object when it succeeded (insert table nodeID=51)', function (done) {
            request(app['app']).post('/api/1.0/').send({
                "jsonrpc": "2.0",
                "method": "getMonitor",
                "id": 100,
                "params": {"nodeID": "51"}
            }).expect(200).end(function (err, res) {
                if(err) {
                    throw err;
                }
                assert.equal(100, res.body.id);
                assert.strictEqual(undefined, res.body.error);
                assert.notStrictEqual(undefined, res.body.result);
                assert.equal("51", res.body.result[0].nodeID);
                assert.notStrictEqual(undefined, res.body.result[0].name);
                assert.notStrictEqual(undefined, res.body.result[0].watchID);
                assert.notStrictEqual(undefined, res.body.result[0].presetID);
                assert.notStrictEqual(undefined, res.body.result[0].params);
                done();
            });
        });
    });
});

