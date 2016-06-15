var app = require('../server');
var request = require('supertest');
var expect = require('chai').expect;
var testUtils = require('./utils/test-utils');
var Promise = require('bluebird');

describe('Orderer', function() {
  var userId, ownedOrderId, ownedOrderrowId, otherOrderId, otherCcOrderId, otherOrderrowId, otherCcOrderrowId, accessToken;

  var purchaseUser = app.models.Purchaseuser;
  var findCostcenter = Promise.promisify(app.models.Costcenter.find, app.models.Costcenter);
  var findRole = Promise.promisify(app.models.Role.find, app.models.Role);

  beforeEach(function(done) {
    var orderFromOwnedCc = {
      'name': 'Jonkun toisen tilaus',
      'costcenterId': 1,
      'subscriberId': 1,
    };
    var orderFromOtherCc = {
      'name': 'Tähän ei pitäisi olla oikeutta',
      'costcenterId': 2,
      'subscriberId': 1,
    };

    return Promise.join(
      findCostcenter({ where: { code: '00000' } }),
      findRole({ where: { name: 'orderer' } }),
      function (ccs, roles) {
        return purchaseUser.createWithRolesAndCostcenters({
          memberNumber: '0000010',
          username: 'newOrderer',
          password: 'salasana',
          name: 'Tanja Tilaaja',
          phone: '050 2345678',
          email: 'tanja@tilaa.ja',
          enlistment: 'Ostaja',
          userSection: 'Palvelut',
        }, roles, ccs, [], []);
      }).then(function(user) {
        userId = user.id;
        return testUtils.loginUser('newOrderer');
      }).then(function(newAccessToken) {
        accessToken = newAccessToken;
        return request(app).post('/api/Purchaseorders?access_token=' + accessToken.id)
        .send({
          'name': 'Uusi tilaus',
          'costcenterId': 1,
          'subscriberId': accessToken.userId,
        })
        .expect(200)
        .expect(function(res) {
          ownedOrderId = res.body.orderId;
        });
      }).then(function() {
        var d = new Date().toISOString();
        return request(app).post('/api/Purchaseorderrows?access_token=' + accessToken.id)
        .send({
          'titleId': 1,
          'amount': 16,
          'deliveryId': 1,
          'orderId': ownedOrderId,
          'approved': false,
          'finished': false,
          'modified': d,
        })
        .expect(200)
        .expect(function(res) {
          ownedOrderrowId = res.body.orderRowId;
        });
      }).then(function() {
        return testUtils.createFixture('Purchaseorder', [orderFromOwnedCc, orderFromOtherCc]);
      }).then(function(orders) {
        otherOrderId = orders[0].orderId;
        otherCcOrderId = orders[1].orderId;

        var d = new Date().toISOString();
        return testUtils.createFixture('Purchaseorderrow', [{
          'titleId': 1,
          'amount': 16,
          'deliveryId': 1,
          'orderId': otherOrderId,
          'approved': false,
          'finished': false,
          'modified': d,
        }, {
          'titleId': 1,
          'amount': 16,
          'deliveryId': 1,
          'orderId': otherCcOrderId,
          'approved': false,
          'finished': false,
          'modified': d,
        }]);
      }).then(function(orderrows) {
        otherOrderrowId = orderrows[0].orderRowId;
        otherCcOrderrowId = orderrows[1].orderRowId;
      }).nodeify(done);
  });

  afterEach(function(done) {
    Promise.join(
      testUtils.deleteFixtureIfExists('Purchaseuser', userId),
      testUtils.deleteFixtureIfExists('Purchaseorder', ownedOrderId),
      testUtils.deleteFixtureIfExists('Purchaseorder', otherOrderId),
      testUtils.deleteFixtureIfExists('Purchaseorder', otherCcOrderId),
      testUtils.deleteFixtureIfExists('Purchaseorderrow', ownedOrderrowId),
      testUtils.deleteFixtureIfExists('Purchaseorderrow', otherOrderrowId),
      testUtils.deleteFixtureIfExists('Purchaseorderrow', otherCcOrderrowId)
    ).nodeify(done);
  });

  describe('should be allowed update owned', function() {
    it('Purchaseorder', function(done) {
      var nameForOrder = 'Muutettu tilaus';
      testUtils.loginUser('newOrderer').then(function(accessToken) {
        var msg = {
          'name': nameForOrder,
        };
        request(app)
        .put('/api/Purchaseorders/' + ownedOrderId)
        .query({ 'access_token': accessToken.id })
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
      var d = new Date().toISOString();
      var msg = {
        'modified': d,
      };
      request(app)
      .put('/api/Purchaseorders/' + ownedOrderId + '/order_rows/' + ownedOrderrowId)
      .query({ access_token: accessToken.id })
      .send(msg)
      .expect(200)
      .expect(function(res) {
        // Make sure that it really has changed
        expect(res.body.modified).to.equal(d);
      })
      .end(done);
    });

    it('Purchaseorderrow through setFinalPriceAndPurchaseOrderNumber', function(done) {
      var data = {
        rowId: ownedOrderrowId,
        finalPrice: 1234,
        orderNumber: '12345-Z',
        ordered: true,
      };
      request(app)
      .post('/api/Purchaseorderrows/setFinalPriceAndPurchaseOrderNumber')
      .query({ access_token: accessToken.id })
      .send(data)
      // .expect(200)
      .expect(function(res) {
        expect(res.body.modifiedOrder.finalPrice).to.equal(1234);
        expect(res.body.modifiedOrder.purchaseOrderNumber).to.equal('12345-Z');
        expect(res.body.modifiedOrder.ordered).to.be.true;
      })
      .end(done);
    });
  });

  describe('should be allowed to update from costcenter they are orderer of', function() {
    it('Purchaseorder', function(done) {
      var nameForOrder = 'Muutettu tilaus';
      testUtils.loginUser('newOrderer').then(function(accessToken) {
        var msg = {
          'name': nameForOrder,
        };
        request(app)
        .put('/api/Purchaseorders/' + otherOrderId)
        .query({ 'access_token': accessToken.id })
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
      var d = new Date().toISOString();
      var msg = {
        'modified': d,
      };
      request(app)
      .put('/api/Purchaseorders/' + otherOrderId + '/order_rows/' + otherOrderrowId)
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

  describe('should not be allowed to update from costcenter they are not orderer of', function() {
    it('Purchaseorder', function(done) {
      var nameForOrder = 'Muutettu tilaus';
      testUtils.loginUser('newOrderer').then(function(accessToken) {
        var msg = {
          'name': nameForOrder,
        };
        request(app)
        .put('/api/Purchaseorders/' + otherCcOrderId)
        .query({ 'access_token': accessToken.id })
        .send(msg)
        .expect(401)
        .end(done);
      });
    });

    it('Purchaseorderrow', function(done) {
      var d = new Date().toISOString();
      var msg = {
        'modified': d,
      };
      request(app)
      .put('/api/Purchaseorders/' + otherCcOrderId + '/order_rows/' + otherCcOrderrowId)
      .query({ access_token: accessToken.id })
      .send(msg)
      .expect(401)
      .end(done);
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
