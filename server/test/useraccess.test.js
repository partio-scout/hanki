var app = require('../server');
var request = require('supertest');
var assert = require('assert');
var expect = require('chai').expect;
var Promise = require('bluebird');

describe('User control', function() {
  describe('decline access for unauthenticated users', function() {
    it('should decline access to Accounts for unauthenticated users', function(done) {
      request(app).get('/api/Accounts')
        .expect(401)
        .end(done);
    });

    it('should decline access to Costcenters for unauthenticated users', function(done) {
      request(app).get('/api/Costcenters')
        .expect(401)
        .end(done);
    });

    it('should decline access to Deliveries for unauthenticated users', function(done) {
      request(app).get('/api/Deliveries')
        .expect(401)
        .end(done);
    });

    it('should decline access to Purchaseorderrows for unauthenticated users', function(done) {
      request(app).get('/api/Purchaseorderrows')
        .expect(401)
        .end(done);
    });

    it('should decline access to Purchaseorders for unauthenticated users', function(done) {
      request(app).get('/api/Purchaseorders')
        .expect(401)
        .end(done);
    });

    it('should decline access to Purchaseusers for unauthenticated users', function(done) {
      request(app).get('/api/Purchaseusers')
        .expect(401)
        .end(done);
    });

    it('should decline access to Suppliers for unauthenticated users', function(done) {
      request(app).get('/api/Suppliers')
        .expect(401)
        .end(done);
    });

    it('should decline access to Titlegroups for unauthenticated users', function(done) {
      request(app).get('/api/Titlegroups')
        .expect(401)
        .end(done);
    });

    it('should decline access to Titles for unauthenticated users', function(done) {
      request(app).get('/api/Titles')
        .expect(401)
        .end(done);
    });

    it('should decline access to Usageobjects for unauthenticated users', function(done) {
      request(app).get('/api/Usageobjects')
        .expect(401)
        .end(done);
    });
  });

/*
  describe('Orderer', function() {
    var User = app.models.User;
    var Role = app.models.Role;
    var RoleMapping = app.models.RoleMapping;

    var username = 'test@test.test';
    var userpass = 'test';
    var userid;
    var UserAccesstoken;

    function createTestUser(username, userpass) {
      return new Promise(function (resolve, reject) {
        // create dummy user for testing
        User.findOrCreate({
          where: {email: username}
        },
        {
          email: username,
          password: userpass
        }, function(err, user) {
          if(err) throw err; 
          resolve(user); 
        });
      });
    }

    function assignRoleToUser(user) {
      return new Promise(function (resolve, reject) {
        Role.findOne({
          where: {name: 'orderer'}
        }, function(err, role) {
          if(err) throw err;
          role.principals.create({
            principalType: RoleMapping.USER,
            principalId: user.id
          }, function(err, principal) {
            if(err) throw err;
            resolve(user);
          });
        });
      });
    }

    function loginUser(user) {
      return new Promise(function (resolve, reject) {
        // log in as orderer
        User.login({
          email: username,
          password: userpass
        }, function(err, accessToken) {
          if(err) throw err;
          return resolve(accessToken, user);
        });
      });
    }

    function doTests(accessToken, user) {
      return new Promise(function (resolve, reject) {
        // do actual tests here, because we need that accesstoken
        it('should allow to get orderlines', function(done) {
          request(app).get('/api/Purchaseorderrows')
            .expect(200)
            .end(done);
        });

        // finally resolve promise
        resolve(accessToken, user);
      });
    }

    function logoutUser(accessToken, user) {
      return new Promise(function (resolve, reject) {
        // logout user
        User.logout(accessToken.id, function(err) {
        });
        return resolve(user);
      });
    }

    function deleteUser(user) {
      User.destroyById(user.id, function(err) {
        if(err) throw err;
      });
    }

    createTestUser(username, userpass)
    .then(assignRoleToUser)
    .then(loginUser(username, userpass))
    .then(doTests)
    .then(logoutUser)
    .then(deleteUser);
    
  });
*/
});