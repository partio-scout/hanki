var app = require('../server');
var request = require('supertest');
var testUtils = require('./utils/test-utils.js');

describe('Orderer', function() {
  describe('should be allowed to create new', function() {
    it('Purchaseorder', function(done) {
      testUtils.loginUser('orderer').then(function(accessToken) {
        request(app).post('/api/Purchaseorders?access_token=' + accessToken.id)
        .send({
          'name': 'Paljon nauloja',
          'costcenterId': 1,
          'subscriberId': accessToken.userId,
        })
        .expect(200)
        .end(done);
      });
    });

    it('Purchaseorderrow', function(done) {
      testUtils.loginUser('orderer').then(function(accessToken) {
        d = new Date().toISOString();
        request(app).post('/api/Purchaseorderrows?access_token=' + accessToken.id)
        .send({
          'titleId': 1,
          'amount': 16,
          'deliveryId': 1,
          'orderId': 3,
          'approved': false,
          'finished': false,
          'modified': d,
        })
        .expect(200)
        .end(done);
      });
    });
  });

  describe('should not be allowed to create new', function() {
    it('Purchaseuser', function(done) {
      testUtils.loginUser('orderer').then(function(accessToken) {
        request(app).post('/api/Purchaseusers?access_token=' + accessToken.id)
          .send({
            email: 'example@example.com',
            password: 'password',
            name: 'n/a',
            phone: 'n/a',
            enlistment: 'n/a',
            userSection: 'n/a',
          })
          .expect(401)
          .end(done);
      });
    });
  });
});
