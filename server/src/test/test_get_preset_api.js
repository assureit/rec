var assert = require('assert')

var app = require('../server')
var request = require('supertest');
describe('api', function () {
    describe('getPresetList', function () {
        it('should return HTTP200 and response object when it succeeded', function (done) {
            request(app['app']).post('/api/1.0/').send({
                jsonrpc: "2.0",
                method: "getPresetList",
                id: 100,
                "params": null
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
        it('should ignore it and must make success when a value is appointed in param', function (done) {
            request(app['app']).post('/api/1.0/').send({
                jsonrpc: "2.0",
                method: "getPresetList",
                id: 100,
                "priority": 0,
                "params": {"datatype":"linux_cpu"}
            }).expect(200).end(function (err, res) {
                if(err) {
                    throw err;
                }
                assert.equal(100, res.body.id);
                assert.strictEqual(undefined, res.body.error);
                assert.notStrictEqual(undefined, res.body.result);
                assert.notStrictEqual(undefined, res.body.result.items);
                assert.notStrictEqual(undefined, res.body.result.items[0].presetID);
                assert.notStrictEqual(undefined, res.body.result.items[0].description);
                assert.notStrictEqual(undefined, res.body.result.items[0].datatype);
                assert.notStrictEqual(undefined, res.body.result.items[0].paramName);
                assert.notStrictEqual(undefined, res.body.result.items[0].normalComment);
                assert.notStrictEqual(undefined, res.body.result.items[0].errorComment);
                done();
            });
        });
    });
});

