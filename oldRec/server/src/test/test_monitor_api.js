var assert = require('assert')

var app = require('../server')
var request = require('supertest');
describe('api', function () {
    describe('registMonitor', function () {
        it('should return HTTP500 and -32602 when there is not nodeID.', function () {
            request(app['app']).post('/api/1.0/').send({
                "jsonrpc": "2.0",
                "method": "registMonitor",
                "id": 100,
                "params": {
                    "name": "serverB_CPU_error", "watchID": "serverA_CPU", "presetID": "CPU_upper_Check", "params": [100, 90, 80]
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
        it('should return HTTP500 and -32602 when there is not watchID.', function () {
            request(app['app']).post('/api/1.0/').send({
                "jsonrpc": "2.0",
                "method": "registMonitor",
                "id": 100,
                "params": {
                    "nodeID": "100", "name": "serverB_CPU_error", "presetID": "CPU_upper_Check", "params": [100, 90, 80]
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
        it('should return HTTP500 and -32602 when there is not presetID.', function () {
            request(app['app']).post('/api/1.0/').send({
                "jsonrpc": "2.0",
                "method": "registMonitor",
                "id": 100,
                "params": {
                    "nodeID": "100", "name": "serverB_CPU_error", "watchID": "serverA_CPU", "params": [100, 90, 80]
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
        it('should return HTTP500 and -32602 when there is not name.', function () {
            request(app['app']).post('/api/1.0/').send({
                "jsonrpc": "2.0",
                "method": "registMonitor",
                "id": 100,
                "params": {
                    "nodeID": "100", "watchID": "serverA_CPU", "presetID": "CPU_upper_Check", "params": [100, 90, 80]
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
        it('should return HTTP500 and -32602 when there is not params.', function () {
            request(app['app']).post('/api/1.0/').send({
                "jsonrpc": "2.0",
                "method": "registMonitor",
                "id": 100,
                "params": {
                    "nodeID": "100", "name": "serverB_CPU_error", "watchID": "serverA_CPU", "presetID": "CPU_upper_Check"
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
        it('should return HTTP200 and response object when it succeeded', function (done) {
            request(app['app']).post('/api/1.0/').send({
                jsonrpc: "2.0",
                method: "registMonitor",
                id: 100,
                "params": {
                    "nodeID": "100", "name": "name_str", "watchID": "watch_1", "presetID": "preset_1", "params": [100, 90, 80]
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
        it('should agree with the contents which you registered.', function (done) {
            request(app['app']).post('/api/1.0/').send({
                jsonrpc: "2.0",
                method: "getMonitor",
                id: 100,
                "params": {"nodeID": "100"}
            }).expect(200).end(function (err, res) {
                if(err) {
                    throw err;
                }
                assert.equal(100, res.body.id);
                assert.strictEqual(undefined, res.body.error);
                assert.notStrictEqual(undefined, res.body.result);
                assert.deepEqual([{"nodeID":"100","name":"name_str","watchID":"watch_1","presetID":"preset_1","params":[100,90,80]}], res.body.result);
                done();
            });
        });
    });
});

describe('api', function () {
    describe('updateMonitor', function () {
        it('should return HTTP500 and -32602 when there is not nodeID.', function () {
            request(app['app']).post('/api/1.0/').send({
                "jsonrpc": "2.0",
                "method": "updateMonitor",
                "id": 100,
                "params": {
                    "name": "serverB_CPU_error", "watchID": "serverA_CPU", "presetID": "CPU_upper_Check", "params": [100, 90, 80]
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
        it('should return HTTP500 and -32602 when there is not watchID.', function () {
            request(app['app']).post('/api/1.0/').send({
                "jsonrpc": "2.0",
                "method": "updateMonitor",
                "id": 100,
                "params": {
                    "nodeID": "100", "name": "serverB_CPU_error", "presetID": "CPU_upper_Check", "params": [100, 90, 80]
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
        it('should return HTTP500 and -32602 when there is not presetID.', function () {
            request(app['app']).post('/api/1.0/').send({
                "jsonrpc": "2.0",
                "method": "updateMonitor",
                "id": 100,
                "params": {
                    "nodeID": "100", "name": "serverB_CPU_error", "watchID": "serverA_CPU", "params": [100, 90, 80]
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
        it('should return HTTP500 and -32602 when there is not name.', function () {
            request(app['app']).post('/api/1.0/').send({
                "jsonrpc": "2.0",
                "method": "updateMonitor",
                "id": 100,
                "params": {
                    "nodeID": "100", "watchID": "serverA_CPU", "presetID": "CPU_upper_Check", "params": [100, 90, 80]
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
        it('should return HTTP500 and -32602 when there is not params.', function () {
            request(app['app']).post('/api/1.0/').send({
                "jsonrpc": "2.0",
                "method": "updateMonitor",
                "id": 100,
                "params": {
                    "nodeID": "100", "name": "serverB_CPU_error", "watchID": "serverA_CPU", "presetID": "CPU_upper_Check"
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
        it('should return HTTP200 and response object when it succeeded', function (done) {
            request(app['app']).post('/api/1.0/').send({
                jsonrpc: "2.0",
                method: "updateMonitor",
                id: 100,
                "params": {
                    "nodeID": "100", "name": "name_str1", "watchID": "watch_2", "presetID": "preset_2", "params": [101, 91, 81]
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
        it('should agree with the contents which you updated.', function (done) {
            request(app['app']).post('/api/1.0/').send({
                jsonrpc: "2.0",
                method: "getMonitor",
                id: 100,
                "params": {"nodeID": "100"}
            }).expect(200).end(function (err, res) {
                if(err) {
                    throw err;
                }
                assert.equal(100, res.body.id);
                assert.strictEqual(undefined, res.body.error);
                assert.notStrictEqual(undefined, res.body.result);
                assert.deepEqual([{"nodeID":"100","name":"name_str1","watchID":"watch_2","presetID":"preset_2","params":[101,91,81]}], res.body.result);
                done();
            });
        });
    });
});


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

