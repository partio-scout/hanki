var app = require('../server');
var request = require('supertest');
var expect = require('chai').expect;
var testUtils = require('./utils/test-utils');

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

      it('Purchaseorders', function(done) {
        testUtils.loginUser('orderer').then(function(accessToken) {
          request(app)
            .get('/api/Purchaseorders')
            .query({ access_token: accessToken.id })
            .expect(200)
            .end(done);
        });
      });

      it('Purchaseorderrows', function(done) {
        testUtils.loginUser('orderer').then(function(accessToken) {
          request(app)
            .get('/api/Purchaseorderrows')
            .query({ access_token: accessToken.id })
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
        testUtils.loginUser('orderer').then(function(accessToken) {
          request(app)
            .get('/api/Purchaseusers/' + accessToken.userId + '/orders')
            .query({ access_token: accessToken.id })
            .expect(200)
            .expect(function(res) {
              expect(res.body).to.have.length(2);
              expect(res.body[0]).to.have.property('name', 'Tanssilava - orderer');
              expect(res.body[0]).to.have.property('subscriberId', accessToken.userId);
              expect(res.body[0]).to.have.property('costcenterId', 1);
            })
            .end(done);
        });
      });

      it('Purchaseorderrows', function(done) {
        testUtils.loginUser('orderer').then(function(accessToken) {
          request(app)
            .get('/api/Purchaseusers/' + accessToken.userId + '/orders')
            .query({ filter: { 'include':['order_rows'] } })
            .query({ access_token: accessToken.id })
            .expect(200)
            .expect(function(res) {
              expect(res.body).to.have.length(2);
              expect(res.body[0]).to.have.property('name', 'Tanssilava - orderer');
              expect(res.body[0]).to.have.property('subscriberId', accessToken.userId);
              expect(res.body[0]).to.have.property('costcenterId', 1);

              expect(res.body[0].order_rows).to.have.length(1);
              expect(res.body[0].order_rows[0]).to.have.property('amount', 2);
              expect(res.body[0].order_rows[0]).to.have.property('orderId', 2);
              expect(res.body[0].order_rows[0]).to.have.property('titleId', 1);
            })
            .end(done);
        });
      });
    });
  });
});
