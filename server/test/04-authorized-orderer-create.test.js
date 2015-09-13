var app = require('../server');
var request = require('supertest');
//var assert = require('assert');
//var expect = require('chai').expect;
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

  describe('should be allowed to create new', function() {
    it('Purchaseorder', function(done) {
      loginUser(username, userpass)
      .then(function(accessToken) {
        request(app).post('/api/Purchaseorders?access_token=' + accessToken.id)
        .send({
          'usageobjectId': 1,
          'name': 'Paljon nauloja',
          'costcenterId': 1,
          'subscriberId': accessToken.userId
        })
        .expect(200)
        .end(done);
      });
    });

    it('Purchaseorderrow', function(done) {
      loginUser(username,  userpass)
      .then(function(accessToken) {
        d = new Date().toISOString();
        request(app).post('/api/Purchaseorderrows?access_token=' + accessToken.id)
        .send({
          'titleId': 1,
          'amount': 16,
          'deliveryId': 1,
          'orderId': 3,
          'selfSupply': false,
          'approved': false,
          'finished': false,
          'modified': d
        })
        .expect(200)
        .end(done);
      });
    });
  });
});
