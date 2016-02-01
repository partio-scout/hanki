var app = require('../server');
var request = require('supertest');
//var expect = require('chai').expect;
var testUtils = require('./utils/test-utils');

describe('Approver', function() {

  it('should be allowed to approve own costcenter purchaseorders', function(done) {
    testUtils.loginUser('approver').then(function(accessToken) {
      var d = new Date().toISOString();
      var msg = {
        'modified': d,
        'approved': true,
      };
      request(app)
        .put('/api/Purchaseorders/2/order_rows/1')
        .query({ access_token: accessToken.id })
        .send(msg)
        .expect(200)
        .end(done);
    });
  });
});
