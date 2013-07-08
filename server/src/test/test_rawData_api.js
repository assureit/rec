var assert = require('assert')

var app = require('../server')
var request = require('supertest');
describe('api', function () {
    describe('rawDataRecord', function () {
        it('should return HTTP500 and -32602 when there is not watchID.', function () {
            request(app['app']).post('/api/1.0/').send({
                "jsonrpc": "2.0",
                "method": "rawDataRecord",
                "id": 100,
                "priority": 0,
                "params": {
                    "data":[{"name":"CPU","num":13,"timestamp":"2013-06-20T13:00:05Z"}]
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
                "method": "rawDataRecord",
                "id": 100,
                "priority": 0,
                "params": {
                    "data":[{"watchID":1111,"name":"CPU","num":13,"timestamp":"2013-06-20T13:00:05Z"}]
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
                "method": "rawDataRecord",
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
                method: "rawDataRecord",
                id: 100,
                "priority": 0,
                "params": {
                    "watchID":1111,"data":[{"name":"CPU","num":13,"timestamp":"2013-07-03T13:01:05Z"}]
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
        it('should return HTTP200 and response object When data is arrangement.', function (done) {
            request(app['app']).post('/api/1.0/').send({
                jsonrpc: "2.0",
                method: "rawDataRecord",
                id: 100,
                "priority": 0,
                "params": {
                    "watchID":1111,"data":[{"name":"CPU","num":13,"timestamp":"2013-07-03T13:01:05Z"},{"name":"CPU","num":14,"timestamp":"2013-07-03T13:05:05Z"}]
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
        it('should return HTTP200 and response object When data is no arrangement.', function (done) {
            request(app['app']).post('/api/1.0/').send({
                jsonrpc: "2.0",
                method: "rawDataRecord",
                "priority": 0,
                id: 100,
                "params": {
                    "watchID":1112,"data":{"name":"CPU","num":13,"timestamp":"2013-07-03T13:02:05Z"}
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
        it('should return HTTP200 and response object When there is not a property', function (done) {
            request(app['app']).post('/api/1.0/').send({
                jsonrpc: "2.0",
                method: "rawDataRecord",
                id: 100,
                "params": {
                    "watchID":1113,"data":[{"name":"CPU","num":13,"timestamp":"2013-07-03T13:02:05Z"}]
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

