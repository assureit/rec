var assert = require('assert')

var app = require('../server')
var request = require('supertest');
describe('api', function () {
    describe('pushRawData', function () {
        it('should return HTTP200 and response object when it succeeded', function (done) {
            request(app['app']).post('/api/2.0/').send({
                jsonrpc: "2.0",
                method: "pushRawData",
                id: 100,
                "priority": 0,
                "params": {"location": "Server A","type": "CPU Used(User)","data": "25"}
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
        it('should return HTTP500 and -32602 when there is not params.', function (done) {
            request(app['app']).post('/api/2.0/').send({
                "jsonrpc": "2.0",
                "method": "pushRawData",
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
                done();
            });
        });
        it('should return HTTP500 and -32602 When there is not a location.', function (done) {
            request(app['app']).post('/api/2.0/').send({
                jsonrpc: "2.0",
                method: "pushRawData",
                id: 100,
                "priority": 0,
                "params": {"type": "CPU Used(User)","data": "25"}
            }).expect(500).end(function (err, res) {
                if(err) {
                    throw err;
                }
                assert.equal(100, res.body.id);
                assert.notStrictEqual(undefined, res.body.error);
                assert.notStrictEqual(undefined, res.body.error.code);
                assert.equal(-32602, res.body.error.code);
                done();
            });
        });
        it('should return HTTP500 and -32602 When there is not a type.', function (done) {
            request(app['app']).post('/api/2.0/').send({
                jsonrpc: "2.0",
                method: "pushRawData",
                "priority": 0,
                id: 100,
                "params": {"location": "Server A","data": "25"}
            }).expect(500).end(function (err, res) {
                if(err) {
                    throw err;
                }
                assert.equal(100, res.body.id);
                assert.notStrictEqual(undefined, res.body.error);
                assert.notStrictEqual(undefined, res.body.error.code);
                assert.equal(-32602, res.body.error.code);
                done();
            });
        });
        it('should return HTTP500 and -32602 When there is not a data.', function (done) {
            request(app['app']).post('/api/2.0/').send({
                jsonrpc: "2.0",
                method: "pushRawData",
                id: 100,
                "params": {"location": "Server A","type": "CPU Used(User)"}
            }).expect(500).end(function (err, res) {
                if(err) {
                    throw err;
                }
                assert.equal(100, res.body.id);
                assert.notStrictEqual(undefined, res.body.error);
                assert.notStrictEqual(undefined, res.body.error.code);
                assert.equal(-32602, res.body.error.code);
                done();
            });
        });
    });
});

