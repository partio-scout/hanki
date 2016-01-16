// Mocha's describe(), it() etc. are global

var app = require('../server');
var request = require('supertest');
var expect = require('chai').expect;
var testUtils = require('./utils/test-utils.js');
var Promise = require('bluebird');
var Purchaseuser = app.models.Purchaseuser;
var createUser = Purchaseuser.createWithRolesAndCostcenters;

describe('getUsersCostcentersWithOrders', function() {
  var costcenter, user, order, orderrow;

  beforeEach(function(done) {
    var costcenterFixture = {
      'code': '00107',
      'name': 'Testikustannuspaikka',
      'approverUserId': 2,
      'controllerUserId': 3,
    };
    var userFixture = {
      'memberNumber': '1234567',
      'username': 'test_user',
      'password': 'salasana',
      'name': 'n/a',
      'phone': 'n/a',
      'email': 'testi@tes.ti',
      'enlistment': 'n/a',
      'userSection': 'n/a',
    };
    testUtils.createFixture('Costcenter', costcenterFixture)
    .then(function(createdCostcenter) {
      costcenter = createdCostcenter;
      return testUtils.find('Role', { 'name': 'orderer' });
    }).then(function(role) {
      return createUser(userFixture, role, [costcenter], [], []);
    }).then(function(createdUser) {
      user = createdUser;
      var orderFixture = {
        'name': 'Testitilaus',
        'costcenterId': costcenter.id,
        'subscriberId': user.id,
      };
      return testUtils.createFixture('Purchaseorder', orderFixture);
    }).then(function(createdOrder) {
      order = createdOrder;
      var orderrowFixture = {
        'titleId': 1,
        'amount': 2,
        'deliveryId': 1,
        'orderId': order.id,
        'modified': '2015-07-26T13:40:15.002Z',
        'approved': 'false',
        'confirmed': null,
        'controllerApproval': null,
        'delivered': null,
        'finished': null,
        'memo': null,
        'ordered': null,
        'providerApproval': null,
        'purchaseOrderNumber': null,
        'userSectionApproval': null,
        'nameOverride': null,
        'priceOverride': null,
        'unitOverride': null,
      };
      return testUtils.createFixture('Purchaseorderrow', orderrowFixture);
    }).then(function(createdOrderrow) {
      orderrow = createdOrderrow;
    }).nodeify(done);
  });

  afterEach(function(done) {
    Promise.join(
      testUtils.deleteFixtureIfExists('Purchaseuser', user.id),
      testUtils.deleteFixtureIfExists('Costcenter', costcenter.id),
      testUtils.deleteFixtureIfExists('Purchaseorder', order.id),
      testUtils.deleteFixtureIfExists('Purchaseorderrow', orderrow.id)
    ).nodeify(done);
  });

  describe('REST API', function() {
    it('should decline access for unauthenticated users', function(done) {
      request(app).get('/api/Costcenters/getUsersCostcentersWithOrders')
      .expect(401)
      .end(done);
    });

    it('should grant access for authenticated users', function(done) {
      testUtils.loginUser('orderer').then(function(accessToken) {
        request(app).get('/api/Costcenters/getUsersCostcentersWithOrders')
        .query({ access_token: accessToken.id })
        .expect(200)
        .end(done);
      });
    });
  });

  describe('method', function() {
    it('should give all orders from users costcenters with orderrows', function(done) {
      var login = testUtils.loginUser(user.username);
      var tempOrder = order.toObject();
      tempOrder.order_rows = [orderrow.toObject()];
      login.then(function(accessToken) {
        request(app).get('/api/Costcenters/getUsersCostcentersWithOrders?access_token=' + accessToken.id )
        .expect(200)
        .end(function(err, res) {
          if (err) {
            done(err);
          } else {
            try {
              expect(err).to.be.null;
              expect(res.body.orders).to.contain(tempOrder);
              done();
            } catch (e) {
              done(e);
            }
          }
        });
      });
    });
  });
});
