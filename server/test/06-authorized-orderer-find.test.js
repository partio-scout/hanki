var app = require('../server');
var request = require('supertest');
//var assert = require('assert');
var expect = require('chai').expect;
var Promise = require('bluebird');

describe('Orderer', function() {
  var User = app.models.Purchaseuser;

  var username = 'orderer';
  var userpass = 'salasana';

  function loginUser(username, userpass) {
    return new Promise(function (resolve, reject) {
      // log in as orderer
      return User.login({
        username: username,
        password: userpass
      }, function(err, accessToken) {
        if (err) throw err;

        resolve(accessToken);
      });
    });
  }

  function promiseFind(model, whereClause, includeClause) {
    includeClause = includeClause || null;
    what = { where: whereClause };
    if (includeClause) {
      what = { where: whereClause, include: includeClause };
    }
    return new Promise(function (resolve, reject) {
      model.find(what, function(err, res) {
        if (err) throw err;

        resolve(res);
      });
    });
  }

  describe('should be allowed to get list of', function() {
    describe('all', function() {
      it('Accounts', function(done) {
        loginUser(username, userpass)
        .then(function(accessToken) {
          request(app).get('/api/Accounts?access_token=' + accessToken.id)
          .expect(200)
          .end(done);
        });
      });

      it('Costcenters', function(done) {
        loginUser(username, userpass)
        .then(function(accessToken) {
          request(app).get('/api/Costcenters?access_token=' + accessToken.id)
          .expect(200)
          .end(done);
        });
      });

      it('Deliveries', function(done) {
        loginUser(username, userpass)
        .then(function(accessToken) {
          request(app).get('/api/Deliveries?access_token=' + accessToken.id)
          .expect(200)
          .end(done);
        });
      });

      it('Suppliers', function(done) {
        loginUser(username, userpass)
        .then(function(accessToken) {
          request(app).get('/api/Suppliers?access_token=' + accessToken.id)
          .expect(200)
          .end(done);
        });
      });

      it('Titlegroups', function(done) {
        loginUser(username, userpass)
        .then(function(accessToken) {
          request(app).get('/api/Titlegroups?access_token=' + accessToken.id)
          .expect(200)
          .end(done);
        });
      });

      it('Titles', function(done) {
        loginUser(username, userpass)
        .then(function(accessToken) {
          request(app).get('/api/Titles?access_token=' + accessToken.id)
          .expect(200)
          .end(done);
        });
      });

      it('Usageobjects', function(done) {
        loginUser(username, userpass)
        .then(function(accessToken) {
          request(app).get('/api/Usageobjects?access_token=' + accessToken.id)
          .expect(200)
          .end(done);
        });
      });

    });

    describe('owned', function() {

      it('Purchaseorders', function(done) {
        var login = loginUser(username, userpass);
        var find = login.then(function(accessToken) {
          return promiseFind(app.models.Purchaseorder, { subscriber: accessToken.userId });
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
        var login = loginUser(username, userpass);
        var find = login.then(function(accessToken) {
          return promiseFind(app.models.Purchaseorder, { subscriber: accessToken.userId }, 'order_rows');
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
      loginUser(username, userpass)
      .then(function(accessToken) {
        request(app)
          .get('/api/Purchaseorders')
          .query({ access_token: accessToken.id })
          .expect(401)
          .end(done);
      });
    });

    it('get all Purchaseorderrows', function(done) {
      loginUser(username, userpass)
      .then(function(accessToken) {
        request(app)
          .get('/api/Purchaseorderrows')
          .query({ access_token: accessToken.id })
          .expect(401)
          .end(done);
      });
    });
  });
});
