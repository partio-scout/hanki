var app = require('../server');
var request = require('supertest');
var testUtils = require('./utils/test-utils');
var Promise = require('bluebird');

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

  it('should not be allowed to make controller approval to own costcenter purchaseorders', function(done) {
    testUtils.loginUser('approver').then(function(accessToken) {
      var d = new Date().toISOString();
      var msg = {
        'modified': d,
        'controllerApproval': true,
      };
      request(app)
        .put('/api/Purchaseorders/2/order_rows/1')
        .query({ access_token: accessToken.id })
        .send(msg)
        .expect(401)
        .end(done);
    });
  });

  it('should not be allowed to approve other costcenter orders', function(done) {
    var createCostcenter = testUtils.createFixture('Costcenter', {
      'code': '11111',
      'name': 'Elämys',
    });
    var createOrder = createCostcenter.then(function(costcenter) {
      return testUtils.createFixture('Purchaseorder', {
        'name': 'ApproveShouldFail',
        'costcenterId': costcenter.id,
        'subscriberId': 1,     // assuming that approver is always with id 2
      });
    });
    var createOrderRow = createOrder.then(function(order) {
      return testUtils.createFixture('Purchaseorderrow', {
        'titleId': 1,
        'amount': 10,
        'deliveryId': 1,
        'orderId': order.id,
        'selfSupply': false,
        'modified': new Date().toISOString(),
        'approved': false,
      });
    });

    Promise.join(createOrder, createOrderRow, testUtils.loginUser('approver'), createCostcenter, function(order, orderrow, accessToken, costcenter) {
      var d = new Date().toISOString();
      var msg = {
        'modified': d,
        'approved': true,
      };
      request(app)
        .put('/api/Purchaseorders/' + order.id + '/order_rows/' + orderrow.id)
        .query({ access_token: accessToken.id })
        .send(msg)
        .expect(401)
        .end(function() {
          testUtils.deleteFixtureIfExists('Costcenter', costcenter.id);
          testUtils.deleteFixtureIfExists('Purchaseorder', order.id);
          testUtils.deleteFixtureIfExists('Purchaseorderrow', orderrow.id);
          done();
        });
    });
  });

});
