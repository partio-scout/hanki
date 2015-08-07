var app = require('../server');
var request = require('supertest');
var assert = require('assert');
var expect = require('chai').expect;
var Promise = require('bluebird');



describe('Orderer', function() {
  var User = app.models.User;

  var username = 'orderer';
  var userpass = 'salasana';

  function loginUser(username, userpass) {
    return new Promise(function (resolve, reject) {
      // log in as orderer
      //console.log("User login attempt");
      return User.login({
        username: username,
        password: userpass
      }, function(err, accessToken) {
        if(err) throw err;
        //console.log("Some token here: " + accessToken.id);
        resolve(accessToken);
      });
    });
  }

  function logoutUser(accessToken) {
    return new Promise(function (resolve, reject) {
      // logout user
      User.logout(accessToken.id, function(err) {
        if (err) throw err;
      });
      resolve();
    });
  }

  describe('should be allowed to', function() {

    // do some testing with authenticated users
    it('get list of Accounts', function(done) {
      loginUser(username, userpass)
      .then(function(accessToken) {
        request(app).get("/api/Accounts?access_token=" + accessToken.id)
        .expect(200)
        .end(done);
      }); 
    });

    it('get list of Costcenters', function(done) {
      loginUser(username, userpass)
      .then(function(accessToken) {
        request(app).get("/api/Costcenters?access_token=" + accessToken.id)
        .expect(200)
        .end(done);
      }); 
    });

    it('get list of Deliveries', function(done) {
      loginUser(username, userpass)
      .then(function(accessToken) {
        request(app).get("/api/Deliveries?access_token=" + accessToken.id)
        .expect(200)
        .end(done);
      }); 
    });

    it('get list of Suppliers', function(done) {
      loginUser(username, userpass)
      .then(function(accessToken) {
        request(app).get("/api/Suppliers?access_token=" + accessToken.id)
        .expect(200)
        .end(done);
      }); 
    });

    it('get list of Titlegroups', function(done) {
      loginUser(username, userpass)
      .then(function(accessToken) {
        request(app).get("/api/Titlegroups?access_token=" + accessToken.id)
        .expect(200)
        .end(done);
      }); 
    });

    it('get list of Titles', function(done) {
      loginUser(username, userpass)
      .then(function(accessToken) {
        request(app).get("/api/Titles?access_token=" + accessToken.id)
        .expect(200)
        .end(done);
      }); 
    });

    it('get list of Usageobjects', function(done) {
      loginUser(username, userpass)
      .then(function(accessToken) {
        request(app).get("/api/Usageobjects?access_token=" + accessToken.id)
        .expect(200)
        .end(done);
      }); 
    });

    it('get list of Purchaseorders', function(done) {
      loginUser(username, userpass)
      .then(function(accessToken) {
        request(app).get("/api/Purchaseorders?access_token=" + accessToken.id)
        .expect(200)
        .end(done);
      }); 
    });

    it('create new Purchaseorder', function(done) {
      loginUser(username, userpass)
      .then(function(accessToken) {
        request(app).post("/api/Purchaseorders?access_token=" + accessToken.id)
        .send({
          "usageobjectId": 1,
          "name": "Paljon nauloja",
          "costcenterId": 1,
          "subscriber": accessToken.userId
        })
        .expect(200)
        .end(done);
      });
    });

  });
});
