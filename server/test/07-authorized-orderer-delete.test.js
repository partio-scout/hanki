var app = require('../server');
var request = require('supertest');
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

  describe('should be allowed to delete owned', function() {
    it('Purchaseorderrow', function(done) {
      testUtils.loginUser('newOrderer').then(function(accessToken) {
        request(app)
          .del('/api/Purchaseorders/' + ownedOrderId + '/order_rows/' + ownedOrderrowId)
          .query({ access_token: accessToken.id })
          .expect(204)
          .end(testUtils.expectModelToBeDeleted('Purchaseorderrow', ownedOrderrowId, done));
      });
    });

    it('Purchaseorder', function(done) {
      testUtils.loginUser('newOrderer').then(function(accessToken) {
        request(app)
          .del('/api/Purchaseorders/' + ownedOrderId)
          .query({ access_token: accessToken.id })
          .expect(204)
          .end(testUtils.expectModelToBeDeleted('Purchaseorder', ownedOrderId, done));
      });
    });
  });

  describe('should be allowed to delete from costcenter they\'re orderer of', function() {
    it('Purchaseorderrow', function(done) {
      testUtils.loginUser('newOrderer').then(function(accessToken) {
        request(app)
          .del('/api/Purchaseorders/' + otherOrderId + '/order_rows/' + otherOrderrowId)
          .query({ access_token: accessToken.id })
          .expect(204)
          .end(testUtils.expectModelToBeDeleted('Purchaseorderrow', otherOrderrowId, done));
      });
    });

    it('Purchaseorder', function(done) {
      testUtils.loginUser('newOrderer').then(function(accessToken) {
        request(app)
          .del('/api/Purchaseorders/' + otherOrderId)
          .query({ access_token: accessToken.id })
          .expect(204)
          .end(testUtils.expectModelToBeDeleted('Purchaseorder', otherOrderId, done));
      });
    });
  });

  describe('should not be allowed to delete from costcenter they\'re not orderer of', function() {
    it('Purchaseorderrows', function(done) {
      testUtils.loginUser('newOrderer').then(function(accessToken) {
        request(app)
          .del('/api/Purchaseorders/' + otherCcOrderId + '/order_rows/' + otherCcOrderrowId)
          .query({ access_token: accessToken.id })
          .expect(401)
          .end(done);
      });
    });

    it('Purchaseorders', function(done) {
      testUtils.loginUser('newOrderer').then(function(accessToken) {
        request(app)
          .del('/api/Purchaseorders/' + otherCcOrderId)
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
