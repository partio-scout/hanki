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
  var controllerAccessToken;

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
    }).then(function() {
      return testUtils.loginUser('controller');
    }).then(function(accessToken) {
      controllerAccessToken = accessToken.id;
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
    it('have their own endpoint for approving rows', function() {
      return request(app).post('/api/Purchaseorderrows/approve/controller').expect(401);
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

    it('can unapprove rows that have not been approved yet', function() {
      return request(app).post('/api/Purchaseorderrows/unapprove/controller?access_token=' + controllerAccessToken)
        .send({
          'ids': [ orderRowIds[1], orderRowIds[2] ],
        })
        .expect(200)
        .then(fetchAllFixtures)
        .then(function(rows) {
          expect(rows[1]).to.have.property('controllerApproval', false);
          expect(rows[2]).to.have.property('controllerApproval', false);

          // Unapproval should reset other approvals of the row to null
          expect(rows[1]).to.have.property('userSectionApproval', null);
          expect(rows[2]).to.have.property('userSectionApproval', null);
          expect(rows[1]).to.have.property('providerApproval', null);

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

          // Unapproval should reset other approvals of the row to null
          expect(rows[3]).to.have.property('userSectionApproval', false);
          expect(rows[5]).to.have.property('providerApproval', true);
        });
    });

    it('cannot unapprove rows that have been approved already', function() {
      return request(app).post('/api/Purchaseorderrows/unapprove/controller?access_token=' + controllerAccessToken)
        .send({
          'ids': [ orderRowIds[5], orderRowIds[6] ],
        })
        .expect(200)
        .then(fetchAllFixtures)
        .then(function(rows) {
          expect(rows[5]).to.have.property('controllerApproval', true);
          expect(rows[6]).to.have.property('controllerApproval', true);
        });
    });

    it('can unapprove rows that haven\'t been approved yet, even if there are some approved rows', function() {
      return request(app).post('/api/Purchaseorderrows/unapprove/controller?access_token=' + controllerAccessToken)
        .send({
          'ids': [ orderRowIds[0], orderRowIds[6] ],
        })
        .expect(200)
        .then(fetchAllFixtures)
        .then(function(rows) {
          expect(rows[0]).to.have.property('controllerApproval', false);
          expect(rows[6]).to.have.property('controllerApproval', true);
        });
    });

  });

});
