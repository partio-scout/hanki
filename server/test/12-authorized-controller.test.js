var app = require('../server');
var request = require('supertest');
var testUtils = require('./utils/test-utils');

describe('Controller', function() {

  it('should not be allowed to approve own costcenter purchaseorders', function(done) {
    testUtils.loginUser('controller').then(function(accessToken) {
      var d = new Date().toISOString();
      var msg = {
        'modified': d,
        'approved': true,
      };
      request(app)
        .put('/api/Purchaseorders/2/order_rows/1')
        .query({ access_token: accessToken.id })
        .send(msg)
        .expect(401)
        .end(done);
    });
  });

  it('should be allowed to make controller approval to own costcenter purchaseorders', function(done) {
    testUtils.loginUser('controller').then(function(accessToken) {
      var d = new Date().toISOString();
      var msg = {
        'modified': d,
        'controllerApproval': true,
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
