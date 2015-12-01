var app = require('../server');
var request = require('supertest');
var testUtils = require('./utils/test-utils.js');
var Promise = require('bluebird');

describe('Orderer', function() {

  beforeEach(function(done) {
    Promise.join(
      testUtils.createFixture('Purchaseorder', {
        'name': 'delete me',
        'costcenterId': 1,
        'orderId': 222,
        'subscriberId': 1,
      }),
      testUtils.createFixture('Purchaseorderrow', {
        'orderRowId': 333,
        'titleId': 1,
        'amount': 16,
        'deliveryId': 1,
        'orderId': 3,
        'approved': false,
        'finished': false,
        'modified': (new Date()).toISOString(),
      }))
    .nodeify(done);
  });

  afterEach(function(done) {
    Promise.join(
      testUtils.deleteFixtureIfExists('Purchaseorder', 222),
      testUtils.deleteFixtureIfExists('Purchaseorderrow', 333))
    .nodeify(done);
  });

  describe('should be allowed to delete owned', function() {
    it('Purchaseorder', function(done) {
      testUtils.loginUser('orderer').then(function(accessToken) {
        request(app)
          .del('/api/Purchaseorders/222')
          .query({ access_token: accessToken.id })
          .expect(204)
          .end(testUtils.expectModelToBeDeleted('Purchaseorder', 222, done));
      });
    });

    it('Purchaseorderrow', function(done) {
      testUtils.loginUser('orderer').then(function(accessToken) {
        request(app)
          .del('/api/Purchaseorders/3/order_rows/333')
          .query({ access_token: accessToken.id })
          .expect(204)
          .end(testUtils.expectModelToBeDeleted('Purchaseorderrow', 333, done));
      });
    });
  });

  describe('should not be allowed to delete others', function() {
    it('Purchaseorders', function(done) {
      testUtils.loginUser('orderer').then(function(accessToken) {
        request(app)
          .del('/api/Purchaseorders/1')
          .query({ access_token: accessToken.id })
          .expect(401)
          .end(done);
      });
    });

    it('Purchaseorderrows', function(done) {
      testUtils.loginUser('orderer').then(function(accessToken) {
        request(app)
          .del('/api/Purchaseorders/1/order_rows/2')
          .query({ access_token: accessToken.id })
          .expect(401)
          .end(done);
      });
    });
  });

  describe('should not be allowed to delete any', function() {
    it('Accounts', function(done) {
      testUtils.loginUser('orderer').then(function(accessToken) {
        request(app)
          .del('/api/Accounts/1')
          .query({ access_token: accessToken.id })
          .expect(401)
          .end(done);
      });
    });

    it('Costcenters', function(done) {
      testUtils.loginUser('orderer').then(function(accessToken) {
        request(app)
          .del('/api/Costcenters/1')
          .query({ access_token: accessToken.id })
          .expect(401)
          .end(done);
      });
    });

    it('Deliveries', function(done) {
      testUtils.loginUser('orderer').then(function(accessToken) {
        request(app)
          .del('/api/Deliveries/1')
          .query({ access_token: accessToken.id })
          .expect(401)
          .end(done);
      });
    });

    it('Suppliers', function(done) {
      testUtils.loginUser('orderer').then(function(accessToken) {
        request(app)
          .del('/api/Suppliers/1')
          .query({ access_token: accessToken.id })
          .expect(401)
          .end(done);
      });
    });

    it('Titlegroups', function(done) {
      testUtils.loginUser('orderer').then(function(accessToken) {
        request(app)
          .del('/api/Titlegroups/1')
          .query({ access_token: accessToken.id })
          .expect(401)
          .end(done);
      });
    });
  });
});
