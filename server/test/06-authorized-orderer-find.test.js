var app = require('../server');
var request = require('supertest');
var expect = require('chai').expect;
var Promise = require('bluebird');
var testUtils = require('./utils/test-utils.js');

describe('Orderer', function() {

  describe('should be allowed to get list of', function() {
    describe('all', function() {
      it('Accounts', function(done) {
        testUtils.loginUser('orderer').then(function(accessToken) {
          request(app).get('/api/Accounts?access_token=' + accessToken.id)
          .expect(200)
          .end(done);
        });
      });

      it('Costcenters', function(done) {
        testUtils.loginUser('orderer').then(function(accessToken) {
          request(app).get('/api/Costcenters?access_token=' + accessToken.id)
          .expect(200)
          .end(done);
        });
      });

      it('Deliveries', function(done) {
        testUtils.loginUser('orderer').then(function(accessToken) {
          request(app).get('/api/Deliveries?access_token=' + accessToken.id)
          .expect(200)
          .end(done);
        });
      });

      it('Suppliers', function(done) {
        testUtils.loginUser('orderer').then(function(accessToken) {
          request(app).get('/api/Suppliers?access_token=' + accessToken.id)
          .expect(200)
          .end(done);
        });
      });

      it('Titlegroups', function(done) {
        testUtils.loginUser('orderer').then(function(accessToken) {
          request(app).get('/api/Titlegroups?access_token=' + accessToken.id)
          .expect(200)
          .end(done);
        });
      });

      it('Titles', function(done) {
        testUtils.loginUser('orderer').then(function(accessToken) {
          request(app).get('/api/Titles?access_token=' + accessToken.id)
          .expect(200)
          .end(done);
        });
      });

    });

    describe('owned', function() {
      it('Cost centres', function(done) {
        testUtils.loginUser('orderer').then(function(accessToken) {
          request(app).get('/api/Purchaseusers/' + accessToken.userId + '/costcenters?access_token=' + accessToken.id)
          .expect(200)
          .end(done);
        });
      });

      it('Cost centres the user is a controller of', function(done) {
        testUtils.loginUser('orderer').then(function(accessToken) {
          request(app).get('/api/Purchaseusers/' + accessToken.userId + '/isControllerOfCostcenter?access_token=' + accessToken.id)
          .expect(200)
          .end(done);
        });
      });

      it('Cost centres the user is an approver of', function(done) {
        testUtils.loginUser('orderer').then(function(accessToken) {
          request(app).get('/api/Purchaseusers/' + accessToken.userId + '/isApproverOfCostcenter?access_token=' + accessToken.id)
          .expect(200)
          .end(done);
        });
      });

      it('Purchaseorders', function(done) {
        var login = testUtils.loginUser('orderer');
        var find = login.then(function(accessToken) {
          return testUtils.promiseFind(app.models.Purchaseorder, { subscriberId: accessToken.userId });
        });
        Promise.join(login, find, function(accessToken, template) {
          request(app)
            .get('/api/Purchaseusers/' + accessToken.userId + '/orders')
            .query({ access_token: accessToken.id })
            .expect(200)
            .expect(function(res) {

              // there must be better way to compare between two JSON arrays
              // (or 'template' just has some interesting contents which doesn't allow comparing them directly)
              // i.e. this doesn't work
              // expect(res.body).to.deep.have.members(template);
              expect(JSON.stringify(res.body)).to.equal(JSON.stringify(template));
            })
            .end(done);
        });
      });

      it('Purchaseorderrows', function(done) {
        var login = testUtils.loginUser('orderer');
        var find = login.then(function(accessToken) {
          return testUtils.promiseFind(app.models.Purchaseorder, { subscriberId: accessToken.userId }, 'order_rows');
        });
        Promise.join(login, find, function(accessToken, template) {
          request(app)
            .get('/api/Purchaseusers/' + accessToken.userId + '/orders')
            .query({ filter: { 'include':['order_rows'] } })
            .query({ access_token: accessToken.id })
            .expect(200)
            .expect(function(res) {
              expect(JSON.stringify(res.body)).to.equal(JSON.stringify(template));
            })
            .end(done);
        });
      });
    });
  });

  describe('should not be allowed to', function() {
    it('get all Purchaseorders', function(done) {
      testUtils.loginUser('orderer').then(function(accessToken) {
        request(app)
          .get('/api/Purchaseorders')
          .query({ access_token: accessToken.id })
          .expect(401)
          .end(done);
      });
    });

    it('get all Purchaseorderrows', function(done) {
      testUtils.loginUser('orderer').then(function(accessToken) {
        request(app)
          .get('/api/Purchaseorderrows')
          .query({ access_token: accessToken.id })
          .expect(401)
          .end(done);
      });
    });
  });
});
