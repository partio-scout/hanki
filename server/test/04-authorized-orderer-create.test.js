var app = require('../server');
var request = require('supertest');
var testUtils = require('./utils/test-utils.js');

describe('Orderer', function() {
  var username = 'orderer';
  var userpass = 'salasana';

  describe('should be allowed to create new', function() {
    it('Purchaseorder', function(done) {
      testUtils.loginUser(username, userpass).then(function(accessToken) {
        request(app).post('/api/Purchaseorders?access_token=' + accessToken.id)
        .send({
          'name': 'Paljon nauloja',
          'costcenterId': 1,
          'subscriberId': accessToken.userId
        })
        .expect(200)
        .end(done);
      });
    });

    it('Purchaseorderrow', function(done) {
      testUtils.loginUser(username,  userpass).then(function(accessToken) {
        d = new Date().toISOString();
        request(app).post('/api/Purchaseorderrows?access_token=' + accessToken.id)
        .send({
          'titleId': 1,
          'amount': 16,
          'deliveryId': 1,
          'orderId': 3,
          'approved': false,
          'finished': false,
          'modified': d
        })
        .expect(200)
        .end(done);
      });
    });
  });
});
