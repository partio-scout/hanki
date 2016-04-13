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
    var token;

    beforeEach(function() {
      return testUtils.loginUser('orderer').then(function(accessToken) {
        token = accessToken.id;
      });
    });

    it('cannot edit controller-approved rows', function() {
      return request(app)
        .put('/api/Purchaseorders/2/order_rows/' + orderRowIds[6] + '?access_token=' + token)
        .send(getExampleFixture({ orderRowId: orderRowIds[6], memo: 'changed!' }))
        .expect(401)
        .then(function(res) {
          expect(res.text).to.contain('You cannot edit rows that have approvals');
        })
        .then(fetchAllFixtures)
        .then(function(rows) {
          expect(rows[6]).not.to.have.property('memo', 'changed!');
        });
    });

    it('cannot edit procurement-approved rows', function() {
      return request(app)
        .put('/api/Purchaseorders/2/order_rows/' + orderRowIds[1] + '?access_token=' + token)
        .send(getExampleFixture({ orderRowId: orderRowIds[1], memo: 'changed!' }))
        .expect(401)
        .then(function(res) {
          expect(res.text).to.contain('You cannot edit rows that have approvals');
        })
        .then(fetchAllFixtures)
        .then(function(rows) {
          expect(rows[1]).not.to.have.property('memo', 'changed!');
        });
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
