var app = require('../server');
var request = require('supertest');
//var assert = require('assert');
//var expect = require('chai').expect;
var Promise = require('bluebird');

describe('Orderer', function() {
  var User = app.models.User;

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

  describe('should be allowed to update', function() {
    it('Purchaseorder', function(done) {
      loginUser(username, userpass)
      .then(function(accessToken) {
        request(app)
          .put('/api/Users/' + accessToken.userId + '/Purchaseorders/2')
          .query({ access_token: accessToken.id })
          .send({
            'orderId': 2,
            'usageobjectId': 1,
            'name': 'Liikaa nauloja',
            'costcenterId': 1,
            'subscriber': accessToken.userId
          })
          .expect(200,'')
          .end(done);
      });
    });

    it('Purchaseorderrow', function(done) {
      loginUser(username, userpass)
      .then(function(accessToken) {
        d = new Date().toISOString();
        request(app).put('/api/Purchaseorderrows/1?access_token=' + accessToken.id)
        .send({
          'selfSupply': true,
          'modified': d
        })
        .expect(200)
        .end(done);
      });
    });
  });
});

