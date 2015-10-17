var app = require('../server');
var request = require('supertest');
var expect = require('chai').expect;
var _ = require('lodash');
var testUtils = require('./utils/test-utils.js');

describe('Orderer', function() {
  var username = 'orderer';
  var userpass = 'salasana';

  function createFixture(modelName, fixture, cb) {
    app.models[modelName].create(fixture, function(err, res) {
      if (err) {
        throw new Error('Unable to create ' + modelName + ' fixture: ' + err);
      } else {
        cb();
      }
    });
  }

  function deleteFixtureIfExists(modelName, id, cb) {
    app.models[modelName].destroyById(id, cb());
  }

  function expectModelToBeDeleted(modelName, id, cb) {
    return function() {
      app.models[modelName].findById(id, function(err, res) {
        expect(err).to.be.undefined;
        expect(res).to.be.null;
        cb();
      });
    };
  }

  beforeEach(function(done) {
    var doneWhenAllDone = _.after(2, done);

    createFixture('Purchaseorder', {
      'name': 'delete me',
      'costcenterId': 1,
      'orderId': 222,
      'subscriberId': 1
    }, doneWhenAllDone);

    createFixture('Purchaseorderrow', {
      'orderRowId': 333,
      'titleId': 1,
      'amount': 16,
      'deliveryId': 1,
      'orderId': 3,
      'approved': false,
      'finished': false,
      'modified': (new Date()).toISOString()
    }, doneWhenAllDone);
  });

  afterEach(function(done) {
    var doneWhenAllDone = _.after(2, done);
    deleteFixtureIfExists('Purchaseorder', 222, doneWhenAllDone);
    deleteFixtureIfExists('Purchaseorderrow', 333, doneWhenAllDone);
  });

  describe('should be allowed to delete owned', function() {
    it('Purchaseorder', function(done) {
      testUtils.loginUser(username, userpass).then(function(accessToken) {
        request(app)
          .del('/api/Purchaseorders/222')
          .query({ access_token: accessToken.id })
          .expect(204)
          .end(expectModelToBeDeleted('Purchaseorder', 222, done));
      });
    });

    it('Purchaseorderrow', function(done) {
      testUtils.loginUser(username, userpass).then(function(accessToken) {
        request(app)
          .del('/api/Purchaseorders/3/order_rows/333')
          .query({ access_token: accessToken.id })
          .expect(204)
          .end(expectModelToBeDeleted('Purchaseorderrow', 333, done));
      });
    });
  });

  describe('should not be allowed to delete others', function() {
    it('Purchaseorders', function(done) {
      testUtils.loginUser(username,userpass).then(function(accessToken) {
        request(app)
          .del('/api/Purchaseorders/1')
          .query({ access_token: accessToken.id })
          .expect(401)
          .end(done);
      });
    });

    it('Purchaseorderrows', function(done) {
      testUtils.loginUser(username,userpass).then(function(accessToken) {
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
      testUtils.loginUser(username, userpass).then(function(accessToken) {
        request(app)
          .del('/api/Accounts/1')
          .query({ access_token: accessToken.id })
          .expect(401)
          .end(done);
      });
    });

    it('Costcenters', function(done) {
      testUtils.loginUser(username, userpass).then(function(accessToken) {
        request(app)
          .del('/api/Costcenters/1')
          .query({ access_token: accessToken.id })
          .expect(401)
          .end(done);
      });
    });

    it('Deliveries', function(done) {
      testUtils.loginUser(username, userpass).then(function(accessToken) {
        request(app)
          .del('/api/Deliveries/1')
          .query({ access_token: accessToken.id })
          .expect(401)
          .end(done);
      });
    });

    it('Suppliers', function(done) {
      testUtils.loginUser(username, userpass).then(function(accessToken) {
        request(app)
          .del('/api/Suppliers/1')
          .query({ access_token: accessToken.id })
          .expect(401)
          .end(done);
      });
    });

    it('Titlegroups', function(done) {
      testUtils.loginUser(username, userpass).then(function(accessToken) {
        request(app)
          .del('/api/Titlegroups/1')
          .query({ access_token: accessToken.id })
          .expect(401)
          .end(done);
      });
    });
  });
});
