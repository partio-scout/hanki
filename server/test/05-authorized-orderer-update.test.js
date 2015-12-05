var app = require('../server');
var request = require('supertest');
var expect = require('chai').expect;
var testUtils = require('./utils/test-utils');

describe('Orderer', function() {
  var nameForOrder = 'Liikaa nauloja';

  describe('should be allowed to update owned', function() {
    it('Purchaseorder', function(done) {
      testUtils.loginUser('orderer').then(function(accessToken) {
        var msg = {
          'orderId': 3,
          'name': nameForOrder,
          'costcenterId': 1,
          'subscriberId': accessToken.userId,
        };
        request(app)
          .put('/api/Purchaseorders/3')
          .query({ access_token: accessToken.id })
          .send(msg)
          .expect(200)
          .expect(function(res) {
            // Make sure that things really happened
            expect(res.body.name).to.equal(nameForOrder);
          })
          .end(done);
      });
    });

    it('Purchaseorderrow', function(done) {
      testUtils.loginUser('orderer').then(function(accessToken) {
        var d = new Date().toISOString();
        var msg = {
          'modified': d,
        };
        request(app)
          .put('/api/Purchaseorders/2/order_rows/1')
          .query({ access_token: accessToken.id })
          .send(msg)
          .expect(200)
          .expect(function(res) {
            // Make sure that it really has changed
            expect(res.body.modified).to.equal(d);
          })
          .end(done);
      });
    });
  });

  describe('should not be allowed to update others', function() {
    it('Purchaseorders', function(done) {
      testUtils.loginUser('orderer').then(function(accessToken) {
        var msg = {
          'orderId': 1,
          'name': nameForOrder,
          'costcenterId': 1,
          'subscriberId': accessToken.userId,
        };
        request(app)
          .put('/api/Purchaseorders/1')
          .query({ access_token: accessToken.id })
          .send(msg)
          .expect(401)
          .end(done);
      });
    });

    it('Purchaseorderrows', function(done) {
      testUtils.loginUser('orderer').then(function(accessToken) {
        var d = new Date().toISOString();
        var msg = {
          'modified': d,
        };
        request(app)
          .put('/api/Purchaseorders/1/order_rows/2')
          .query({ access_token: accessToken.id })
          .send(msg)
          .expect(401)
          .end(done);
      });
    });
  });

  describe('should not be allowed to update any', function() {
    it('Accounts', function(done) {
      testUtils.loginUser('orderer').then(function(accessToken) {
        var msg = {
          'name': 'new title name',
        };
        request(app)
          .put('/api/Accounts/1')
          .query({ access_token: accessToken.id })
          .send(msg)
          .expect(401)
          .end(done);
      });
    });

    it('Costcenters', function(done) {
      testUtils.loginUser('orderer').then(function(accessToken) {
        var msg = {
          'name': 'new costcenter name',
        };
        request(app)
          .put('/api/Costcenters/1')
          .query({ access_token: accessToken.id })
          .send(msg)
          .expect(401)
          .end(done);
      });
    });

    it('Deliveries', function(done) {
      testUtils.loginUser('orderer').then(function(accessToken) {
        var msg = {
          'description': 'new delivery name',
        };
        request(app)
          .put('/api/Deliveries/1')
          .query({ access_token: accessToken.id })
          .send(msg)
          .expect(401)
          .end(done);
      });
    });

    it('Suppliers', function(done) {
      testUtils.loginUser('orderer').then(function(accessToken) {
        var msg = {
          'name': 'new supplier name',
        };
        request(app)
          .put('/api/Suppliers/1')
          .query({ access_token: accessToken.id })
          .send(msg)
          .expect(401)
          .end(done);
      });
    });

    it('Titlegroups', function(done) {
      testUtils.loginUser('orderer').then(function(accessToken) {
        var msg = {
          'name': 'new titlegroup name',
        };
        request(app)
          .put('/api/Titlegroups/1')
          .query({ access_token: accessToken.id })
          .send(msg)
          .expect(401)
          .end(done);
      });
    });
  });
});
