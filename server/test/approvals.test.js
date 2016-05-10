var app = require('../server');
var Promise = require('bluebird');
var request = require('supertest-as-promised')(Promise);
var expect = require('chai').expect;
var testUtils = require('./utils/test-utils.js');
var _ = require('lodash');

function getExampleFixture(changes) {
  var defaultFixture = {
    'titleId': 1,
    'amount': 2,
    'deliveryId': 1,
    'orderId': 2,
    'selfSupply': false,
    'modified': new Date().toISOString(),
    'approved': false,
  };
  return _.merge(defaultFixture, changes || {});
}

describe('Approvals', function() {
  var orderRowIds;

  function fetchAllFixtures() {
    return app.models.Purchaseorderrow.findByIds(orderRowIds);
  }

  beforeEach(function() {
    return testUtils.createFixture('Purchaseorderrow', [
      getExampleFixture(),
      getExampleFixture({ 'providerApproval': true }),
      getExampleFixture({ 'userSectionApproval': true }),
      getExampleFixture({ 'controllerApproval': false, 'userSectionApproval': false }),
      getExampleFixture({ 'controllerApproval': false }),
      getExampleFixture({ 'controllerApproval': true, 'providerApproval': true }),
      getExampleFixture({ 'controllerApproval': true }),
      getExampleFixture({ 'controllerApproval': true, 'providerApproval': false }),
    ]).then(function(rows) {
      orderRowIds = _.map(rows, 'orderRowId');
    });
  });

  afterEach(function() {
    return testUtils.deleteFixturesIfExist('Purchaseorderrow', {
      'orderRowId': {
        'inq': orderRowIds,
      },
    });
  });

  describe('Controllers', function() {
    var controllerAccessToken;

    beforeEach(function() {
      return testUtils.loginUser('controller').then(function(accessToken) {
        controllerAccessToken = accessToken.id;
      });
    });

    it('can approve a row', function() {
      return request(app).post('/api/Purchaseorderrows/approve/controller?access_token=' + controllerAccessToken)
        .send({
          'ids': [ orderRowIds[1] ],
        })
        .expect(200)
        .then(fetchAllFixtures)
        .then(function(rows) {
          expect(rows[0]).to.have.property('controllerApproval', null);
          expect(rows[1]).to.have.property('controllerApproval', true);
          expect(rows[2]).to.have.property('controllerApproval', null);
          expect(rows[3]).to.have.property('controllerApproval', false);
          expect(rows[4]).to.have.property('controllerApproval', false);
        });
    });

    it('can approve several rows', function() {
      return request(app).post('/api/Purchaseorderrows/approve/controller?access_token=' + controllerAccessToken)
        .send({
          'ids': [ orderRowIds[1], orderRowIds[4], orderRowIds[2] ],
        })
        .expect(200)
        .then(fetchAllFixtures)
        .then(function(rows) {
          expect(rows[1]).to.have.property('controllerApproval', true);
          expect(rows[2]).to.have.property('controllerApproval', true);
          expect(rows[4]).to.have.property('controllerApproval', true);
        });
    });

    it('can approve several rows without affecting other rows', function() {
      return request(app).post('/api/Purchaseorderrows/approve/controller?access_token=' + controllerAccessToken)
        .send({
          'ids': [ orderRowIds[1], orderRowIds[4], orderRowIds[2] ],
        })
        .expect(200)
        .then(fetchAllFixtures)
        .then(function(rows) {
          expect(rows[0]).to.have.property('controllerApproval', null);
          expect(rows[3]).to.have.property('controllerApproval', false);
        });
    });

    it('cannot edit controller-approved rows', function() {
      return request(app).put('/api/Purchaseorderrows/' + orderRowIds[5] + '?access_token=' + controllerAccessToken)
        .send({
          'orderRowId': orderRowIds[5],
          'titleId': 1,
          'amount': 222,
          'deliveryId': 1,
          'orderId': 2,
          'selfSupply': false,
          'modified': new Date().toISOString(),
          'approved': false,
        })
        .expect(401);
    });

    it('have their own endpoint for unapproving orders', function() {
      return request(app).post('/api/Purchaseorderrows/unapprove/controller').expect(401);
    });

    it('can unapprove rows', function() {
      return request(app).post('/api/Purchaseorderrows/unapprove/controller?access_token=' + controllerAccessToken)
        .send({
          'ids': [ orderRowIds[1], orderRowIds[2] ],
        })
        .expect(200)
        .then(fetchAllFixtures)
        .then(function(rows) {
          expect(rows[1]).to.have.property('controllerApproval', false);
          expect(rows[2]).to.have.property('controllerApproval', false);
        });
    });

    it('can unapprove rows without affecting the row\'s other approvals', function() {
      return request(app).post('/api/Purchaseorderrows/unapprove/controller?access_token=' + controllerAccessToken)
        .send({
          'ids': [ orderRowIds[1], orderRowIds[2] ],
        })
        .expect(200)
        .then(fetchAllFixtures)
        .then(function(rows) {
          expect(rows[1]).to.have.property('userSectionApproval', null);
          expect(rows[2]).to.have.property('userSectionApproval', true);
          expect(rows[1]).to.have.property('providerApproval', true);

        });
    });

    it('doesn\'t affect other rows when unapproving', function() {
      return request(app).post('/api/Purchaseorderrows/unapprove/controller?access_token=' + controllerAccessToken)
        .send({
          'ids': [ orderRowIds[1], orderRowIds[2] ],
        })
        .expect(200)
        .then(fetchAllFixtures)
        .then(function(rows) {
          expect(rows[0]).to.have.property('controllerApproval', null);
          expect(rows[3]).to.have.property('controllerApproval', false);
          expect(rows[4]).to.have.property('controllerApproval', false);

          // Unapproval should not affect other rows
          expect(rows[3]).to.have.property('userSectionApproval', false);
          expect(rows[5]).to.have.property('providerApproval', true);
        });
    });

    it('cannot approve rows as procurement', function() {
      return request(app)
        .post('/api/Purchaseorderrows/approve/procurement?access_token=' + controllerAccessToken)
        .expect(401);
    });
  });

  describe('Procurement masters', function() {
    var masterAccessToken;

    beforeEach(function() {
      return testUtils.loginUser('procurementMaster').then(function(accessToken) {
        masterAccessToken = accessToken.id;
      });
    });

    it('cannot approve rows as controller', function() {
      return request(app)
        .post('/api/Purchaseorderrows/approve/controller?access_token=' + masterAccessToken)
        .expect(401);
    });

    it('cannot unapprove rows as controller', function() {
      return request(app)
        .post('/api/Purchaseorderrows/unapprove/controller?access_token=' + masterAccessToken)
        .expect(401);
    });

    it('can approve rows for procurement', function() {
      return request(app)
        .post('/api/Purchaseorderrows/approve/procurement?access_token=' + masterAccessToken)
        .send({
          ids: [ orderRowIds[0], orderRowIds[2] ],
        })
        .expect(200)
        .then(fetchAllFixtures)
        .then(function(rows) {
          expect(rows[0]).to.have.property('providerApproval', true);
          expect(rows[0]).to.have.property('controllerApproval', null);
          expect(rows[0]).to.have.property('userSectionApproval', null);

          expect(rows[2]).to.have.property('providerApproval', true);
        });
    });

    it('do not affect other rows when approving', function() {
      return request(app)
        .post('/api/Purchaseorderrows/approve/procurement?access_token=' + masterAccessToken)
        .send({
          ids: [ orderRowIds[0], orderRowIds[1] ],
        })
        .expect(200)
        .then(fetchAllFixtures)
        .then(function(rows) {
          expect(rows[2]).to.have.property('providerApproval', null);
        });
    });

    it('can approve several rows without affecting other rows', function() {
      return request(app)
        .post('/api/Purchaseorderrows/approve/procurement?access_token=' + masterAccessToken)
        .send({
          ids: [ orderRowIds[0], orderRowIds[1] ],
        })
        .expect(200)
        .then(fetchAllFixtures)
        .then(function(rows) {
          expect(rows[2]).to.have.property('providerApproval', null);
        });
    });

    it('can unapprove rows', function() {
      return request(app)
        .post('/api/Purchaseorderrows/unapprove/procurement?access_token=' + masterAccessToken)
        .send({
          ids: [ orderRowIds[0], orderRowIds[2] ],
        })
        .expect(200)
        .then(fetchAllFixtures)
        .then(function(rows) {
          expect(rows[0]).to.have.property('providerApproval', false);
          expect(rows[2]).to.have.property('providerApproval', false);
        });
    });

    it('can unapprove rows without affecting the row\'s other approvals', function() {
      return request(app)
        .post('/api/Purchaseorderrows/unapprove/procurement?access_token=' + masterAccessToken)
        .send({
          ids: [ orderRowIds[0], orderRowIds[2] ],
        })
        .expect(200)
        .then(fetchAllFixtures)
        .then(function(rows) {
          expect(rows[2]).to.have.property('userSectionApproval', true);
        });
    });

    it('can unapprove rows without affecting other rows', function() {
      return request(app)
        .post('/api/Purchaseorderrows/unapprove/procurement?access_token=' + masterAccessToken)
        .send({
          ids: [ orderRowIds[0] ],
        })
        .expect(200)
        .then(fetchAllFixtures)
        .then(function(rows) {
          expect(rows[0]).to.have.property('providerApproval', false);
          expect(rows[1]).to.have.property('providerApproval', true);
          expect(rows[2]).to.have.property('providerApproval', null);
        });
    });

    it('can edit approved rows', function() {
      return request(app)
        .put('/api/Purchaseorders/2/order_rows/' + orderRowIds[5] + '?access_token=' + masterAccessToken)
        .send(getExampleFixture({ orderRowId: orderRowIds[5], memo: 'changed!' }))
        .expect(200)
        .then(fetchAllFixtures)
        .then(function(rows) {
          expect(rows[5]).to.have.property('memo', 'changed!');
        });
    });
  });

  describe('Orderers', function() {
    this.timeout(5000);
    var token, userId;

    var purchaseUser = app.models.Purchaseuser;
    var findCostcenter = Promise.promisify(app.models.Costcenter.find, app.models.Costcenter);
    var findRole = Promise.promisify(app.models.Role.find, app.models.Role);

    beforeEach(function() {
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
          return testUtils.loginUser('newOrderer').then(function(accessToken) {
            token = accessToken.id;
          });
        });
    });

    afterEach(function(done) {
      return testUtils.deleteFixtureIfExists('Purchaseuser', userId).nodeify(done);
    });

    it('can edit rows with no approvals or declines', function() {
      return request(app)
        .put('/api/Purchaseorders/2/order_rows/' + orderRowIds[0] + '?access_token=' + token)
        .send(getExampleFixture({ orderRowId: orderRowIds[0], memo: 'changed!' }))
        .expect(200);
    });

    it('cannot edit rows with only approvals', function() {
      return request(app)
        .put('/api/Purchaseorders/2/order_rows/' + orderRowIds[6] + '?access_token=' + token)
        .send(getExampleFixture({ orderRowId: orderRowIds[6], memo: 'changed!' }))
        .expect(401)
        .then(function(res) {
          expect(res.text).to.contain('You cannot edit or delete rows that have been approved');
        })
        .then(fetchAllFixtures)
        .then(function(rows) {
          expect(rows[6]).not.to.have.property('memo', 'changed!');
        });
    });

    it('can edit rows with approvals and declines', function() {
      return request(app)
        .put('/api/Purchaseorders/2/order_rows/' + orderRowIds[7] + '?access_token=' + token)
        .send(getExampleFixture({ orderRowId: orderRowIds[7], memo: 'changed!' }))
        .expect(200);
    });

    it('can delete rows with no approvals or declines', function() {
      return request(app)
        .delete('/api/Purchaseorders/2/order_rows/' + orderRowIds[0] + '?access_token=' + token)
        .expect(204);
    });

    it('cannot delete rows with only approvals', function() {
      return request(app)
        .delete('/api/Purchaseorders/2/order_rows/' + orderRowIds[6] + '?access_token=' + token)
        .expect(401)
        .then(function(res) {
          expect(res.text).to.contain('You cannot edit or delete rows that have been approved');
        });
    });

    it('can delete rows with approvals and declines', function() {
      return request(app)
        .delete('/api/Purchaseorders/2/order_rows/' + orderRowIds[7] + '?access_token=' + token)
        .expect(204);
    });
  });

  describe('PurchaseOrderRow\'s prohibitChanges field', function() {
    var ordererToken, controllerAccessToken, userId;

    var purchaseUser = app.models.Purchaseuser;
    var findCostcenter = Promise.promisify(app.models.Costcenter.find, app.models.Costcenter);
    var findRole = Promise.promisify(app.models.Role.find, app.models.Role);

    beforeEach(function() {
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

          return Promise.join(
            testUtils.loginUser('newOrderer'),
            testUtils.loginUser('controller'),
            function(ot, ct) {
              ordererToken = ot.id;
              controllerAccessToken = ct.id;
            }
          );
        });
    });

    afterEach(function(done) {
      return testUtils.deleteFixtureIfExists('Purchaseuser', userId).nodeify(done);
    });

    function getOrderRowAndExpectProhibitChangesToBe(fixtureNumber, expectedValue) {
      return request(app)
        .get('/api/Purchaseorders/2/order_rows/' + orderRowIds[fixtureNumber] + '?access_token=' + ordererToken)
        .expect(200)
        .then(function(res) {
          expect(res.body).to.have.property('prohibitChanges', expectedValue);
        });
    }

    it('should be true when there is only user section acceptance', function() {
      return getOrderRowAndExpectProhibitChangesToBe(2, true);
    });

    it('should be true when there is only controller acceptance', function() {
      return getOrderRowAndExpectProhibitChangesToBe(6, true);
    });

    it('should be true when there is only procurement acceptance', function() {
      return getOrderRowAndExpectProhibitChangesToBe(1, true);
    });

    it('should be true when there are several acceptances', function() {
      return getOrderRowAndExpectProhibitChangesToBe(5, true);
    });

    it('should be false when there are no acceptances', function() {
      return getOrderRowAndExpectProhibitChangesToBe(0, false);
    });

    it('should be false when there are acceptances and declines', function() {
      return getOrderRowAndExpectProhibitChangesToBe(7, false);
    });

    it('should be present when loading rows from the rows endpoint', function() {
      return request(app)
        .get('/api/Purchaseorderrows?access_token=' + controllerAccessToken)
        .expect(200)
        .then(function(res) {
          expect(res.body[0]).to.have.property('prohibitChanges');
        });
    });

    it('should be present when loading a row from the rows endpoint', function() {
      return request(app)
        .get('/api/Purchaseorderrows/' + orderRowIds[1] + '?access_token=' + controllerAccessToken)
        .expect(200)
        .then(function(res) {
          expect(res.body).to.have.property('prohibitChanges', true);
        });
    });

    it('should be present when loading a row from the user\'s orders endpoint', function() {
      // Here login orderer because row is taken through user endpoint so other users don't have access
      return testUtils.loginUser('orderer').then(function(accessToken) {
        return request(app)
          .get('/api/Purchaseusers/1/orders?access_token=' + accessToken.id + '&filter[order]=orderId%20DESC&filter[include]=order_rows')
          .expect(200)
          .then(function(res) {
            expect(res.body[0].order_rows[0]).to.have.property('prohibitChanges', false);
          });
      });
    });

    it('should be ignored when updating models', function() {
      return request(app)
        .put('/api/Purchaseorders/2/order_rows/' + orderRowIds[0] + '?access_token=' + ordererToken)
        .send(getExampleFixture({ orderRowId: orderRowIds[0], prohibitChanges: true }))
        .expect(200);
    });
  });

  describe('Unauthenticated users', function() {
    it('cannot access controller approval endpoint', function() {
      return request(app).post('/api/Purchaseorderrows/approve/controller').expect(401);
    });

    it('cannot access controller unapproval endpoint', function() {
      return request(app).post('/api/Purchaseorderrows/unapprove/controller').expect(401);
    });
  });

});
